import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";
import {
  LayoutDashboard,
  CheckSquare,
  Wrench,
  AlertTriangle,
  Building2,
} from "lucide-react";

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
        { href: "/staff", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/staff", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
        { href: "/staff", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
        { href: "/staff", label: "Incidents", icon: <AlertTriangle className="h-4 w-4" /> },
      ]}
      logoutAction={logout}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned tasks" value="—" detail="Staff task data will connect next" icon={<CheckSquare className="h-4 w-4" />} />
        <StatCard label="Maintenance" value="—" detail="Requests will appear here" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Incidents" value="—" detail="Incident workflow will appear here" icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="Hostel" value="—" detail="Assigned workspace" icon={<Building2 className="h-4 w-4" />} />
      </div>
      <div className="mt-4">
        <SectionCard
          title="Staff operations"
          description="The shell is ready; operational modules will be connected in the next frontend milestone."
        >
          <div className="mx-5 mb-5 rounded-[14px] border border-dashed border-border bg-secondary p-6">
            <h3 className="font-semibold">Staff module foundation is ready</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tasks, maintenance, complaints, incidents and announcements will
              plug into this workspace without changing the navigation
              structure.
            </p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
