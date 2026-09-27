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

export type NavGroup = {
  label: string;
  items: NavItem[];
};

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  email?: string | null;
  navItems?: NavItem[];
  navGroups?: NavGroup[];
  activeHref: string;
  children: React.ReactNode;
  logoutAction: () => void | Promise<void>;
};

export function AppShell({
  eyebrow,
  title,
  description,
  email,
  navItems = [],
  navGroups = [],
  activeHref,
  children,
  logoutAction,
}: AppShellProps) {
  const initial = (email?.[0] ?? "U").toUpperCase();
  const groups: NavGroup[] =
    navGroups.length > 0
      ? navGroups
      : navItems.length > 0
        ? [{ label: "Workspace", items: navItems }]
        : [];

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-6">
          <Link href="/" className="flex items-center gap-3 px-1 pb-6">
            <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-primary text-base font-extrabold text-white">
              H
            </span>
            <span className="min-w-0">
              <strong className="block text-[18px] font-bold leading-[22px] tracking-tight text-foreground">
                Hostivo
              </strong>
              <small className="block truncate text-[10px] font-medium leading-3 text-muted-foreground">
                Smart hostel management
              </small>
            </span>
          </Link>

          <nav
            className="min-h-0 flex-1 overflow-y-auto pr-1"
            aria-label="Primary navigation"
          >
            <div className="grid gap-5">
              {groups.map((group) => (
                <section key={group.label}>
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase leading-[13px] tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const active = item.href === activeHref;
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          className={cn(
                            "flex min-h-[38px] items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium leading-[17px] text-foreground transition-colors hover:bg-secondary",
                            active &&
                              "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <span
                            className={cn(
                              "flex size-[18px] shrink-0 items-center justify-center",
                              active
                                ? "text-sidebar-primary"
                                : "text-muted-foreground"
                            )}
                            aria-hidden="true"
                          >
                            {item.icon}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </nav>
        </div>

        <div className="border-t border-sidebar-border px-4 py-4">
          <Link
            className="flex items-center gap-3 rounded-[8px] px-1 py-2 transition-colors hover:bg-secondary"
            href="/dashboard"
          >
            <Avatar className="size-10 shrink-0">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-medium">
                {email ?? "Account"}
              </strong>
              <small className="block text-[11px] text-muted-foreground">
                Account
              </small>
            </span>
          </Link>
          <form action={logoutAction} className="mt-1">
            <button
              className="w-full rounded-md px-1 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <MobileNav
        navItems={navItems}
        navGroups={navGroups}
        activeHref={activeHref}
        email={email}
        logoutAction={logoutAction}
      />

      <main className="w-full lg:ml-[264px]">
        <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="truncate text-xs font-medium text-muted-foreground">
            Hostivo
            <span className="px-1.5 text-muted-foreground/40">/</span>
            {eyebrow}
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-[8px]"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Button>
            <Avatar className="size-9">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1112px] px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
          <section className="mb-7">
            <p className="mb-1.5 text-[11px] font-semibold uppercase leading-[15px] tracking-wider text-primary">
              {eyebrow}
            </p>
            <h1 className="text-[28px] font-bold leading-8 tracking-[-0.02em] sm:text-[32px] sm:leading-[34px]">
              {title}
            </h1>
            <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {description}
            </p>
          </section>

          {children}
        </div>
      </main>
    </div>
  );
}
