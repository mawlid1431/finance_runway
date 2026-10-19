import { normalizeBookingInput } from "@/lib/booking";
import { DEMO_TICKETS, getTicketInsights } from "@/lib/demo-data";
import type {
  BookingInput,
  BookingRecord,
  BookingStatus,
  TicketInsights,
  TicketRecord,
  TicketStatus,
  TicketTeam,
} from "@/lib/types";

type DemoStore = {
  tickets: TicketRecord[];
  bookings: BookingRecord[];
};

const globalDemoStore = globalThis as typeof globalThis & {
  fintechFinanceDemoStore?: DemoStore;
};

function copyTicket(ticket: TicketRecord): TicketRecord {
  return { ...ticket };
}

function getStore() {
  globalDemoStore.fintechFinanceDemoStore ??= {
    tickets: DEMO_TICKETS.map(copyTicket),
    bookings: [],
  };
  globalDemoStore.fintechFinanceDemoStore.bookings ??= [];

  return globalDemoStore.fintechFinanceDemoStore;
}

export function listDemoTickets(limit = 50): TicketRecord[] {
  return [...getStore().tickets]
    .sort((a, b) => b.createdAt - a.createdAt || b.ticketId - a.ticketId)
    .slice(0, limit)
    .map(copyTicket);
}

export function getDemoTicket(ticketId: number): TicketRecord | null {
  const ticket = getStore().tickets.find(
    (candidate) => candidate.ticketId === ticketId,
  );

  return ticket ? copyTicket(ticket) : null;
}

export function createDemoTicket(input: {
  subject: string;
  team: TicketTeam;
}): TicketRecord {
  const subject = input.subject.trim();

  if (!subject) {
    throw new Error("Ticket subject is required.");
  }

  if (subject.length > 180) {
    throw new Error("Ticket subject must be 180 characters or fewer.");
  }

  const store = getStore();
  const ticket: TicketRecord = {
    ticketId:
      Math.max(...store.tickets.map((existing) => existing.ticketId), 4_799) +
      1,
    subject,
    team: input.team,
    status: "open",
    createdAt: Date.now(),
  };

  store.tickets.push(ticket);
  return copyTicket(ticket);
}

export function updateDemoTicketStatus(input: {
  ticketId: number;
  status: TicketStatus;
}): TicketRecord {
  const ticket = getStore().tickets.find(
    (candidate) => candidate.ticketId === input.ticketId,
  );

  if (!ticket) {
    throw new Error(`Ticket #${input.ticketId} was not found.`);
  }

  ticket.status = input.status;
  return copyTicket(ticket);
}

export function getDemoTicketInsights(): TicketInsights {
  return getTicketInsights(listDemoTickets());
}

export function listDemoBookings(limit = 50): BookingRecord[] {
  return [...getStore().bookings]
    .sort((a, b) => b.createdAt - a.createdAt || b.bookingId - a.bookingId)
    .slice(0, limit)
    .map((booking) => ({ ...booking }));
}

export function getDemoBooking(bookingId: number): BookingRecord | null {
  const booking = getStore().bookings.find((candidate) => candidate.bookingId === bookingId);
  return booking ? { ...booking } : null;
}

export function createDemoBooking(input: BookingInput): BookingRecord {
  const normalized = normalizeBookingInput(input);
  const store = getStore();
  const booking: BookingRecord = {
    bookingId: Math.max(1_000, ...store.bookings.map((existing) => existing.bookingId)) + 1,
    ...normalized,
    status: "requested",
    createdAt: Date.now(),
  };
  store.bookings.push(booking);
  return { ...booking };
}

export function updateDemoBookingStatus(input: {
  bookingId: number;
  status: BookingStatus;
}): BookingRecord {
  const booking = getStore().bookings.find(
    (candidate) => candidate.bookingId === input.bookingId,
  );
  if (!booking) {
    throw new Error(`Booking #${input.bookingId} was not found.`);
  }
  booking.status = input.status;
  return { ...booking };
}

export function resetDemoTickets() {
  globalDemoStore.fintechFinanceDemoStore = {
    tickets: DEMO_TICKETS.map(copyTicket),
    bookings: [],
  };
}
