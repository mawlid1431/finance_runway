"use client";

import {
  BarChart3,
  ChartNoAxesCombined,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDashboard } from "@/components/layout/dashboard-provider";
import { FintechLogoIcon } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Overview", icon: BarChart3, target: "overview" },
  { href: "/revenue", label: "Revenue", icon: ChartNoAxesCombined, target: "revenue" },
  { href: "/tickets", label: "Tickets", icon: TicketCheck, target: "tickets" },
  { href: "/settings", label: "Settings", icon: Settings2, target: "settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { openPanel } = useDashboard();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/8 bg-[#111514] text-[#f4f1e8] transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex",
        collapsed ? "w-[72px]" : "w-[218px]",
      )}
    >
      {/* ── Logo header row with collapse toggle ───────────────────────── */}
      <div
        className={cn(
          "flex h-[78px] shrink-0 items-center border-b border-white/8",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex min-w-0 items-center gap-3",
            collapsed ? "justify-center" : "flex-1",
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[#1a0a00]">
            <FintechLogoIcon className="size-[18px]" />
          </span>
          {!collapsed && (
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

        {/* Collapse button (shown when expanded, top-right of header) */}
        {!collapsed && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="ml-2 grid size-8 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-white/[0.07] hover:text-white/80"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      {/* Expand button (shown when collapsed, sits just below the logo) */}
      {collapsed && (
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
        className={cn("space-y-1 py-5", collapsed ? "px-2" : "px-3")}
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
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm transition",
                collapsed ? "justify-center" : "gap-3",
                active
                  ? "bg-white/[0.09] text-white"
                  : "text-white/48 hover:bg-white/[0.05] hover:text-white/80",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && (
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
      {!collapsed && (
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
  );
}
