"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  createTicket as createStoredTicket,
  listTickets,
  updateTicketStatus as updateStoredTicketStatus,
} from "@/lib/ticket-store";
import type { TicketStatus, TicketTeam } from "@/lib/types";

// Server actions are public endpoints: require a signed-in user and validate input.
async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in to manage tickets.");
}

const createInput = z.object({
  subject: z.string().trim().min(1).max(180),
  team: z.enum(["Billing", "Support", "Product"]),
});

const updateInput = z.object({
  ticketId: z.number().int().positive(),
  status: z.enum(["open", "closed"]),
});

export async function getTickets() {
  await requireUser();
  return listTickets();
}

export async function createTicket(input: {
  subject: string;
  team: TicketTeam;
}) {
  await requireUser();
  return createStoredTicket(createInput.parse(input));
}

export async function updateTicketStatus(input: {
  ticketId: number;
  status: TicketStatus;
}) {
  await requireUser();
  return updateStoredTicketStatus(updateInput.parse(input));
}
