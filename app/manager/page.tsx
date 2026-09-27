import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";

export default async function ManagerHome() {
  const { email, role } = await getUserContext();

  if (role !== "manager" && role !== "system_admin") {
    return null;
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <h1 className="brand">Manager Dashboard</h1>
        <p className="subtitle">
          Authentication and authorization are active. Hostel CRUD and
          management modules will be built in the next milestone.
        </p>
        <p className="meta">Signed in as: {email ?? "Authenticated user"}</p>
        <form action={logout} style={{ marginTop: 20 }}>
          <button className="secondary-button" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
