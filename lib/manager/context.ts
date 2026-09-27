
import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/get-user-context";

type HostelSummary = {
  id: string;
  name: string;
  location: string;
  contact_phone: string | null;
  contact_email: string | null;
  status: string;
};

export async function getManagerHostels() {
  const { supabase, userId, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") {
    redirect("/dashboard");
  }

  if (role === "system_admin") {
    const { data, error } = await supabase
      .from("hostels")
      .select("id,name,location,contact_phone,contact_email,status")
      .order("name");

    if (error) {
      throw new Error("Unable to load hostels.");
    }

    return (data ?? []) as HostelSummary[];
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("hostel_memberships")
    .select("hostel_id")
    .eq("user_id", userId)
    .eq("membership_role", "manager")
    .eq("status", "active")
    .order("created_at");

  if (membershipError) {
    throw new Error("Unable to load hostel assignments.");
  }

  const hostelIds = (memberships ?? []).map((membership) => membership.hostel_id);

  if (hostelIds.length === 0) {
    return [] as HostelSummary[];
  }

  const { data, error } = await supabase
    .from("hostels")
    .select("id,name,location,contact_phone,contact_email,status")
    .in("id", hostelIds)
    .order("name");

  if (error) {
    throw new Error("Unable to load assigned hostels.");
  }

  return (data ?? []) as HostelSummary[];
}

export async function getManagerHostel(hostelId: string) {
  const { supabase, userId, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") {
    redirect("/dashboard");
  }

  if (role === "manager") {
    const { data: membership, error } = await supabase
      .from("hostel_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("hostel_id", hostelId)
      .eq("membership_role", "manager")
      .eq("status", "active")
      .maybeSingle();

    if (error || !membership) {
      redirect("/manager");
    }
  }

  const { data: hostel, error } = await supabase
    .from("hostels")
    .select("id,name,location,contact_phone,contact_email,status")
    .eq("id", hostelId)
    .maybeSingle();

  if (error || !hostel) {
    redirect("/manager");
  }

  return { supabase, userId, role, hostel };
}
