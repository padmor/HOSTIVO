import Link from "next/link";
import { Bell, LockKeyhole, Mail, CheckCircle2, ArrowDown } from "lucide-react";

import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657894]">
      {children}
    </span>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registerHref = params.next
    ? "/register?next=" + encodeURIComponent(params.next)
    : "/register";

  return (
    <main className="min-h-screen bg-white text-[#14233d]">
      <div className="grid min-h-screen lg:grid-cols-[56.75%_43.25%]">
        <section className="relative flex min-h-[520px] flex-col overflow-hidden bg-gradient-to-br from-[#0f8978] via-[#116f6a] to-[#15253a] px-8 py-10 text-white sm:px-12 lg:min-h-screen lg:px-[64px] lg:py-[64px]">
          <Link href="/" className="flex w-fit items-center gap-3.5" aria-label="Hostivo home">
            <span className="grid size-[40px] place-items-center rounded-[8px] bg-white text-[19px] font-black text-[#0d7d6d]">
              H
            </span>
            <span className="text-[20px] font-extrabold tracking-[-0.02em]">Hostivo</span>
          </Link>

          <div className="relative z-10 mt-auto max-w-[760px] pb-12 pt-20 sm:pb-[124px] lg:pb-[118px]">
            <h1 className="max-w-[760px] text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[48px] lg:text-[46px] xl:text-[52px]">
              Everything your hostel needs.
            </h1>
            <p className="mt-6 max-w-[760px] text-[17px] font-medium leading-[1.55] text-white/70 sm:text-[18px]">
              An institutional operations system that connects applications, automated availability checks,
              secure payment verification, and automated bed allocation.
            </p>

            <div className="mt-9 grid gap-4">
              {[
                "Applications connected to real availability",
                "Verified payments before final allocation",
                "Role-based access across the hostel",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[15px] font-semibold text-white">
                  <CheckCircle2 className="size-[18px] shrink-0 text-white/90" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="absolute bottom-8 left-8 text-[12px] font-medium text-white/50 sm:left-12 lg:bottom-[62px] lg:left-[64px]">
            © 2025 Hostivo. Institutional Fleet-grade Hostel Operations.
          </p>
        </section>

        <section className="flex min-h-[680px] items-center bg-white px-8 py-12 sm:px-12 lg:min-h-screen lg:px-[64px] lg:py-[64px]">
          <div className="w-full max-w-[590px]">
            <div className="mb-8">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.02em] text-[#0d7d6d]">Access Hostivo</p>
              <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[30px]">
                Sign in or create an account
              </h2>
              <p className="mt-2 text-[15px] font-medium text-[#60728e]">
                Use your institutional credentials to authenticate.
              </p>
            </div>

            {params.message ? (
              <div className="mb-5 rounded-[8px] border border-[#d7ebe7] bg-[#eff8f6] px-4 py-3 text-[13px] font-semibold text-[#0d7d6d]" role="status">
                {params.message}
              </div>
            ) : null}
            {params.error ? (
              <div className="mb-5 rounded-[8px] border border-[#f0d5d5] bg-[#fff6f6] px-4 py-3 text-[13px] font-semibold text-[#b33a3a]" role="alert">
                {params.error}
              </div>
            ) : null}

            <form className="grid gap-5" action={login}>
              <input type="hidden" name="next" value={params.next ?? "/dashboard"} />

              <div className="grid gap-2">
                <Label htmlFor="login-email" className="text-[13px] font-bold text-[#14233d]">
                  Institutional Email Address
                </Label>
                <div className="relative">
                  <FieldIcon><Mail className="size-[17px]" /></FieldIcon>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="e.g. k.asante@ucc.edu.gh"
                    required
                    className="h-[44px] rounded-[8px] border-[#d8e2ee] pl-10 text-[14px] shadow-none placeholder:text-[#7a8ba4] focus:border-[#0d8a78] focus:ring-[#0d8a78]/10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="login-password" className="text-[13px] font-bold text-[#14233d]">
                  Password
                </Label>
                <div className="relative">
                  <FieldIcon><LockKeyhole className="size-[17px]" /></FieldIcon>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    required
                    className="h-[44px] rounded-[8px] border-[#d8e2ee] pl-10 pr-12 text-[14px] shadow-none placeholder:text-[#7a8ba4] focus:border-[#0d8a78] focus:ring-[#0d8a78]/10"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#657894]">
                    <Bell className="size-[16px]" />
                  </span>
                </div>
                <div className="flex justify-end pt-0.5">
                  <Link href="/forgot-password" className="text-[13px] font-bold text-[#0d7d6d] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="h-[46px] rounded-[8px] bg-[#0e8877] text-[14px] font-extrabold hover:bg-[#0b7567]">
                Sign In to Hostivo
              </Button>
            </form>

            <div className="my-9 flex items-center gap-4 text-[12px] font-extrabold text-[#71829b]">
              <span className="h-px flex-1 bg-[#dce5ef]" />
              <span>OR</span>
              <span className="h-px flex-1 bg-[#dce5ef]" />
            </div>

            <div>
              <p className="text-[14px] font-extrabold text-[#14233d]">New to Hostivo?</p>
              <p className="mt-1.5 text-[13px] font-medium leading-5 text-[#60728e]">
                Create an account with your email address and password to get started.
              </p>
              <Button asChild type="button" variant="outline" className="mt-5 h-[42px] w-full rounded-[8px] border-[#0d8a78] text-[14px] font-extrabold text-[#0d7d6d] hover:bg-[#eff8f6] hover:text-[#0d7d6d]">
                <Link href={registerHref}>Create Account</Link>
              </Button>
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/" className="flex items-center gap-2 text-[13px] font-bold text-[#60728e] hover:text-[#0d7d6d]">
                <ArrowDown className="size-[15px]" />
                Back to University Main Portal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
