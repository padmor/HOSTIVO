"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
import type { NavItem } from "./app-shell";

type MobileNavProps = {
  navItems: NavItem[];
  activeHref: string;
  email?: string | null;
  logoutAction: () => void | Promise<void>;
};

export function MobileNav({
  navItems,
  activeHref,
  email,
  logoutAction,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const initial = (email?.[0] ?? "U").toUpperCase();

  return (
    <div className="lg:hidden">
      {/* Fixed mobile header bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-xs font-black text-white">
            H
          </span>
          <strong className="text-sm tracking-tight">Hostivo</strong>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Spacer so content is not hidden behind the fixed header */}
      <div className="h-14" aria-hidden="true" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Hostivo navigation menu</SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col">
            <div className="p-4 pb-2">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setOpen(false)}
              >
                <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-black text-white">
                  H
                </span>
                <span>
                  <strong className="block text-base tracking-tight">
                    Hostivo
                  </strong>
                  <small className="block text-[11px] text-muted-foreground">
                    Smart hostel management
                  </small>
                </span>
              </Link>
            </div>

            <nav
              className="grid gap-1 px-4 pt-4"
              aria-label="Primary navigation"
            >
              <span className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
                Workspace
              </span>
              {navItems.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-[42px] items-center gap-2.5 rounded-[11px] px-3 text-[13px] font-bold text-sidebar-foreground transition-colors hover:bg-muted/60",
                    item.href === activeHref &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  aria-current={
                    item.href === activeHref ? "page" : undefined
                  }
                >
                  <span
                    className="flex w-5 shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-border p-4">
              <div className="flex items-center gap-2.5 px-2 py-2">
                <Avatar className="h-[34px] w-[34px]">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs">
                    {email ?? "Account"}
                  </strong>
                  <small className="text-[11px] text-muted-foreground">
                    Signed in
                  </small>
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  className="w-full px-2 py-2 text-left text-xs font-bold text-muted-foreground transition-colors hover:text-destructive"
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
