
import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";
import { getManagerHostels } from "@/lib/manager/context";

export default async function ManagerHome() {
  const { email, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") {
    return null;
  }

  const hostels = await getManagerHostels();

  return (
    <main className="page-shell">
      <section className="page-card">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Hostivo</p>
            <h1 className="brand">Manager Dashboard</h1>
            <p className="subtitle">
              Configure your hostel structure and fee plans before tenant
              applications open.
            </p>
          </div>
          <form action={logout}>
            <button className="secondary-button button-auto" type="submit">
              Sign out
            </button>
          </form>
        </div>

        <p className="meta">
          Signed in as: {email ?? "Authenticated user"}
        </p>

        {hostels.length === 0 ? (
          <div className="empty-state">
            <h2>No hostel assigned</h2>
            <p>
              Your manager account is authenticated, but it is not currently
              assigned to a hostel. A system administrator must assign the
              manager role to a hostel before setup can begin.
            </p>
          </div>
        ) : (
          <div className="stack">
            {hostels.map((hostel) => (
              <article className="list-card" key={hostel.id}>
                <div>
                  <h2>{hostel.name}</h2>
                  <p className="meta">{hostel.location}</p>
                  <p className="status-pill">{hostel.status}</p>
                </div>
                <Link
                  className="primary-button button-auto link-button"
                  href={"/manager/setup?hostel=" + hostel.id}
                >
                  Open setup
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
