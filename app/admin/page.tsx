import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";
import { ProvisionForm } from "./provision-form";
import { AppShell } from "@/components/hostivo/app-shell";
import { StatCard } from "@/components/hostivo/stat-card";
import { SectionCard } from "@/components/hostivo/section-card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  Home,
  UserCog,
} from "lucide-react";

export default async function AdminPage() {
  const { supabase, email, role } = await getUserContext();

  if (role !== "system_admin") return null;

  const [{ data: hostels, error: hostelsError }, rolesResult] =
    await Promise.all([
      supabase
        .from("hostels")
        .select("id,name,status")
        .eq("status", "active")
        .order("name"),
      supabase.from("user_roles").select("role", { count: "exact" }),
    ]);

  if (hostelsError) throw new Error("Unable to load hostels.");

  const roleRows = rolesResult.data ?? [];
  const managerCount = roleRows.filter(
    (item) => item.role === "manager"
  ).length;
  const staffCount = roleRows.filter((item) => item.role === "staff").length;

  return (
    <AppShell
      eyebrow="System admin"
      title="Platform administration"
      description="Provision operational users and keep the platform’s active hostels under control."
      email={email}
      activeHref="/admin"
      navItems={[
        { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/admin", label: "Managers", icon: <Users className="h-4 w-4" /> },
        { href: "/admin", label: "Staff", icon: <UserCog className="h-4 w-4" /> },
        { href: "/admin", label: "Hostels", icon: <Building2 className="h-4 w-4" /> },
      ]}
      logoutAction={logout}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active hostels"
          value={hostels?.length ?? 0}
          detail="Ready for operations"
          icon={<Home className="h-4 w-4" />}
        />
        <StatCard
          label="Managers"
          value={managerCount}
          detail="Provisioned manager roles"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Staff"
          value={staffCount}
          detail="Provisioned staff roles"
          icon={<UserCog className="h-4 w-4" />}
        />
        <StatCard
          label="Administration"
          value="Live"
          detail="Protected system workspace"
          icon={<ShieldCheck className="h-4 w-4" />}
          trend="Secure"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <SectionCard
          title="Provision a manager or staff user"
          description="Existing accounts can be updated; new users receive an invitation."
        >
          <div className="px-5 pb-5">
            <ProvisionForm hostels={hostels ?? []} />
          </div>
        </SectionCard>

        <SectionCard
          title="Active hostels"
          description={
            (hostels?.length ?? 0) +
            " active hostel(s) available to assign."
          }
        >
          <div>
            {(hostels ?? []).map((hostel) => (
              <div
                className="flex items-center justify-between gap-3.5 border-t border-border/50 px-5 py-3.5 first:border-t-0"
                key={hostel.id}
              >
                <div className="min-w-0">
                  <strong className="block text-[13px] font-semibold">
                    {hostel.name}
                  </strong>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    Ready for manager and tenant operations
                  </span>
                </div>
                <Badge variant="success">{hostel.status}</Badge>
              </div>
            ))}
            {!hostels?.length ? (
              <div className="mx-5 mb-5 rounded-[14px] border border-dashed border-border bg-secondary p-6">
                <h3 className="font-semibold">No active hostels</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Create or activate a hostel before provisioning operational
                  accounts.
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
