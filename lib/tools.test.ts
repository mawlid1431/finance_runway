import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { serverTools } from "@/lib/agent-tools";
import {
  CLIENT_TOOL_NAMES,
  SERVER_TOOL_NAMES,
  parseClientToolArgs,
} from "@/lib/tools";

describe("Malitos tool contract", () => {
  it("exposes all 13 tools", () => {
    expect(CLIENT_TOOL_NAMES.length + SERVER_TOOL_NAMES.length).toBe(18);
    expect(Object.keys(serverTools).sort()).toEqual(
      [...SERVER_TOOL_NAMES].sort(),
    );
  });

  it("includes all three page actions", () => {
    for (const name of ["click", "scroll_to", "highlight"] as const) {
      expect(CLIENT_TOOL_NAMES).toContain(name);
      expect(
        parseClientToolArgs(name, JSON.stringify({ target: "revenue-chart" })),
      ).toMatchObject({ target: "revenue-chart" });
    }
  });

  it("validates client tool arguments from the agent", () => {
    const args = (value: unknown) => JSON.stringify(value);

    expect(parseClientToolArgs("set_date_range", args({ range: "30d" }))).toEqual({
      range: "30d",
    });
    expect(parseClientToolArgs("set_date_range", args({ range: "31d" }))).toBeNull();
    expect(
      parseClientToolArgs("filter_tickets", args({ filter: "billing" })),
    ).toEqual({ filter: "billing" });
    expect(
      parseClientToolArgs("filter_tickets", args({ filter: "product" })),
    ).toBeNull();
    expect(
      parseClientToolArgs(
        "open_panel",
        args({ title: "Revenue insight", body: "Revenue is up." }),
      ),
    ).toEqual({ title: "Revenue insight", body: "Revenue is up." });
    expect(
      parseClientToolArgs("open_panel", args({ title: "Missing body" })),
    ).toBeNull();
    expect(parseClientToolArgs("refresh_tickets", "")).toEqual({});
    expect(parseClientToolArgs("highlight", "not json")).toBeNull();
    expect(parseClientToolArgs("highlight", args({ target: "x" }))).toEqual({
      target: "x",
      durationMs: 3000,
    });
  });
});
