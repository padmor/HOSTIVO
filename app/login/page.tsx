import Link from "next/link";
import { login, signup } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section
        className="grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-border bg-card shadow-md lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]"
        aria-labelledby="auth-title"
      >
        {/* Hero panel */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[rgba(8,69,60,0.96)] to-[rgba(14,122,104,0.92)] p-8 text-white lg:p-[52px]">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-white/15 text-sm font-black">
              H
            </span>
            <span>
              <strong className="block font-black">Hostivo</strong>
              <small className="block text-[11px] font-semibold text-white/70">
                Smart hostel management
              </small>
            </span>
          </Link>

          <h1 className="mt-10 max-w-[9ch] text-5xl font-semibold leading-[0.98] tracking-tighter lg:text-[clamp(42px,5vw,64px)]">
            Everything your hostel needs.
          </h1>
          <p className="mt-4 max-w-[42ch] leading-relaxed text-white/80">
            A focused workspace for the people who run accommodation and the
            residents who use it.
          </p>

          <ul className="mt-8 grid gap-3">
            {[
              "Applications connected to real availability",
              "Verified payments before final allocation",
              "Role-based access across the hostel",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-sm text-white/90"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* Decorative circle */}
          <div
            className="absolute -bottom-40 -right-36 h-[360px] w-[360px] rounded-full border-[70px] border-white/[0.08]"
            aria-hidden="true"
          />
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-8 lg:p-[52px]">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            Access Hostivo
          </p>
          <h2
            id="auth-title"
            className="mt-2 text-[26px] font-semibold tracking-tight"
          >
            Sign in or create an account
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Tenant accounts can be created here. Manager and staff accounts are
            provisioned by administrators.
          </p>

          {params.message ? (
            <div
              className="mb-4 rounded-lg bg-success-soft p-3 text-sm leading-snug text-success"
              role="status"
            >
              {params.message}
            </div>
          ) : null}
          {params.error ? (
            <div
              className="mb-4 rounded-lg bg-destructive-soft p-3 text-sm leading-snug text-destructive"
              role="alert"
            >
              {params.error}
            </div>
          ) : null}

          <form className="grid gap-4" action={login}>
            <input
              type="hidden"
              name="next"
              value={params.next ?? "/dashboard"}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit">Sign in to Hostivo</Button>
          </form>

          <Separator className="my-6" />

          <form className="grid gap-4" action={signup}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                New tenant
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your account and start using Hostivo immediately.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            <Button variant="outline" type="submit">
              Create tenant account
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            <Link
              className="font-bold text-primary hover:underline"
              href="/"
            >
              &larr; Back to Hostivo
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
