import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("server-only", () => ({}));

import {
  createTicket,
  getTickets,
  updateTicketStatus,
} from "@/actions/demo";
import { resetDemoTickets } from "@/lib/demo-store";

describe("demo ticket actions", () => {
  beforeEach(() => {
    vi.stubEnv("CONVEX_URL", "");
    auth.mockResolvedValue({ userId: "user_1" });
    resetDemoTickets();
  });

  it("shares the local store across manual actions", async () => {
    const created = await createTicket({
      subject: "Customer cannot find their renewal date",
      team: "Billing",
    });
    const updated = await updateTicketStatus({
      ticketId: created.ticketId,
      status: "closed",
    });
    const tickets = await getTickets();

    expect(updated.status).toBe("closed");
    expect(tickets[0]).toEqual(updated);
  });

  it("refuses signed-out callers", async () => {
    auth.mockResolvedValue({ userId: null });
    await expect(getTickets()).rejects.toThrow("Sign in");
  });

  it("rejects invalid ticket input", async () => {
    await expect(
      createTicket({ subject: "", team: "Billing" }),
    ).rejects.toThrow();
  });
});
