// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createClient } from "@supabase/supabase-js";
import sendFCMNotification from "./fcm/send.ts";
import sendAPNsNotification from "./apns/send2.ts";
import { fetchEventUser } from "./datasource.ts";
import type { EventUserType, MessageModel } from "./types";
// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ADMIN_KEY!
);

// Main Edge Function
Bun.serve({
  port: 8000,
  fetch: async (req) => {
    try {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
        });
      }
      // Get event_id from webhook payload
      const {
        record: { id: event_id },
      } = await req.json();
      const res = (await fetchEventUser(supabase, event_id)) as EventUserType;
      const { event, record, sender, receiver, devices } = res;
      //   return new Response(
      //   JSON.stringify(res)
      // );
      console.debug({ event, record, sender, receiver, devices });
      if (!res.devices)
        return new Response(JSON.stringify({ error: "No push token" }));

      // Check if receiver is offline
      // const lastSeen = new Date(receiver!.last_seen).getTime();
      // if (Date.now() - lastSeen <= 10000) return new Response("User online");

      // Prepare notification message
      let message = { title: "", body: "" };
      const senderName = sender.username || "Someone";
      if (event.event_type == "message") {
        message = {
          title: `${senderName}`,
          body: `${(record as MessageModel).content ?? ""}`,
        };
      } else {
        message = {
          title: `${senderName} invites you`,
          body: "You've received an invitation. Do you accept or refuse?",
        };
      }

      // Send platform-specific notification
      if (devices[0].device_type == "fcm") {
        //|| device_token.includes(":")
        console.log(
          await sendFCMNotification(devices[0].device_token, message)
        );
      } else {
        console.log(
          await sendAPNsNotification(devices[0].device_token, message)
        );
      }

      // return new Response("Notification sent successfully");
      return new Response(JSON.stringify({ msg: "No answer" }));
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify(error), {
        status: 500,
      });
    }
  },
});
