import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { isServerTool, runServerTool } from "@/lib/agent-tools";

// Called only by the Malitos agent worker (agent/agent.py), never the browser.
// Excluded from Clerk in middleware.ts; guarded by AGENT_SHARED_SECRET instead.

function authorized(request: Request) {
  const secret = process.env.AGENT_SHARED_SECRET;
  if (!secret || secret.length < 32) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tool: string }> },
) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { tool } = await params;
  if (!isServerTool(tool)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  try {
    const input = await request.json().catch(() => ({}));
    return NextResponse.json(runServerTool(tool, input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The tool failed." },
      { status: 400 },
    );
  }
}
