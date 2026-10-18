// Malitos is rendered by Synthesia and driven by the LiveKit agent worker in
// agent/. The persona and tool rules live in agent/instructions.py.

export const MALITOS_IMAGE = "/malitos.jpeg";

// Must match LIVEKIT_AGENT_NAME in agent/agent.py so the worker joins the room.
export const MALITOS_AGENT_NAME = process.env.LIVEKIT_AGENT_NAME ?? "malitos";

// The participant identity the Synthesia plugin joins the room with.
export const SYNTHESIA_AVATAR_IDENTITY = "synthesia-avatar-agent";
