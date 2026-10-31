"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { useDashboard } from "@/components/layout/dashboard-provider";
import { FintechLogoIcon } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-media-query";

const pageNames: Record<string, string> = {
  "/": "Overview",
  "/revenue": "Revenue",
  "/tickets": "Tickets",
  "/settings": "Settings",
};

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { openPanel } = useDashboard();
  const mounted = useHydrated();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color:var(--paper)]/88 backdrop-blur-xl">
      <div className="flex h-[66px] items-center justify-between px-4 sm:px-7 lg:px-8">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="grid size-9 place-items-center rounded-xl text-[var(--ink)] transition hover:bg-[var(--surface-raised)]"
            onClick={onMobileMenuOpen}
          >
            <Menu className="size-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-[var(--accent)] text-[#1a0a00]">
              <FintechLogoIcon className="size-4" />
            </span>
            <span className="font-semibold tracking-[-0.04em]">Fintech Finance</span>
          </Link>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--muted)] md:flex">
          <span>Fintech Finance</span>
          <span>/</span>
          <span className="text-[var(--ink)]">{pageNames[pathname] ?? "Overview"}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            id="notifications"
            data-avatar-target="notifications"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() =>
              openPanel({
                title: "All caught up",
                body: "No urgent alerts. The refund anomaly is already marked on the Revenue page.",
              })
            }
          >
            <Bell className="size-4" />
          </Button>
          <Button
            id="theme-toggle"
            data-avatar-target="theme-toggle"
            variant="outline"
            size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <div className="ml-1">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                  userButtonPopoverCard: "shadow-2xl border border-[var(--line)]",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
