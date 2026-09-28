"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserContext } from "@/lib/auth/get-user-context";
import { createClient } from "@/lib/supabase/server";

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


const paymentReferenceSchema = z.object({
  chargeId: z.string().uuid(),
  provider: z.string().trim().min(2).max(50),
  providerReference: z.string().trim().min(3).max(120),
});

function paymentPath(message?: string, error?: string) {
  const params = new URLSearchParams();
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? "/tenant/payments?" + query : "/tenant/payments";
}

export async function submitPaymentReference(formData: FormData) {
  const parsed = paymentReferenceSchema.safeParse({
    chargeId: formData.get("chargeId"),
    provider: formData.get("provider"),
    providerReference: formData.get("providerReference"),
  });

  if (!parsed.success) {
    redirect(paymentPath(undefined, "Enter a valid payment method and transaction reference."));
  }

  const { supabase, role } = await getUserContext();

  if (role !== "tenant") {
    redirect("/dashboard");
  }

  const { data, error } = await supabase.rpc("submit_payment_reference", {
    p_charge_id: parsed.data.chargeId,
    p_provider: parsed.data.provider,
    p_provider_reference: parsed.data.providerReference,
  });

  if (error) {
    redirect(paymentPath(undefined, "We could not submit the payment reference right now. Please try again."));
  }

  const result =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { ok?: boolean; code?: string })
      : {};

  const messages: Record<string, string> = {
    charge_not_found: "That charge could not be found for your account.",
    charge_not_payable: "That charge is no longer waiting for payment.",
    missing_application_context: "This charge is missing its application context.",
    application_not_found: "The linked application could not be found.",
    duplicate_reference: "That transaction reference has already been submitted.",
    invalid_payment_details: "Enter a valid payment method and transaction reference.",
  };

  if (result.ok === true && result.code === "submitted") {
    redirect(paymentPath("Payment reference submitted. The hostel finance team can now verify it."));
  }

  if (result.ok === true && result.code === "already_paid") {
    redirect(paymentPath("This charge has already been paid."));
  }

  redirect(paymentPath(undefined, messages[result.code ?? ""] ?? "The payment reference could not be submitted."));
}


const publicApplicationSchema = z.object({
  feePlanId: z.string().uuid(),
  studentId: z.string().trim().min(2).max(80),
  contactPhone: z.string().trim().min(7).max(40),
});

function publicApplicationPath(feePlanId: string, error?: string) {
  const params = new URLSearchParams({ feePlanId });
  if (error) params.set("error", error);
  return "/apply?" + params.toString();
}

export async function submitPublicApplication(formData: FormData) {
  const parsed = publicApplicationSchema.safeParse({
    feePlanId: formData.get("feePlanId"),
    studentId: formData.get("studentId"),
    contactPhone: formData.get("contactPhone"),
  });

  if (!parsed.success) {
    redirect(
      publicApplicationPath(
        String(formData.get("feePlanId") ?? ""),
        "Enter a valid student ID, phone number, and accommodation option.",
      ),
    );
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) {
    const next = publicApplicationPath(
      parsed.data.feePlanId,
      parsed.data.studentId,
      parsed.data.contactPhone,
    );
    redirect("/login?next=" + encodeURIComponent(next));
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      student_id: parsed.data.studentId,
      phone: parsed.data.contactPhone,
    })
    .eq("id", userId);

  if (profileError) {
    redirect(
      publicApplicationPath(
        parsed.data.feePlanId,
        "We could not save your application details. Please try again.",
      ),
    );
  }

  const { data, error } = await supabase.rpc("create_application_with_charge", {
    p_fee_plan_id: parsed.data.feePlanId,
  });

  if (error) {
    redirect(
      publicApplicationPath(
        parsed.data.feePlanId,
        "We could not submit the application right now. Please try again.",
      ),
    );
  }

  const result =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { ok?: boolean; code?: string })
      : {};

  if (result.ok === true) {
    redirect("/tenant?message=" + encodeURIComponent("Application submitted. Your payment charge is ready; allocation happens after verified payment."));
  }

  if (result.code === "no_availability") {
    redirect(
      publicApplicationPath(
        parsed.data.feePlanId,
        "There are no available beds for this hostel right now.",
      ),
    );
  }

  if (result.code === "already_applied") {
    redirect(
      publicApplicationPath(
        parsed.data.feePlanId,
        "You already have an active application for this hostel.",
      ),
    );
  }

  redirect(
    publicApplicationPath(
      parsed.data.feePlanId,
      "The selected fee plan is no longer available. Refresh and try again.",
    ),
  );
}
