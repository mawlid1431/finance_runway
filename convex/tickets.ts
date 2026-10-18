import { ConvexError, v } from "convex/values";

import { DEMO_TICKETS } from "../lib/demo-data";
import { assertServer, assertUser } from "./access";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { ticketStatus, ticketTeam } from "./schema";

function toRecord(doc: Doc<"tickets">) {
  return {
    ticketId: doc.ticketId,
    subject: doc.subject,
    team: doc.team,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

async function listRecords(ctx: QueryCtx, limit = 50) {
  const docs = await ctx.db
    .query("tickets")
    .withIndex("by_createdAt")
    .order("desc")
    .take(Math.min(Math.max(limit, 1), 200));
  return docs.map(toRecord);
}

async function findTicket(ctx: QueryCtx, ticketId: number) {
  return ctx.db
    .query("tickets")
    .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
    .unique();
}

async function insertTicket(
  ctx: MutationCtx,
  subject: string,
  team: Doc<"tickets">["team"],
) {
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
}

async function setStatus(
  ctx: MutationCtx,
  ticketId: number,
  status: Doc<"tickets">["status"],
) {
  const doc = await findTicket(ctx, ticketId);
  if (!doc) throw new ConvexError(`Ticket #${ticketId} was not found.`);
  await ctx.db.patch(doc._id, { status });
  return toRecord({ ...doc, status });
}

// ── Browser (signed-in user, live) ─────────────────────────────────────────

export const listLive = query({
  args: {},
  handler: async (ctx) => {
    await assertUser(ctx);
    return listRecords(ctx);
  },
});

export const createLive = mutation({
  args: { subject: v.string(), team: ticketTeam },
  handler: async (ctx, { subject, team }) => {
    await assertUser(ctx);
    return insertTicket(ctx, subject, team);
  },
});

export const updateStatusLive = mutation({
  args: { ticketId: v.number(), status: ticketStatus },
  handler: async (ctx, { ticketId, status }) => {
    await assertUser(ctx);
    return setStatus(ctx, ticketId, status);
  },
});

// ── Server and Malitos agent (shared secret) ───────────────────────────────

export const list = query({
  args: { secret: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { secret, limit }) => {
    assertServer(secret);
    return listRecords(ctx, limit);
  },
});

export const get = query({
  args: { secret: v.string(), ticketId: v.number() },
  handler: async (ctx, { secret, ticketId }) => {
    assertServer(secret);
    const doc = await findTicket(ctx, ticketId);
    return doc ? toRecord(doc) : null;
  },
});

export const create = mutation({
  args: { secret: v.string(), subject: v.string(), team: ticketTeam },
  handler: async (ctx, { secret, subject, team }) => {
    assertServer(secret);
    return insertTicket(ctx, subject, team);
  },
});

export const updateStatus = mutation({
  args: { secret: v.string(), ticketId: v.number(), status: ticketStatus },
  handler: async (ctx, { secret, ticketId, status }) => {
    assertServer(secret);
    return setStatus(ctx, ticketId, status);
  },
});

// Loads the starter tickets into an empty table. Safe to run more than once.
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
