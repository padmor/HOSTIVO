import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="page-card">
        <h1 className="brand">Hostivo</h1>
        <p className="subtitle">
          Smart hostel management for managers, staff, and tenants.
        </p>
        <div className="inline-actions">
          <Link className="primary-button" href="/login">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
