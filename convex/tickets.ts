import { ConvexError, v } from "convex/values";

import { DEMO_TICKETS } from "../lib/demo-data";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { ticketStatus, ticketTeam } from "./schema";

// Convex functions are reachable by anyone who knows the deployment URL, so
// every ticket function requires CONVEX_SERVER_SECRET. Only the Next.js server
// (lib/ticket-store.ts) holds it; the browser never talks to Convex directly.
function assertServer(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || expected.length < 32 || secret !== expected) {
    throw new ConvexError("Unauthorized.");
  }
}

function toRecord(doc: Doc<"tickets">) {
  return {
    ticketId: doc.ticketId,
    subject: doc.subject,
    team: doc.team,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

export const list = query({
  args: { secret: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { secret, limit }) => {
    assertServer(secret);
    const docs = await ctx.db
      .query("tickets")
      .withIndex("by_createdAt")
      .order("desc")
      .take(Math.min(Math.max(limit ?? 50, 1), 200));
    return docs.map(toRecord);
  },
});

export const get = query({
  args: { secret: v.string(), ticketId: v.number() },
  handler: async (ctx, { secret, ticketId }) => {
    assertServer(secret);
    const doc = await ctx.db
      .query("tickets")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
      .unique();
    return doc ? toRecord(doc) : null;
  },
});

export const create = mutation({
  args: { secret: v.string(), subject: v.string(), team: ticketTeam },
  handler: async (ctx, { secret, subject, team }) => {
    assertServer(secret);
    const trimmed = subject.trim();
    if (!trimmed) throw new ConvexError("Ticket subject is required.");
    if (trimmed.length > 180) {
      throw new ConvexError("Ticket subject must be 180 characters or fewer.");
    }

    // Mutations are transactional, so the next ID can't be handed out twice.
    const last = await ctx.db
      .query("tickets")
      .withIndex("by_ticketId")
      .order("desc")
      .first();
    const ticket = {
      ticketId: Math.max(last?.ticketId ?? 0, 4_799) + 1,
      subject: trimmed,
      team,
      status: "open" as const,
      createdAt: Date.now(),
    };
    await ctx.db.insert("tickets", ticket);
    return ticket;
  },
});

export const updateStatus = mutation({
  args: { secret: v.string(), ticketId: v.number(), status: ticketStatus },
  handler: async (ctx, { secret, ticketId, status }) => {
    assertServer(secret);
    const doc = await ctx.db
      .query("tickets")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
      .unique();
    if (!doc) throw new ConvexError(`Ticket #${ticketId} was not found.`);
    await ctx.db.patch(doc._id, { status });
    return toRecord({ ...doc, status });
  },
});

// Loads the demo tickets into an empty table. Safe to run more than once.
export const seed = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertServer(secret);
    if (await ctx.db.query("tickets").first()) return { seeded: 0 };
    for (const ticket of DEMO_TICKETS) {
      await ctx.db.insert("tickets", ticket);
    }
    return { seeded: DEMO_TICKETS.length };
  },
});
