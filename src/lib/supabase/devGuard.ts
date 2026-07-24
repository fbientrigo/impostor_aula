// Refuses a hosted Supabase URL in local development, so a misconfigured
// .env.local fails loudly instead of silently talking to production data.
// Takes the URL as a parameter (no env reads) so this file is safe to import
// from both browser and server Supabase config modules.

import { SupabaseConfigError } from "./errors";

export function assertDevSafeSupabaseUrl(url: string): void {
  if (process.env.NODE_ENV !== "development") return;

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return;
  }

  if (hostname.endsWith(".supabase.co")) {
    throw new SupabaseConfigError(
      "Development is configured for hosted Supabase. Start the local stack and update .env.local.",
    );
  }
}
