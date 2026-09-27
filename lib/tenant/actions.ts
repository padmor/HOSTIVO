"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserContext } from "@/lib/auth/get-user-context";

const applicationSchema = z.object({
  feePlanId: z.string().uuid(),
});

function tenantPath(message?: string, error?: string) {
  const params = new URLSearchParams();
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? "/tenant?" + query : "/tenant";
}

export async function submitApplication(formData: FormData) {
  const parsed = applicationSchema.safeParse({
    feePlanId: formData.get("feePlanId"),
  });

  if (!parsed.success) {
    redirect(tenantPath(undefined, "Choose a valid fee plan."));
  }

  const { supabase, role } = await getUserContext();

  if (role !== "tenant") {
    redirect("/dashboard");
  }

  const { data, error } = await supabase.rpc("create_application_with_charge", {
    p_fee_plan_id: parsed.data.feePlanId,
  });

  if (error) {
    redirect(
      tenantPath(
        undefined,
        "We could not submit the application right now. Please try again.",
      ),
    );
  }

  const result =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { ok?: boolean; code?: string })
      : {};

  if (result.ok === true) {
    redirect(
      tenantPath(
        "Application submitted. Your payment charge is ready; room/bed allocation happens after verified payment.",
      ),
    );
  }

  if (result.code === "no_availability") {
    redirect(
      tenantPath(
        undefined,
        "There are no available beds for this hostel right now.",
      ),
    );
  }

  if (result.code === "already_applied") {
    redirect(
      tenantPath(
        undefined,
        "You already have an active application for this hostel.",
      ),
    );
  }

  redirect(
    tenantPath(
      undefined,
      "The selected fee plan is no longer available. Refresh and try again.",
    ),
  );
}
