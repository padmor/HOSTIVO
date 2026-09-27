import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";
import { ProvisionForm } from "./provision-form";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";

export default async function AdminPage() {
  const { supabase, email, role } = await getUserContext();

  if (role !== "system_admin") return null;

  const [{ data: hostels, error: hostelsError }, rolesResult] = await Promise.all([
    supabase.from("hostels").select("id,name,status").eq("status", "active").order("name"),
    supabase.from("user_roles").select("role", { count: "exact" }),
  ]);

  if (hostelsError) throw new Error("Unable to load hostels.");

  const roleRows = rolesResult.data ?? [];
  const managerCount = roleRows.filter((item) => item.role === "manager").length;
  const staffCount = roleRows.filter((item) => item.role === "staff").length;

  return (
    <AppShell
      eyebrow="System admin"
      title="Platform administration"
      description="Provision operational users and keep the platform’s active hostels under control."
      email={email}
      activeHref="/admin"
      navItems={[
        { href: "/admin", label: "Overview", icon: "⌂" },
        { href: "/admin", label: "Managers", icon: "◉" },
        { href: "/admin", label: "Staff", icon: "▤" },
        { href: "/admin", label: "Hostels", icon: "▦" },
      ]}
      logoutAction={logout}
    >
      <div className="stats-grid">
        <StatCard label="Active hostels" value={hostels?.length ?? 0} detail="Ready for operations" icon="▦" />
        <StatCard label="Managers" value={managerCount} detail="Provisioned manager roles" icon="◉" />
        <StatCard label="Staff" value={staffCount} detail="Provisioned staff roles" icon="▤" />
        <StatCard label="Administration" value="Live" detail="Protected system workspace" icon="✓" trend="Secure" />
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Provision a manager or staff user"
          description="Existing accounts can be updated; new users receive an invitation."
        >
          <div style={{ padding: "0 20px 20px" }}>
            <ProvisionForm hostels={hostels ?? []} />
          </div>
        </SectionCard>

        <SectionCard title="Active hostels" description={(hostels?.length ?? 0) + " active hostel(s) available to assign."}>
          <div className="data-list">
            {(hostels ?? []).map((hostel) => (
              <div className="data-row" key={hostel.id}>
                <div className="data-main">
                  <strong>{hostel.name}</strong>
                  <span>Ready for manager and tenant operations</span>
                </div>
                <span className="status-pill success">{hostel.status}</span>
              </div>
            ))}
            {!hostels?.length ? (
              <div className="empty-state" style={{ margin: "0 20px 20px" }}>
                <h2>No active hostels</h2>
                <p>Create or activate a hostel before provisioning operational accounts.</p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
