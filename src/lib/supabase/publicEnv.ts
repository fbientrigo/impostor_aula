// Public/browser-safe Supabase config resolution. Only ever reads
// NEXT_PUBLIC_* vars, which Next.js inlines into the client bundle at build
// time via literal `process.env.NEXT_PUBLIC_X` references — keep these
// references literal (no dynamic lookup) or the browser build silently gets
// `undefined`.

import { assertDevSafeSupabaseUrl } from "./devGuard";

export interface PublicSupabaseConfig {
  url: string;
  anonKey: string;
}

/** Returns the public Supabase config, or null if it isn't configured (realtime is optional). */
export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  assertDevSafeSupabaseUrl(url);
  return { url, anonKey };
}
