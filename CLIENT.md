# Fintech Finance

Client brief and presentation guide.

**Product:** Fintech Finance  
**Consultant:** Malitos, a live video AI that sits beside the dashboard  
**One line:** A signed-in operations desk where a person can read revenue and support tickets, or ask Malitos to explain the numbers, point at the screen, and file the ticket for them.

---

## Goal

Give a finance or support lead one place to see the business and act on it, without switching between a chart, a ticket queue, and a chat window.

Malitos is not a separate chatbot. It joins the same session, speaks, reads the same live data, and can drive the page the person is already looking at.

---

## Problems this solves

| Problem | What happens today without this | What Fintech Finance does |
| --- | --- | --- |
| Numbers are hard to narrate | A manager asks "how did the last 30 days look?" and someone clicks through charts to answer. | Ask out loud. Malitos reads the live total, the change versus the previous period, the peak day, and refund flags, then says it in plain language. |
| The dashboard is busy | New users do not know where revenue, refunds, or the queue live. | Malitos scrolls to the right card and highlights it, so the person sees the answer on screen, not only hears it. |
| Support work interrupts the conversation | Filing or closing a ticket means leaving the call and typing into another tool. | Say "file a billing ticket about a failed refund." Malitos creates an open ticket. The queue updates on screen. |
| Finance and support sit apart | Revenue and the ticket queue are two reports. | One spoken brief covers 30 day revenue and the open queue, including which team owns the most open tickets. |
| Explaining the product takes a trainer | Demos depend on the presenter clicking the right controls in order. | The avatar can walk the client through Overview, Revenue, Tickets, and Settings while they watch. |

What it does not claim: this build uses demo revenue history and a support queue (Billing, Support, Product). It is the working product shape, ready to connect to a client's real books and help desk later. It is not a bank, a payment processor, or a full CRM.

---

## What the client sees

After sign-in, four pages:

| Page | What it shows |
| --- | --- |
| Overview | 30 day revenue, refund flags, open tickets, recent activity, and shortcuts. |
| Revenue | A chart for 7, 30, or 90 days, with totals, change, peak, and refund dips. |
| Tickets | The queue, filters (all, open, billing), and create or close a ticket. |
| Settings | Light or dark theme, alert toggles, and checks for microphone and screen share before a call. |

Every action Malitos can take also has a button. The person is never locked into voice.

---

## How a session works

1. The person opens the site. If they are not signed in, they go to the sign-in page.
2. The dashboard loads live revenue and tickets. Numbers update when data changes, including changes Malitos makes.
3. They press **Start call**. The app opens a private room for about 15 minutes and brings Malitos in.
4. Malitos appears as video, greets them in one short turn, and listens.
5. They speak. Speech becomes text, the model decides whether to look up data, change the page, or just answer, then the reply is spoken on the avatar.
6. If they share a screen, Malitos can use what is visible as context. It still only changes data when they clearly ask.

A single spoken request follows this order:

1. Hear the request.
2. If it is about numbers or tickets, call the dashboard and wait for the real result. Malitos does not invent figures.
3. If they asked to be shown something, scroll to that part of the page, then highlight it.
4. If they asked to open or file something, do that, then refresh the queue so they can see it.
5. Speak the result in one to three short sentences.

Tool use is capped so one request cannot wander. A half-heard phrase is not allowed to create a ticket. Creating or closing a ticket happens only when the person explicitly asks and has given the details.

---

## What a client can ask in the room

**Look and explain**

- "How is revenue over the last 30 days?"
- "Show me the chart and highlight the peak."
- "Switch the chart to 90 days."
- "How many tickets are open, and which team has the most?"
- "Open ticket 4803."

**Change the work**

- "File a billing ticket: customer charged twice."
- "Close ticket 4803."
- "Show only open tickets."

**Guide the screen**

- "Take me to Settings."
- "Put that explanation on screen."

---

## What we used

