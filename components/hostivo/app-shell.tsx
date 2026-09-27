import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { MobileNav } from "./mobile-nav";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  email?: string | null;
  navItems: NavItem[];
  activeHref: string;
  children: React.ReactNode;
  logoutAction: () => void | Promise<void>;
};

export function AppShell({
  eyebrow,
  title,
  description,
  email,
  navItems,
  activeHref,
  children,
  logoutAction,
}: AppShellProps) {
  const initial = (email?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[264px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex flex-1 flex-col px-4 pt-5 pb-4">
          <Link href="/" className="flex items-center gap-2.5 px-2 pb-6">
            <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-black text-white">
              H
            </span>
            <span>
              <strong className="block text-base tracking-tight">Hostivo</strong>
              <small className="block text-[11px] text-muted-foreground">
                Smart hostel management
              </small>
            </span>
          </Link>

          <nav className="grid gap-1" aria-label="Primary navigation">
            <span className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
              Workspace
            </span>
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex min-h-[42px] items-center gap-2.5 rounded-[11px] px-3 text-[13px] font-bold text-sidebar-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
                  item.href === activeHref &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                aria-current={item.href === activeHref ? "page" : undefined}
              >
                <span className="flex w-5 shrink-0 items-center justify-center" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <Link
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
            href="/dashboard"
          >
            <Avatar className="h-[34px] w-[34px]">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-xs">
                {email ?? "Account"}
              </strong>
              <small className="text-[11px] text-muted-foreground">
                Open account
              </small>
            </span>
          </Link>
          <form action={logoutAction}>
            <button
              className="w-full px-2 py-2 text-left text-xs font-bold text-muted-foreground transition-colors hover:text-destructive"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile Navigation ── */}
      <MobileNav
        navItems={navItems}
        activeHref={activeHref}
        email={email}
        logoutAction={logoutAction}
      />

      {/* ── Main Content ── */}
      <main className="w-full lg:ml-[264px]">
        <header className="sticky top-0 z-10 flex h-[66px] items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-sm lg:top-0 lg:px-8">
          <div className="text-xs font-bold text-muted-foreground">
            Hostivo
            <span className="px-1.5 text-muted-foreground/40">/</span>
            {eyebrow}
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-[34px] w-[34px]">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="mx-auto max-w-[1260px] px-4 py-8 lg:px-8">
          <section className="mb-6">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight lg:text-[32px]">
              {title}
            </h1>
            <p className="mt-2 max-w-[72ch] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </section>
          {children}
        </div>
      </main>
    </div>
  );
}
