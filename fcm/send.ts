import type { Message } from "../types.d.ts";
import generateFCMJWT, { config } from "./jwt.ts";

// Send FCM Notification with Service Account
export default async function sendFCMNotification(
  deviceToken: string,
  message: Message
) {
  const accessToken = await generateFCMJWT();

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${config.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: {
            title: message.title ?? "",
            body: message.body ?? "",
          },
          data: message.data ?? {},
        },
      }),
    }
  );

  return await response.json();
}
