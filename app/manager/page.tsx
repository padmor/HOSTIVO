import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { getManagerHostels } from "@/lib/manager/context";
import { getUserContext } from "@/lib/auth/get-user-context";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";

export default async function ManagerHome() {
  const { supabase, email, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") return null;

  const hostels = await getManagerHostels();
  const hostelIds = hostels.map((hostel) => hostel.id);

  const [
    tenantsResult,
    applicationsResult,
    activeAllocationsResult,
    chargesResult,
  ] = await Promise.all([
    hostelIds.length
      ? supabase.from("tenants").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds)
      : Promise.resolve({ count: 0 }),
    hostelIds.length
      ? supabase.from("applications").select("id,application_number,status,created_at,hostel_id", { count: "exact" }).in("hostel_id", hostelIds).order("created_at", { ascending: false }).limit(6)
      : Promise.resolve({ count: 0, data: [] }),
    hostelIds.length
      ? supabase.from("allocations").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds).eq("status", "active")
      : Promise.resolve({ count: 0 }),
    hostelIds.length
      ? supabase.from("charges").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
  ]);

  const tenantCount = tenantsResult.count ?? 0;
  const applicationCount = applicationsResult.count ?? 0;
  const activeAllocationCount = activeAllocationsResult.count ?? 0;
  const pendingChargeCount = chargesResult.count ?? 0;
  const applications = applicationsResult.data ?? [];

  const hostelName = new Map(hostels.map((hostel) => [hostel.id, hostel.name]));

  return (
    <AppShell
      eyebrow="Manager"
      title="Operations dashboard"
      description="See the state of your hostels, then jump directly into setup and daily operations."
      email={email}
      activeHref="/manager"
      navItems={[
        { href: "/manager", label: "Dashboard", icon: "⌂" },
        { href: "/manager/setup", label: "Hostel setup", icon: "▦" },
        { href: "/tenant", label: "Tenant view", icon: "◉" },
      ]}
      logoutAction={logout}
    >
      <div className="stats-grid">
        <StatCard label="Assigned hostels" value={hostels.length} detail="Active manager workspace" icon="⌂" />
        <StatCard label="Tenants" value={tenantCount} detail="Across assigned hostels" icon="◉" />
        <StatCard label="Active allocations" value={activeAllocationCount} detail="Current room / bed occupancy" icon="▤" />
        <StatCard label="Pending charges" value={pendingChargeCount} detail="Awaiting payment action" icon="₵" />
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Recent applications"
          description={applicationCount + " application(s) currently visible to your manager role."}
          action={<span className="status-pill info">Live data</span>}
        >
          <div className="data-list">
            {applications.map((application) => (
              <div className="data-row" key={application.id}>
                <div className="data-main">
                  <strong>{application.application_number}</strong>
                  <span>{hostelName.get(application.hostel_id) ?? "Hostel"} · {new Date(application.created_at).toLocaleDateString()}</span>
                </div>
                <span className={"status-pill " + (application.status === "allocated" ? "success" : "warning")}>
                  {application.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
            {!applications.length ? (
              <div className="empty-state" style={{ margin: "0 20px 20px" }}>
                <h2>No applications yet</h2>
                <p>Once tenants begin applying, their application activity will appear here.</p>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Manager actions"
          description="Start with configuration, then move into operations."
        >
          <div className="quick-grid">
            {hostels.map((hostel) => (
              <Link className="quick-action" href={"/manager/setup?hostel=" + hostel.id} key={hostel.id}>
                <strong>{hostel.name}</strong>
                <span>Open building, room, bed and fee setup.</span>
              </Link>
            ))}
            {!hostels.length ? (
              <div className="empty-state" style={{ margin: 0, gridColumn: "1 / -1" }}>
                <p>A system administrator needs to assign this manager account to an active hostel.</p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
