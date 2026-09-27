import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { getManagerHostels } from "@/lib/manager/context";
import { getUserContext } from "@/lib/auth/get-user-context";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  User,
  Home,
  Users,
  Layers,
  Banknote,
} from "lucide-react";

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
      ? supabase
          .from("tenants")
          .select("id", { count: "exact", head: true })
          .in("hostel_id", hostelIds)
      : Promise.resolve({ count: 0, data: [] }),
    hostelIds.length
      ? supabase
          .from("applications")
          .select(
            "id,application_number,status,created_at,hostel_id",
            { count: "exact" }
          )
          .in("hostel_id", hostelIds)
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ count: 0, data: [] }),
    hostelIds.length
      ? supabase
          .from("allocations")
          .select("id", { count: "exact", head: true })
          .in("hostel_id", hostelIds)
          .eq("status", "active")
      : Promise.resolve({ count: 0 }),
    hostelIds.length
      ? supabase
          .from("charges")
          .select("id", { count: "exact", head: true })
          .in("hostel_id", hostelIds)
          .eq("status", "pending")
      : Promise.resolve({ count: 0 }),
  ]);

  const tenantCount = tenantsResult.count ?? 0;
  const applicationCount = applicationsResult.count ?? 0;
  const activeAllocationCount = activeAllocationsResult.count ?? 0;
  const pendingChargeCount = chargesResult.count ?? 0;
  const applications = applicationsResult.data ?? [];

  const hostelName = new Map(
    hostels.map((hostel) => [hostel.id, hostel.name])
  );

  return (
    <AppShell
      eyebrow="Manager"
      title="Operations dashboard"
      description="See the state of your hostels, then jump directly into setup and daily operations."
      email={email}
      activeHref="/manager"
      navItems={[
        { href: "/manager", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/manager/setup", label: "Hostel setup", icon: <Building2 className="h-4 w-4" /> },
        { href: "/tenant", label: "Tenant view", icon: <User className="h-4 w-4" /> },
      ]}
      logoutAction={logout}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned hostels"
          value={hostels.length}
          detail="Active manager workspace"
          icon={<Home className="h-4 w-4" />}
        />
        <StatCard
          label="Tenants"
          value={tenantCount}
          detail="Across assigned hostels"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Active allocations"
          value={activeAllocationCount}
          detail="Current room / bed occupancy"
          icon={<Layers className="h-4 w-4" />}
        />
        <StatCard
          label="Pending charges"
          value={pendingChargeCount}
          detail="Awaiting payment action"
          icon={<Banknote className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <SectionCard
          title="Recent applications"
          description={
            applicationCount +
            " application(s) currently visible to your manager role."
          }
          action={<Badge variant="info">Live data</Badge>}
        >
          <div>
            {applications.map((application) => (
              <div
                className="flex items-center justify-between gap-3.5 border-t border-border/50 px-5 py-3.5 first:border-t-0"
                key={application.id}
              >
                <div className="min-w-0">
                  <strong className="block text-[13px] font-semibold">
                    {application.application_number}
                  </strong>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {hostelName.get(application.hostel_id) ?? "Hostel"} &middot;{" "}
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  variant={
                    application.status === "allocated" ? "success" : "warning"
                  }
                >
                  {application.status.replaceAll("_", " ")}
                </Badge>
              </div>
            ))}
            {!applications.length ? (
              <div className="mx-5 mb-5 rounded-[14px] border border-dashed border-border bg-secondary p-6">
                <h3 className="font-semibold">No applications yet</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Once tenants begin applying, their application activity will
                  appear here.
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Manager actions"
          description="Start with configuration, then move into operations."
        >
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-5">
            {hostels.map((hostel) => (
              <Link
                className="rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-primary/30 hover:bg-primary-soft/30"
                href={"/manager/setup?hostel=" + hostel.id}
                key={hostel.id}
              >
                <strong className="block text-xs font-semibold">
                  {hostel.name}
                </strong>
                <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">
                  Open building, room, bed and fee setup.
                </span>
              </Link>
            ))}
            {!hostels.length ? (
              <div className="col-span-2 rounded-[14px] border border-dashed border-border bg-secondary p-5">
                <p className="text-sm text-muted-foreground">
                  A system administrator needs to assign this manager account to
                  an active hostel.
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
