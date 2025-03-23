import http2 from "node:http2";
import { Message } from "../types";
import generateAPNsJWT from "./jwt.ts";

// Environment variables
const team_id = process.env.APNS_TEAM_ID!;
const key_id = process.env.APNS_KEY_ID!;
const bundle_id = process.env.APNS_BUNDLE_ID!;
const production = process.env.APNS_PRODUCTION!;
const private_key = process.env.APNS_P8_BASE64!;

// APNs constants
const APNS_HOSTS = {
  production: "api.push.apple.com",
  development: "api.sandbox.push.apple.com",
};

export default async function sendAPNsNotification(
  deviceToken: string,
  message: Message
): Promise<{ res: string } | any> {
  const host =
    production === "true" ? APNS_HOSTS.production : APNS_HOSTS.development;
  const client = http2.connect(`https://${host}`);

  try {
    const token = await generateAPNsJWT({
      privateKey: private_key,
      teamId: team_id,
      keyId: key_id,
    });

    const payload = JSON.stringify({
      aps: {
        alert: {
          title: message.title ?? "",
          body: message.body ?? "",
        },
      },
      ...message.data,
    });

    return new Promise((resolve, reject) => {
      const req = client.request({
        ":path": `/3/device/${deviceToken}`,
        ":method": "POST",
        authorization: `Bearer ${token}`,
        "apns-topic": bundle_id,
        "apns-push-type": "alert",
        "content-type": "application/json",
        "content-length": Buffer.byteLength(payload),
      });

      let responseBody = "";
      let timeout: Timer;

      // Setup response handlers
      req
        .setEncoding("utf8")
        .on("response", (headers) => {
          if (headers[":status"] !== 200) {
            const error = new Error(
              `APNs request failed with status ${headers[":status"]}`
            );
            error.name = "APNsError";
            reject(error);
          }
        })
        .on("data", (chunk) => (responseBody += chunk))
        .on("end", () => {
          clearTimeout(timeout);
          client.close();
          resolve(responseBody ? JSON.parse(responseBody) : { res: "success" });
        })
        .on("error", (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

      // Set timeout (5 seconds)
      timeout = setTimeout(() => {
        req.close(http2.constants.NGHTTP2_CANCEL);
        client.close();
        reject(new Error("APNs request timed out"));
      }, 1000);

      // Send payload
      req.write(payload);
      req.end();
    });
  } catch (e) {
    client.close();
    return e;
  }
}
