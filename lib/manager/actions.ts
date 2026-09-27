
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getManagerHostel } from "@/lib/manager/context";

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
