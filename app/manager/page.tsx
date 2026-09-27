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
  ClipboardList,
  Building2,
  DoorOpen,
  Home,
  Users,
  Wrench,
  BedSingle,
  Layers,
  Banknote,
  AlertTriangle,
  ShieldAlert,
  UserCog,
  Megaphone,
  BarChart3,
  Settings,
} from "lucide-react";

export default async function ManagerHome() {
  const { supabase, email, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") return null;

  const hostels = await getManagerHostels();
  const hostelIds = hostels.map((hostel) => hostel.id);

  const [
    activeTenantsResult,
    applicationsResult,
    activeAllocationsResult,
    chargesResult,
    maintenanceResult,
  ] = await Promise.all([
    hostelIds.length
      ? supabase
          .from("tenants")
          .select("id", { count: "exact", head: true })
          .in("hostel_id", hostelIds)
          .eq("status", "active")
      : Promise.resolve({ count: 0, data: [] }),
    hostelIds.length
      ? supabase
          .from("applications")
          .select("id,application_number,status,created_at,hostel_id", {
            count: "exact",
          })
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
    hostelIds.length
      ? supabase
          .from("maintenance_requests")
          .select("id", { count: "exact", head: true })
          .in("hostel_id", hostelIds)
          .in("status", ["submitted", "received", "assigned", "in_progress"])
      : Promise.resolve({ count: 0 }),
  ]);

  const buildingResult = hostelIds.length
    ? await supabase
        .from("buildings")
        .select("id")
        .in("hostel_id", hostelIds)
    : { data: [] };

  const buildingIds = (buildingResult.data ?? []).map((building) => building.id);

  const floorResult = buildingIds.length
    ? await supabase.from("floors").select("id").in("building_id", buildingIds)
    : { data: [] };

  const floorIds = (floorResult.data ?? []).map((floor) => floor.id);

  const roomResult = floorIds.length
    ? await supabase.from("rooms").select("id").in("floor_id", floorIds)
    : { data: [] };

  const roomIds = (roomResult.data ?? []).map((room) => room.id);

  const [totalBedsResult, availableBedsResult] = roomIds.length
    ? await Promise.all([
        supabase
          .from("beds")
          .select("id", { count: "exact", head: true })
          .in("room_id", roomIds),
        supabase
          .from("beds")
          .select("id", { count: "exact", head: true })
          .in("room_id", roomIds)
          .eq("status", "available"),
      ])
    : [{ count: 0 }, { count: 0 }];

  const currentTenantCount = activeTenantsResult.count ?? 0;
  const applicationCount = applicationsResult.count ?? 0;
  const activeAllocationCount = activeAllocationsResult.count ?? 0;
  const pendingChargeCount = chargesResult.count ?? 0;
  const openMaintenanceCount = maintenanceResult.count ?? 0;
  const totalBedCount = totalBedsResult.count ?? 0;
  const availableBedCount = availableBedsResult.count ?? 0;
  const applications = applicationsResult.data ?? [];

  const hostelName = new Map(
    hostels.map((hostel) => [hostel.id, hostel.name])
  );

  const occupancy =
    totalBedCount > 0
      ? Math.min(100, Math.round((activeAllocationCount / totalBedCount) * 100))
      : 0;

  return (
    <AppShell
      eyebrow="Manager"
      title="Operations Overview"
      description="Monitor capacity, residents, applications, payments, and service issues from one workspace."
      email={email}
      activeHref="/manager"
      navGroups={[
        {
          label: "Overview",
          items: [
            { href: "/manager", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
            { href: "/manager/applications", label: "Applications", icon: <ClipboardList className="h-4 w-4" /> },
            { href: "/manager/allocations", label: "Allocations", icon: <BedSingle className="h-4 w-4" /> },
            { href: "/manager/tenants", label: "Tenants", icon: <Users className="h-4 w-4" /> },
            { href: "/manager/payments", label: "Payments", icon: <Banknote className="h-4 w-4" /> },
          ],
        },
        {
          label: "Hostel",
          items: [
            { href: "/manager/setup", label: "Hostel setup", icon: <Building2 className="h-4 w-4" /> },
            { href: "/manager/hostel", label: "Hostel overview", icon: <Home className="h-4 w-4" /> },
            { href: "/manager/occupancy", label: "Occupancy", icon: <Layers className="h-4 w-4" /> },
            { href: "/manager/rooms", label: "Rooms & beds", icon: <DoorOpen className="h-4 w-4" /> },
          ],
        },
        {
          label: "Operations",
          items: [
            { href: "/manager/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
            { href: "/manager/complaints", label: "Complaints", icon: <AlertTriangle className="h-4 w-4" /> },
            { href: "/manager/incidents", label: "Incidents", icon: <ShieldAlert className="h-4 w-4" /> },
            { href: "/manager/staff", label: "Staff", icon: <UserCog className="h-4 w-4" /> },
            { href: "/manager/announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
          ],
        },
        {
          label: "System",
          items: [
            { href: "/manager/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
            { href: "/manager/activity", label: "Activity", icon: <Layers className="h-4 w-4" /> },
            { href: "/manager/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
          ],
        },
      ]}
      logoutAction={logout}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total beds"
          value={totalBedCount}
          detail="Configured hostel capacity"
          icon={<BedSingle className="h-4 w-4" />}
        />
        <StatCard
          label="Occupied beds"
          value={activeAllocationCount}
          detail="Active room and bed allocations"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Available beds"
          value={availableBedCount}
          detail="Ready for allocation"
          icon={<Home className="h-4 w-4" />}
        />
        <StatCard
          label="Current tenants"
          value={currentTenantCount}
          detail="Residents currently active"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Open maintenance"
          value={openMaintenanceCount}
          detail="Requests needing action"
          icon={<Wrench className="h-4 w-4" />}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.68fr)_minmax(300px,0.9fr)]">
        <SectionCard
          title="Recent applications"
          description={applicationCount + " application(s) currently visible to your manager role."}
          action={<Badge variant="info">Live data</Badge>}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[116px_minmax(160px,1fr)_150px_116px] border-t border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>App no.</span>
                <span>Hostel</span>
                <span>Status</span>
                <span>Date</span>
              </div>

              {applications.map((application) => (
                <div
                  className="grid grid-cols-[116px_minmax(160px,1fr)_150px_116px] items-center gap-2 border-t border-border/50 px-5 py-3.5"
                  key={application.id}
                >
                  <strong className="truncate text-[13px] font-semibold">
                    {application.application_number}
                  </strong>
                  <span className="truncate text-[12px] text-muted-foreground">
                    {hostelName.get(application.hostel_id) ?? "Hostel"}
                  </span>
                  <span>
                    <Badge
                      variant={
                        application.status === "allocated"
                          ? "success"
                          : application.status === "cancelled"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {application.status.replaceAll("_", " ")}
                    </Badge>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {!applications.length ? (
                <div className="mx-5 my-5 rounded-[8px] border border-dashed border-border bg-secondary p-6">
                  <h3 className="font-semibold">No applications yet</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Once residents begin applying, application activity will appear here.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Manager actions"
          description="Open the configured hostel workspace."
        >
          <div className="grid gap-2.5 px-5 pb-5">
            {hostels.map((hostel) => (
              <Link
                className="rounded-[8px] border border-border bg-card p-3.5 transition-colors hover:border-primary/30 hover:bg-primary-soft/30"
                href={"/manager/setup?hostel=" + hostel.id}
                key={hostel.id}
              >
                <strong className="block text-xs font-semibold">
                  {hostel.name}
                </strong>
                <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">
                  Buildings, floors, rooms, beds, and fee plans.
                </span>
              </Link>
            ))}
            {!hostels.length ? (
              <div className="rounded-[8px] border border-dashed border-border bg-secondary p-5">
                <p className="text-sm text-muted-foreground">
                  A system administrator needs to assign this manager account to an active hostel.
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Operational signals"
          description="Live workload indicators for today."
        >
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <div className="rounded-[8px] bg-primary-soft p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                Applications
              </span>
              <strong className="mt-2 block text-2xl font-extrabold">
                {applicationCount}
              </strong>
            </div>
            <div className="rounded-[8px] bg-secondary p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Pending charges
              </span>
              <strong className="mt-2 block text-2xl font-extrabold">
                {pendingChargeCount}
              </strong>
            </div>
            <div className="rounded-[8px] bg-destructive-soft p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">
                Maintenance
              </span>
              <strong className="mt-2 block text-2xl font-extrabold">
                {openMaintenanceCount}
              </strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Capacity"
          description="A quick view of available versus occupied inventory."
        >
          <div className="p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Occupancy
                </span>
                <strong className="mt-1 block text-3xl font-extrabold tracking-tight">
                  {totalBedCount > 0 ? occupancy + "%" : "—"}
                </strong>
              </div>
              <span className="text-xs text-muted-foreground">
                {activeAllocationCount} occupied · {availableBedCount} available
              </span>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-label="Current bed occupancy"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={occupancy}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: occupancy + "%" }}
              />
            </div>

            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              Capacity updates as beds are allocated, released, or taken offline for maintenance.
            </p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
