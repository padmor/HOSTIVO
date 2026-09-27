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
  UserRoundCheck,
  X,
} from "lucide-react";

import { logout } from "@/lib/auth/actions";
import { createMaintenanceRequest, reviewApplication, reviewPayment, updateHostel } from "@/lib/manager/actions";
import { getManagerHostels } from "@/lib/manager/context";
import { getUserContext } from "@/lib/auth/get-user-context";
import { AppShell } from "@/components/hostivo/app-shell";
import { SectionCard } from "@/components/hostivo/section-card";
import { StatCard } from "@/components/hostivo/stat-card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ q?: string; status?: string; hostel?: string; page?: string }>;
};

type Row = Record<string, unknown>;

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/manager", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
      { href: "/manager/tenants", label: "Tenants", icon: <Users className="h-4 w-4" /> },
      { href: "/manager/applications", label: "Applications", icon: <ClipboardList className="h-4 w-4" /> },
      { href: "/manager/allocations", label: "Allocations", icon: <BedDouble className="h-4 w-4" /> },
      { href: "/manager/payments", label: "Payments", icon: <Banknote className="h-4 w-4" /> },
    ],
  },
  {
    label: "Hostel",
    items: [
      { href: "/manager/buildings", label: "Buildings", icon: <Building2 className="h-4 w-4" /> },
      { href: "/manager/floors", label: "Floors", icon: <Layers className="h-4 w-4" /> },
      { href: "/manager/rooms", label: "Rooms", icon: <DoorOpen className="h-4 w-4" /> },
      { href: "/manager/beds", label: "Beds", icon: <BedDouble className="h-4 w-4" /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/manager/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
      { href: "/manager/complaints", label: "Complaints", icon: <AlertTriangle className="h-4 w-4" /> },
      { href: "/manager/incidents", label: "Incidents", icon: <ShieldAlert className="h-4 w-4" /> },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/manager/staff", label: "Staff", icon: <Users className="h-4 w-4" /> },
      { href: "/manager/announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
      { href: "/manager/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
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
  buildings: {
    title: "Buildings",
    eyebrow: "Hostel",
    description: "Manage the buildings that make up your hostel property.",
  },
  floors: {
    title: "Floors",
    eyebrow: "Hostel",
    description: "Manage floors within each hostel building.",
  },
  beds: {
    title: "Beds",
    eyebrow: "Hostel",
    description: "Manage individual bed inventory used for resident allocation.",
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

  if (module === "buildings") {
    const { data } = await supabase
      .from("buildings")
      .select("id,name,code,hostel_id,created_at")
      .in("hostel_id", hostelIds)
      .order("name");
    return { rows: (data ?? []) as Row[], count: data?.length ?? 0 };
  }

  if (module === "floors") {
    const { data: buildings } = await supabase.from("buildings").select("id,name,hostel_id").in("hostel_id", hostelIds);
    const buildingIds = (buildings ?? []).map((x) => x.id);
    const { data } = buildingIds.length
      ? await supabase.from("floors").select("id,name,floor_number,building_id,created_at").in("building_id", buildingIds).order("floor_number")
      : { data: [] as { id: string; name: string; floor_number: number | null; building_id: string; created_at: string }[] };
    const buildingMap = new Map((buildings ?? []).map((x) => [x.id, x.name]));
    return {
      rows: (data ?? []).map((floor) => ({ ...floor, building_name: buildingMap.get(floor.building_id) ?? "Building" })) as Row[],
      count: data?.length ?? 0,
    };
  }

  if (module === "beds") {
    const { data: buildings } = await supabase.from("buildings").select("id,hostel_id").in("hostel_id", hostelIds);
    const buildingIds = (buildings ?? []).map((x) => x.id);
    const { data: floors } = buildingIds.length ? await supabase.from("floors").select("id,building_id").in("building_id", buildingIds) : { data: [] };
    const floorIds = (floors ?? []).map((x) => x.id);
    const { data: rooms } = floorIds.length ? await supabase.from("rooms").select("id,floor_id,room_number").in("floor_id", floorIds) : { data: [] };
    const roomIds = (rooms ?? []).map((x) => x.id);
    const { data } = roomIds.length ? await supabase.from("beds").select("id,room_id,bed_number,status,created_at").in("room_id", roomIds).order("bed_number") : { data: [] };
    const roomMap = new Map((rooms ?? []).map((x) => [x.id, x.room_number]));
    return { rows: (data ?? []).map((bed) => ({ ...bed, room_name: roomMap.get(bed.room_id) ?? "Room" })) as Row[], count: data?.length ?? 0 };
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

  if (module === "applications") {
    const { data: application } = await supabase
      .from("applications")
      .select("id,hostel_id,applicant_user_id,application_number,status,submitted_at,created_at,tenant_id")
      .eq("id", id)
      .in("hostel_id", hostelIds)
      .maybeSingle();

    if (!application) redirect("/manager/applications");

    const [{ data: profile }, { data: charge }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name,email,phone,student_id")
        .eq("id", application.applicant_user_id)
        .maybeSingle(),
      supabase
        .from("charges")
        .select("id,description,amount,currency,status,due_at")
        .eq("application_id", application.id)
        .eq("hostel_id", application.hostel_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const hostel = (await supabase
      .from("hostels")
      .select("name")
      .eq("id", application.hostel_id)
      .maybeSingle()).data;

    const approved = ["paid", "allocated", "completed"].includes(application.status);
    const paymentPending = application.status === "payment_pending";

    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <SectionCard
          title="Applicant information"
          description="Review applicant details and approve the next stage of the accommodation workflow."
          action={
            <Link href="/manager/applications" className="text-xs font-semibold text-primary hover:underline">
              Back to applications
            </Link>
          }
        >
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {[
              ["Full name", profile?.full_name ?? "Not available"],
              ["Student ID", profile?.student_id ?? "Not provided"],
              ["Email address", profile?.email ?? "Not available"],
              ["Phone number", profile?.phone ?? "Not provided"],
              ["Application", application.application_number],
              ["Hostel", hostel?.name ?? "Hostel"],
            ].map(([label, value]) => (
              <div className="rounded-[8px] border border-border bg-secondary p-4" key={String(label)}>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                <span className="mt-2 block break-words text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="mx-5 mb-5 rounded-[8px] border border-border bg-card p-5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Selected accommodation & fee plan</span>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <strong className="text-sm">{charge?.description ?? "Fee plan pending"}</strong>
              {charge ? <span className="text-sm font-semibold">{Number(charge.amount).toLocaleString()} {charge.currency}</span> : null}
            </div>
          </div>
          <div className="mx-5 mb-5 grid gap-2 sm:grid-cols-5">
            {[
              ["Submitted", true],
              ["Availability checked", approved || paymentPending],
              ["Payment pending", paymentPending || approved],
              ["Room allocated", application.status === "allocated" || application.status === "completed"],
              ["Active attendance", false],
            ].map(([label, done]) => (
              <div className="rounded-[8px] border border-border bg-secondary p-3" key={String(label)}>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                  <span className={"size-2 rounded-full " + (done ? "bg-primary" : "bg-muted")} />
                  {done ? "Complete" : "Pending"}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid content-start gap-5">
          <SectionCard title="Payment status" description="Charge associated with this application.">
            <div className="p-5">
              <div className="rounded-[8px] bg-secondary p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Charge reference</span>
                <strong className="mt-2 block break-all text-sm">{charge?.id ?? "No charge"}</strong>
                <span className="mt-2 block text-xs text-muted-foreground">
                  Outstanding amount: {charge ? Number(charge.amount).toLocaleString() + " " + charge.currency : "—"}
                </span>
                <div className="mt-3">
                  <Badge variant={charge?.status === "paid" ? "success" : "warning"}>{charge?.status ?? "missing"}</Badge>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Application status" description="Current workflow state.">
            <div className="p-5">
              <Badge variant={statusVariant(application.status)}>{application.status.replaceAll("_", " ")}</Badge>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {paymentPending
                  ? "Payment is now the next action. Allocation is handled after verified payment."
                  : application.status === "paid"
                    ? "Payment is verified. The allocation process can now assign a bed."
                    : approved
                      ? "The application has progressed beyond review."
                      : "This application is awaiting manager review."}
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Review actions" description="Only use these controls when the application is still awaiting review.">
            <div className="grid gap-2 p-5 sm:grid-cols-2">
              <form action={reviewApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <input type="hidden" name="decision" value="reject" />
                <button type="submit" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-destructive/30 bg-destructive-soft px-4 text-sm font-semibold text-destructive hover:bg-destructive/10">
                  <X className="h-4 w-4" />
                  Reject application
                </button>
              </form>
              <form action={reviewApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <input type="hidden" name="decision" value="approve" />
                <button type="submit" disabled={paymentPending || approved} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
                  <UserRoundCheck className="h-4 w-4" />
                  Approve &amp; check availability
                </button>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

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
  const detailId = getDetailId(segments);
  const subview = getSubview(segments);

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

  if (module === "applications") {
    const { data: allApplications } = await supabase
      .from("applications")
      .select("id,application_number,applicant_user_id,hostel_id,status,submitted_at,created_at")
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });

    const applicationRows = allApplications ?? [];
    const applicantIds = [...new Set(applicationRows.map((x) => x.applicant_user_id))];
    const [{ data: profiles }, { data: charges }] = await Promise.all([
      applicantIds.length
        ? supabase.from("profiles").select("id,full_name,student_id").in("id", applicantIds)
        : { data: [] as { id: string; full_name: string; student_id: string | null }[] },
      applicationRows.length
        ? supabase.from("charges").select("application_id,description,amount,currency,status").in("application_id", applicationRows.map((x) => x.id))
        : { data: [] as { application_id: string | null; description: string; amount: number; currency: string; status: string }[] },
    ]);
    const profileById = new Map((profiles ?? []).map((x) => [x.id, x]));
    const chargeByApp = new Map<string, { application_id: string | null; description: string; amount: number; currency: string; status: string }>();
    for (const charge of charges ?? []) if (charge.application_id && !chargeByApp.has(charge.application_id)) chargeByApp.set(charge.application_id, charge);

    const filtered = applicationRows.filter((row) => {
      const profile = profileById.get(row.applicant_user_id);
      const haystack = [profile?.full_name, profile?.student_id, row.application_number, hostelIds.includes(row.hostel_id) ? hostels.find((h) => h.id === row.hostel_id)?.name : ""].filter(Boolean).join(" ");
      const statusOk = !filters.status || filters.status === "all" || row.status === filters.status;
      return statusOk && matchesQuery({ haystack }, filters.q ?? "");
    });
    const page = Math.max(1, Number(filters.page ?? "1") || 1);
    const pageSize = 8;
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
      <AppShell eyebrow="Operations" title="Manage accommodation applications" description="Review resident applications, payment state, and the next automated step." email={email} activeHref="/manager/applications" navGroups={navGroups} logoutAction={logout}>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total applications" value={applicationRows.length} detail="Total received" icon={<ClipboardList className="h-4 w-4" />} />
          <StatCard label="Pending review" value={applicationRows.filter((x) => x.status === "submitted").length} detail="Awaiting approval" icon={<Activity className="h-4 w-4" />} />
          <StatCard label="Approved" value={applicationRows.filter((x) => ["payment_pending", "paid", "allocated", "completed"].includes(x.status)).length} detail="Passed review" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Rejected" value={applicationRows.filter((x) => x.status === "cancelled").length} detail="Cancelled applications" icon={<AlertTriangle className="h-4 w-4" />} />
        </div>

        <div className="mt-4 rounded-[8px] border border-border bg-card p-4">
          <form className="grid gap-2.5 lg:grid-cols-[1fr_170px_auto]" method="get">
            <input name="q" defaultValue={filters.q ?? ""} placeholder="Search Applicant, ID..." className="h-10 rounded-[8px] border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            <select name="status" defaultValue={filters.status ?? "all"} className="h-10 rounded-[8px] border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option value="all">Status: All</option>
              <option value="submitted">Pending</option>
              <option value="payment_pending">Payment pending</option>
              <option value="paid">Paid</option>
              <option value="allocated">Allocated</option>
              <option value="cancelled">Rejected</option>
            </select>
            <button type="submit" className="min-h-10 rounded-[8px] bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Filter</button>
          </form>
        </div>

        <div className="mt-4">
          <SectionCard title="Applications" description={"Showing " + (visible.length ? ((currentPage - 1) * pageSize + 1) : 0) + "-" + Math.min(currentPage * pageSize, filtered.length) + " of " + filtered.length + " applications"}>
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.1fr_1fr_170px_130px_80px] border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Applicant</span><span>Hostel / Plan</span><span>Status</span><span>Applied</span><span>Action</span>
                </div>
                {visible.map((application) => {
                  const profile = profileById.get(application.applicant_user_id);
                  const charge = chargeByApp.get(application.id);
                  return (
                    <div className="grid grid-cols-[1.1fr_1fr_170px_130px_80px] items-center gap-3 border-b border-border/50 px-5 py-3.5" key={application.id}>
                      <div className="min-w-0"><strong className="block truncate text-[13px]">{profile?.full_name ?? "Applicant"}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{profile?.student_id ?? application.application_number}</span></div>
                      <div className="min-w-0"><strong className="block truncate text-[12px]">{hostels.find((h) => h.id === application.hostel_id)?.name ?? "Hostel"}</strong><span className="mt-1 block truncate text-[11px] text-muted-foreground">{charge?.description ?? "Fee plan not available"}</span></div>
                      <span><Badge variant={statusVariant(application.status)}>{application.status.replaceAll("_", " ")}</Badge></span>
                      <span className="text-[11px] text-muted-foreground">{new Date(application.created_at).toLocaleDateString()}</span>
                      <Link href={"/manager/applications/" + application.id} className="text-xs font-semibold text-primary hover:underline">View</Link>
                    </div>
                  );
                })}
                {!visible.length ? <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No applications match the current filters.</div> : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <span className="text-xs text-muted-foreground">Page {currentPage} of {pageCount}</span>
              <div className="flex gap-2">
                <Link href={"/manager/applications?" + new URLSearchParams({ ...(filters.q ? { q: filters.q } : {}), ...(filters.status ? { status: filters.status } : {}), page: String(Math.max(1, currentPage - 1)) }).toString()} className={"inline-flex min-h-9 items-center rounded-[8px] border border-border px-3 text-xs font-semibold " + (currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-secondary")}>Previous</Link>
                <Link href={"/manager/applications?" + new URLSearchParams({ ...(filters.q ? { q: filters.q } : {}), ...(filters.status ? { status: filters.status } : {}), page: String(Math.min(pageCount, currentPage + 1)) }).toString()} className={"inline-flex min-h-9 items-center rounded-[8px] border border-border px-3 text-xs font-semibold " + (currentPage === pageCount ? "pointer-events-none opacity-40" : "hover:bg-secondary")}>Next</Link>
              </div>
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  if (module === "payments") {
    const { data: payments } = await supabase
      .from("payments")
      .select("id,provider_reference,internal_reference,amount,currency,status,verified_at,paid_at,created_at,application_id,tenant_id")
      .in("hostel_id", hostelIds)
      .order("created_at", { ascending: false });
    const rows = payments ?? [];
    const pending = rows.filter((x) => x.status === "pending").length;
    const verifiedToday = rows.filter((x) => x.status === "successful").length;
    const failed = rows.filter((x) => ["failed", "reversed"].includes(x.status)).length;
    const visible = rows.filter((row) => matchesQuery(row, filters.q ?? "") && (!filters.status || filters.status === "all" || row.status === filters.status)).slice(0, 50);

    return (
      <AppShell eyebrow="Finance" title="Verify bank transactions and approve tenant clearances" description="Review payment records and move verified applications into the allocation workflow." email={email} activeHref="/manager/payments" navGroups={navGroups} logoutAction={logout}>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <StatCard label="Pending verification" value={pending} detail="Requires checking" icon={<Banknote className="h-4 w-4" />} />
          <StatCard label="Verified today" value={verifiedToday} detail="Successfully processed" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Failed / rejected" value={failed} detail="Transaction flags" icon={<AlertTriangle className="h-4 w-4" />} />
        </div>
        <div className="mt-4">
          <SectionCard title="Payment verification" description={visible.length + " transaction(s) in the current view."}>
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[1.2fr_1fr_170px_170px_180px] border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Reference</span><span>Amount</span><span>Status</span><span>Recorded</span><span>Action</span>
                </div>
                {visible.map((payment) => (
                  <div className="grid grid-cols-[1.2fr_1fr_170px_170px_180px] items-center gap-3 border-b border-border/50 px-5 py-3.5" key={payment.id}>
                    <div><strong className="block truncate text-[13px]">{payment.provider_reference}</strong><span className="mt-1 block truncate text-[11px] text-muted-foreground">{payment.internal_reference}</span></div>
                    <span className="text-sm font-semibold">{Number(payment.amount).toLocaleString()} {payment.currency}</span>
                    <Badge variant={statusVariant(payment.status)}>{payment.status.replaceAll("_", " ")}</Badge>
                    <span className="text-[11px] text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <form action={reviewPayment}><input type="hidden" name="paymentId" value={payment.id}/><input type="hidden" name="decision" value="reject"/><button type="submit" className="inline-flex min-h-9 items-center rounded-[8px] border border-destructive/30 bg-destructive-soft px-3 text-xs font-semibold text-destructive hover:bg-destructive/10">Reject</button></form>
                      <form action={reviewPayment}><input type="hidden" name="paymentId" value={payment.id}/><input type="hidden" name="decision" value="verify"/><button type="submit" disabled={payment.status === "successful"} className="inline-flex min-h-9 items-center rounded-[8px] bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40">Verify Clear</button></form>
                    </div>
                  </div>
                ))}
                {!visible.length ? <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No payment records match the current view.</div> : null}
              </div>
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  if (module === "allocations") {
    const { data: allocations } = await supabase
      .from("allocations")
      .select("id,tenant_id,bed_id,status,starts_at,ends_at,allocated_at")
      .in("hostel_id", hostelIds)
      .order("allocated_at", { ascending: false });
    const allocationRows = allocations ?? [];
    const activeCount = allocationRows.filter((x) => x.status === "active").length;
    const bedIds = [...new Set(allocationRows.map((x) => x.bed_id))];
    const tenantIds = [...new Set(allocationRows.map((x) => x.tenant_id))];
    const [{ data: tenants }, { data: beds }] = await Promise.all([
      tenantIds.length ? supabase.from("tenants").select("id,tenant_number,user_id").in("id", tenantIds) : { data: [] as { id:string; tenant_number:string|null; user_id:string }[] },
      bedIds.length ? supabase.from("beds").select("id,bed_number,room_id,status").in("id", bedIds) : { data: [] as { id:string; bed_number:string; room_id:string; status:string }[] },
    ]);
    const userIds = (tenants ?? []).map((x) => x.user_id);
    const { data: profiles } = userIds.length ? await supabase.from("profiles").select("id,full_name").in("id", userIds) : { data: [] as {id:string;full_name:string}[] };
    const tenantMap = new Map((tenants ?? []).map((x) => [x.id, x]));
    const profileMap = new Map((profiles ?? []).map((x) => [x.id, x]));
    const bedMap = new Map((beds ?? []).map((x) => [x.id, x]));
    const bedRoomIds = [...new Set((beds ?? []).map((x) => x.room_id))];
    const { data: rooms } = bedRoomIds.length ? await supabase.from("rooms").select("id,room_number,floor_id").in("id", bedRoomIds) : { data: [] as {id:string;room_number:string;floor_id:string}[] };
    const roomMap = new Map((rooms ?? []).map((x) => [x.id, x]));
    const visible = allocationRows.filter((row) => {
      const tenant = tenantMap.get(row.tenant_id); const profile = tenant ? profileMap.get(tenant.user_id) : null; const bed = bedMap.get(row.bed_id); const haystack = [profile?.full_name, tenant?.tenant_number, bed?.bed_number, bed ? roomMap.get(bed.room_id)?.room_number : ""].filter(Boolean).join(" ");
      return matchesQuery({ haystack }, filters.q ?? "") && (!filters.status || filters.status === "all" || row.status === filters.status);
    }).slice(0, 50);

    const buildingResult = hostelIds.length ? await supabase.from("buildings").select("id").in("hostel_id", hostelIds) : { data: [] };
    const buildingIds = (buildingResult.data ?? []).map((x) => x.id);
    const floorResult = buildingIds.length ? await supabase.from("floors").select("id").in("building_id", buildingIds) : { data: [] };
    const floorIds = (floorResult.data ?? []).map((x) => x.id);
    const roomResult = floorIds.length ? await supabase.from("rooms").select("id").in("floor_id", floorIds) : { data: [] };
    const roomIds = (roomResult.data ?? []).map((x) => x.id);
    const [totalBeds, availableBeds] = roomIds.length ? await Promise.all([
      supabase.from("beds").select("id", {count:"exact",head:true}).in("room_id", roomIds),
      supabase.from("beds").select("id", {count:"exact",head:true}).in("room_id", roomIds).eq("status","available"),
    ]) : [{count:0},{count:0}];
    const total = totalBeds.count ?? 0;
    const available = availableBeds.count ?? 0;
    const occupancy = total ? Math.round(((total - available) / total) * 100) : 0;

    return (
      <AppShell eyebrow="Residence" title="Live residency and occupancy overview" description="Monitor current resident allocations and live bed capacity." email={email} activeHref="/manager/allocations" navGroups={navGroups} logoutAction={logout}>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <StatCard label="Active allocations" value={activeCount} detail="Tenants checked in" icon={<Users className="h-4 w-4" />} />
          <StatCard label="Available beds" value={available} detail="Unoccupied slots" icon={<BedDouble className="h-4 w-4" />} />
          <StatCard label="Occupancy rate" value={occupancy + "%"} detail={"Total capacity " + total} icon={<Layers className="h-4 w-4" />} />
        </div>
        <div className="mt-4 rounded-[8px] border border-border bg-card p-4">
          <form className="grid gap-2.5 sm:grid-cols-[1fr_180px_auto]" method="get">
            <input name="q" defaultValue={filters.q ?? ""} placeholder="Filter by Tenant, Room..." className="h-10 rounded-[8px] border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            <select name="status" defaultValue={filters.status ?? "all"} className="h-10 rounded-[8px] border border-input bg-card px-3 text-sm"><option value="all">Status: All</option><option value="active">Active</option><option value="reserved">Pending</option><option value="ended">Ended</option><option value="cancelled">Cancelled</option></select>
            <button type="submit" className="min-h-10 rounded-[8px] bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Filter</button>
          </form>
        </div>
        <div className="mt-4"><SectionCard title="Current allocations" description={visible.length + " allocation(s) in the current view."}>
          <div className="overflow-x-auto"><div className="min-w-[680px]"><div className="grid grid-cols-[1fr_160px_140px_170px] border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><span>Tenant</span><span>Bed</span><span>Status</span><span>Allocated</span></div>
          {visible.map((row)=>{const tenant=tenantMap.get(row.tenant_id);const profile=tenant?profileMap.get(tenant.user_id):null;const bed=bedMap.get(row.bed_id);const room=bed?roomMap.get(bed.room_id):null;return <div className="grid grid-cols-[1fr_160px_140px_170px] items-center gap-3 border-b border-border/50 px-5 py-3.5" key={row.id}><div><strong className="block truncate text-[13px]">{profile?.full_name??tenant?.tenant_number??"Tenant"}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{room?.room_number??"Room"} · {tenant?.tenant_number??"No tenant number"}</span></div><span className="text-sm">{bed?.bed_number??"Bed"}</span><Badge variant={statusVariant(row.status)}>{row.status}</Badge><span className="text-[11px] text-muted-foreground">{new Date(row.allocated_at).toLocaleDateString()}</span></div>})}
          {!visible.length?<div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No allocations match the current view.</div>:null}</div></div>
        </SectionCard></div>
      </AppShell>
    );
  }

  if (module === "tenants") {
    const { data: tenants } = await supabase.from("tenants").select("id,user_id,hostel_id,tenant_number,status,created_at").in("hostel_id", hostelIds).order("created_at",{ascending:false});
    const rows = tenants ?? [];
    const ids = [...new Set(rows.map(x=>x.user_id))];
    const {data:profiles}=ids.length?await supabase.from("profiles").select("id,full_name,student_id").in("id",ids):{data:[] as {id:string;full_name:string;student_id:string|null}[]};
    const map=new Map((profiles??[]).map(x=>[x.id,x]));
    const filtered=rows.filter(row=>{const p=map.get(row.user_id);return matchesQuery({haystack:[p?.full_name,p?.student_id,row.tenant_number].filter(Boolean).join(" ")},filters.q??"")&&(!filters.status||filters.status==="all"||row.status===filters.status)}).slice(0,50);
    const total=rows.length;const active=rows.filter(x=>x.status==="active").length;const inactive=rows.filter(x=>["inactive","checked_out","suspended"].includes(x.status)).length;

    return <AppShell eyebrow="Residents" title="University of Cape Coast — Adehye Hall" description="Manage residential profiles, room assignments, and tenant status." email={email} activeHref="/manager/tenants" navGroups={navGroups} logoutAction={logout}>
      <div className="grid gap-3.5 sm:grid-cols-3"><StatCard label="Total tenants" value={total} detail="All residential profiles" icon={<Users className="h-4 w-4"/>}/><StatCard label="Active tenants" value={active} detail="Verified residents" icon={<CheckCircle2 className="h-4 w-4"/>}/><StatCard label="Inactive tenants" value={inactive} detail="Checked out or pending" icon={<AlertTriangle className="h-4 w-4"/>}/></div>
      <div className="mt-4 rounded-[8px] border border-border bg-card p-4"><form className="grid gap-2.5 sm:grid-cols-[1fr_180px_auto]" method="get"><input name="q" defaultValue={filters.q??""} placeholder="Search Tenant Name, Student ID..." className="h-10 rounded-[8px] border border-input bg-card px-3 text-sm"/><select name="status" defaultValue={filters.status??"all"} className="h-10 rounded-[8px] border border-input bg-card px-3 text-sm"><option value="all">Status: All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="checked_out">Checked out</option></select><button type="submit" className="min-h-10 rounded-[8px] bg-primary px-4 text-sm font-semibold text-white">Filter</button></form></div>
      <div className="mt-4"><SectionCard title="Tenants" description={filtered.length+" tenant(s) in the current view."}><div className="overflow-x-auto"><div className="min-w-[700px]"><div className="grid grid-cols-[1.2fr_170px_150px_100px] border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><span>Name</span><span>Room / Bed</span><span>Status</span><span>Actions</span></div>{filtered.map(row=><div className="grid grid-cols-[1.2fr_170px_150px_100px] items-center gap-3 border-b border-border/50 px-5 py-3.5" key={row.id}><div><strong className="block truncate text-[13px]">{map.get(row.user_id)?.full_name??"Tenant"}</strong><span className="mt-1 text-[11px] text-muted-foreground">{map.get(row.user_id)?.student_id??row.tenant_number??"No student ID"}</span></div><span className="text-xs text-muted-foreground">View allocation</span><Badge variant={statusVariant(row.status)}>{row.status.replaceAll("_"," ")}</Badge><Link className="text-xs font-semibold text-primary hover:underline" href={"/manager/tenants/"+row.id}>View</Link></div>)}{!filtered.length?<div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No tenants match the current filters.</div>:null}</div></div></SectionCard></div>
    </AppShell>;
  }

  if (module === "maintenance" && subview === "new") {
    return <AppShell eyebrow="Operations" title="Adehye Hall Operations & Facility Care" description="Create a maintenance request for the hostel operations team." email={email} activeHref="/manager/maintenance" navGroups={navGroups} logoutAction={logout}>
      <SectionCard title="Request details" description="Capture enough information for maintenance staff to diagnose and resolve the issue.">
        <form action={createMaintenanceRequest} className="grid gap-5 p-5">
          <input type="hidden" name="hostelId" value={hostels[0]?.id ?? ""}/>
          <div className="grid gap-2"><label className="text-[13px] font-semibold">Category</label><select className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm" name="category" defaultValue="general"><option value="general">General</option><option value="electrical">Electrical</option><option value="plumbing">Plumbing</option><option value="furniture">Furniture</option><option value="security">Security</option></select></div>
          <div className="grid gap-2"><label className="text-[13px] font-semibold">Priority</label><select className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm" name="priority" defaultValue="normal"><option value="low">Low</option><option value="normal">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          <div className="grid gap-2"><label className="text-[13px] font-semibold">Issue title</label><input name="title" required placeholder="E.g., Broken ceiling fan, leaky washroom pipe" className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm"/></div>
          <div className="grid gap-2"><label className="text-[13px] font-semibold">Detailed description</label><textarea name="description" required rows={6} placeholder="Please provide specific details about the issue..." className="rounded-[8px] border border-input bg-card px-3 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/></div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href="/manager/maintenance" className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-border px-4 text-sm font-semibold">Cancel</Link><button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-[8px] bg-primary px-4 text-sm font-semibold text-white">Submit request</button></div>
        </form>
      </SectionCard>
    </AppShell>;
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
                <div className="rounded-[8px] border border-border bg-secondary p-4" key={String(label)}>
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
    const selectedHostel = hostels[0] ?? null;
    return (
      <AppShell eyebrow="System Configuration" title="Settings" description="Configure the hostel details that drive the operational workspace." email={email} activeHref="/manager/settings" navGroups={navGroups} logoutAction={logout}>
        <div className="mb-4 flex flex-wrap gap-2">
          {["Hostel", "Applications", "Allocation", "Payments", "Notifications", "Security", "Profile"].map((tab) => (
            <Link
              href={tab === "Hostel" ? "/manager/settings" : tab === "Applications" ? "/manager/applications" : tab === "Allocation" ? "/manager/allocations" : tab === "Payments" ? "/manager/payments" : "/manager/settings"}
              className={"inline-flex min-h-9 items-center rounded-[8px] border px-3 text-xs font-semibold " + (tab === "Hostel" ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground hover:bg-secondary")}
              key={tab}
            >
              {tab}
            </Link>
          ))}
        </div>
        {selectedHostel ? (
          <SectionCard title="Hostel details" description="Core property information used across the Hostivo workspace.">
            <form action={updateHostel} className="grid gap-5 p-5">
              <input type="hidden" name="hostelId" value={selectedHostel.id} />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2"><label htmlFor="settings-hostel-name" className="text-[13px] font-semibold">Hostel Name</label><input id="settings-hostel-name" name="name" defaultValue={selectedHostel.name} required className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm" /></div>
                <div className="grid gap-2"><label htmlFor="settings-location" className="text-[13px] font-semibold">Location</label><input id="settings-location" name="location" defaultValue={selectedHostel.location} required className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm" /></div>
                <div className="grid gap-2"><label htmlFor="settings-phone" className="text-[13px] font-semibold">Contact Phone</label><input id="settings-phone" name="contactPhone" defaultValue={selectedHostel.contact_phone ?? ""} className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm" /></div>
                <div className="grid gap-2"><label htmlFor="settings-email" className="text-[13px] font-semibold">Contact Email</label><input id="settings-email" name="contactEmail" type="email" defaultValue={selectedHostel.contact_email ?? ""} className="h-11 rounded-[8px] border border-input bg-card px-3 text-sm" /></div>
              </div>
              <div className="flex justify-end"><button type="submit" className="inline-flex min-h-10 items-center rounded-[8px] bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Save changes</button></div>
            </form>
          </SectionCard>
        ) : (
          <div className="rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No managed hostel is assigned to this account yet.</div>
        )}
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

      <SectionCard
        title={config.title + " queue"}
        description={count + " record(s) available to your manager role."}
        action={
          module === "maintenance" ? (
            <Link href="/manager/maintenance/new" className="inline-flex min-h-9 items-center rounded-[8px] bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark">
              New request
            </Link>
          ) : null
        }
      >
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
