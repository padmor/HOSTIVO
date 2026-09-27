import Link from "next/link";
import { login, signup } from "@/lib/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-hero">
          <Link href="/" className="public-brand">
            <span className="brand-mark">H</span>
            <span>
              <strong>Hostivo</strong>
              <small style={{ color: "rgba(255,255,255,.68)" }}>Smart hostel management</small>
            </span>
          </Link>
          <h1>Everything your hostel needs.</h1>
          <p className="subtitle">
            A focused workspace for the people who run accommodation and the
            residents who use it.
          </p>
          <ul className="feature-list">
            <li><span className="feature-dot">✓</span> Applications connected to real availability</li>
            <li><span className="feature-dot">✓</span> Verified payments before final allocation</li>
            <li><span className="feature-dot">✓</span> Role-based access across the hostel</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <p className="eyebrow">Access Hostivo</p>
          <h2 id="auth-title">Sign in or create an account</h2>
          <p className="meta" style={{ marginTop: 0, marginBottom: 22 }}>
            Tenant accounts can be created here. Manager and staff accounts are provisioned by administrators.
          </p>

          {params.message ? <div className="notice" role="status">{params.message}</div> : null}
          {params.error ? <div className="error" role="alert">{params.error}</div> : null}

          <form className="form" action={login}>
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" name="password" type="password" autoComplete="current-password" minLength={8} required />
            </div>
            <button className="primary-button" type="submit">Sign in to Hostivo</button>
          </form>

          <div style={{ height: 26, borderBottom: "1px solid var(--border)", marginBottom: 26 }} />

          <form className="form" action={signup}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 3 }}>New tenant</p>
              <p className="meta" style={{ margin: 0 }}>Create a tenant account to explore available hostel options.</p>
            </div>
            <div className="field">
              <label htmlFor="signup-name">Full name</label>
              <input id="signup-name" name="fullName" type="text" autoComplete="name" required minLength={2} maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input id="signup-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="signup-password">Password</label>
              <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            </div>
            <button className="secondary-button" type="submit">Create tenant account</button>
          </form>

          <p className="meta" style={{ marginTop: 22 }}>
            <Link className="shell-link" href="/">← Back to Hostivo</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
