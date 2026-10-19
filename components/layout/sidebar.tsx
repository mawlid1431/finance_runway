"use client";

import {
  BarChart3,
  CalendarCheck,
  ChartNoAxesCombined,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  TicketCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useDashboard } from "@/components/layout/dashboard-provider";
import { FintechLogoIcon } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Overview", icon: BarChart3, target: "overview" },
  { href: "/revenue", label: "Revenue", icon: ChartNoAxesCombined, target: "revenue" },
  { href: "/tickets", label: "Tickets", icon: TicketCheck, target: "tickets" },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck, target: "bookings" },
  { href: "/settings", label: "Settings", icon: Settings2, target: "settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { openPanel } = useDashboard();
  // On mobile the drawer is always full-width — collapsed only applies on desktop
  const iconOnly = collapsed && !mobileOpen;

  useEffect(() => {
    onMobileClose();
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/8 bg-[#111514] text-[#f4f1e8]",
          "transition-[width,transform] duration-300 ease-out motion-reduce:transition-none",
          // Mobile: full sidebar width, slides in/out
          "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible, width based on collapsed state
          collapsed ? "md:w-[72px] md:translate-x-0" : "md:w-[218px] md:translate-x-0",
        )}
      >
      {/* ── Logo header row with collapse toggle ───────────────────────── */}
      <div
        className={cn(
          "flex h-[78px] shrink-0 items-center border-b border-white/8",
          iconOnly ? "justify-center px-0" : "px-4",
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex min-w-0 items-center gap-3",
            iconOnly ? "justify-center" : "flex-1",
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[#1a0a00]">
            <FintechLogoIcon className="size-[18px]" />
          </span>
          {!iconOnly && (
            <span className="min-w-0">
              <span className="block truncate text-[1.05rem] font-semibold leading-none tracking-[-0.04em]">
                Fintech Finance
              </span>
              <span className="mt-1 block font-mono text-[0.56rem] uppercase tracking-[0.15em] text-white/38">
                Finance Platform
              </span>
            </span>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          aria-label="Close navigation menu"
          className="ml-2 grid size-8 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-white/[0.07] hover:text-white/80 md:hidden"
        >
          <X className="size-4" />
        </button>

        {/* Collapse button (shown on desktop when expanded) */}
        {!iconOnly && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="ml-2 hidden size-8 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-white/[0.07] hover:text-white/80 md:grid"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      {/* Expand button (shown on desktop when collapsed) */}
      {iconOnly && (
        <button
          onClick={onToggle}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="flex w-full items-center justify-center border-b border-white/8 py-2.5 text-white/45 transition hover:bg-white/[0.07] hover:text-white/80"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav
        className={cn("space-y-1 py-5", iconOnly ? "px-2" : "px-3")}
        aria-label="Primary navigation"
      >
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.target}
              data-avatar-target={item.target}
              title={iconOnly ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm transition",
                iconOnly ? "justify-center" : "gap-3",
                active
                  ? "bg-white/[0.09] text-white"
                  : "text-white/48 hover:bg-white/[0.05] hover:text-white/80",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!iconOnly && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ──────────────────────────────────────────────── */}
      {(!collapsed || mobileOpen) && (
        <div className="mt-auto p-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm font-semibold">Malitos is on call</p>
            <p className="mt-1 text-xs leading-5 text-white/42">
              Navigate, act, and inspect demo data.
            </p>
          </div>
          <button
            id="demo-guide"
            data-avatar-target="demo-guide"
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/45 transition hover:bg-white/5 hover:text-white/75"
            onClick={() =>
              openPanel({
                title: "Two-minute demo",
                body: "Ask Malitos to show 30-day revenue, explain the refund dip, create a Billing ticket, then switch to dark mode.",
              })
            }
          >
            <CircleHelp className="size-4" />
            Demo guide
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
