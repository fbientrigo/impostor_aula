// Browser Supabase client (anon key). Used ONLY to subscribe to Realtime broadcast
// channels — never to read table data. Roles/titles therefore can't leak through a
// Postgres-changes payload, because we don't use Postgres changes at all.

"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Returns the browser client, or null if realtime env is not configured. */
export function getBrowserClient(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null; // realtime optional; the app falls back to polling
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
