"use client";

import {
  DisconnectButton,
  TrackToggle,
  VideoTrack,
  isTrackReference,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { PhoneOff } from "lucide-react";
import Image from "next/image";

import { MALITOS_IMAGE, SYNTHESIA_AVATAR_IDENTITY } from "@/lib/avatar";
import { useCanShareScreen } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

// The Synthesia avatar is a regular LiveKit participant publishing a camera track.
export function AvatarStage() {
  const participants = useRemoteParticipants();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  const avatarTrack = cameraTracks.find(
    (ref) =>
      isTrackReference(ref) &&
      ref.participant.identity === SYNTHESIA_AVATAR_IDENTITY,
  );
  const ownScreen = screenTracks.find(
    (ref) => isTrackReference(ref) && ref.participant.isLocal,
  );
  const ownCamera = cameraTracks.find(
    (ref) => isTrackReference(ref) && ref.participant.isLocal,
  );
  const agentJoined = participants.some((p) => p.isAgent);

  return (
    <div className="absolute inset-0 bg-[#0b0f0e]">
      {avatarTrack && isTrackReference(avatarTrack) ? (
        <VideoTrack
          trackRef={avatarTrack}
          data-testid="avatar-video"
          className="absolute inset-0 size-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <Image
              src={MALITOS_IMAGE}
              alt=""
              width={72}
              height={72}
              className="live-dot size-[72px] rounded-2xl object-cover object-top"
            />
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/45">
              {agentJoined ? "Malitos is joining…" : "Connecting…"}
            </p>
          </div>
        </div>
      )}

      {ownScreen && isTrackReference(ownScreen) ? (
        <VideoTrack
          trackRef={ownScreen}
          data-testid="screen-share-video"
          className="absolute bottom-24 left-3 aspect-video w-[55%] rounded-lg border border-white/15 object-cover"
        />
      ) : null}
      {ownCamera && isTrackReference(ownCamera) ? (
        <VideoTrack
          trackRef={ownCamera}
          data-testid="user-video"
          className="absolute bottom-24 right-3 aspect-[3/4] w-[28%] rounded-lg border border-white/15 object-cover"
        />
      ) : null}
    </div>
  );
}

const controlClass =
  "grid size-11 place-items-center rounded-full md:size-10 border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/15 hover:text-white data-[lk-enabled=false]:text-white/40 [&_svg]:size-4";

export function CallControls() {
  const canShareScreen = useCanShareScreen();
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8 md:gap-2">
      <TrackToggle source={Track.Source.Microphone} className={controlClass} aria-label="Toggle microphone" />
      <TrackToggle source={Track.Source.Camera} className={controlClass} aria-label="Toggle camera" />
      {canShareScreen ? (
        <TrackToggle source={Track.Source.ScreenShare} className={controlClass} aria-label="Share screen" />
      ) : null}
      <DisconnectButton
        className={cn(controlClass, "border-transparent bg-[#e5484d] text-white hover:bg-[#d13438]")}
        aria-label="End call"
      >
        <PhoneOff />
      </DisconnectButton>
    </div>
  );
}
