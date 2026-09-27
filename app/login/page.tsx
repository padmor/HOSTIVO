import Link from "next/link";
import { login, signup } from "@/lib/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title" className="brand">
          Hostivo
        </h1>
        <p className="subtitle">
          Secure access to the Smart Hostel Management System.
        </p>

        {params.message ? (
          <p className="notice" role="status">
            {params.message}
          </p>
        ) : null}

        {params.error ? (
          <p className="error" role="alert">
            {params.error}
          </p>
        ) : null}

        <form className="form" action={login}>
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </div>

          <button className="primary-button" type="submit">
            Sign in
          </button>
        </form>

        <div style={{ height: 24 }} />

        <form className="form" action={signup}>
          <div className="field">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
            />
          </div>

          <div className="field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          <button className="secondary-button" type="submit">
            Create tenant account
          </button>
        </form>

        <p className="meta" style={{ marginTop: 20 }}>
          <Link href="/">Back to Hostivo</Link>
        </p>
      </section>
    </main>
  );
}
