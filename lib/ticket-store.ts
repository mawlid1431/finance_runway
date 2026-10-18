import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";

import { api } from "@/convex/_generated/api";
import { getDemoRevenue, getTicketInsights } from "@/lib/demo-data";
import * as memory from "@/lib/demo-store";
import type {
  RevenueRange,
  TicketInsights,
  TicketRecord,
  TicketStatus,
  TicketTeam,
} from "@/lib/types";

// Tickets and revenue live in Convex when CONVEX_URL is set. Without it (tests, a fresh
// checkout) they fall back to the in-memory demo store.

function convex() {
  const url = process.env.CONVEX_URL;
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!url) return null;
  if (!secret) throw new Error("CONVEX_SERVER_SECRET is not set.");
  return { client: new ConvexHttpClient(url), secret };
}

async function call<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    // Surface Convex's validation messages ("Ticket #1 was not found.") as-is.
    if (error instanceof ConvexError) throw new Error(String(error.data));
    throw error;
  }
}

export async function listTickets(limit = 50): Promise<TicketRecord[]> {
  const db = convex();
  if (!db) return memory.listDemoTickets(limit);
  return call(() => db.client.query(api.tickets.list, { secret: db.secret, limit }));
}

export async function getTicket(ticketId: number): Promise<TicketRecord | null> {
  const db = convex();
  if (!db) return memory.getDemoTicket(ticketId);
  return call(() => db.client.query(api.tickets.get, { secret: db.secret, ticketId }));
}

export async function createTicket(input: {
  subject: string;
  team: TicketTeam;
}): Promise<TicketRecord> {
  const db = convex();
  if (!db) return memory.createDemoTicket(input);
  return call(() =>
    db.client.mutation(api.tickets.create, { secret: db.secret, ...input }),
  );
}

export async function updateTicketStatus(input: {
  ticketId: number;
  status: TicketStatus;
}): Promise<TicketRecord> {
  const db = convex();
  if (!db) return memory.updateDemoTicketStatus(input);
  return call(() =>
    db.client.mutation(api.tickets.updateStatus, { secret: db.secret, ...input }),
  );
}

export async function getTicketInsightsFromStore(): Promise<TicketInsights> {
  return getTicketInsights(await listTickets());
}

export async function getRevenueSummary(range: RevenueRange) {
  const db = convex();
  if (!db) {
    return { ...getDemoRevenue(range), series: undefined };
  }
  return call(() => db.client.query(api.revenue.summary, { secret: db.secret, range }));
}
