// Browser Supabase client (anon key). Used ONLY to subscribe to Realtime broadcast
// channels — never to read table data. Roles/titles therefore can't leak through a
// Postgres-changes payload, because we don't use Postgres changes at all.

"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./publicEnv";

let cached: SupabaseClient | null = null;

/** Returns the browser client, or null if realtime env is not configured. */
export function getBrowserClient(): SupabaseClient | null {
  if (cached) return cached;

  const config = getPublicSupabaseConfig();
  if (!config) {
    return null; // realtime optional; the app falls back to polling
  }

  cached = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
