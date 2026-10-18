// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

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
