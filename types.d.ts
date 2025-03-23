import { PostgrestError } from "@supabase/supabase-js";

interface EventRecord {
  id: string;
  event_type: evtType;
  message_id: number | null;
  game_id: number | null;
  created_at: string;
}
interface Message {
  title: string | null;
  body: string | null;
  data?: object | null;
}
interface UserProfile {
  id: string;
  username?: string;
  lang: string;
  avatar_url: string;
}
interface firebaseEntries {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}
interface MessageModel {
  id: number;
  sender: string;
  receiver: string;
  content: string;
  created_at: string;
  delivered: boolean;
}
interface GameModel {
  id: number;
  sender: string;
  receiver: string;
  invited: string | null;
  reacted: string | null;
  accepted: string | null;
  vote1: number;
  vote2: number;
  score1: number;
  score2: number;
}
interface UserDeviceModel {
  id: number;
  user_id: string;
  device_type: deviceType;
  device_token: string;
}
interface EventUserType {
  event: EventRecord;
  record: GameModel | MessageModel;
  receiver: UserProfile;
  sender: UserProfile;
  devices: UserDeviceModel[];
  recordError: PostgrestError | null;
  eventError: PostgrestError | null;
  receiverError: PostgrestError | null;
  devicesError: PostgrestError | null;
}

type Status = "pending" | "accepted" | "refused" | null;
type deviceType = "apn" | "fcm";
type evtType = "game_score" | "game_vote" | "game_invite" | "game" | "message";