| Piece | Product | Why it is here |
| --- | --- | --- |
| Web app | Next.js 16, React 19, TypeScript, Tailwind CSS | The dashboard the client sees. |
| Sign-in | Clerk | Only signed-in people reach the dashboard. |
| Live data | Convex | Revenue and tickets update on every open screen as soon as they change. |
| Call, voice, and page control | LiveKit Cloud | The room for audio, video, and the commands that move the page. Skit uses LiveKit as well. This repository's worker is Malitos. |
| Avatar | Synthesia. Console: [app.synthesia.io](https://app.synthesia.io) | Malitos as a real-time video person, not a text box. The key is `SYNTHESIA_API_KEY`. The local name `syntha_API` points at that same Synthesia app. The same account is also used for Skit. |
| Speech | Cartesia (through LiveKit): ink-2 to hear, sonic-3.6 to speak | Turns speech into text and the reply back into a voice. |
| Reasoning | OpenAI GPT-4.1 (through LiveKit), overridable | Chooses the right lookup or page action. Persona and limits live in the worker instructions. |
| Checks | Zod on the server, matching checks in the worker | Bad or incomplete tool arguments are rejected before they touch data. |
| Hosting shape | Vercel for the web app; a separate Python worker for Malitos | The browser never holds the secrets for the database, the room, or the avatar. |
| Tests | Vitest | Dashboard behavior is tested without spending avatar or voice credits. |

Package manager and local runtime: Bun. Worker language: Python.

---

## Suggested presentation (about 8 minutes)

Use this as the slide list. Each block is one slide. The line under it is what to say.

**1. Title**  
Fintech Finance. An operations dashboard with a consultant in the room.  
Say: "This is a working desk for revenue and support. Malitos sits beside it and can do the same work you can do with the mouse."

**2. The problem**  
People lose time translating a dashboard into an answer, and they leave the conversation to file the work.  
Say: "The question is usually simple. The clicking is not. We put the answer and the action in the same call."

**3. The goal**  
One signed-in session. Live numbers. A voice that reads those numbers and can point at them.  
Say: "Malitos does not guess. It asks the same data the charts are using, then shows you where that number lives."

**4. The four pages**  
Overview, Revenue, Tickets, Settings.  
Say: "You can ignore the avatar and use it as a normal dashboard. Voice is an extra pair of hands."

**5. A call, step by step**  
Sign in, start call, greeting, question, lookup, highlight, spoken answer.  
Say: "I will ask for 30 day revenue. Watch the chart, not just the avatar."

**6. Live demo script**  
Run these in order:

1. Start on Overview. Ask: "Give me a quick health check."
2. Ask: "Open revenue and highlight the chart."
3. Ask: "Set this to 90 days and tell me the peak."
4. Ask: "Open tickets and show me what is still open."
5. Ask: "File a support ticket: payout delayed for the north region."
6. Point at the new row. Ask: "Close that ticket."

**7. Trust**  
Sign-in is required. The avatar worker uses its own secret, not the user's password. Ticket writes only happen on a clear request.  
Say: "The browser does not hold database or avatar keys. A mumbled sentence cannot create a ticket."

**8. Close**  
Today: a full loop on demo revenue and a three-team queue. Next: the client's own revenue feed and ticket source, same conversation.  
Say: "The workflow is the product. The data source is the part we swap for yours."

---

## One diagram to leave on screen

```text
Person
  → signs in (Clerk)
  → dashboard (Next.js) subscribed to live revenue and tickets (Convex)
  → starts a call (LiveKit room)
       → Malitos worker
            → hears and speaks (Cartesia)
            → decides (GPT-4.1)
            → appears on camera (Synthesia)
            → reads or writes data through the app
            → scrolls, highlights, or filters the page they are on
  → the dashboard updates in front of them
```

---

## If they ask

**Is the data real?**  
In this build it is seeded demo history: daily revenue (a negative amount is a refund) and a ticket queue. The path is the same one a live feed would use.

**Can it click around by itself?**  
It moves and highlights when the question needs the screen. It clicks, creates, or closes only when asked.

**Can two people see the same update?**  
Yes. A ticket Malitos creates shows up on every open dashboard, because the data is live.

**What do we need from the client later?**  
Their identity provider (or keep Clerk), a revenue source, and a ticket source. The conversation and the page control stay.
