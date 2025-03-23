const team_id = process.env.APNS_TEAM_ID!;
const key_id = process.env.APNS_KEY_ID!;
const bundle_id = process.env.APNS_BUNDLE_ID!;
const production = process.env.APNS_PRODUCTION!;
const private_key = process.env.APNS_P8_BASE64!;
const APNS_PRODUCTION = "api.push.apple.com";
const APNS_DEVELOPMENT = "api.sandbox.push.apple.com";
import { Message } from "../types";
import generateAPNsJWT from "./jwt.ts";
// Since Apple's servers require http/2,
// we need to use node's http2 module instead
// this file is for demostration purposes only
export default async function sendAPNsNotification(
  deviceToken: string,
  message: Message
) {
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
        // sound: "default",
      },
    });
    const res = await fetch(
      `https://${
        production === "true" ? APNS_PRODUCTION : APNS_DEVELOPMENT
      }/3/device/${deviceToken}`,

      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "apns-topic": bundle_id, //"halves",,
          "apns-push-type": "alert",
          "Content-Length": `${payload.length}`,
        }),

        body: payload,
        verbose: true,
      }
    );
    const str = await res.text();
    if (str == "") return { res: "success" };
    return res.json();
  } catch (e) {
    return e;
  }
}
