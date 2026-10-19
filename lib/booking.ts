import type { BookingInput } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;

export function normalizeBookingInput(input: BookingInput): BookingInput {
  const name = input.name.trim();
  const contact = input.contact.trim();
  const date = input.date.trim();
  const time = input.time.trim();
  const reason = input.reason.trim();

  if (!name || name.length > 80) {
    throw new Error("Booking name is required and must be 80 characters or fewer.");
  }
  if (!EMAIL.test(contact) && !PHONE.test(contact)) {
    throw new Error("Booking contact must be a phone number or email address.");
  }
  const dateMatch = DATE.exec(date);
  if (!dateMatch) {
    throw new Error("Booking date must use YYYY-MM-DD.");
  }
  const parsed = new Date(
    Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3])),
  );
  if (
    parsed.getUTCFullYear() !== Number(dateMatch[1]) ||
    parsed.getUTCMonth() !== Number(dateMatch[2]) - 1 ||
    parsed.getUTCDate() !== Number(dateMatch[3])
  ) {
    throw new Error("Booking date must be a real calendar date.");
  }
  if (!TIME.test(time)) {
    throw new Error("Booking time must use HH:MM.");
  }
  const normalizedTime = time.slice(0, 5);
  if (!reason || reason.length > 240) {
    throw new Error("Booking reason is required and must be 240 characters or fewer.");
  }

  return { name, contact, date, time: normalizedTime, reason };
}
