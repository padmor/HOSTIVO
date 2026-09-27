import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";

export default async function DashboardRouter() {
  const { userId, email, role } = await getUserContext();

  if (role === "manager") {
    redirect("/manager");
  }

  if (role === "staff") {
    redirect("/staff");
  }

  if (role === "tenant") {
    redirect("/tenant");
  }

  if (role === "system_admin") {
    return (
      <main className="page-shell">
        <section className="page-card">
          <h1 className="brand">Hostivo System Administration</h1>
          <p className="subtitle">
            Authentication is active. Platform administration will be added in
            the system-administration milestone.
          </p>
          <p className="meta">Signed in as: {email ?? userId}</p>
          <form action={logout} style={{ marginTop: 20 }}>
            <button className="secondary-button" type="submit">
              Sign out
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <h1 className="brand">Hostivo account</h1>
        <p className="subtitle">
          Your account is authenticated, but no Hostivo role has been assigned
          yet.
        </p>
        <p className="meta">Signed in as: {email ?? userId}</p>
        <form action={logout} style={{ marginTop: 20 }}>
          <button className="secondary-button" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
