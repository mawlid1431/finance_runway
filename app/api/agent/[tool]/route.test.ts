// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/agent/[tool]/route";
import { getDemoRevenue } from "@/lib/demo-data";
import { resetDemoTickets } from "@/lib/demo-store";

const SECRET = "x".repeat(48);

function call(tool: string, body: unknown, secret = SECRET) {
  return POST(
    new Request(`http://localhost/api/agent/${tool}`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ tool }) },
  );
}

describe("/api/agent/[tool]", () => {
  beforeEach(() => {
    vi.stubEnv("AGENT_SHARED_SECRET", SECRET);
    vi.stubEnv("CONVEX_URL", "");
    resetDemoTickets();
  });

  it("rejects a wrong or missing secret", async () => {
    expect((await call("get_revenue", {}, "wrong")).status).toBe(401);
    vi.stubEnv("AGENT_SHARED_SECRET", "");
    expect((await call("get_revenue", {}, "")).status).toBe(401);
  });

  it("rejects unknown tools", async () => {
    expect((await call("delete_everything", {})).status).toBe(404);
  });

  it("returns revenue for the requested range", async () => {
    const res = await call("get_revenue", { range: "7d" });
    expect(res.status).toBe(200);
    expect((await res.json()).total).toBe(getDemoRevenue("7d").total);
  });

  it("creates and updates tickets", async () => {
    const created = await (
      await call("create_ticket", { subject: "Card declined", team: "Billing" })
    ).json();
    expect(created.ticket).toMatchObject({
      subject: "Card declined",
      status: "open",
    });

    const updated = await (
      await call("update_ticket_status", {
        ticketId: created.ticket.ticketId,
        status: "closed",
      })
    ).json();
    expect(updated.status).toBe("closed");
  });

  it("creates and confirms a booking", async () => {
    const created = await (
      await call("create_booking", {
        name: "Amina Hassan",
        contact: "amina@example.com",
        date: "2026-11-02",
        time: "14:30",
        reason: "Review the refund dip",
      })
    ).json();
    expect(created.booking).toMatchObject({
      name: "Amina Hassan",
      status: "requested",
      date: "2026-11-02",
      time: "14:30",
    });

    const updated = await (
      await call("update_booking_status", {
        bookingId: created.booking.bookingId,
        status: "confirmed",
      })
    ).json();
    expect(updated.status).toBe("confirmed");

    const found = await (
      await call("get_booking", { bookingId: created.booking.bookingId })
    ).json();
    expect(found.booking.status).toBe("confirmed");
  });

  it("rejects a booking that is missing a real contact", async () => {
    expect(
      (
        await call("create_booking", {
          name: "Amina Hassan",
          contact: "not-a-contact",
          date: "2026-11-02",
          time: "14:30",
          reason: "Review the refund dip",
        })
      ).status,
    ).toBe(400);
  });

  it("returns 400 for invalid arguments", async () => {
    expect(
      (await call("create_ticket", { subject: "", team: "Billing" })).status,
    ).toBe(400);
    expect(
      (await call("update_ticket_status", { ticketId: 1, status: "closed" }))
        .status,
    ).toBe(400);
  });
});
