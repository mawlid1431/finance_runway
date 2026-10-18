import { z } from "zod";

import { getDemoRevenue } from "@/lib/demo-data";
import {
  createTicket,
  getTicket,
  getTicketInsightsFromStore,
  updateTicketStatus,
} from "@/lib/ticket-store";

// Server tools the Malitos agent worker calls through /api/agent/<tool>.
// Inputs come from an LLM, so every tool validates its arguments.

const range = z.enum(["7d", "30d", "90d"]);
const ticketId = z.coerce.number().int().positive();

export const serverTools = {
  get_overview_insights: {
    schema: z.object({}),
    run: async () => {
      const revenue = getDemoRevenue("30d");
      const tickets = await getTicketInsightsFromStore();
      return {
        revenue: {
          total: revenue.total,
          changePct: revenue.changePct,
          refundCount: revenue.refundCount,
        },
        support: {
          total: tickets.total,
          open: tickets.open,
          topTeam: tickets.topTeam,
          latestTicket: tickets.latestTicket,
        },
      };
    },
  },
  get_revenue: {
    schema: z.object({ range: range.default("30d") }),
    run: (args: { range: z.infer<typeof range> }) => {
      const revenue = getDemoRevenue(args.range);
      return {
        total: revenue.total,
        changePct: revenue.changePct,
        dailyAverage: revenue.dailyAverage,
        peakDay: revenue.peakDay,
        refundCount: revenue.refundCount,
        dip: revenue.dip,
      };
    },
  },
  get_ticket_insights: {
    schema: z.object({}),
    run: async () => ({ ...(await getTicketInsightsFromStore()) }),
  },
  get_ticket: {
    schema: z.object({ ticketId }),
    run: async (args: { ticketId: number }) => ({
      ticket: await getTicket(args.ticketId),
    }),
  },
  create_ticket: {
    schema: z.object({
      subject: z.string().trim().min(1).max(180),
      team: z.enum(["Billing", "Support", "Product"]),
    }),
    run: async (args: { subject: string; team: "Billing" | "Support" | "Product" }) => ({
      ticket: await createTicket(args),
    }),
  },
  update_ticket_status: {
    schema: z.object({ ticketId, status: z.enum(["open", "closed"]) }),
    run: async (args: { ticketId: number; status: "open" | "closed" }) => ({
      ...(await updateTicketStatus(args)),
    }),
  },
} as const;

export type ServerToolName = keyof typeof serverTools;

export function isServerTool(name: string): name is ServerToolName {
  return Object.hasOwn(serverTools, name);
}

export async function runServerTool(name: ServerToolName, input: unknown) {
  const tool = serverTools[name];
  const parsed = tool.schema.safeParse(input ?? {});
  if (!parsed.success) {
    throw new Error(`Invalid arguments for ${name}.`);
  }
  return (tool.run as (args: unknown) => unknown | Promise<unknown>)(parsed.data);
}
