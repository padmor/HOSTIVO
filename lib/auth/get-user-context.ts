import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type HostivoRole = "system_admin" | "manager" | "staff" | "tenant";

export async function getUserContext() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleError) {
    throw new Error("Unable to load account permissions.");
  }

  return {
    supabase,
    userId,
    email: typeof data.claims.email === "string" ? data.claims.email : null,
    role: (roleRow?.role ?? null) as HostivoRole | null,
  };
}
