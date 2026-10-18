import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const ticketTeam = v.union(
  v.literal("Billing"),
  v.literal("Support"),
  v.literal("Product"),
);
export const ticketStatus = v.union(v.literal("open"), v.literal("closed"));

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
});
