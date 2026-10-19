import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const ticketTeam = v.union(
  v.literal("Billing"),
  v.literal("Support"),
  v.literal("Product"),
);
export const ticketStatus = v.union(v.literal("open"), v.literal("closed"));
export const bookingStatus = v.union(
  v.literal("requested"),
  v.literal("confirmed"),
  v.literal("cancelled"),
);

export default defineSchema({
  tickets: defineTable({
    ticketId: v.number(),
    subject: v.string(),
    team: ticketTeam,
    status: ticketStatus,
    createdAt: v.number(),
  })
    .index("by_ticketId", ["ticketId"])
    .index("by_createdAt", ["createdAt"]),

  bookings: defineTable({
    bookingId: v.number(),
    name: v.string(),
    contact: v.string(),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
    status: bookingStatus,
    createdAt: v.number(),
  })
    .index("by_bookingId", ["bookingId"])
    .index("by_createdAt", ["createdAt"]),

  // One row per day. Negative amounts are refunds.
  revenue: defineTable({
    date: v.string(),
    amount: v.number(),
    refunded: v.boolean(),
  }).index("by_date", ["date"]),
});
