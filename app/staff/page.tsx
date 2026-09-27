import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";

export default async function StaffPage() {
  const { email, role } = await getUserContext();

  if (role !== "staff") return null;

  return (
    <AppShell
      eyebrow="Staff"
      title="Staff workspace"
      description="A focused operational home for tasks, maintenance requests, incidents, and resident support."
      email={email}
      activeHref="/staff"
      navItems={[
        { href: "/staff", label: "Dashboard", icon: "⌂" },
        { href: "/staff", label: "Tasks", icon: "✓" },
        { href: "/staff", label: "Maintenance", icon: "⚒" },
        { href: "/staff", label: "Incidents", icon: "!" },
      ]}
      logoutAction={logout}
    >
      <div className="stats-grid">
        <StatCard label="Assigned tasks" value="—" detail="Staff task data will connect next" icon="✓" />
        <StatCard label="Maintenance" value="—" detail="Requests will appear here" icon="⚒" />
        <StatCard label="Incidents" value="—" detail="Incident workflow will appear here" icon="!" />
        <StatCard label="Hostel" value="—" detail="Assigned workspace" icon="▦" />
      </div>
      <SectionCard title="Staff operations" description="The shell is ready; operational modules will be connected in the next frontend milestone.">
        <div className="empty-state" style={{ margin: "0 20px 20px" }}>
          <h2>Staff module foundation is ready</h2>
          <p>Tasks, maintenance, complaints, incidents and announcements will plug into this workspace without changing the navigation structure.</p>
        </div>
      </SectionCard>
    </AppShell>
  );
}
