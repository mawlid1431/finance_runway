import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AgentCard } from "@/components/agent/agent-card";

const { createAvatarSession } = vi.hoisted(() => ({
  createAvatarSession: vi.fn(),
}));

vi.mock("@/actions/avatar", () => ({ createAvatarSession }));
vi.mock("@/components/agent/client-tool-handlers", () => ({
  ClientToolHandlers: () => null,
}));
vi.mock("@/components/agent/avatar-stage", () => ({
  AvatarStage: () => <div data-testid="avatar-stage" />,
  CallControls: () => null,
}));
vi.mock("@livekit/components-react", () => ({
  LiveKitRoom: ({
    token,
    onDisconnected,
    children,
  }: {
    token: string;
    onDisconnected: () => void;
    children: ReactNode;
  }) => (
    <div data-testid={`room-${token}`}>
      {children}
      <button onClick={onDisconnected}>Hang up</button>
    </div>
  ),
  RoomAudioRenderer: () => null,
}));

const firstSession = {
  sessionId: "malitos-1",
  serverUrl: "wss://example.com",
  token: "token-1",
  roomName: "malitos-1",
};

const secondSession = {
  ...firstSession,
  sessionId: "malitos-2",
  token: "token-2",
  roomName: "malitos-2",
};

describe("AgentCard", () => {
  it("creates fresh credentials after hanging up", async () => {
    createAvatarSession
      .mockResolvedValueOnce(firstSession)
      .mockResolvedValueOnce(secondSession);

    render(<AgentCard open onOpenChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Start call" }));
    expect(await screen.findByTestId("room-token-1")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-stage")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hang up" }));
    await waitFor(() =>
      expect(screen.queryByTestId("room-token-1")).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Start call" }));
    expect(await screen.findByTestId("room-token-2")).toBeInTheDocument();
    expect(createAvatarSession).toHaveBeenCalledTimes(2);
  });

  it("explains a missing LiveKit configuration", async () => {
    createAvatarSession.mockRejectedValueOnce(
      new Error("LiveKit is not configured."),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<AgentCard open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Start call" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Add the LiveKit keys",
    );
  });
});
