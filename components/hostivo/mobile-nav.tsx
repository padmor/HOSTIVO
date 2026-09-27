"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { NavGroup, NavItem } from "./app-shell";

type MobileNavProps = {
  navItems?: NavItem[];
  navGroups?: NavGroup[];
  activeHref: string;
  email?: string | null;
  logoutAction: () => void | Promise<void>;
};

export function MobileNav({
  navItems = [],
  navGroups = [],
  activeHref,
  email,
  logoutAction,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const initial = (email?.[0] ?? "U").toUpperCase();
  const groups: NavGroup[] =
    navGroups.length > 0
      ? navGroups
      : navItems.length > 0
        ? [{ label: "Workspace", items: navItems }]
        : [];

  return (
    <div className="lg:hidden">
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[8px] bg-primary text-sm font-extrabold text-white">
            H
          </span>
          <strong className="text-[15px] font-bold tracking-tight">
            Hostivo
          </strong>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-[8px]"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div className="h-14" aria-hidden="true" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[264px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Hostivo navigation</SheetTitle>
            <SheetDescription>
              Navigate between Hostivo workspaces
            </SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col bg-sidebar">
            <div className="border-b border-sidebar-border px-4 py-6">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setOpen(false)}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-primary text-base font-extrabold text-white">
                  H
                </span>
                <span>
                  <strong className="block text-[18px] font-bold leading-[22px]">
                    Hostivo
                  </strong>
                  <small className="block text-[10px] text-muted-foreground">
                    Smart hostel management
                  </small>
                </span>
              </Link>
            </div>

            <nav
              className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
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
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex min-h-[42px] items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary",
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

            <div className="border-t border-sidebar-border p-4 safe-area-pb">
              <div className="flex items-center gap-3 px-1 py-2">
                <Avatar className="size-10">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs font-medium">
                    {email ?? "Account"}
                  </strong>
                  <small className="block text-[11px] text-muted-foreground">
                    Signed in
                  </small>
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  className="mt-1 w-full rounded-md px-1 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
