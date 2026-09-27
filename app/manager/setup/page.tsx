import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";
import { getManagerHostels, getManagerHostel } from "@/lib/manager/context";
import {
  createBuilding,
  createFloor,
  createRoom,
  createBed,
  createFeePlan,
} from "@/lib/manager/actions";
import { AppShell } from "@/components/hostivo/app-shell";
import { SectionCard } from "@/components/hostivo/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  User,
  Layers,
  DoorOpen,
  BedDouble,
  Banknote,
} from "lucide-react";

type SetupPageProps = {
  searchParams: Promise<{ hostel?: string; message?: string; error?: string }>;
};

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const params = await searchParams;
  const { email, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") return null;

  const hostels = await getManagerHostels();
  const hostelId = params.hostel ?? hostels[0]?.id;
  const hostel = hostelId ? await getManagerHostel(hostelId) : null;

  return (
    <AppShell
      eyebrow="Manager"
      title="Hostel setup"
      description="Configure buildings, floors, rooms, beds and fee plans for your assigned hostels."
      email={email}
      activeHref="/manager/setup"
      navItems={[
        { href: "/manager", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/manager/setup", label: "Hostel setup", icon: <Building2 className="h-4 w-4" /> },
        { href: "/tenant", label: "Tenant view", icon: <User className="h-4 w-4" /> },
      ]}
      logoutAction={logout}
    >
      {params.message ? (
        <div className="mb-4 rounded-lg bg-success-soft p-3 text-sm text-success" role="status">
          {params.message}
        </div>
      ) : null}
      {params.error ? (
        <div className="mb-4 rounded-lg bg-destructive-soft p-3 text-sm text-destructive" role="alert">
          {params.error}
        </div>
      ) : null}

      {/* Hostel selector */}
      {hostels.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {hostels.map((h) => (
            <Link
              key={h.id}
              href={"/manager/setup?hostel=" + h.id}
              className={
                "rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors " +
                (h.id === hostelId
                  ? "border-primary/40 bg-primary-soft text-primary-dark"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30")
              }
            >
              {h.name}
            </Link>
          ))}
        </div>
      ) : null}

      {!hostel ? (
        <SectionCard title="No hostel assigned">
          <div className="mx-5 mb-5 rounded-[14px] border border-dashed border-border bg-secondary p-6">
            <p className="text-sm text-muted-foreground">
              Your account is not assigned to any active hostel yet. Contact the system administrator.
            </p>
          </div>
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Buildings */}
          <SectionCard
            title="Buildings"
            description={"Manage the physical buildings of " + hostel.name + "."}
            action={<Badge variant="info">{(hostel as any).buildings?.length ?? 0}</Badge>}
          >
            <div>
              {((hostel as any).buildings ?? []).map((building: any) => (
                <div
                  className="flex items-center justify-between gap-3.5 border-t border-border/50 px-5 py-3.5 first:border-t-0"
                  key={building.id}
                >
                  <div className="min-w-0">
                    <strong className="block text-[13px] font-semibold">{building.name}</strong>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {building.code ?? "No code"}
                    </span>
                  </div>
                  <Badge variant="success">{building.status ?? "active"}</Badge>
                </div>
              ))}
            </div>
            <form className="grid gap-3 border-t border-border/50 px-5 py-4" action={createBuilding}>
              <input type="hidden" name="hostelId" value={hostelId} />
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="building-name">Name</Label>
                  <Input id="building-name" name="name" required minLength={1} maxLength={120} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="building-code">Code</Label>
                  <Input id="building-code" name="code" maxLength={20} />
                </div>
              </div>
              <Button type="submit" size="sm">Add building</Button>
            </form>
          </SectionCard>

          {/* Floors */}
          <SectionCard
            title="Floors"
            description="Add floors to buildings."
            action={<Layers className="h-4 w-4 text-muted-foreground" />}
          >
            <form className="grid gap-3 px-5 pb-5" action={createFloor}>
              <input type="hidden" name="hostelId" value={hostelId} />
              <div className="grid gap-1.5">
                <Label htmlFor="floor-building">Building</Label>
                <select
                  id="floor-building"
                  name="buildingId"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="" disabled>Select building</option>
                  {((hostel as any).buildings ?? []).map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="floor-name">Name</Label>
                  <Input id="floor-name" name="name" required minLength={1} maxLength={80} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="floor-level">Level</Label>
                  <Input id="floor-level" name="level" type="number" defaultValue="0" />
                </div>
              </div>
              <Button type="submit" size="sm">Add floor</Button>
            </form>
          </SectionCard>

          {/* Rooms */}
          <SectionCard
            title="Rooms"
            description="Create rooms on specific floors."
            action={<DoorOpen className="h-4 w-4 text-muted-foreground" />}
          >
            <form className="grid gap-3 px-5 pb-5" action={createRoom}>
              <input type="hidden" name="hostelId" value={hostelId} />
              <div className="grid gap-1.5">
                <Label htmlFor="room-floor">Floor</Label>
                <select
                  id="room-floor"
                  name="floorId"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="" disabled>Select floor</option>
                  {((hostel as any).buildings ?? []).flatMap((b: any) =>
                    (b.floors ?? []).map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {b.name} — {f.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="room-number">Room number</Label>
                  <Input id="room-number" name="roomNumber" required maxLength={20} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="room-capacity">Capacity</Label>
                  <Input id="room-capacity" name="capacity" type="number" defaultValue="4" min="1" />
                </div>
              </div>
              <Button type="submit" size="sm">Add room</Button>
            </form>
          </SectionCard>

          {/* Beds */}
          <SectionCard
            title="Beds"
            description="Create bed slots within rooms."
            action={<BedDouble className="h-4 w-4 text-muted-foreground" />}
          >
            <form className="grid gap-3 px-5 pb-5" action={createBed}>
              <input type="hidden" name="hostelId" value={hostelId} />
              <div className="grid gap-1.5">
                <Label htmlFor="bed-room">Room</Label>
                <select
                  id="bed-room"
                  name="roomId"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="" disabled>Select room</option>
                  {((hostel as any).buildings ?? []).flatMap((b: any) =>
                    (b.floors ?? []).flatMap((f: any) =>
                      (f.rooms ?? []).map((r: any) => (
                        <option key={r.id} value={r.id}>
                          {b.name} — {f.name} — Room {r.room_number}
                        </option>
                      ))
                    )
                  )}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bed-label">Bed label</Label>
                <Input id="bed-label" name="bedLabel" required maxLength={40} placeholder="e.g. A, B, Top, Bottom" />
              </div>
              <Button type="submit" size="sm">Add bed</Button>
            </form>
          </SectionCard>

          {/* Fee Plans */}
          <SectionCard
            title="Fee plans"
            description="Publish accommodation pricing tenants can apply for."
            action={<Banknote className="h-4 w-4 text-muted-foreground" />}
          >
            <form className="grid gap-3 px-5 pb-5" action={createFeePlan}>
              <input type="hidden" name="hostelId" value={hostelId} />
              <div className="grid gap-1.5">
                <Label htmlFor="plan-name">Plan name</Label>
                <Input id="plan-name" name="name" required minLength={2} maxLength={120} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="plan-description">Description</Label>
                <Input id="plan-description" name="description" maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="plan-amount">Amount</Label>
                  <Input id="plan-amount" name="amount" type="number" min="0" step="0.01" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="plan-currency">Currency</Label>
                  <Input id="plan-currency" name="currency" defaultValue="GHS" maxLength={5} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="plan-start">Starts</Label>
                  <Input id="plan-start" name="startsAt" type="date" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="plan-end">Ends</Label>
                  <Input id="plan-end" name="endsAt" type="date" required />
                </div>
              </div>
              <Button type="submit" size="sm">Publish fee plan</Button>
            </form>
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
