import { fail, handler, ok } from "@/lib/api";
import { touchHealthcheck } from "@/lib/healthcheck";
import { safeEqual } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handler(async () => {
    const secret = process.env.CRON_SECRET;
    if (!secret) return fail("cron_not_configured", 500);

    const authorization = req.headers.get("authorization");
    if (!safeEqual(authorization, `Bearer ${secret}`)) {
      return fail("unauthorized", 401);
    }

    const checkedAt = await touchHealthcheck("vercel-cron");
    return ok({ ok: true, source: "vercel-cron", checked_at: checkedAt });
  });
}
