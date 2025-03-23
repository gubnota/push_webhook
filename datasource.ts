import { SupabaseClient } from "@supabase/supabase-js";
import type {
  EventUserType,
  EventRecord,
  GameModel,
  MessageModel,
  UserDeviceModel,
  UserProfile,
} from "./types.d.ts";

/// Prepares
export async function fetchEventUser(
  supabase: SupabaseClient,
  event_id: string
): Promise<EventUserType | Error> {
  try {
    // Fetch full event details
    const { data: event, error: eventError } = (await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single()) as { data: EventRecord; error: any };

    if (!event || eventError) throw new Error("Event not found");

    type ResultType = { data: MessageModel | GameModel; error: any };
    // |
    // | { data: GameModel; error: any };

    let { data: record, error: recordError } = (await supabase
      .from(event.event_type === "message" ? "messages" : "games")
      .select("*")
      .eq(
        "id",
        event.event_type == "message" ? event.message_id : event.game_id
      )
      .single()) as ResultType;
    if (event.event_type == "message") record = record as MessageModel;
    else {
      record = record as GameModel;
    }
    // Fetch receiver profile and sender name
    let [
      { data: sender, error: senderError },
      { data: receiver, error: receiverError },
      { data: devices, error: devicesError },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", record.sender).single(),
      supabase.from("profiles").select("*").eq("id", record.receiver).single(),
      // Get devices from user_devices
      supabase.from("user_devices").select("*").eq("user_id", record.receiver),
    ]);

    sender = sender as UserProfile;
    receiver = receiver as UserProfile;
    devices = devices as UserDeviceModel[];

    return {
      event,
      record,
      sender,
      receiver,
      devices,
      recordError,
      eventError,
      receiverError,
      devicesError,
    };
  } catch (error) {
    console.error("Error:", error);
    return error as Error;
  }
}
