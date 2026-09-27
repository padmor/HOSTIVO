import Link from "next/link";
import { ChevronDown, Info } from "lucide-react";

import { submitPublicApplication } from "@/lib/tenant/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{
    feePlanId?: string;
    studentId?: string;
    contactPhone?: string;
    error?: string;
  }>;
};

export default async function PublicApplicationPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: feePlans, error: feePlanError } = await supabase
    .from("fee_plans")
    .select("id,hostel_id,name,description,amount,currency,starts_at,ends_at")
    .eq("status", "active")
    .order("name");

  if (feePlanError) {
    throw new Error("Unable to load accommodation options.");
  }

  const plans = feePlans ?? [];
  const hostelIds = [...new Set(plans.map((plan) => plan.hostel_id))];

  const { data: hostels, error: hostelError } = hostelIds.length
    ? await supabase
        .from("hostels")
        .select("id,name,location")
        .in("id", hostelIds)
        .eq("status", "active")
        .order("name")
    : { data: [], error: null };

  if (hostelError) throw new Error("Unable to load hostel options.");

  const hostelById = new Map((hostels ?? []).map((hostel) => [hostel.id, hostel]));

  const selectedPlan =
    plans.find((plan) => plan.id === params.feePlanId) ?? plans[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-foreground">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-20">
          <Link href="/" className="flex items-center gap-[10px]" aria-label="Hostivo home">
            <span className="grid size-8 place-items-center rounded-[6px] bg-primary text-[18px] font-extrabold text-white">
              H
            </span>
            <span className="text-[20px] font-bold tracking-tight">Hostivo</span>
          </Link>
          <Link href="/login" className="text-[15px] font-semibold text-foreground hover:text-primary">
            Sign in
          </Link>
        </div>
      </header>

      <div className="flex w-full justify-center px-4 pb-16 pt-10 sm:px-6 sm:pt-[60px]">
        <section className="w-full max-w-[720px] rounded-[16px] border border-[#e2e8f0] bg-white p-6 shadow-[0_8px_12px_rgba(20,32,51,0.02)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wide text-primary">
              Accommodation
            </span>
            <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground">
              Apply for accommodation
            </h1>
            <p className="text-[15px] font-medium leading-6 text-muted-foreground">
              Select your preferred hostel and fee plan to begin your application.
            </p>
          </div>

          <div className="my-6 h-px w-full bg-border" />

          {params.error ? (
            <div
              className="mb-5 rounded-[8px] border border-destructive/10 bg-destructive-soft px-4 py-3 text-[13px] font-medium leading-5 text-destructive"
              role="alert"
            >
              {params.error}
            </div>
          ) : null}

          {plans.length ? (
            <form className="flex flex-col gap-5" action={submitPublicApplication}>
              <div className="grid gap-1.5">
                <label htmlFor="hostel" className="text-[13px] font-semibold">
                  Preferred Hostel <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    id="hostel"
                    name="feePlanId"
                    value={selectedPlan?.id ?? ""}
                    onChange={() => {}}
                    aria-label="Preferred hostel and fee plan"
                    className="h-12 w-full appearance-none rounded-[8px] border border-border bg-white px-3 pr-10 text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {(hostelById.get(plan.hostel_id)?.name ?? "Hostel")} — {plan.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="fee-plan-display" className="text-[13px] font-semibold">
                  Fee Plan <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    id="fee-plan-display"
                    name="feePlanId"
                    defaultValue={selectedPlan?.id ?? ""}
                    className="h-12 w-full appearance-none rounded-[8px] border border-border bg-white px-3 pr-10 text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    onChange={() => {}}
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {Number(plan.amount).toLocaleString()} {plan.currency}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {selectedPlan?.description ?? "Your fee plan determines the accommodation charge created with the application."}
                </p>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="student-id" className="text-[13px] font-semibold">
                  Student ID Number <span className="text-destructive">*</span>
                </label>
                <input
                  id="student-id"
                  name="studentId"
                  required
                  defaultValue={params.studentId ?? ""}
                  placeholder="UCC/2023/0142"
                  className="h-12 w-full rounded-[8px] border border-border bg-white px-3 text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="contact-phone" className="text-[13px] font-semibold">
                  Contact Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="flex h-12 items-center gap-2 rounded-[8px] border border-border bg-white px-3">
                  <span className="text-[14px] font-semibold text-muted-foreground">+233</span>
                  <input
                    id="contact-phone"
                    name="contactPhone"
                    required
                    defaultValue={params.contactPhone ?? ""}
                    inputMode="tel"
                    placeholder="24 555 7890"
                    className="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 rounded-[8px] bg-primary-soft p-4">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="flex-1 text-[13px] font-medium leading-[1.4] text-primary">
                  Availability is checked automatically. If a bed is available, you will proceed to payment.
                </p>
              </div>

              <Button type="submit" className="h-auto w-full rounded-[8px] px-4 py-3.5 text-[15px] font-bold">
                Check availability &amp; apply
              </Button>

              <div className="flex justify-center pt-1">
                <Link href="/login" className="text-[14px] font-semibold text-primary underline underline-offset-4 hover:text-primary-dark">
                  Already have an application? Check status
                </Link>
              </div>
            </form>
          ) : (
            <div className="rounded-[8px] border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">
              No active accommodation options are published yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
