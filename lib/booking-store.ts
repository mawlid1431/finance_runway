import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";

import { api } from "@/convex/_generated/api";
import * as memory from "@/lib/demo-store";
import type { BookingInput, BookingRecord, BookingStatus } from "@/lib/types";

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
    if (error instanceof ConvexError) throw new Error(String(error.data));
    throw error;
  }
}

export async function listBookings(limit = 50): Promise<BookingRecord[]> {
  const db = convex();
  if (!db) return memory.listDemoBookings(limit);
  return call(() => db.client.query(api.bookings.list, { secret: db.secret, limit }));
}

export async function getBooking(bookingId: number): Promise<BookingRecord | null> {
  const db = convex();
  if (!db) return memory.getDemoBooking(bookingId);
  return call(() => db.client.query(api.bookings.get, { secret: db.secret, bookingId }));
}

export async function createBooking(input: BookingInput): Promise<BookingRecord> {
  const db = convex();
  if (!db) return memory.createDemoBooking(input);
  return call(() => db.client.mutation(api.bookings.create, { secret: db.secret, ...input }));
}

export async function updateBookingStatus(input: {
  bookingId: number;
  status: BookingStatus;
}): Promise<BookingRecord> {
  const db = convex();
  if (!db) return memory.updateDemoBookingStatus(input);
  return call(() =>
    db.client.mutation(api.bookings.updateStatus, { secret: db.secret, ...input }),
  );
}
