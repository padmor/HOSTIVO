import Link from "next/link";
import { Mail } from "lucide-react";

import { requestPasswordReset } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-16 text-[#14233d] sm:grid sm:place-items-center">
      <div className="w-full max-w-[490px]">
        <Link
          href="/"
          className="mx-auto mb-6 flex w-fit items-center gap-3.5"
          aria-label="Hostivo home"
        >
          <span className="grid size-[40px] place-items-center rounded-[8px] bg-[#0d7d6d] text-[19px] font-black text-white">
            H
          </span>
          <span className="text-[20px] font-extrabold tracking-[-0.02em]">
            Hostivo
          </span>
        </Link>

        <section className="rounded-[16px] bg-white p-8 shadow-[0_14px_40px_rgba(20,32,51,0.06)] sm:p-10">
          <div className="text-center">
            <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
              Forgot your password?
            </h1>
            <p className="mt-2 text-[15px] font-medium leading-6 text-[#60728e]">
              Enter your email and we&apos;ll send you a password reset link.
            </p>
          </div>

          {params.error ? (
            <div
              className="mt-6 rounded-[8px] border border-[#f0d5d5] bg-[#fff6f6] px-4 py-3 text-[13px] font-semibold text-[#b33a3a]"
              role="alert"
            >
              {params.error}
            </div>
          ) : null}

          {params.message ? (
            <div
              className="mt-6 rounded-[8px] border border-[#d7ebe7] bg-[#eff8f6] px-4 py-3 text-[13px] font-semibold text-[#0d7d6d]"
              role="status"
            >
              {params.message}
            </div>
          ) : null}

          <form className="mt-7 grid gap-4" action={requestPasswordReset}>
            <div className="grid gap-2">
              <Label
                htmlFor="forgot-email"
                className="text-[13px] font-bold text-[#14233d]"
              >
                Email Address
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657894]">
                  <Mail className="size-[17px]" />
                </span>
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className="h-[44px] rounded-[8px] border-[#d8e2ee] pl-10 text-[14px] shadow-none focus:border-[#0d8a78] focus:ring-[#0d8a78]/10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-[46px] rounded-[8px] bg-[#0e8877] text-[14px] font-extrabold hover:bg-[#0b7567]"
            >
              Send reset link
            </Button>
          </form>

          <div className="mt-7 text-center">
            <Link
              href="/login"
              className="text-[14px] font-extrabold text-[#0d7d6d] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
