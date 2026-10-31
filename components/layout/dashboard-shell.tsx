"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { AgentCard } from "@/components/agent/agent-card";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { InfoPanel } from "@/components/overlays/info-panel";
import { useDashboard } from "@/components/layout/dashboard-provider";
import { useMediaQuery, useStoredFlag } from "@/lib/use-media-query";
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
  // The saved preference applies until the user toggles in this tab.
  const storedCollapsed = useStoredFlag("sidebar-collapsed");
  const [collapsedChoice, setCollapsedChoice] = useState<boolean | null>(null);
  const sidebarCollapsed = collapsedChoice ?? storedCollapsed;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer on navigation. Adjusting state while rendering
  // avoids an extra effect pass.
  const pathname = usePathname();
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (pathname !== drawerPath) {
    setDrawerPath(pathname);
    setMobileOpen(false);
  }

  function handleToggleSidebar() {
    const next = !sidebarCollapsed;
    localStorage.setItem("sidebar-collapsed", String(next));
    setCollapsedChoice(next);
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
