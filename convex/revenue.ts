import { ConvexError, v } from "convex/values";

import { DEMO_REVENUE, summarizeRevenue } from "../lib/demo-data";
import { assertServer, assertUser } from "./access";
import { mutation, query, type QueryCtx } from "./_generated/server";

const range = v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"));

// The 180 most recent days, oldest first — enough for every range and its
// comparison period.
async function recentDays(ctx: QueryCtx) {
  const rows = await ctx.db
    .query("revenue")
    .withIndex("by_date")
    .order("desc")
    .take(180);
  return rows
    .reverse()
    .map(({ date, amount, refunded }) => ({ date, amount, refunded }));
}

// Browser (signed-in user, live): the raw days, summarised per range client-side.
export const listLive = query({
  args: {},
  handler: async (ctx) => {
    await assertUser(ctx);
    return recentDays(ctx);
  },
});

// Malitos agent (shared secret).
export const summary = query({
  args: { secret: v.string(), range },
  handler: async (ctx, { secret, range }) => {
    assertServer(secret);
    const s = summarizeRevenue(await recentDays(ctx), range);
    return {
      total: s.total,
      changePct: s.changePct,
      dailyAverage: s.dailyAverage,
      peakDay: s.peakDay,
      refundCount: s.refundCount,
      dip: s.dip,
    };
  },
});

// Record or correct one day's revenue (date is YYYY-MM-DD).
export const record = mutation({
  args: { secret: v.string(), date: v.string(), amount: v.number() },
  handler: async (ctx, { secret, date, amount }) => {
    assertServer(secret);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ConvexError("Date must be YYYY-MM-DD.");
    }
    const existing = await ctx.db
      .query("revenue")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    const row = { date, amount, refunded: amount < 0 };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("revenue", row);
    return row;
  },
});

// Loads the starter revenue history into an empty table. Safe to re-run.
export const seed = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertServer(secret);
    if (await ctx.db.query("revenue").first()) return { seeded: 0 };
    for (const row of DEMO_REVENUE) {
      await ctx.db.insert("revenue", row);
    }
    return { seeded: DEMO_REVENUE.length };
  },
});
