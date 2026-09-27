"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    const { data, error } = await supabase.functions.invoke("admin-provision-user", {
      body: { email, fullName, role, hostelId },
    });

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
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="provision-name">Full name</label>
        <input
          id="provision-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          minLength={2}
          maxLength={120}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="provision-email">Email</label>
        <input
          id="provision-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={160}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="provision-role">Role</label>
        <select
          id="provision-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "manager" | "staff")}
        >
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="provision-hostel">Hostel</label>
        <select
          id="provision-hostel"
          value={hostelId}
          onChange={(e) => setHostelId(e.target.value)}
          required
          disabled={!hostels.length}
        >
          {!hostels.length ? <option value="">No active hostels</option> : null}
          {hostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </div>
      <button className="primary-button" type="submit" disabled={busy || !hostelId}>
        {busy ? "Provisioning…" : "Provision account"}
      </button>
      {status ? <div className="notice">{status}</div> : null}
    </form>
  );
}
