import { getServiceClient } from "@/lib/supabase/server";

export async function touchHealthcheck(source: string): Promise<string> {
  const checkedAt = new Date().toISOString();
  const { error } = await getServiceClient()
    .from("app_healthcheck")
    .upsert(
      {
        id: 1,
        touched_at: checkedAt,
        source,
        last_status: "ok",
      },
      { onConflict: "id" },
    );

  if (error) throw error;
  return checkedAt;
}
