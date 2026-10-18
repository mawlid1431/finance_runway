import { ConvexError } from "convex/values";

import type { QueryCtx } from "./_generated/server";

// Two ways in:
//  - the dashboard in the browser, as a signed-in Clerk user (live queries)
//  - the Next.js server and the Malitos agent, with CONVEX_SERVER_SECRET

export async function assertUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Sign in to use the dashboard.");
  return identity;
}

export function assertServer(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || expected.length < 32 || secret !== expected) {
    throw new ConvexError("Unauthorized.");
  }
}
