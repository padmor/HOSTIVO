import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="page-shell">
      <section className="page-card">
        <h1 className="brand">Something went wrong</h1>
        <p className="subtitle">
          Hostivo could not complete that request. Please try again.
        </p>
        <Link className="primary-button" href="/login">
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
