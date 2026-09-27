import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Banknote,
  BedDouble,
  Building2,
  CheckCircle2,
  ClipboardList,
  DoorOpen,
  FileText,
  Home,
  Layers,
  Megaphone,
  Settings,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";

import { logout } from "@/lib/auth/actions";
import { getManagerHostels } from "@/lib/manager/context";
import { getUserContext } from "@/lib/auth/get-user-context";
import { AppShell } from "@/components/hostivo/app-shell";
import { SectionCard } from "@/components/hostivo/section-card";
import { StatCard } from "@/components/hostivo/stat-card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ q?: string; status?: string; hostel?: string }>;
};

type Row = Record<string, unknown>;

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/manager", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
      { href: "/manager/applications", label: "Applications", icon: <ClipboardList className="h-4 w-4" /> },
      { href: "/manager/allocations", label: "Allocations", icon: <BedDouble className="h-4 w-4" /> },
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
      { href: "/manager/staff", label: "Staff", icon: <Users className="h-4 w-4" /> },
      { href: "/manager/announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/manager/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
      { href: "/manager/activity", label: "Activity", icon: <Activity className="h-4 w-4" /> },
      { href: "/manager/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

const labels: Record<string, { title: string; eyebrow: string; description: string }> = {
  applications: {
    title: "Applications",
    eyebrow: "Applications",
    description: "Review resident applications, payment state, and the next automated step.",
  },
  allocations: {
    title: "Allocation engine",
    eyebrow: "Allocation",
    description: "Monitor verified applications, automatic bed assignment, and exceptions.",
  },
  tenants: {
    title: "Tenants",
    eyebrow: "Residents",
    description: "Manage active residents, room assignments, account status, and resident records.",
  },
  payments: {
    title: "Payments",
    eyebrow: "Finance",
    description: "Track charges, payment status, and accounts requiring attention.",
  },
  occupancy: {
    title: "Occupancy",
    eyebrow: "Hostel",
    description: "See current bed capacity, occupied inventory, and availability.",
  },
  hostel: {
    title: "Hostel overview",
    eyebrow: "Hostel",
    description: "Review the configured property hierarchy and operating capacity.",
  },
  rooms: {
    title: "Rooms & beds",
    eyebrow: "Hostel",
    description: "Browse the configured room and bed inventory used by automatic allocation.",
  },
  maintenance: {
    title: "Maintenance",
    eyebrow: "Operations",
    description: "Track service requests, priorities, assignments, and open workload.",
  },
  staff: {
    title: "Staff",
    eyebrow: "Operations",
    description: "Review the staff members supporting hostel operations.",
  },
  reports: {
    title: "Reports",
    eyebrow: "System",
    description: "Turn current operational data into management information.",
  },
  activity: {
    title: "Activity",
    eyebrow: "System",
    description: "Review the latest operational events and audit trail.",
  },
  settings: {
    title: "Settings",
    eyebrow: "System",
    description: "Manage the workspace configuration and move into the dedicated setup controls.",
  },
  complaints: {
    title: "Complaints",
    eyebrow: "Operations",
    description: "Track resident complaints and their resolution state.",
  },
  incidents: {
    title: "Incidents",
    eyebrow: "Operations",
    description: "Track incidents affecting residents, rooms, and hostel operations.",
  },
  announcements: {
    title: "Announcements",
    eyebrow: "Operations",
    description: "Manage resident-facing announcements and expiry.",
  },
};

function getModule(segments: string[]) {
  return segments[0] ?? "dashboard";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getDetailId(segments: string[]) {
  return segments.length > 1 && isUuid(segments[1]) ? segments[1] : null;
}

function getSubview(segments: string[]) {
  return segments.length > 1 && !isUuid(segments[1]) ? segments.slice(1).join("/") : null;
}

function matchesQuery(row: Row, q: string) {
  if (!q) return true;
  const haystack = Object.values(row)
    .filter((value) => ["string", "number"].includes(typeof value))
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

function statusVariant(status: string | null) {
  if (!status) return "default" as const;
  if (["active", "allocated", "successful", "resolved", "closed", "paid", "checked_in"].includes(status)) {
    return "success" as const;
  }
  if (["failed", "cancelled", "overdue", "urgent", "suspended"].includes(status)) {
    return "destructive" as const;
  }
  return "warning" as const;
}

async function loadModuleData(
  module: string,
  hostelIds: string[],
  supabase: Awaited<ReturnType<typeof getUserContext>>["supabase"],
) {
  if (!hostelIds.length) return { rows: [] as Row[], count: 0 };

  if (module === "applications") {
    const { data, count } = await supabase
      .from("applications")
      .select("id,application_number,status,created_at,submitted_at,hostel_id,applicant_user_id", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "allocations") {
    const { data, count } = await supabase
      .from("allocations")
      .select("id,tenant_id,application_id,bed_id,status,starts_at,ends_at,allocated_at,hostel_id", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("allocated_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "tenants") {
    const { data, count } = await supabase
      .from("tenants")
      .select("id,user_id,hostel_id,tenant_number,status,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "payments") {
    const { data, count } = await supabase
      .from("payments")
      .select("id,tenant_id,application_id,charge_id,provider,provider_reference,internal_reference,amount,currency,status,verified_at,paid_at,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "maintenance") {
    const { data, count } = await supabase
      .from("maintenance_requests")
      .select("id,tenant_id,room_id,bed_id,title,description,priority,status,assigned_staff_id,resolved_at,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "staff") {
    const { data, count } = await supabase
      .from("staff")
      .select("id,user_id,staff_number,department,status,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "complaints") {
    const { data, count } = await supabase
      .from("complaints")
      .select("id,tenant_id,subject,description,status,handled_by,resolved_at,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "incidents") {
    const { data, count } = await supabase
      .from("incidents")
      .select("id,tenant_id,room_id,incident_type,description,status,reported_by,handled_by,occurred_at,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "announcements") {
    const { data, count } = await supabase
      .from("announcements")
      .select("id,title,body,audience_type,status,published_at,expires_at,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "activity") {
    const { data, count } = await supabase
      .from("audit_logs")
      .select("id,actor_user_id,action,entity_type,entity_id,result,metadata,created_at", { count: "exact" })
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false })
      .limit(100);
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "hostel") {
    const { data, count } = await supabase
      .from("hostels")
      .select("id,name,location,status,contact_phone,contact_email,created_at", { count: "exact" })
      .in("id", hostelIds)
      .order("name");
    return { rows: (data ?? []) as Row[], count: count ?? 0 };
  }

  if (module === "rooms") {
    const { data: buildings } = await supabase.from("buildings").select("id,name,hostel_id").in("hostel_id", hostelIds);
    const buildingIds = (buildings ?? []).map((x) => x.id);
    const { data: floors } = buildingIds.length
      ? await supabase.from("floors").select("id,name,building_id").in("building_id", buildingIds)
      : { data: [] as { id: string; name: string; building_id: string }[] };
    const floorIds = (floors ?? []).map((x) => x.id);
    const { data: rooms } = floorIds.length
      ? await supabase.from("rooms").select("id,floor_id,room_number,capacity,status").in("floor_id", floorIds).order("room_number")
      : { data: [] as { id: string; floor_id: string; room_number: string; capacity: number; status: string }[] };
    const roomsWithContext = (rooms ?? []).map((room) => {
      const floor = (floors ?? []).find((x) => x.id === room.floor_id);
      const building = floor ? (buildings ?? []).find((x) => x.id === floor.building_id) : null;
      return { ...room, floor_name: floor?.name ?? "", building_name: building?.name ?? "" };
    });
    return { rows: roomsWithContext as Row[], count: roomsWithContext.length };
  }

  return { rows: [] as Row[], count: 0 };
}

async function renderDetail(
  module: string,
  id: string,
  supabase: Awaited<ReturnType<typeof getUserContext>>["supabase"],
  hostelIds: string[],
) {
  const config = labels[module];
  if (!config) redirect("/manager");

  let result: Row | null = null;
  let table = module;

  const mapping: Record<string, string> = {
    applications: "applications",
    allocations: "allocations",
    tenants: "tenants",
    payments: "payments",
    maintenance: "maintenance_requests",
    staff: "staff",
    complaints: "complaints",
    incidents: "incidents",
    announcements: "announcements",
  };
  table = mapping[module] ?? module;

  if (["applications", "allocations", "tenants", "payments", "maintenance", "staff", "complaints", "incidents", "announcements"].includes(module)) {
    const query = supabase.from(table).select("*").eq("id", id);
    const scoped = module === "staff" ? query : query.in("hostel_id", hostelIds);
    const { data } = await scoped.maybeSingle();
    result = (data ?? null) as Row | null;
  }

  if (!result) redirect("/manager/" + module);

  const entries = Object.entries(result);
  return (
    <SectionCard
      title="Record detail"
      description={config.description}
      action={
        <Link href={"/manager/" + module} className="text-xs font-semibold text-primary hover:underline">
          Back to {config.title}
        </Link>
      }
    >
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div className="rounded-[8px] border border-border bg-secondary p-4" key={key}>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {key.replaceAll("_", " ")}
            </span>
            <span className="mt-2 block break-words text-sm font-medium">
              {value === null || value === undefined || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default async function ManagerModulePage({ params, searchParams }: PageProps) {
  const [{ segments }, filters] = await Promise.all([params, searchParams]);
  const { supabase, email, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") redirect("/dashboard");

  const module = getModule(segments);
  const detailId = getDetailId(segments);\n  const subview = getSubview(segments);

  if (module === "dashboard") redirect("/manager");

  const config = labels[module];
  if (!config) redirect("/manager");

  const hostels = await getManagerHostels();
  const hostelIds = hostels
    .filter((hostel) => !filters.hostel || hostel.id === filters.hostel)
    .map((hostel) => hostel.id);

  if (detailId) {
    return (
      <AppShell
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        email={email}
        activeHref={"/manager/" + module}
        navGroups={navGroups}
        logoutAction={logout}
      >
        {await renderDetail(module, detailId, supabase, hostelIds)}
      </AppShell>
    );
  }

  const { rows: rawRows, count } = await loadModuleData(module, hostelIds, supabase);
  let rows = rawRows.filter((row) => matchesQuery(row, filters.q ?? ""));
  if (subview === "exceptions") {
    rows = rows.filter((row) => ["failed", "cancelled", "paused", "overdue"].includes(String(row.status ?? "")));
  } else if (subview === "history") {
    rows = rows.slice(0, 100);
  } else if (subview === "queue") {
    rows = rows.filter((row) => ["submitted", "payment_pending", "paid", "reserved", "pending", "initiated"].includes(String(row.status ?? "")));
  } else if (subview === "verification") {
    rows = rows.filter((row) => ["pending", "paid", "successful"].includes(String(row.status ?? "")));
  } else if (subview === "overdue") {
    rows = rows.filter((row) => String(row.status ?? "") === "overdue");
  } else if (subview === "reconciliation") {
    rows = rows.filter((row) => ["successful", "failed", "reversed", "refunded"].includes(String(row.status ?? "")));
  }

  if (module === "occupancy") {
    const buildingResult = hostelIds.length ? await supabase.from("buildings").select("id").in("hostel_id", hostelIds) : { data: [] };
    const buildingIds = (buildingResult.data ?? []).map((x) => x.id);
    const floorResult = buildingIds.length ? await supabase.from("floors").select("id").in("building_id", buildingIds) : { data: [] };
    const floorIds = (floorResult.data ?? []).map((x) => x.id);
    const roomResult = floorIds.length ? await supabase.from("rooms").select("id").in("floor_id", floorIds) : { data: [] };
    const roomIds = (roomResult.data ?? []).map((x) => x.id);
    const [total, available, occupied, reserved, maintenance] = roomIds.length
      ? await Promise.all([
          supabase.from("beds").select("id", { count: "exact", head: true }).in("room_id", roomIds),
          supabase.from("beds").select("id", { count: "exact", head: true }).in("room_id", roomIds).eq("status", "available"),
          supabase.from("beds").select("id", { count: "exact", head: true }).in("room_id", roomIds).eq("status", "occupied"),
          supabase.from("beds").select("id", { count: "exact", head: true }).in("room_id", roomIds).eq("status", "reserved"),
          supabase.from("beds").select("id", { count: "exact", head: true }).in("room_id", roomIds).eq("status", "maintenance"),
        ])
      : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }];

    const totalCount = total.count ?? 0;
    const occupiedCount = occupied.count ?? 0;
    const occupancy = totalCount ? Math.round((occupiedCount / totalCount) * 100) : 0;

    return (
      <AppShell
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        email={email}
        activeHref="/manager/occupancy"
        navGroups={navGroups}
        logoutAction={logout}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total beds" value={totalCount} detail="Configured inventory" icon={<BedDouble className="h-4 w-4" />} />
          <StatCard label="Occupied" value={occupiedCount} detail="Current occupancy" icon={<Users className="h-4 w-4" />} />
          <StatCard label="Available" value={available.count ?? 0} detail="Ready for allocation" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Reserved" value={reserved.count ?? 0} detail="Held inventory" icon={<Layers className="h-4 w-4" />} />
          <StatCard label="Maintenance" value={maintenance.count ?? 0} detail="Temporarily unavailable" icon={<Wrench className="h-4 w-4" />} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <SectionCard title="Capacity" description="Live bed inventory from Supabase.">
            <div className="p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Occupancy</span>
                  <strong className="mt-1 block text-4xl font-extrabold tracking-tight">{occupancy}%</strong>
                </div>
                <span className="text-xs text-muted-foreground">{occupiedCount} occupied · {available.count ?? 0} available</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: occupancy + "%" }} />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Bed state" description="Inventory by state.">
            <div className="grid gap-2 p-5 sm:grid-cols-2">
              {[
                ["Available", available.count ?? 0, "success"],
                ["Occupied", occupiedCount, "success"],
                ["Reserved", reserved.count ?? 0, "warning"],
                ["Maintenance", maintenance.count ?? 0, "destructive"],
              ].map(([label, value, tone]) => (
                <div className="rounded-[8px] border border-border bg-secondary p-4" key={label}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                  <strong className="mt-2 block text-2xl font-extrabold">{String(value)}</strong>
                  <Badge className="mt-2" variant={tone === "destructive" ? "destructive" : tone === "success" ? "success" : "warning"}>
                    Live
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  if (module === "hostel") {
    return (
      <AppShell eyebrow={config.eyebrow} title={config.title} description={config.description} email={email} activeHref="/manager/hostel" navGroups={navGroups} logoutAction={logout}>
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((hostel) => (
            <SectionCard key={String(hostel.id)} title={String(hostel.name)} description={String(hostel.location ?? "")}>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Status</span><div className="mt-2"><Badge variant={statusVariant(String(hostel.status))}>{String(hostel.status)}</Badge></div></div>
                <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Contact</span><p className="mt-2 text-sm font-medium break-words">{String(hostel.contact_email ?? hostel.contact_phone ?? "Not configured")}</p></div>
              </div>
              <div className="px-5 pb-5"><Link href={"/manager/setup?hostel=" + String(hostel.id)} className="inline-flex min-h-10 items-center rounded-[8px] bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Open setup</Link></div>
            </SectionCard>
          ))}
        </div>
      </AppShell>
    );
  }

  if (module === "settings") {
    return (
      <AppShell eyebrow={config.eyebrow} title={config.title} description={config.description} email={email} activeHref="/manager/settings" navGroups={navGroups} logoutAction={logout}>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["/manager/setup", "Hostel configuration", "Buildings, floors, rooms, beds, and fee plans.", Building2],
            ["/manager/occupancy", "Occupancy", "Live inventory and capacity.", Layers],
            ["/manager/reports", "Reports", "Management information and operational metrics.", BarChart3],
            ["/manager/activity", "Activity", "Audit events and operational history.", Activity],
          ].map(([href, title, description, Icon]) => (
            <Link href={String(href)} className="group rounded-[8px] border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary-soft/30" key={String(href)}>
              <span className="grid size-9 place-items-center rounded-[8px] bg-primary-soft text-primary"><Icon className="h-4 w-4" /></span>
              <strong className="mt-4 block text-sm font-semibold">{String(title)}</strong>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{String(description)}</span>
            </Link>
          ))}
        </div>
      </AppShell>
    );
  }

  if (module === "reports") {
    const activeTenant = await supabase.from("tenants").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds).eq("status", "active");
    const paidPayments = await supabase.from("payments").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds).eq("status", "successful");
    const openMaintenance = await supabase.from("maintenance_requests").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds).in("status", ["submitted", "received", "assigned", "in_progress"]);
    const allocated = await supabase.from("allocations").select("id", { count: "exact", head: true }).in("hostel_id", hostelIds).eq("status", "active");

    return (
      <AppShell eyebrow={config.eyebrow} title={config.title} description={config.description} email={email} activeHref="/manager/reports" navGroups={navGroups} logoutAction={logout}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active tenants" value={activeTenant.count ?? 0} detail="Current residents" icon={<Users className="h-4 w-4" />} />
          <StatCard label="Successful payments" value={paidPayments.count ?? 0} detail="Recorded successful transactions" icon={<Banknote className="h-4 w-4" />} />
          <StatCard label="Open maintenance" value={openMaintenance.count ?? 0} detail="Requests in progress" icon={<Wrench className="h-4 w-4" />} />
          <StatCard label="Active allocations" value={allocated.count ?? 0} detail="Occupied beds" icon={<BedDouble className="h-4 w-4" />} />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["/manager/occupancy", "Occupancy report", "Capacity, occupied beds, and availability."],
            ["/manager/applications", "Applications report", "Application volume and status."],
            ["/manager/payments", "Payments report", "Payment activity and outstanding work."],
            ["/manager/tenants", "Tenant report", "Resident directory and movement."],
            ["/manager/maintenance", "Maintenance report", "Service requests and workload."],
            ["/manager/allocations", "Allocation report", "Automatic allocation activity and exceptions."],
          ].map(([href, title, desc]) => (
            <Link href={href} className="rounded-[8px] border border-border bg-card p-5 hover:border-primary/30 hover:bg-primary-soft/30" key={href}>
              <strong className="block text-sm font-semibold">{title}</strong>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{desc}</span>
            </Link>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell eyebrow={config.eyebrow} title={config.title} description={config.description} email={email} activeHref={"/manager/" + module} navGroups={navGroups} logoutAction={logout}>
      <div className="mb-4 flex flex-col gap-3 rounded-[8px] border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form className="flex min-w-0 flex-1 gap-2" method="get">
          <input name="q" defaultValue={filters.q ?? ""} placeholder={"Search " + config.title.toLowerCase() + "…"} className="h-10 min-w-0 flex-1 rounded-[8px] border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <button type="submit" className="min-h-10 rounded-[8px] border border-border bg-secondary px-4 text-sm font-semibold hover:bg-muted">Search</button>
        </form>
        <Link href={"/manager/" + module} className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary">Clear</Link>
      </div>

      <SectionCard title={config.title + " queue"} description={count + " record(s) available to your manager role."}>
        {rows.length ? (
          <div className="overflow-x-auto">
            <div className="min-w-[760px] divide-y divide-border/60">
              {rows.map((row) => {
                const id = String(row.id ?? "");
                const status = row.status ? String(row.status) : null;
                const titleValue =
                  row.application_number ??
                  row.tenant_number ??
                  row.title ??
                  row.subject ??
                  row.staff_number ??
                  row.internal_reference ??
                  row.name ??
                  row.action ??
                  id;
                const subtitle =
                  row.description ??
                  row.provider ??
                  row.department ??
                  row.entity_type ??
                  row.location ??
                  row.incident_type ??
                  "";
                return (
                  <div className="grid grid-cols-[minmax(220px,1fr)_160px_170px_120px] items-center gap-4 px-5 py-4" key={id}>
                    <div className="min-w-0">
                      <strong className="block truncate text-[13px] font-semibold">{String(titleValue)}</strong>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{String(subtitle)}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "—"}</span>
                    <span>{status ? <Badge variant={statusVariant(status)}>{status.replaceAll("_", " ")}</Badge> : <span className="text-xs text-muted-foreground">Recorded</span>}</span>
                    <Link href={"/manager/" + module + "/" + id} className="justify-self-start text-xs font-semibold text-primary hover:underline">View</Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-7 text-sm text-muted-foreground">
            No records match the current view.
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
