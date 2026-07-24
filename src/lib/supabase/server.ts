// Server-only Supabase client using the service-role key. ALL sensitive reads and
// every mutation go through this client inside API routes, so RLS can stay
// deny-by-default and secrets (concept titles, roles, tokens) never reach a
// browser bundle.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabaseConfig } from "./serverEnv";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const { url, serviceKey } = getServerSupabaseConfig();

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
