import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeDollarSign,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  User,
  Wrench,
} from "lucide-react";

import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";
import { submitApplication } from "@/lib/tenant/actions";
import { AppShell } from "@/components/hostivo/app-shell";
import { SectionCard } from "@/components/hostivo/section-card";
import { StatCard } from "@/components/hostivo/stat-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge as UiBadge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ message?: string; error?: string; q?: string }>;
};

const groups = [
  {
    label: "My workspace",
    items: [
      { href: "/tenant", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: "/tenant/applications", label: "Applications", icon: <ClipboardList className="h-4 w-4" /> },
      { href: "/tenant/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
      { href: "/tenant/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
      { href: "/tenant/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/tenant/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    ],
  },
];

function titleFor(view: string) {
  return {
    applications: ["Applications", "Applications", "Track applications and move through payment and allocation."],
    payments: ["Payments", "Payments", "Review charges and payment records connected to your account."],
    maintenance: ["Maintenance", "Maintenance", "View service requests for your room and hostel."],
    notifications: ["Notifications", "Notifications", "Stay up to date with hostel activity and important actions."],
    profile: ["Profile", "Profile", "Manage the account information connected to your tenant identity."],
  }[view] ?? ["Your accommodation", "Tenant", "Manage your accommodation and hostel account."];
}

export default async function TenantModulePage({ params, searchParams }: Props) {
  const [{ segments }, query] = await Promise.all([params, searchParams]);
  const { supabase, email, userId, role } = await getUserContext();

  if (role !== "tenant") redirect("/dashboard");

  const view = segments[0] ?? "dashboard";
  const detailId = segments[1];

  const { data: applications } = await supabase
    .from("applications")
    .select("id,hostel_id,application_number,status,submitted_at,created_at")
    .eq("applicant_user_id", userId)
    .order("created_at", { ascending: false });

  const applicationRows = applications ?? [];
  const applicationIds = applicationRows.map((x) => x.id);

  const { data: charges } = applicationIds.length
    ? await supabase
        .from("charges")
        .select("id,application_id,description,amount,currency,status,due_at,created_at")
        .in("application_id", applicationIds)
        .order("created_at", { ascending: false })
    : { data: [] as {
        id: string;
        application_id: string | null;
        description: string;
        amount: number;
        currency: string;
        status: string;
        due_at: string | null;
        created_at: string;
      }[] };

  const chargeRows = charges ?? [];

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id,hostel_id,tenant_number,status,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const tenant = tenants?.[0] ?? null;

  const { data: feePlans } = await supabase
    .from("fee_plans")
    .select("id,hostel_id,name,description,amount,currency")
    .eq("status", "active")
    .order("name");

  const hostelsById = new Map<string, { id: string; name: string; location: string }>();
  const hostelIds = [...new Set((feePlans ?? []).map((x) => x.hostel_id))];
  if (hostelIds.length) {
    const { data: hostels } = await supabase
      .from("hostels")
      .select("id,name,location")
      .in("id", hostelIds)
      .eq("status", "active");
    for (const hostel of hostels ?? []) hostelsById.set(hostel.id, hostel);
  }

  if (detailId && view === "applications") {
    const application = applicationRows.find((x) => x.id === detailId);
    if (!application) redirect("/tenant/applications");
    const charge = chargeRows.find((x) => x.application_id === application.id);
    return (
      <AppShell eyebrow="Tenant" title="Application detail" description="Review the current application state and next action." email={email} activeHref="/tenant/applications" navGroups={groups} logoutAction={logout}>
        <SectionCard title={application.application_number} description="Application lifecycle">
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Status</span><div className="mt-2"><UiBadge variant={application.status === "allocated" ? "success" : "warning"}>{application.status.replaceAll("_", " ")}</UiBadge></div></div>
            <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Created</span><span className="mt-2 block text-sm font-medium">{new Date(application.created_at).toLocaleString()}</span></div>
            <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Payment</span><span className="mt-2 block text-sm font-medium">{charge ? charge.status.replaceAll("_", " ") : "No charge"}</span></div>
            <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Next</span><span className="mt-2 block text-sm font-medium">{application.status === "payment_pending" ? "Complete payment" : application.status === "paid" ? "Automatic allocation" : application.status === "allocated" ? "Prepare for check-in" : "Monitor application"}</span></div>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  if (detailId && view === "maintenance") {
    const { data: request } = await supabase.from("maintenance_requests").select("*").eq("id", detailId).eq("tenant_id", tenant?.id ?? "").maybeSingle();
    if (!request) redirect("/tenant/maintenance");
    return (
      <AppShell eyebrow="Tenant" title="Maintenance request" description="View your request and its current service state." email={email} activeHref="/tenant/maintenance" navGroups={groups} logoutAction={logout}>
        <SectionCard title={request.title} description={request.description}>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Priority</span><span className="mt-2 block text-sm font-medium">{request.priority}</span></div>
            <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Status</span><div className="mt-2"><UiBadge variant={request.status === "resolved" || request.status === "closed" ? "success" : "warning"}>{request.status.replaceAll("_", " ")}</UiBadge></div></div>
          </div>
        </SectionCard>
      </AppShell>
    );
  }


  if (view === "dashboard") {
    const pending = applicationRows.filter((x) => x.status === "payment_pending").length;
    const allocated = applicationRows.filter((x) => x.status === "allocated").length;
    return (
      <AppShell
        eyebrow="Tenant"
        title="Your accommodation"
        description="Track applications, payments, allocation, and hostel services from your tenant workspace."
        email={email}
        activeHref="/tenant"
        navGroups={groups}
        logoutAction={logout}
      >
        {query.message ? <div className="mb-4 rounded-[8px] bg-success-soft p-3 text-sm text-success" role="status">{query.message}</div> : null}
        {query.error ? <div className="mb-4 rounded-[8px] bg-destructive-soft p-3 text-sm text-destructive" role="alert">{query.error}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Applications" value={applicationRows.length} detail="Accommodation requests" icon={<ClipboardList className="h-4 w-4" />} />
          <StatCard label="Awaiting payment" value={pending} detail="Payment actions needed" icon={<CreditCard className="h-4 w-4" />} />
          <StatCard label="Allocated" value={allocated} detail="Room / bed assignment" icon={<Home className="h-4 w-4" />} />
          <StatCard label="Available options" value={(feePlans ?? []).length} detail="Published fee plans" icon={<FileText className="h-4 w-4" />} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <SectionCard title="Start an application" description="Choose an active accommodation option. Availability is checked on the server at submission.">
            {(feePlans ?? []).length ? (
              <form className="grid gap-4 p-5" action={submitApplication}>
                <div className="grid gap-1.5">
                  <Label htmlFor="fee-plan">Accommodation option</Label>
                  <select id="fee-plan" name="feePlanId" defaultValue="" required className="h-11 w-full rounded-[8px] border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                    <option value="" disabled>Choose an option</option>
                    {(feePlans ?? []).map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {hostelsById.get(plan.hostel_id)?.name ?? "Hostel"} — {plan.name} — {Number(plan.amount).toLocaleString()} {plan.currency}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit">Check availability and apply</Button>
              </form>
            ) : (
              <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No active accommodation options are published yet.</div>
            )}
          </SectionCard>
          <SectionCard title="Current account" description="Your tenant identity and current status.">
            <div className="grid gap-3 p-5">
              <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Account</span><strong className="mt-2 block text-sm">{email ?? "Tenant"}</strong></div>
              <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Tenant number</span><strong className="mt-2 block text-sm">{tenant?.tenant_number ?? "Not assigned yet"}</strong></div>
              <div className="rounded-[8px] bg-secondary p-4"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Status</span><div className="mt-2"><UiBadge variant={tenant?.status === "active" ? "success" : "warning"}>{tenant?.status ?? "applicant"}</UiBadge></div></div>
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  if (view === "profile") {
    const { data: profile } = await supabase.from("profiles").select("full_name,email,phone,avatar_path").eq("id", userId).maybeSingle();
    return (
      <AppShell eyebrow="Tenant" title="Profile" description="Manage the account information connected to your tenant identity." email={email} activeHref="/tenant/profile" navGroups={groups} logoutAction={logout}>
        <SectionCard title="Personal information" description="These details are stored in your Hostivo profile.">
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {[
              ["Full name", profile?.full_name ?? "Not set"],
              ["Email", profile?.email ?? email ?? "Not set"],
              ["Phone", profile?.phone ?? "Not set"],
              ["Tenant number", tenant?.tenant_number ?? "Not assigned"],
            ].map(([label, value]) => (
              <div className="rounded-[8px] border border-border bg-secondary p-4" key={label}>
                <span className="block text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
                <span className="mt-2 block break-words text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  if (view === "applications") {
    return (
      <AppShell eyebrow="Tenant" title="Applications" description="Track applications and their payment and allocation state." email={email} activeHref="/tenant/applications" navGroups={groups} logoutAction={logout}>
        <SectionCard title="Application history" description={applicationRows.length + " application(s) on this account."}>
          <div className="overflow-x-auto">
            <div className="min-w-[680px] divide-y divide-border/60">
              {applicationRows.map((application) => (
                <div className="grid grid-cols-[1fr_150px_150px_100px] items-center gap-4 px-5 py-4" key={application.id}>
                  <div className="min-w-0"><strong className="block truncate text-sm">{application.application_number}</strong><span className="mt-1 block text-xs text-muted-foreground">{new Date(application.created_at).toLocaleDateString()}</span></div>
                  <UiBadge variant={application.status === "allocated" ? "success" : "warning"}>{application.status.replaceAll("_", " ")}</UiBadge>
                  <span className="text-xs text-muted-foreground">{application.submitted_at ? "Submitted" : "Draft"}</span>
                  <Link className="text-xs font-semibold text-primary hover:underline" href={"/tenant/applications/" + application.id}>View</Link>
                </div>
              ))}
              {!applicationRows.length ? <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No applications yet.</div> : null}
            </div>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  if (view === "payments") {
    return (
      <AppShell eyebrow="Tenant" title="Payments" description="Review charges connected to your applications and account." email={email} activeHref="/tenant/payments" navGroups={groups} logoutAction={logout}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total charges" value={chargeRows.length} detail="Charges on this account" icon={<BadgeDollarSign className="h-4 w-4" />} />
          <StatCard label="Paid" value={chargeRows.filter((x) => x.status === "paid").length} detail="Completed charges" icon={<CreditCard className="h-4 w-4" />} />
          <StatCard label="Pending" value={chargeRows.filter((x) => x.status === "pending").length} detail="Payment action needed" icon={<FileText className="h-4 w-4" />} />
        </div>
        <div className="mt-5">
          <SectionCard title="Charges" description={chargeRows.length + " charge(s) currently associated with your applications."}>
            <div className="divide-y divide-border/60">
              {chargeRows.map((charge) => (
                <div className="flex items-center justify-between gap-4 px-5 py-4" key={charge.id}>
                  <div className="min-w-0"><strong className="block truncate text-sm">{charge.description}</strong><span className="mt-1 block text-xs text-muted-foreground">{Number(charge.amount).toLocaleString()} {charge.currency}{charge.due_at ? " · due " + new Date(charge.due_at).toLocaleDateString() : ""}</span></div>
                  <UiBadge variant={charge.status === "paid" ? "success" : "warning"}>{charge.status.replaceAll("_", " ")}</UiBadge>
                </div>
              ))}
              {!chargeRows.length ? <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No charges are available.</div> : null}
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  if (view === "maintenance") {
    const { data: requests } = await supabase
      .from("maintenance_requests")
      .select("id,title,description,priority,status,created_at,resolved_at")
      .eq("tenant_id", tenant?.id ?? "")
      .order("created_at", { ascending: false });

    return (
      <AppShell eyebrow="Tenant" title="Maintenance" description="View service requests associated with your hostel stay." email={email} activeHref="/tenant/maintenance" navGroups={groups} logoutAction={logout}>
        <SectionCard title="Your maintenance requests" description={(requests ?? []).length + " request(s) on your tenant record."}>
          <div className="divide-y divide-border/60">
            {(requests ?? []).map((request) => (
              <Link href={"/tenant/maintenance/" + request.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-secondary" key={request.id}>
                <div className="min-w-0"><strong className="block truncate text-sm">{request.title}</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{request.description}</span></div>
                <UiBadge variant={request.status === "resolved" || request.status === "closed" ? "success" : request.priority === "urgent" ? "destructive" : "warning"}>{request.status.replaceAll("_", " ")}</UiBadge>
              </Link>
            ))}
            {!(requests ?? []).length ? <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No maintenance requests yet.</div> : null}
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  if (view === "notifications") {
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id,title,body,read_at,created_at,type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    return (
      <AppShell eyebrow="Tenant" title="Notifications" description="Review recent hostel and account notifications." email={email} activeHref="/tenant/notifications" navGroups={groups} logoutAction={logout}>
        <SectionCard title="Notification center" description={(notifications ?? []).length + " notification(s)."}>
          <div className="divide-y divide-border/60">
            {(notifications ?? []).map((notification) => (
              <div className="px-5 py-4" key={notification.id}><div className="flex items-start justify-between gap-3"><strong className="text-sm">{notification.title}</strong><UiBadge variant={notification.read_at ? "default" : "info"}>{notification.read_at ? "Read" : "New"}</UiBadge></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.body}</p></div>
            ))}
            {!(notifications ?? []).length ? <div className="m-5 rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">No notifications yet.</div> : null}
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  redirect("/tenant");
}
