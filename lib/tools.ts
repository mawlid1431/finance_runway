import { z } from "zod";

// Client tools: the Malitos agent worker calls these over LiveKit RPC and the
// browser runs them (components/agent/client-tool-handlers.tsx). The agent
// side of each contract is in agent/agent.py.

const target = z.string().trim().min(1).max(80);

export const clientToolSchemas = {
  scroll_to: z.object({ target }),
  highlight: z.object({
    target,
    durationMs: z.number().int().min(500).max(10_000).default(3000),
  }),
  click: z.object({ target }),
  set_date_range: z.object({ range: z.enum(["7d", "30d", "90d"]) }),
  filter_tickets: z.object({ filter: z.enum(["all", "open", "billing"]) }),
  open_panel: z.object({
    title: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(1200),
  }),
  refresh_tickets: z.object({}),
} as const;

export type ClientToolName = keyof typeof clientToolSchemas;

export const CLIENT_TOOL_NAMES = Object.keys(
  clientToolSchemas,
) as ClientToolName[];

export const SERVER_TOOL_NAMES = [
  "get_overview_insights",
  "get_revenue",
  "get_ticket_insights",
  "get_ticket",
  "create_ticket",
  "update_ticket_status",
] as const;

export function parseClientToolArgs<T extends ClientToolName>(
  name: T,
  payload: string,
): z.infer<(typeof clientToolSchemas)[T]> | null {
  let raw: unknown;
  try {
    raw = JSON.parse(payload || "{}");
  } catch {
    return null;
  }
  const parsed = clientToolSchemas[name].safeParse(raw);
  return parsed.success
    ? (parsed.data as z.infer<(typeof clientToolSchemas)[T]>)
    : null;
}
