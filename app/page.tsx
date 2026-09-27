import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    number: "01",
    title: "One hostel workspace",
    description:
      "Bring accommodation, tenants, payments, maintenance, and announcements into one operating system.",
  },
  {
    number: "02",
    title: "Automated allocation",
    description:
      "Move verified tenant payments into controlled room and bed allocation without double-booking.",
  },
  {
    number: "03",
    title: "Role-based access",
    description:
      "Give managers, staff, tenants, and system administrators focused experiences built around their responsibilities.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Header */}
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-black text-white">
            H
          </span>
          <span>
            <strong className="block font-black">Hostivo</strong>
            <small className="block text-[11px] font-semibold text-muted-foreground">
              Smart hostel management
            </small>
          </span>
        </Link>
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1180px] items-center gap-16 px-4 pb-[72px] pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft px-3 py-2 text-xs font-extrabold text-primary-dark">
            Smart hostel operations &middot; Built for scale
          </div>
          <h1 className="max-w-[10ch] text-5xl font-semibold leading-[0.98] tracking-tighter lg:text-7xl">
            Run your hostel from one place.
          </h1>
          <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
            Hostivo connects the full accommodation journey &mdash; from
            availability and applications to verified payment, room allocation,
            tenant records, and day-to-day hostel operations.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button asChild size="lg">
              <Link href="/login">Get started</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="#features">Explore Hostivo</Link>
            </Button>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div
          className="rounded-[26px] border border-border bg-white/80 p-5 shadow-md"
          aria-label="Hostivo dashboard preview"
        >
          <div className="overflow-hidden rounded-[18px] border border-border bg-secondary">
            <div className="flex gap-1.5 border-b border-border px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-muted" />
              <span className="h-2 w-2 rounded-full bg-muted" />
              <span className="h-2 w-2 rounded-full bg-muted" />
            </div>
            <div className="grid min-h-[390px] grid-cols-[92px_1fr]">
              <aside className="border-r border-border bg-card p-2.5 pt-3.5">
                <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-gradient-to-br from-primary to-primary-dark text-[10px] font-black text-white">
                  H
                </span>
                <div className="mt-6 grid gap-2">
                  <span className="h-2.5 w-[70px] rounded-lg bg-primary-soft" />
                  <span className="h-2.5 w-[54px] rounded-lg bg-muted" />
                  <span className="h-2.5 w-[64px] rounded-lg bg-muted" />
                  <span className="h-2.5 w-[54px] rounded-lg bg-muted" />
                </div>
              </aside>
              <div className="p-4">
                <div className="h-4 w-[45%] rounded-lg bg-muted" />
                <div className="mt-2 h-2 w-[62%] rounded-lg bg-muted/60" />
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="min-h-[82px] rounded-xl border border-border bg-card p-3"
                    >
                      <div className="h-[18px] w-[40%] rounded-md bg-muted" />
                      <div className="mt-2 h-2 w-[68%] rounded-md bg-muted/50" />
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 overflow-hidden rounded-xl border border-border bg-card">
                  {[1, 2, 3, 4].map((row) => (
                    <div
                      key={row}
                      className="grid grid-cols-[1.2fr_0.8fr_0.6fr] gap-3 border-t border-border/50 px-3 py-2.5 first:border-t-0"
                    >
                      <span className="h-2 rounded bg-muted/60" />
                      <span className="h-2 rounded bg-muted/60" />
                      <span className="h-2 rounded bg-muted/60" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="mx-auto grid max-w-[1180px] gap-4 px-4 pb-20 md:grid-cols-3"
        id="features"
      >
        {features.map((feature) => (
          <Card
            key={feature.number}
            className="rounded-[20px] bg-white/90 p-6"
          >
            <div className="mb-4 grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-primary-soft text-lg font-black text-primary-dark">
              {feature.number}
            </div>
            <h2 className="mb-2 text-lg font-semibold">{feature.title}</h2>
            <p className="leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </Card>
        ))}
      </section>
    </main>
  );
}
