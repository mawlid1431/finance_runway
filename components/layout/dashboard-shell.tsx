"use client";

import { useEffect, useState } from "react";

import { AgentCard } from "@/components/agent/agent-card";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { InfoPanel } from "@/components/overlays/info-panel";
import { useDashboard } from "@/components/layout/dashboard-provider";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { panel, closePanel } = useDashboard();
  // Malitos starts open on desktop and minimised on phones, where it would
  // cover the page; after that it follows what the user chooses.
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [agentChoice, setAgentOpen] = useState<boolean | null>(null);
  const agentOpen = agentChoice ?? isDesktop;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  function handleToggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main
        className={cn(
          "min-h-screen pb-16 transition-[margin] duration-300 ease-out motion-reduce:transition-none",
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[218px]",
          "lg:mr-0",
        )}
      >
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-6 sm:px-7 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
      <AgentCard open={agentOpen} onOpenChange={setAgentOpen} />
      <InfoPanel panel={panel} onClose={closePanel} />
    </div>
  );
}
