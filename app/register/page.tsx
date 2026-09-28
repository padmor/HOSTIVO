import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, CheckCircle2 } from "lucide-react";

import { signup } from "@/lib/auth/actions";
import {
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
    diag?: string;
  }>;
};

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657894]">
      {children}
    </span>
  );
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  let diagnostic:
    | {
        rest: number | null;
        auth: number | null;
        signup: number | null;
      }
    | null = null;

  if (params.diag === "1") {
    const headers = {
      apikey: supabasePublishableKey,
    };

    const check = async (request: () => Promise<Response>) => {
      try {
        const response = await request();
        return response.status;
      } catch {
        return null;
      }
    };

    diagnostic = {
      rest: await check(() =>
        fetch(supabaseUrl + "/rest/v1/hostels?select=id&limit=1", {
          headers,
          cache: "no-store",
        }),
      ),
      auth: await check(() =>
        fetch(supabaseUrl + "/auth/v1/settings", {
          headers,
          cache: "no-store",
        }),
      ),
      signup: await check(() =>
        fetch(supabaseUrl + "/functions/v1/auth-direct-signup", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store",
        }),
      ),
    };
  }

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
              Join your hostel community.
            </h1>
            <p className="mt-6 max-w-[760px] text-[17px] font-medium leading-[1.55] text-white/70 sm:text-[18px]">
              Hostivo facilitates swift online bookings, transparent billing, and instant space reservations within authorized halls of residence.
            </p>

            <div className="mt-9 grid gap-4">
              {[
                "Apply for accommodation online",
                "Track payments and allocation status",
                "Access smart hostel administration services",
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

        <section className="flex min-h-[720px] items-center bg-white px-8 py-12 sm:px-12 lg:min-h-screen lg:px-[64px] lg:py-[64px]">
          <div className="w-full max-w-[590px]">
            <div className="mb-7">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.02em] text-[#0d7d6d]">Register</p>
              <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[30px]">
                Create your account
              </h2>
              <p className="mt-2 text-[15px] font-medium text-[#60728e]">
                Create your Hostivo account with your email address and a password.
              </p>
            </div>

            {diagnostic ? (
              <div className="mb-5 rounded-[8px] border border-[#d8e2ee] bg-[#f7fafc] px-4 py-3 text-[12px] font-mono text-[#435673]" role="status">
                Supabase REST: {diagnostic.rest ?? "no-response"} · Auth: {diagnostic.auth ?? "no-response"} · Direct signup: {diagnostic.signup ?? "no-response"}
              </div>
            ) : null}

            {params.error ? (
              <div className="mb-5 rounded-[8px] border border-[#f0d5d5] bg-[#fff6f6] px-4 py-3 text-[13px] font-semibold text-[#b33a3a]" role="alert">
                {params.error}
              </div>
            ) : null}

            <form className="grid gap-4" action={signup}>
              <div className="grid gap-2">
                <Label htmlFor="register-email" className="text-[13px] font-bold text-[#14233d]">Email Address</Label>
                <div className="relative">
                  <FieldIcon><Mail className="size-[17px]" /></FieldIcon>
                  <Input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className="h-[44px] rounded-[8px] border-[#d8e2ee] pl-10 text-[14px] shadow-none focus:border-[#0d8a78] focus:ring-[#0d8a78]/10" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="register-password" className="text-[13px] font-bold text-[#14233d]">Password</Label>
                <div className="relative">
                  <FieldIcon><LockKeyhole className="size-[17px]" /></FieldIcon>
                  <Input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="h-[44px] rounded-[8px] border-[#d8e2ee] pl-10 text-[14px] shadow-none focus:border-[#0d8a78] focus:ring-[#0d8a78]/10" />
                </div>
              </div>

              <Button type="submit" className="mt-2 h-[46px] rounded-[8px] bg-[#0e8877] text-[14px] font-extrabold hover:bg-[#0b7567]">
                Create Account
              </Button>
            </form>

            <div className="mt-7 text-center text-[14px] font-medium text-[#60728e]">
              Already have an account?{" "}
              <Link href={params.next ? "/login?next=" + encodeURIComponent(params.next) : "/login"} className="font-extrabold text-[#0d7d6d] hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/" className="flex items-center gap-2 text-[13px] font-bold text-[#60728e] hover:text-[#0d7d6d]">
                <ArrowLeft className="size-[15px]" />
                Back to University Main Portal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
