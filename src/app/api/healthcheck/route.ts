import { fail, handler, ok } from "@/lib/api";
import { touchHealthcheck } from "@/lib/healthcheck";
import { safeEqual } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handler(async () => {
    const secret = process.env.HEALTHCHECK_SECRET;
    if (!secret) return fail("healthcheck_not_configured", 500);

    const authorization = req.headers.get("authorization");
    if (!safeEqual(authorization, `Bearer ${secret}`)) {
      return fail("unauthorized", 401);
    }

    const checkedAt = await touchHealthcheck("github-actions");
    return ok({ ok: true, service: "vercel+supabase", checked_at: checkedAt });
  });
}
