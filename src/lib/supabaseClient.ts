// Supabase browser client. Absent env → `supabase` is null and the app falls
// back to local/simulated behaviour, so nothing breaks without keys.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anon as string, { realtime: { params: { eventsPerSecond: 5 } } })
  : null;

// A stable per-browser id so a member can recognise and release their own seat.
const CLIENT_KEY = "wc-client-id";
export function getClientId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}
