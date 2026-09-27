"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Hostel = { id: string; name: string };

export function ProvisionForm({ hostels }: { hostels: Hostel[] }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "staff">("manager");
  const [hostelId, setHostelId] = useState(hostels[0]?.id ?? "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke(
      "admin-provision-user",
      { body: { email, fullName, role, hostelId } }
    );

    if (error || !data?.ok) {
      setStatus(data?.error ?? error?.message ?? "Provisioning failed.");
      setBusy(false);
      return;
    }

    setStatus(data.message ?? "Account provisioned.");
    setBusy(false);
    setEmail("");
    setFullName("");
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-1.5">
        <Label htmlFor="provision-name">Full name</Label>
        <Input
          id="provision-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          minLength={2}
          maxLength={120}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="provision-email">Email</Label>
        <Input
          id="provision-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={160}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="provision-role">Role</Label>
        <select
          id="provision-role"
          className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          value={role}
          onChange={(e) => setRole(e.target.value as "manager" | "staff")}
        >
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="provision-hostel">Hostel</Label>
        <select
          id="provision-hostel"
          className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          value={hostelId}
          onChange={(e) => setHostelId(e.target.value)}
          required
          disabled={!hostels.length}
        >
          {!hostels.length ? (
            <option value="">No active hostels</option>
          ) : null}
          {hostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={busy || !hostelId}>
        {busy ? "Provisioning…" : "Provision account"}
      </Button>
      {status ? (
        <div className="rounded-lg bg-success-soft p-3 text-sm text-success">
          {status}
        </div>
      ) : null}
    </form>
  );
}
