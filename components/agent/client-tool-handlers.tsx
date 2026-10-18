"use client";

import { useRoomContext } from "@livekit/components-react";
import { RpcError, type RpcInvocationData } from "livekit-client";
import { useEffect, useRef } from "react";

import { useDashboard } from "@/components/layout/dashboard-provider";
import {
  clickTarget,
  highlightTarget,
  scrollToTarget,
} from "@/lib/page-actions";
import {
  CLIENT_TOOL_NAMES,
  parseClientToolArgs,
  type ClientToolName,
} from "@/lib/tools";

export function ClientToolHandlers() {
  const room = useRoomContext();
  const dashboard = useDashboard();
  // Handlers are registered once per room; read the latest dashboard state via ref.
  const dashboardRef = useRef(dashboard);
  useEffect(() => {
    dashboardRef.current = dashboard;
  }, [dashboard]);

  useEffect(() => {
    async function run(name: ClientToolName, payload: string): Promise<string> {
      const { openPanel, refreshTickets, setRange, setTicketFilter } =
        dashboardRef.current;

      switch (name) {
        case "scroll_to": {
          const args = parseClientToolArgs(name, payload);
          return args ? scrollToTarget(args.target) : invalid();
        }
        case "highlight": {
          const args = parseClientToolArgs(name, payload);
          return args ? highlightTarget(args.target, args.durationMs) : invalid();
        }
        case "click": {
          const args = parseClientToolArgs(name, payload);
          return args ? clickTarget(args.target) : invalid();
        }
        case "set_date_range": {
          const args = parseClientToolArgs(name, payload);
          if (!args) return invalid();
          setRange(args.range);
          return "ok";
        }
        case "filter_tickets": {
          const args = parseClientToolArgs(name, payload);
          if (!args) return invalid();
          setTicketFilter(args.filter);
          return "ok";
        }
        case "open_panel": {
          const args = parseClientToolArgs(name, payload);
          if (!args) return invalid();
          openPanel({ title: args.title, body: args.body });
          return "ok";
        }
        case "refresh_tickets":
          await refreshTickets();
          return "ok";
      }
    }

    for (const name of CLIENT_TOOL_NAMES) {
      room.registerRpcMethod(name, async (data: RpcInvocationData) => {
        // Only agents in this room may drive the page.
        const caller = room.remoteParticipants.get(data.callerIdentity);
        if (!caller?.isAgent) {
          throw new RpcError(1403, "Caller is not the Malitos agent.");
        }
        return run(name, data.payload);
      });
    }

    return () => {
      for (const name of CLIENT_TOOL_NAMES) room.unregisterRpcMethod(name);
    };
  }, [room]);

  return null;
}

function invalid(): never {
  throw new RpcError(1400, "Invalid arguments.");
}
