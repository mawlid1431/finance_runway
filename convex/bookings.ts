import { ConvexError, v } from "convex/values";

import { normalizeBookingInput } from "../lib/booking";
import { assertServer, assertUser } from "./access";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { bookingStatus } from "./schema";

function toRecord(doc: Doc<"bookings">) {
  return {
    bookingId: doc.bookingId,
    name: doc.name,
    contact: doc.contact,
    date: doc.date,
    time: doc.time,
    reason: doc.reason,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

async function listRecords(ctx: QueryCtx, limit = 50) {
  const docs = await ctx.db
    .query("bookings")
    .withIndex("by_createdAt")
    .order("desc")
    .take(Math.min(Math.max(limit, 1), 200));
  return docs.map(toRecord);
}

async function findBooking(ctx: QueryCtx, bookingId: number) {
  return ctx.db
    .query("bookings")
    .withIndex("by_bookingId", (q) => q.eq("bookingId", bookingId))
    .unique();
}

async function insertBooking(
  ctx: MutationCtx,
  input: {
    name: string;
    contact: string;
    date: string;
    time: string;
    reason: string;
  },
) {
  let normalized;
  try {
    normalized = normalizeBookingInput(input);
  } catch (error) {
    throw new ConvexError(error instanceof Error ? error.message : "Invalid booking.");
  }
  const last = await ctx.db.query("bookings").withIndex("by_bookingId").order("desc").first();
  const booking = {
    bookingId: (last?.bookingId ?? 1_000) + 1,
    ...normalized,
    status: "requested" as const,
    createdAt: Date.now(),
  };
  await ctx.db.insert("bookings", booking);
  return booking;
}

async function setStatus(
  ctx: MutationCtx,
  bookingId: number,
  status: Doc<"bookings">["status"],
) {
  const doc = await findBooking(ctx, bookingId);
  if (!doc) throw new ConvexError(`Booking #${bookingId} was not found.`);
  await ctx.db.patch(doc._id, { status });
  return toRecord({ ...doc, status });
}

export const listLive = query({
  args: {},
  handler: async (ctx) => {
    await assertUser(ctx);
    return listRecords(ctx);
  },
});

export const createLive = mutation({
  args: {
    name: v.string(),
    contact: v.string(),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, input) => {
    await assertUser(ctx);
    return insertBooking(ctx, input);
  },
});

export const updateStatusLive = mutation({
  args: { bookingId: v.number(), status: bookingStatus },
  handler: async (ctx, { bookingId, status }) => {
    await assertUser(ctx);
    return setStatus(ctx, bookingId, status);
  },
});

export const list = query({
  args: { secret: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { secret, limit }) => {
    assertServer(secret);
    return listRecords(ctx, limit);
  },
});

export const get = query({
  args: { secret: v.string(), bookingId: v.number() },
  handler: async (ctx, { secret, bookingId }) => {
    assertServer(secret);
    const doc = await findBooking(ctx, bookingId);
    return doc ? toRecord(doc) : null;
  },
});

export const create = mutation({
  args: {
    secret: v.string(),
    name: v.string(),
    contact: v.string(),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, { secret, ...input }) => {
    assertServer(secret);
    return insertBooking(ctx, input);
  },
});

export const updateStatus = mutation({
  args: { secret: v.string(), bookingId: v.number(), status: bookingStatus },
  handler: async (ctx, { secret, bookingId, status }) => {
    assertServer(secret);
    return setStatus(ctx, bookingId, status);
  },
});
