
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getManagerHostel } from "@/lib/manager/context";
import { getUserContext } from "@/lib/auth/get-user-context";

const uuidSchema = z.string().uuid();

const hostelSchema = z.object({
  hostelId: uuidSchema,
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(240),
  contactPhone: z.string().trim().max(40).optional(),
  contactEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
});

const buildingSchema = z.object({
  hostelId: uuidSchema,
  name: z.string().trim().min(1).max(80),
  code: z.string().trim().max(30).optional(),
});

const floorSchema = z.object({
  hostelId: uuidSchema,
  buildingId: uuidSchema,
  name: z.string().trim().min(1).max(80),
  floorNumber: z.coerce.number().int().min(-10).max(200).optional(),
});

const roomSchema = z.object({
  hostelId: uuidSchema,
  floorId: uuidSchema,
  roomNumber: z.string().trim().min(1).max(40),
  capacity: z.coerce.number().int().min(1).max(50),
});

const bedSchema = z.object({
  hostelId: uuidSchema,
  roomId: uuidSchema,
  bedNumber: z.string().trim().min(1).max(40),
});

const feePlanSchema = z.object({
  hostelId: uuidSchema,
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  amount: z.coerce.number().positive().finite().max(100000000),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code."),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function setupPath(hostelId: string, message?: string, error?: string) {
  const params = new URLSearchParams({ hostel: hostelId });
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  return "/manager/setup?" + params.toString();
}

async function requireManagerHostel(hostelId: string) {
  const parsed = uuidSchema.safeParse(hostelId);
  if (!parsed.success) {
    redirect("/manager");
  }

  return getManagerHostel(parsed.data);
}

export async function updateHostel(formData: FormData) {
  const rawHostelId = value(formData, "hostelId");
  const parsed = hostelSchema.safeParse({
    hostelId: rawHostelId,
    name: value(formData, "name"),
    location: value(formData, "location"),
    contactPhone: value(formData, "contactPhone") || undefined,
    contactEmail: value(formData, "contactEmail"),
  });

  if (!parsed.success) {
    redirect(setupPath(rawHostelId, undefined, "Check the hostel details and try again."));
  }

  const { supabase } = await requireManagerHostel(parsed.data.hostelId);

  const { error } = await supabase
    .from("hostels")
    .update({
      name: parsed.data.name,
      location: parsed.data.location,
      contact_phone: parsed.data.contactPhone || null,
      contact_email: parsed.data.contactEmail || null,
    })
    .eq("id", parsed.data.hostelId);

  if (error) {
    redirect(setupPath(parsed.data.hostelId, undefined, "Unable to update hostel details."));
  }

  redirect(setupPath(parsed.data.hostelId, "Hostel details saved."));
}

export async function createBuilding(formData: FormData) {
  const rawHostelId = value(formData, "hostelId");
  const parsed = buildingSchema.safeParse({
    hostelId: rawHostelId,
    name: value(formData, "name"),
    code: value(formData, "code") || undefined,
  });

  if (!parsed.success) {
    redirect(setupPath(rawHostelId, undefined, "Enter a valid building name."));
  }

  const { supabase } = await requireManagerHostel(parsed.data.hostelId);

  const { error } = await supabase.from("buildings").insert({
    hostel_id: parsed.data.hostelId,
    name: parsed.data.name,
    code: parsed.data.code || null,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "A building with that name already exists."
        : "Unable to create the building.";
    redirect(setupPath(parsed.data.hostelId, undefined, message));
  }

  redirect(setupPath(parsed.data.hostelId, "Building created."));
}

export async function createFloor(formData: FormData) {
  const rawHostelId = value(formData, "hostelId");
  const parsed = floorSchema.safeParse({
    hostelId: rawHostelId,
    buildingId: value(formData, "buildingId"),
    name: value(formData, "name"),
    floorNumber: value(formData, "floorNumber") || undefined,
  });

  if (!parsed.success) {
    redirect(setupPath(rawHostelId, undefined, "Enter a valid floor name and number."));
  }

  const { supabase } = await requireManagerHostel(parsed.data.hostelId);

  const { data: building } = await supabase
    .from("buildings")
    .select("id,hostel_id")
    .eq("id", parsed.data.buildingId)
    .maybeSingle();

  if (!building || building.hostel_id !== parsed.data.hostelId) {
    redirect(setupPath(parsed.data.hostelId, undefined, "The selected building is not part of this hostel."));
  }

  const { error } = await supabase.from("floors").insert({
    building_id: parsed.data.buildingId,
    name: parsed.data.name,
    floor_number: parsed.data.floorNumber ?? null,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "A floor with that name already exists in this building."
        : "Unable to create the floor.";
    redirect(setupPath(parsed.data.hostelId, undefined, message));
  }

  redirect(setupPath(parsed.data.hostelId, "Floor created."));
}

export async function createRoom(formData: FormData) {
  const rawHostelId = value(formData, "hostelId");
  const parsed = roomSchema.safeParse({
    hostelId: rawHostelId,
    floorId: value(formData, "floorId"),
    roomNumber: value(formData, "roomNumber"),
    capacity: value(formData, "capacity"),
  });

  if (!parsed.success) {
    redirect(setupPath(rawHostelId, undefined, "Enter a valid room number and capacity."));
  }

  const { supabase } = await requireManagerHostel(parsed.data.hostelId);

  const { data: floor } = await supabase
    .from("floors")
    .select("id,building_id")
    .eq("id", parsed.data.floorId)
    .maybeSingle();

  if (!floor) {
    redirect(setupPath(parsed.data.hostelId, undefined, "The selected floor is not available."));
  }

  const { data: building } = await supabase
    .from("buildings")
    .select("id,hostel_id")
    .eq("id", floor.building_id)
    .maybeSingle();

  if (!building || building.hostel_id !== parsed.data.hostelId) {
    redirect(setupPath(parsed.data.hostelId, undefined, "The selected floor is not part of this hostel."));
  }

  const { error } = await supabase.from("rooms").insert({
    floor_id: parsed.data.floorId,
    room_number: parsed.data.roomNumber,
    capacity: parsed.data.capacity,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "That room number already exists on this floor."
        : "Unable to create the room.";
    redirect(setupPath(parsed.data.hostelId, undefined, message));
  }

  redirect(setupPath(parsed.data.hostelId, "Room created."));
}

export async function createBed(formData: FormData) {
  const rawHostelId = value(formData, "hostelId");
  const parsed = bedSchema.safeParse({
    hostelId: rawHostelId,
    roomId: value(formData, "roomId"),
    bedNumber: value(formData, "bedNumber"),
  });

  if (!parsed.success) {
    redirect(setupPath(rawHostelId, undefined, "Enter a valid bed number."));
  }

  const { supabase } = await requireManagerHostel(parsed.data.hostelId);

  const { data: room } = await supabase
    .from("rooms")
    .select("id,floor_id")
    .eq("id", parsed.data.roomId)
    .maybeSingle();

  if (!room) {
    redirect(setupPath(parsed.data.hostelId, undefined, "The selected room is not available."));
  }

  const { data: floor } = await supabase
    .from("floors")
    .select("id,building_id")
    .eq("id", room.floor_id)
    .maybeSingle();

  const { data: building } = floor
    ? await supabase
        .from("buildings")
        .select("id,hostel_id")
        .eq("id", floor.building_id)
        .maybeSingle()
    : { data: null };

  if (!building || building.hostel_id !== parsed.data.hostelId) {
    redirect(setupPath(parsed.data.hostelId, undefined, "The selected room is not part of this hostel."));
  }

  const { error } = await supabase.from("beds").insert({
    room_id: parsed.data.roomId,
    bed_number: parsed.data.bedNumber,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "That bed number already exists in this room."
        : "Unable to create the bed.";
    redirect(setupPath(parsed.data.hostelId, undefined, message));
  }

  redirect(setupPath(parsed.data.hostelId, "Bed created."));
}

export async function createFeePlan(formData: FormData) {
  const rawHostelId = value(formData, "hostelId");
  const parsed = feePlanSchema.safeParse({
    hostelId: rawHostelId,
    name: value(formData, "name"),
    description: value(formData, "description") || undefined,
    amount: value(formData, "amount"),
    currency: value(formData, "currency").toUpperCase(),
    startsAt: value(formData, "startsAt") || undefined,
    endsAt: value(formData, "endsAt") || undefined,
  });

  if (!parsed.success) {
    redirect(setupPath(rawHostelId, undefined, "Check the fee plan fields and try again."));
  }

  if (
    parsed.data.startsAt &&
    parsed.data.endsAt &&
    parsed.data.endsAt < parsed.data.startsAt
  ) {
    redirect(setupPath(parsed.data.hostelId, undefined, "Fee plan end date cannot be before the start date."));
  }

  const { supabase } = await requireManagerHostel(parsed.data.hostelId);

  const { error } = await supabase.from("fee_plans").insert({
    hostel_id: parsed.data.hostelId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    starts_at: parsed.data.startsAt ? parsed.data.startsAt + "T00:00:00Z" : null,
    ends_at: parsed.data.endsAt ? parsed.data.endsAt + "T23:59:59Z" : null,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "A fee plan with that name already exists."
        : "Unable to create the fee plan.";
    redirect(setupPath(parsed.data.hostelId, undefined, message));
  }

  redirect(setupPath(parsed.data.hostelId, "Fee plan created."));
}


const applicationReviewSchema = z.object({
  applicationId: uuidSchema,
  decision: z.enum(["approve", "reject"]),
});

const paymentReviewSchema = z.object({
  paymentId: uuidSchema,
  decision: z.enum(["verify", "reject"]),
});

const maintenanceSchema = z.object({
  hostelId: uuidSchema,
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(2000),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

function modulePath(hostelId: string, module: string, message?: string, error?: string) {
  const params = new URLSearchParams({ hostel: hostelId });
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  return "/manager/" + module + "?" + params.toString();
}

async function requireManagerRecordHostel(
  table: "applications" | "payments" | "maintenance_requests",
  id: string,
) {
  const { supabase } = await getUserContext();
  const { data: record, error } = await supabase
    .from(table)
    .select("id,hostel_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !record?.hostel_id) {
    redirect("/manager");
  }

  await getManagerHostel(record.hostel_id);
  return { supabase, hostelId: record.hostel_id };
}

export async function reviewApplication(formData: FormData) {
  const parsed = applicationReviewSchema.safeParse({
    applicationId: value(formData, "applicationId"),
    decision: value(formData, "decision"),
  });

  if (!parsed.success) redirect("/manager/applications?error=Invalid%20application%20action.");

  const { supabase, hostelId } = await requireManagerRecordHostel(
    "applications",
    parsed.data.applicationId,
  );

  const { data: application } = await supabase
    .from("applications")
    .select("id,status")
    .eq("id", parsed.data.applicationId)
    .eq("hostel_id", hostelId)
    .maybeSingle();

  if (!application) redirect("/manager/applications?error=Application%20not%20found.");

  if (parsed.data.decision === "reject") {
    const { error } = await supabase
      .from("applications")
      .update({ status: "cancelled" })
      .eq("id", parsed.data.applicationId)
      .eq("hostel_id", hostelId);

    if (error) redirect("/manager/applications?error=Unable%20to%20reject%20the%20application.");
    redirect(modulePath(hostelId, "applications", "Application%20rejected."));
  }

  if (!["draft", "submitted"].includes(application.status)) {
    redirect(modulePath(hostelId, "applications", undefined, "This application is already in the payment/allocation workflow."));
  }

  const { data: applicationDetails } = await supabase
    .from("applications")
    .select("id,tenant_id")
    .eq("id", parsed.data.applicationId)
    .eq("hostel_id", hostelId)
    .maybeSingle();

  if (!applicationDetails) redirect("/manager/applications?error=Application%20not%20found.");

  const { data: availableBed } = await supabase
    .from("beds")
    .select("id,room_id")
    .eq("status", "available")
    .limit(1)
    .maybeSingle();

  if (!availableBed) {
    redirect(modulePath(hostelId, "applications", undefined, "No available beds are currently available."));
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "payment_pending" })
    .eq("id", parsed.data.applicationId)
    .eq("hostel_id", hostelId);

  if (error) redirect(modulePath(hostelId, "applications", undefined, "Unable to approve the application."));

  redirect(modulePath(hostelId, "applications", "Application approved and moved to payment pending."));
}

export async function reviewPayment(formData: FormData) {
  const parsed = paymentReviewSchema.safeParse({
    paymentId: value(formData, "paymentId"),
    decision: value(formData, "decision"),
  });

  if (!parsed.success) redirect("/manager/payments?error=Invalid%20payment%20action.");

  const { supabase, hostelId } = await requireManagerRecordHostel(
    "payments",
    parsed.data.paymentId,
  );

  const { data: payment } = await supabase
    .from("payments")
    .select("id,application_id,charge_id,status,amount,currency")
    .eq("id", parsed.data.paymentId)
    .eq("hostel_id", hostelId)
    .maybeSingle();

  if (!payment) redirect("/manager/payments?error=Payment%20not%20found.");

  const successful = parsed.data.decision === "verify";

  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: successful ? "successful" : "failed",
      verified_at: successful ? new Date().toISOString() : null,
      paid_at: successful ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.paymentId)
    .eq("hostel_id", hostelId);

  if (paymentError) {
    redirect(modulePath(hostelId, "payments", undefined, "Unable to update payment verification."));
  }

  if (successful && payment.charge_id) {
    await supabase
      .from("charges")
      .update({ status: "paid" })
      .eq("id", payment.charge_id)
      .eq("hostel_id", hostelId);
  }

  if (successful && payment.application_id) {
    await supabase
      .from("applications")
      .update({ status: "paid" })
      .eq("id", payment.application_id)
      .eq("hostel_id", hostelId);
  }

  if (!successful && payment.application_id) {
    await supabase
      .from("applications")
      .update({ status: "payment_pending" })
      .eq("id", payment.application_id)
      .eq("hostel_id", hostelId);
  }

  redirect(
    modulePath(
      hostelId,
      "payments",
      successful ? "Payment verified and application cleared for allocation." : "Payment marked as failed.",
    ),
  );
}

export async function createMaintenanceRequest(formData: FormData) {
  const parsed = maintenanceSchema.safeParse({
    hostelId: value(formData, "hostelId"),
    title: value(formData, "title"),
    description: value(formData, "description"),
    priority: value(formData, "priority"),
  });

  if (!parsed.success) {
    redirect(modulePath(value(formData, "hostelId"), "maintenance", undefined, "Check the request fields and try again."));
  }

  const { supabase } = await getManagerHostel(parsed.data.hostelId);

  const { error } = await supabase.from("maintenance_requests").insert({
    hostel_id: parsed.data.hostelId,
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority,
    status: "submitted",
  });

  if (error) {
    redirect(modulePath(parsed.data.hostelId, "maintenance", undefined, "Unable to submit the maintenance request."));
  }

  redirect(modulePath(parsed.data.hostelId, "maintenance", "Maintenance request submitted."));
}
