import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";

export default async function StaffHome() {
  const { email, role } = await getUserContext();

  if (role !== "staff" && role !== "manager" && role !== "system_admin") {
    return null;
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <h1 className="brand">Staff Portal</h1>
        <p className="subtitle">
          Authentication is active. Staff responsibilities and task workflows
          will be built in their scheduled milestone.
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
