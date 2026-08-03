"use client";

import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
  PageActions,
  ScreenShareVideo,
  type SessionCredentials,
  UserVideo,
} from "@runwayml/avatars-react";
import { ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { createAvatarSession } from "@/actions/avatar";
import { ClientToolHandlers } from "@/components/agent/client-tool-handlers";
import { Button } from "@/components/ui/button";
import { NOVA_AVATAR_ID, NOVA_IMAGE } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function AgentCard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [session, setSession] = useState<SessionCredentials | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCall() {
    setError(null);
    setStarting(true);
    try {
      setSession(await createAvatarSession());
    } catch (startError) {
      showCallError(
        startError instanceof Error
          ? startError
          : new Error("The call could not start."),
      );
    } finally {
      setStarting(false);
    }
  }

  function endCall(sessionId: string) {
    setSession((current) =>
      current?.sessionId === sessionId ? null : current,
    );
  }

  function showCallError(callError: Error) {
    console.error(callError);
    setError(
      "The call could not start. Check the local Runway setup and try again.",
    );
  }

  return (
    <>
      <aside
        id="nova-agent"
        data-avatar-target="nova-agent"
        className={cn(
          "fixed right-3 z-50 w-[268px] overflow-hidden rounded-2xl border border-white/10 bg-[#101514] text-white shadow-[0_20px_80px_rgba(4,8,7,0.45)] transition-all duration-300 ease-out motion-reduce:transition-none",
          session
            ? "bottom-3 top-[68px]"
            : "top-[68px]",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-4 opacity-0",
        )}
        aria-label="Malitos AI assistant"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex h-11 items-center gap-2 border-b border-white/10 px-3.5">
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-[0.8rem] font-semibold">Malitos</span>
          <span className="font-mono text-[0.57rem] uppercase tracking-[0.14em] text-white/40">
            AI Consultant
          </span>
          <button
            id="nova-widget-minimize"
            data-avatar-target="nova-widget-minimize"
            type="button"
            className="ml-auto grid size-7 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
            aria-label="Minimize Malitos"
            aria-expanded={open}
            aria-controls="nova-agent"
            onClick={() => onOpenChange(false)}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className={cn("overflow-y-auto", session ? "h-[calc(100%-2.75rem)]" : "")}>
          {session ? (
            <AvatarCall
              key={session.sessionId}
              avatarId={NOVA_AVATAR_ID}
              credentials={session}
              video={false}
              className="h-full !aspect-auto rounded-none"
              onEnd={() => endCall(session.sessionId)}
              onError={(callError) => {
                showCallError(callError);
                endCall(session.sessionId);
              }}
            >
              <AvatarVideo className="!absolute inset-0" />
              <ScreenShareVideo className="!absolute bottom-32 left-4 aspect-video !h-auto !w-[55%] overflow-hidden rounded-lg" />
              <UserVideo className="!bottom-32" />
              <PageActions
                highlightDuration={3000}
                scrollBehavior="smooth"
                scrollBlock="center"
              />
              <ControlBar showCamera={true} showScreenShare />
              <ClientToolHandlers />
            </AvatarCall>
          ) : (
            <div className="flex flex-col p-4">
              <div className="flex items-center gap-3">
                <Image
                  src={NOVA_IMAGE}
                  alt="Malitos, Fintech Finance AI consultant"
                  width={48}
                  height={48}
                  className="size-12 rounded-xl object-cover object-top"
                  preload
                />
                <div>
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/38">
                    AI Consultant
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold tracking-[-0.03em]">
                    How can I help?
                  </h2>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <p className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-white/32">
                  What Malitos can do
                </p>
                <p className="mt-1 text-[0.72rem] leading-[1.55] text-white/55">
                  Navigate the UI, explain insights, change revenue ranges,
                  filter tickets, and create or update tickets.
                </p>
              </div>
              <div className="mt-3">
                <Button
                  id="start-call"
                  data-avatar-target="start-call"
                  variant="accent"
                  className="w-full"
                  disabled={starting}
                  onClick={startCall}
                >
                  <Headphones className="size-3.5" />
                  {starting ? "Starting..." : "Start call"}
                </Button>
              </div>
              {error ? (
                <p
                  role="alert"
                  className="mt-2.5 text-center text-[0.7rem] text-[#ff9b90]"
                >
                  {error}
                </p>
              ) : null}
              <p className="mt-2 text-center font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/28">
                Start · then share your screen
              </p>
            </div>
          )}
        </div>
      </aside>

      <button
        id="nova-widget-open"
        data-avatar-target="nova-widget-open"
        type="button"
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2.5 rounded-full border border-white/10 bg-[#101514] px-4 text-white shadow-[0_18px_60px_rgba(4,8,7,0.34)] transition duration-300 ease-out motion-reduce:transition-none",
          open
            ? "pointer-events-none translate-y-2 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100",
        )}
        aria-label="Open Malitos"
        aria-expanded={open}
        aria-controls="nova-agent"
        onClick={() => onOpenChange(true)}
      >
        <span className="size-2 rounded-full bg-[var(--accent)]" />
        <span className="text-sm font-semibold">Malitos</span>
        <ChevronLeft className="size-4 text-white/55" />
      </button>
    </>
  );
}
