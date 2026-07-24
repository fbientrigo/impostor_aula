import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { getPublicSupabaseConfig } from "@/lib/supabase/publicEnv";
import { getServerSupabaseConfig } from "@/lib/supabase/serverEnv";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getPublicSupabaseConfig", () => {
  it("prefers NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY over the legacy ANON_KEY", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-anon-test");

    expect(getPublicSupabaseConfig()).toEqual({
      url: "http://127.0.0.1:54321",
      anonKey: "sb_publishable_test",
    });
  });

  it("falls back to the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-anon-test");

    expect(getPublicSupabaseConfig()).toEqual({
      url: "http://127.0.0.1:54321",
      anonKey: "legacy-anon-test",
    });
  });

  it("returns null when unconfigured, instead of throwing (realtime is optional)", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);

    expect(getPublicSupabaseConfig()).toBeNull();
  });

  it("rejects a hosted *.supabase.co URL in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(() => getPublicSupabaseConfig()).toThrow(/local stack/i);
  });

  it("accepts a hosted *.supabase.co URL outside development (production)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(getPublicSupabaseConfig()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "sb_publishable_test",
    });
  });

  it("never resolves the server-only secret/service-role key names", async () => {
    const source = await readFile(new URL("../lib/supabase/publicEnv.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/SUPABASE_SECRET_KEY/);
    expect(source).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});

describe("getServerSupabaseConfig", () => {
  it("prefers SUPABASE_SECRET_KEY over the legacy SERVICE_ROLE_KEY", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-service-role-test");

    expect(getServerSupabaseConfig()).toEqual({
      url: "http://127.0.0.1:54321",
      serviceKey: "sb_secret_test",
    });
  });

  it("falls back to the legacy SUPABASE_SERVICE_ROLE_KEY", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SECRET_KEY", undefined);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-service-role-test");

    expect(getServerSupabaseConfig()).toEqual({
      url: "http://127.0.0.1:54321",
      serviceKey: "legacy-service-role-test",
    });
  });

  it("throws a clear error when the server key or URL is missing", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    vi.stubEnv("SUPABASE_SECRET_KEY", undefined);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);

    expect(() => getServerSupabaseConfig()).toThrow(/Missing Supabase env/);
  });

  it("rejects a hosted *.supabase.co URL in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");

    expect(() => getServerSupabaseConfig()).toThrow(/local stack/i);
  });

  it("accepts a hosted *.supabase.co URL outside development (production)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");

    expect(getServerSupabaseConfig()).toEqual({
      url: "https://example.supabase.co",
      serviceKey: "sb_secret_test",
    });
  });
});
