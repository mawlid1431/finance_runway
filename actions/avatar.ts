"use server";

import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import {
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
} from "livekit-server-sdk";

import { MALITOS_AGENT_NAME } from "@/lib/avatar";

export type AvatarSession = {
  sessionId: string;
  serverUrl: string;
  token: string;
  roomName: string;
};

// Production builds strip thrown error messages from server actions, so
// expected failures are returned as a reason the panel can explain.
export type AvatarSessionResult =
  | { ok: true; session: AvatarSession }
  | { ok: false; reason: "unauthorized" | "not_configured" };

export async function createAvatarSession(): Promise<AvatarSessionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, reason: "unauthorized" };
  }

  const serverUrl = process.env.LIVEKIT_URL;
  if (!serverUrl || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    return { ok: false, reason: "not_configured" };
  }

  // A fresh room per call so the agent worker is dispatched every time.
  const roomName = `malitos-${randomUUID().slice(0, 8)}`;
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: `user-${userId}`, ttl: "15m" },
  );
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  token.roomConfig = new RoomConfiguration({
    // Keeps the avatar's audio and video in sync in the browser.
    syncStreams: true,
    agents: [new RoomAgentDispatch({ agentName: MALITOS_AGENT_NAME })],
  });

  return {
    ok: true,
    session: {
      sessionId: roomName,
      serverUrl,
      token: await token.toJwt(),
      roomName,
    },
  };
}
