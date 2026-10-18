// @vitest-environment node
import { TokenVerifier } from "livekit-server-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth }));

import { createAvatarSession } from "@/actions/avatar";
import { MALITOS_AGENT_NAME } from "@/lib/avatar";

const API_KEY = "APIkey123";
const API_SECRET = "s".repeat(40);

describe("createAvatarSession", () => {
  beforeEach(() => {
    vi.stubEnv("LIVEKIT_URL", "wss://malitos.livekit.example");
    vi.stubEnv("LIVEKIT_API_KEY", API_KEY);
    vi.stubEnv("LIVEKIT_API_SECRET", API_SECRET);
    auth.mockResolvedValue({ userId: "user_1" });
  });

  it("mints a room token that dispatches the Malitos agent", async () => {
    const session = await createAvatarSession();

    expect(session.serverUrl).toBe("wss://malitos.livekit.example");
    expect(session.roomName).toMatch(/^malitos-[0-9a-f]{8}$/);
    expect(session.sessionId).toBe(session.roomName);

    const claims = await new TokenVerifier(API_KEY, API_SECRET).verify(
      session.token,
    );
    expect(claims.sub).toBe("user-user_1");
    expect(claims.video).toMatchObject({
      room: session.roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
    });
    expect(claims.roomConfig?.syncStreams).toBe(true);
    expect(claims.roomConfig?.agents?.[0]?.agentName).toBe(MALITOS_AGENT_NAME);
  });

  it("creates a fresh room for every call", async () => {
    const first = await createAvatarSession();
    const second = await createAvatarSession();
    expect(first.roomName).not.toBe(second.roomName);
  });

  it("refuses signed-out callers", async () => {
    auth.mockResolvedValue({ userId: null });
    await expect(createAvatarSession()).rejects.toThrow("401");
  });

  it("explains missing LiveKit configuration", async () => {
    vi.stubEnv("LIVEKIT_URL", "");
    await expect(createAvatarSession()).rejects.toThrow("not configured");
  });
});
