import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";
import { submitApplication } from "@/lib/tenant/actions";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";

type TenantPageProps = { searchParams: Promise<{ message?: string; error?: string }> };

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
    .select("id,hostel_id,name,description,amount,currency,starts_at,ends_at")
    .eq("status", "active")
    .order("hostel_id")
    .order("name");

  if (feePlanError) throw new Error("Unable to load accommodation options.");

  const planRows = feePlans ?? [];
  const hostelIds = [...new Set(planRows.map((plan) => plan.hostel_id))];

  const { data: hostels, error: hostelsError } = hostelIds.length
    ? await supabase.from("hostels").select("id,name,location").in("id", hostelIds).eq("status", "active").order("name")
    : { data: [], error: null };

  if (hostelsError) throw new Error("Unable to load hostel options.");

  const hostelById = new Map((hostels ?? []).map((hostel) => [hostel.id, hostel]));

  const { data: applications, error: applicationError } = await supabase
    .from("applications")
    .select("id,hostel_id,application_number,status,submitted_at,created_at")
    .eq("applicant_user_id", userId)
    .order("created_at", { ascending: false });

  if (applicationError) throw new Error("Unable to load your applications.");

  const applicationRows = applications ?? [];
  const applicationIds = applicationRows.map((application) => application.id);

  const { data: charges, error: chargeError } = applicationIds.length
    ? await supabase.from("charges").select("application_id,description,amount,currency,status").in("application_id", applicationIds).order("created_at", { ascending: false })
    : { data: [], error: null };

  if (chargeError) throw new Error("Unable to load your charges.");

  const chargeRows = charges ?? [];
  const chargeByApplication = new Map<string, (typeof chargeRows)[number]>();
  for (const charge of chargeRows) {
    if (charge.application_id && !chargeByApplication.has(charge.application_id)) chargeByApplication.set(charge.application_id, charge);
  }

  const pendingCount = applicationRows.filter((item) => item.status === "payment_pending").length;
  const allocatedCount = applicationRows.filter((item) => item.status === "allocated").length;

  return (
    <AppShell
      eyebrow="Tenant"
      title="Your accommodation"
      description="Choose an active accommodation option, track your applications, and keep your hostel records in one place."
      email={email}
      activeHref="/tenant"
      navItems={[
        { href: "/tenant", label: "Dashboard", icon: "⌂" },
        { href: "/tenant", label: "Applications", icon: "▤" },
        { href: "/tenant", label: "Payments", icon: "₵" },
        { href: "/tenant", label: "Maintenance", icon: "⚒" },
        { href: "/tenant", label: "Profile", icon: "◉" },
      ]}
      logoutAction={logout}
    >
      <div className="stats-grid">
        <StatCard label="My applications" value={applicationRows.length} detail="Accommodation applications" icon="▤" />
        <StatCard label="Awaiting payment" value={pendingCount} detail="Charges created automatically" icon="₵" />
        <StatCard label="Allocated" value={allocatedCount} detail="Allocation completed" icon="✓" />
        <StatCard label="Available options" value={planRows.length} detail="Active fee plans" icon="⌂" />
      </div>

      {params.message ? <div className="notice">{params.message}</div> : null}
      {params.error ? <div className="error">{params.error}</div> : null}

      <div className="dashboard-grid">
        <SectionCard
          title="Apply for accommodation"
          description="Availability is checked on the server when you submit."
        >
          {planRows.length ? (
            <form className="form" action={submitApplication} style={{ padding: "0 20px 20px" }}>
              <div className="field">
                <label htmlFor="fee-plan">Hostel and fee plan</label>
                <select id="fee-plan" name="feePlanId" defaultValue="" required>
                  <option value="" disabled>Choose an accommodation option</option>
                  {planRows.map((plan) => {
                    const hostel = hostelById.get(plan.hostel_id);
                    if (!hostel) return null;
                    return (
                      <option key={plan.id} value={plan.id}>
                        {hostel.name} — {plan.name} — {Number(plan.amount).toLocaleString()} {plan.currency}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button className="primary-button" type="submit">Check availability and apply</button>
            </form>
          ) : (
            <div className="empty-state" style={{ margin: "0 20px 20px" }}>
              <h2>No options published</h2>
              <p>There are no active accommodation fee plans available yet.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Profile" description="The account information connected to your tenant identity.">
          <div className="data-list">
            <div className="data-row"><div className="data-main"><strong>Name</strong><span>{profile?.full_name ?? "Not set"}</span></div></div>
            <div className="data-row"><div className="data-main"><strong>Email</strong><span>{profile?.email ?? email ?? "Not set"}</span></div></div>
            <div className="data-row"><div className="data-main"><strong>Phone</strong><span>{profile?.phone ?? "Not set"}</span></div></div>
          </div>
        </SectionCard>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionCard title="Your applications" description={applicationRows.length + " application(s) on this account."}>
          <div className="data-list">
            {applicationRows.map((application) => {
              const hostel = hostelById.get(application.hostel_id);
              const charge = chargeByApplication.get(application.id);
              return (
                <div className="data-row" key={application.id}>
                  <div className="data-main">
                    <strong>{hostel?.name ?? "Hostel"} · {application.application_number}</strong>
                    <span>{charge ? "Charge: " + Number(charge.amount).toLocaleString() + " " + charge.currency + " · " + charge.status.replaceAll("_", " ") : "Charge details unavailable"}</span>
                  </div>
                  <span className={"status-pill " + (application.status === "allocated" ? "success" : "warning")}>{application.status.replaceAll("_", " ")}</span>
                </div>
              );
            })}
            {!applicationRows.length ? (
              <div className="empty-state" style={{ margin: "0 20px 20px" }}>
                <h2>No applications yet</h2>
                <p>Your first application will appear here after you choose an accommodation option.</p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
