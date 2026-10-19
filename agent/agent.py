"""Malitos — the Fintech Finance AI consultant as a Synthesia interactive avatar.

The worker joins each LiveKit room the dashboard creates, starts the Synthesia
avatar, and runs the conversation. Two kinds of tools:

  - server tools read and change demo data through the Next.js app
    (POST {APP_URL}/api/agent/<tool>, authenticated with AGENT_SHARED_SECRET)
  - client tools change the page the user is looking at, via LiveKit RPC to
    the user's browser (registered in components/agent/client-tool-handlers.tsx)

Run: python agent.py dev   (`console` mode uses a mock room — no avatar)
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Annotated, Any, Literal

import aiohttp
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    ToolError,
    WorkerOptions,
    cli,
    function_tool,
    inference,
    room_io,
)
from livekit.plugins import silero, synthesia
from pydantic import Field

from instructions import GREETING, INSTRUCTIONS

# The dashboard's .env holds every key, so the worker reads the same file.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

logger = logging.getLogger("malitos")

AGENT_NAME = os.getenv("LIVEKIT_AGENT_NAME", "malitos")
APP_URL = os.getenv("APP_URL", "http://localhost:3000").rstrip("/")
AGENT_SHARED_SECRET = os.getenv("AGENT_SHARED_SECRET", "")
AVATAR_ID = os.getenv("SYNTHESIA_AVATAR_ID", "4b638067-6319-46e1-b634-371a4bdfceb9")
CARTESIA_VOICE_ID = os.getenv("CARTESIA_VOICE_ID", "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4")
LLM_MODEL = os.getenv("AGENT_LLM_MODEL", "openai/gpt-4.1")

Range = Literal["7d", "30d", "90d"]
TicketId = Annotated[int, Field(description='Whole-number ticket ID; "#4803" becomes 4803.')]


class Malitos(Agent):
    def __init__(self, room: rtc.Room, http: aiohttp.ClientSession) -> None:
        super().__init__(instructions=INSTRUCTIONS)
        self._room = room
        self._http = http

    # ── transport ──────────────────────────────────────────────────────────

    async def _server(self, tool: str, args: dict[str, Any] | None = None) -> dict:
        try:
            async with self._http.post(
                f"{APP_URL}/api/agent/{tool}",
                json=args or {},
                headers={"Authorization": f"Bearer {AGENT_SHARED_SECRET}"},
                timeout=aiohttp.ClientTimeout(total=8),
            ) as res:
                body = await res.json(content_type=None)
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            logger.warning("server tool %s failed: %s", tool, e)
            raise ToolError("The dashboard did not respond. Try again in a moment.") from e
        if res.status != 200:
            raise ToolError(body.get("error", "The request failed."))
        return body

    def _user_identity(self) -> str | None:
        for p in self._room.remote_participants.values():
            if p.kind == rtc.ParticipantKind.PARTICIPANT_KIND_STANDARD:
                return p.identity
        return None

    async def _client(self, method: str, payload: dict[str, Any] | None = None) -> str:
        identity = self._user_identity()
        if identity is None:
            raise ToolError("The user's browser is not connected.")
        try:
            return await self._room.local_participant.perform_rpc(
                destination_identity=identity,
                method=method,
                payload=json.dumps(payload or {}),
                response_timeout=5.0,
            )
        except rtc.RpcError as e:
            raise ToolError(e.message) from e

    # ── page actions ───────────────────────────────────────────────────────

    @function_tool
    async def scroll_to(self, target: str) -> str:
        """Scroll a page target into view. Call before highlight or click.

        Args:
            target: Exact target name from the instructions, such as revenue-chart.
        """
        return await self._client("scroll_to", {"target": target})

    @function_tool
    async def highlight(self, target: str) -> str:
        """Pulse a page target for three seconds so the user sees it.

        Args:
            target: Exact target name from the instructions.
        """
        return await self._client("highlight", {"target": target, "durationMs": 3000})

    @function_tool
    async def click(self, target: str) -> str:
        """Click a visible page target. Only when the user asked to open or activate it.

        Args:
            target: Exact target name from the instructions.
        """
        return await self._client("click", {"target": target})

    # ── client tools ───────────────────────────────────────────────────────

    @function_tool
    async def set_date_range(self, range: Range) -> str:
        """Change the visible revenue chart range. Only when the Revenue page is open.

        Args:
            range: "7d", "30d", or "90d".
        """
        return await self._client("set_date_range", {"range": range})

    @function_tool
    async def filter_tickets(self, filter: Literal["all", "open", "billing"]) -> str:
        """Change the visible ticket queue. Only when the Tickets page is open.

        Args:
            filter: "all" for every ticket, "open" for open tickets, "billing" for Billing.
        """
        return await self._client("filter_tickets", {"filter": filter})

    @function_tool
    async def filter_bookings(self, filter: Literal["all", "requested", "confirmed"]) -> str:
        """Change the visible booking list. Only when the Bookings page is open.

        Args:
            filter: "all" for every booking, "requested" for new requests, "confirmed" for confirmed appointments.
        """
        return await self._client("filter_bookings", {"filter": filter})

    @function_tool
    async def open_panel(self, title: str, body: str) -> str:
        """Show a short insight or explanation in the dashboard info panel.

        Args:
            title: Short plain-text heading.
            body: Concise plain-text insight or explanation.
        """
        return await self._client("open_panel", {"title": title, "body": body})

    @function_tool
    async def refresh_tickets(self) -> str:
        """Reload the visible ticket queue right after create_ticket or update_ticket_status succeeds."""
        return await self._client("refresh_tickets")

    @function_tool
    async def refresh_bookings(self) -> str:
        """Reload the visible bookings list right after create_booking or update_booking_status succeeds."""
        return await self._client("refresh_bookings")

    # ── server tools ───────────────────────────────────────────────────────

    @function_tool
    async def get_overview_insights(self) -> dict:
        """Fetch the cross-functional brief: 30-day revenue total, change and refunds plus ticket total, open count, top team, and latest ticket."""
        return await self._server("get_overview_insights")

    @function_tool
    async def get_revenue(self, range: Range = "30d") -> dict:
        """Fetch revenue metrics: total, change percentage, daily average, peak day, refund count, and the revenue dip.

        Args:
            range: "7d", "30d", or "90d". Use "30d" when the user gives no range.
        """
        return await self._server("get_revenue", {"range": range})

    @function_tool
    async def get_ticket_insights(self) -> dict:
        """Fetch support queue metrics: total, open and closed counts, open tickets by team, the top team, and the latest ticket."""
        return await self._server("get_ticket_insights")

    @function_tool
    async def get_ticket(self, ticket_id: TicketId) -> dict:
        """Look up one ticket by number. Returns ticket as null when no match exists."""
        return await self._server("get_ticket", {"ticketId": ticket_id})

    @function_tool
    async def create_ticket(
        self,
        subject: Annotated[str, Field(description="Plain-text summary, at most 180 characters.")],
        team: Literal["Billing", "Support", "Product"],
    ) -> dict:
        """Create an open ticket. Only when the user explicitly asks to create, file, or log one. Afterwards speak the result and call refresh_tickets."""
        return await self._server("create_ticket", {"subject": subject, "team": team})

    @function_tool
    async def update_ticket_status(
        self, ticket_id: TicketId, status: Literal["open", "closed"]
    ) -> dict:
        """Close or reopen a ticket. Only when the user explicitly asks. Afterwards speak the result and call refresh_tickets."""
        return await self._server(
            "update_ticket_status", {"ticketId": ticket_id, "status": status}
        )

    @function_tool
    async def get_booking(self, booking_id: TicketId) -> dict:
        """Look up one appointment booking by number. Returns booking as null when no match exists."""
        return await self._server("get_booking", {"bookingId": booking_id})

    @function_tool
    async def create_booking(
        self,
        name: Annotated[str, Field(description="Person the appointment is for, at most 80 characters.")],
        contact: Annotated[str, Field(description="Phone number or email address.")],
        date: Annotated[str, Field(description="Appointment date as YYYY-MM-DD.")],
        time: Annotated[str, Field(description="Appointment time as HH:MM in 24-hour form.")],
        reason: Annotated[str, Field(description="Why they are booking, at most 240 characters.")],
    ) -> dict:
        """Save an appointment booking. Only after the user has given name, contact, date, time, and reason. Afterwards speak the result and call refresh_bookings."""
        return await self._server(
            "create_booking",
            {"name": name, "contact": contact, "date": date, "time": time, "reason": reason},
        )

    @function_tool
    async def update_booking_status(
        self, booking_id: TicketId, status: Literal["requested", "confirmed", "cancelled"]
    ) -> dict:
        """Confirm or cancel a booking. Only when the user explicitly asks. Afterwards speak the result and call refresh_bookings."""
        return await self._server(
            "update_booking_status", {"bookingId": booking_id, "status": status}
        )


def prewarm(proc) -> None:
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect()
    http = aiohttp.ClientSession()
    ctx.add_shutdown_callback(http.close)

    session = AgentSession(
        stt=inference.STT(model="cartesia/ink-2"),
        llm=inference.LLM(model=LLM_MODEL),
        tts=inference.TTS(model="cartesia/sonic-3.6", voice=CARTESIA_VOICE_ID),
        vad=ctx.proc.userdata["vad"],
        max_tool_steps=6,
        turn_handling={
            "turn_detection": "stt",
            # Off: a speculative reply from a half-heard transcript could write tickets.
            "preemptive_generation": {"enabled": False},
            "interruption": {"min_duration": 0.75, "min_words": 1, "false_interruption_timeout": 2.0},
        },
    )

    avatar = synthesia.AvatarSession(
        synthesia.AvatarConfig(avatar_ids=[AVATAR_ID]),
        join_timeout=60.0,
    )
    for attempt in range(3):
        try:
            await avatar.start(session, room=ctx.room)
            break
        except synthesia.SynthesiaError as e:
            if not e.retryable or attempt == 2:
                raise
            await asyncio.sleep(2 * (attempt + 1))

    await session.start(
        agent=Malitos(room=ctx.room, http=http),
        room=ctx.room,
        # video_input lets Malitos see the user's camera or shared screen.
        room_options=room_io.RoomOptions(video_input=True),
    )
    # Interruptible, so the user can cut in (by voice or chat) during the greeting.
    session.generate_reply(instructions=GREETING)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm, agent_name=AGENT_NAME)
    )
