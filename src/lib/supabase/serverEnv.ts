// Server-only Supabase config resolution. Must never be imported from
// "use client" code — it reads the elevated secret/service-role key.

import { assertDevSafeSupabaseUrl } from "./devGuard";
import { SupabaseConfigError } from "./errors";

export interface ServerSupabaseConfig {
  url: string;
  serviceKey: string;
}

export function getServerSupabaseConfig(): ServerSupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new SupabaseConfigError(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local.",
    );
  }

  assertDevSafeSupabaseUrl(url);
  return { url, serviceKey };
}
