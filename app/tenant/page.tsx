import { logout } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/get-user-context";

export default async function TenantHome() {
  const { email } = await getUserContext();

  return (
    <main className="page-shell">
      <section className="page-card">
        <h1 className="brand">Tenant Portal</h1>
        <p className="subtitle">
          Authentication is active. The tenant application, payment,
          accommodation, maintenance, and records modules will be built next.
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
