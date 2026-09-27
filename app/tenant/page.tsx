import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";
import { submitApplication, submitPaymentReference } from "@/lib/tenant/actions";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Layers,
  Banknote,
  Wrench,
  User,
  Home,
  CheckCircle,
} from "lucide-react";

type TenantPageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function TenantPage({ searchParams }: TenantPageProps) {
  const params = await searchParams;
  const { supabase, email, userId, role } = await getUserContext();

  if (role !== "tenant") redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,phone")
    .eq("id", userId)
    .maybeSingle();

  const { data: feePlans, error: feePlanError } = await supabase
    .from("fee_plans")
    .select(
      "id,hostel_id,name,description,amount,currency,starts_at,ends_at"
    )
    .eq("status", "active")
    .order("hostel_id")
    .order("name");

  if (feePlanError) throw new Error("Unable to load accommodation options.");

  const planRows = feePlans ?? [];
  const hostelIds = [...new Set(planRows.map((plan) => plan.hostel_id))];

  const { data: hostels, error: hostelsError } = hostelIds.length
    ? await supabase
        .from("hostels")
        .select("id,name,location")
        .in("id", hostelIds)
        .eq("status", "active")
        .order("name")
    : { data: [], error: null };

  if (hostelsError) throw new Error("Unable to load hostel options.");

  const hostelById = new Map(
    (hostels ?? []).map((hostel) => [hostel.id, hostel])
  );

  const { data: applications, error: applicationError } = await supabase
    .from("applications")
    .select(
      "id,hostel_id,application_number,status,submitted_at,created_at"
    )
    .eq("applicant_user_id", userId)
    .order("created_at", { ascending: false });

  if (applicationError)
    throw new Error("Unable to load your applications.");

  const applicationRows = applications ?? [];
  const applicationIds = applicationRows.map((a) => a.id);

  const { data: charges, error: chargeError } = applicationIds.length
    ? await supabase
        .from("charges")
        .select(
          "application_id,description,amount,currency,status"
        )
        .in("application_id", applicationIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (chargeError) throw new Error("Unable to load your charges.");

  const chargeRows = charges ?? [];
  const chargeByApplication = new Map<
    string,
    (typeof chargeRows)[number]
  >();
  for (const charge of chargeRows) {
    if (
      charge.application_id &&
      !chargeByApplication.has(charge.application_id)
    )
      chargeByApplication.set(charge.application_id, charge);
  }

  const pendingCount = applicationRows.filter(
    (item) => item.status === "payment_pending"
  ).length;
  const allocatedCount = applicationRows.filter(
    (item) => item.status === "allocated"
  ).length;

  return (
    <AppShell
      eyebrow="Tenant"
      title="Your accommodation"
      description="Choose an active accommodation option, track your applications, and keep your hostel records in one place."
      email={email}
      activeHref="/tenant"
      navItems={[
        { href: "/tenant", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/tenant", label: "Applications", icon: <Layers className="h-4 w-4" /> },
        { href: "/tenant", label: "Payments", icon: <Banknote className="h-4 w-4" /> },
        { href: "/tenant", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
        { href: "/tenant", label: "Profile", icon: <User className="h-4 w-4" /> },
      ]}
      logoutAction={logout}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My applications" value={applicationRows.length} detail="Accommodation applications" icon={<Layers className="h-4 w-4" />} />
        <StatCard label="Awaiting payment" value={pendingCount} detail="Charges created automatically" icon={<Banknote className="h-4 w-4" />} />
        <StatCard label="Allocated" value={allocatedCount} detail="Allocation completed" icon={<CheckCircle className="h-4 w-4" />} />
        <StatCard label="Available options" value={planRows.length} detail="Active fee plans" icon={<Home className="h-4 w-4" />} />
      </div>

      {params.message ? (
        <div className="mt-4 rounded-lg bg-success-soft p-3 text-sm text-success" role="status">
          {params.message}
        </div>
      ) : null}
      {params.error ? (
        <div className="mt-4 rounded-lg bg-destructive-soft p-3 text-sm text-destructive" role="alert">
          {params.error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <SectionCard title="Apply for accommodation" description="Availability is checked on the server when you submit.">
          {planRows.length ? (
            <form className="grid gap-4 px-5 pb-5" action={submitApplication}>
              <div className="grid gap-1.5">
                <Label htmlFor="fee-plan">Hostel and fee plan</Label>
                <select
                  id="fee-plan"
                  name="feePlanId"
                  defaultValue=""
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="" disabled>Choose an accommodation option</option>
                  {planRows.map((plan) => {
                    const hostel = hostelById.get(plan.hostel_id);
                    if (!hostel) return null;
                    return (
                      <option key={plan.id} value={plan.id}>
                        {hostel.name} — {plan.name} —{" "}
                        {Number(plan.amount).toLocaleString()} {plan.currency}
                      </option>
                    );
                  })}
                </select>
              </div>
              <Button type="submit">Check availability and apply</Button>
            </form>
          ) : (
            <div className="mx-5 mb-5 rounded-[14px] border border-dashed border-border bg-secondary p-6">
              <h3 className="font-semibold">No options published</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                There are no active accommodation fee plans available yet.
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Profile" description="The account information connected to your tenant identity.">
          <div>
            {[{ label: "Name", value: profile?.full_name }, { label: "Email", value: profile?.email ?? email }, { label: "Phone", value: profile?.phone }].map((row) => (
              <div className="flex items-center justify-between gap-3.5 border-t border-border/50 px-5 py-3.5 first:border-t-0" key={row.label}>
                <div className="min-w-0">
                  <strong className="block text-[13px] font-semibold">{row.label}</strong>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{row.value ?? "Not set"}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Your applications" description={applicationRows.length + " application(s) on this account."}>
          <div>
            {applicationRows.map((application) => {
              const hostel = hostelById.get(application.hostel_id);
              const charge = chargeByApplication.get(application.id);
              return (
                <div className="flex items-center justify-between gap-3.5 border-t border-border/50 px-5 py-3.5 first:border-t-0" key={application.id}>
                  <div className="min-w-0">
                    <strong className="block text-[13px] font-semibold">
                      {hostel?.name ?? "Hostel"} &middot; {application.application_number}
                    </strong>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {charge
                        ? "Charge: " + Number(charge.amount).toLocaleString() + " " + charge.currency + " · " + charge.status.replaceAll("_", " ")
                        : "Charge details unavailable"}
                    </span>
                  </div>
                  <Badge variant={application.status === "allocated" ? "success" : "warning"}>
                    {application.status.replaceAll("_", " ")}
                  </Badge>
                </div>
              );
            })}
            {!applicationRows.length ? (
              <div className="mx-5 mb-5 rounded-[14px] border border-dashed border-border bg-secondary p-6">
                <h3 className="font-semibold">No applications yet</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Your first application will appear here after you choose an accommodation option.
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
