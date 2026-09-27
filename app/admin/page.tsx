import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";
import { ProvisionForm } from "./provision-form";

export default async function AdminPage() {
  const { supabase, email, role } = await getUserContext();

  if (role !== "system_admin") {
    return null;
  }

  const { data: hostels, error } = await supabase
    .from("hostels")
    .select("id,name,status")
    .eq("status", "active")
    .order("name");

  if (error) {
    throw new Error("Unable to load hostels.");
  }

  return (
    <main className="page-shell">
      <section className="page-card wide-card">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Hostivo administration</p>
            <h1 className="brand">System administrator</h1>
            <p className="subtitle">
              Provision manager and staff accounts and assign them to active
              hostels.
            </p>
          </div>
          <form action={logout}>
            <button className="secondary-button button-auto" type="submit">
              Sign out
            </button>
          </form>
        </div>

        <p className="meta">Signed in as: {email ?? "Authenticated user"}</p>

        <section className="setup-section" style={{ marginTop: 24 }}>
          <div className="section-heading">
            <div>
              <h2>Provision manager or staff</h2>
              <p className="meta">
                Existing accounts are updated; new accounts receive an email
                invitation.
              </p>
            </div>
          </div>
          <ProvisionForm hostels={hostels ?? []} />
        </section>

        <section className="inventory-section">
          <div className="section-heading">
            <div>
              <h2>Active hostels</h2>
              <p className="meta">{hostels?.length ?? 0} active hostel(s).</p>
            </div>
          </div>
          <div className="stack">
            {(hostels ?? []).map((hostel) => (
              <article className="list-card" key={hostel.id}>
                <div>
                  <h3>{hostel.name}</h3>
                  <p className="status-pill">{hostel.status}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
