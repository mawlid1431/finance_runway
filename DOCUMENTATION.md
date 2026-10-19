# Fintech Finance — Complete Setup Documentation

> **Promo:** 50% off one month of any paid plan with code **`SKILLS50`**.

This guide walks you through everything needed to clone this repo, configure all third-party services, and run the project locally.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Clerk Authentication Setup](#3-clerk-authentication-setup)
4. [Synthesia and LiveKit](#4-synthesia-and-livekit)
5. [Environment Variables](#5-environment-variables)
6. [Run Locally](#6-run-locally)
7. [Project Structure](#7-project-structure)
8. [Available Scripts](#8-available-scripts)
9. [Features Overview](#9-features-overview)

---

## 1. Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 22.13+ | Required by Next.js 16 |
| Bun | 1.2+ | Used as package manager and runtime |
| Git | Any | For cloning |

Install Bun if you haven't already:

```bash
curl -fsSL https://bun.sh/install | bash
```

Or on Windows (PowerShell):

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

---

## 2. Clone & Install

```bash
git clone https://github.com/mawlid1431/fintech-finance.git
cd fintech-finance
bun install
```

Copy the example environment file:

```bash
cp .env.example .env
```

---

## 3. Clerk Authentication Setup

Clerk handles all user authentication (sign-in, sign-up, session management).

### 3.1 Create a Clerk account

Go to [https://clerk.com](https://clerk.com) and sign up for a free account.

### 3.2 Create an application

1. From your Clerk dashboard, click **Create application**
2. Enter a name (e.g. `Fintech Finance`)
3. Select your preferred sign-in methods (Email, Google, GitHub, etc.)
4. Click **Create application**

### 3.3 Get your API keys

In your Clerk application dashboard, go to **API Keys** (left sidebar):

| Key | Where to find |
|-----|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Shown as **Publishable key** |
| `CLERK_SECRET_KEY` | Shown as **Secret keys** (reveal it) |

Still in the dashboard, go to **JWT Templates** → find the default template to get:

| Key | Where to find |
|-----|--------------|
| `NEXT_PUBLIC_CLERK_DOMAIN` | Your app's **Frontend API URL** (e.g. `https://your-slug.clerk.accounts.dev`) |
| `CLERK_JWKS_URL` | **JWKS URL** — append `/.well-known/jwks.json` to your Frontend API URL |
| `CLERK_PEM_PUBLIC_KEY` | **PEM Public Key** — found under your JWT key settings |

Clerk links:
- Dashboard: [https://dashboard.clerk.com](https://dashboard.clerk.com)
- Docs: [https://clerk.com/docs](https://clerk.com/docs)
- Next.js integration guide: [https://clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)

### 3.4 Configure sign-in URLs

In your Clerk dashboard → **Paths**, verify or set:
- Sign-in URL: `/sign-in`
- After sign-in URL: `/`
- After sign-up URL: `/`

---

## 4. Synthesia and LiveKit

Malitos is a second AI on top of the dashboard. Synthesia renders the video avatar. LiveKit carries the call (microphone, screen share, and the commands that move the page). Speech and the language model run through LiveKit as well.

The same Synthesia account and the same LiveKit project are also used for the other AI, **Skit**. This repository's worker is Malitos (`LIVEKIT_AGENT_NAME`, default `malitos`). Skit is the other agent on those accounts, not a second copy of this dashboard.

### 4.1 Synthesia

Console: [https://app.synthesia.io](https://app.synthesia.io)

1. Open the Synthesia app and go to developer settings for **Interactive Avatars**.
2. Create an API key scoped to Interactive Avatars.
3. Copy the interactive avatar id for Malitos.

In `.env`:

| Key | Where it comes from |
| --- | --- |
| `SYNTHESIA_API_KEY` | Synthesia API key. Server only. A local alias `syntha_API` in some notes points at the same app: [https://app.synthesia.io](https://app.synthesia.io). |
| `SYNTHESIA_AVATAR_ID` | Interactive avatar id. Optional. The worker has a default avatar when this is unset. |

The avatar joins the call as the participant `synthesia-avatar-agent`.

### 4.2 LiveKit

In the LiveKit Cloud dashboard, open the project, then **Settings → Keys**. Copy:

| Key | Where it comes from |
| --- | --- |
| `LIVEKIT_URL` | Project WebSocket URL (`wss://…livekit.cloud`) |
| `LIVEKIT_API_KEY` | API key on that settings page |
| `LIVEKIT_API_SECRET` | API secret on that settings page |

LiveKit also bills speech-to-text, the language model, and the voice (LiveKit Inference). Do not commit these values.

### 4.3 What Malitos says

The greeting and the tool rules live in `agent/instructions.py`, not in the Synthesia console. On each call Malitos introduces itself as the Fintech Finance consultant, says it can explore the dashboard, explain insights, and help with tickets, and mentions that sharing the screen lets it see what you see.

---

## 5. Environment Variables

Create a `.env` file at the project root with the following values:

```env
# ── Synthesia (https://app.synthesia.io) ──────────────────────────────
SYNTHESIA_API_KEY=
# SYNTHESIA_AVATAR_ID=

# ── LiveKit (Cloud dashboard → Settings → Keys)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# ── Malitos worker ────────────────────────────────────────────────────
AGENT_SHARED_SECRET=
APP_URL=http://localhost:3000

# ── Convex ────────────────────────────────────────────────────────────
CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SERVER_SECRET=

# ── Clerk ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_CLERK_DOMAIN=https://your-slug.clerk.accounts.dev
CLERK_API_URL=https://api.clerk.com
CLERK_JWKS_URL=https://your-slug.clerk.accounts.dev/.well-known/jwks.json
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
your_pem_public_key_content_here
-----END PUBLIC KEY-----"

# ── Clerk redirect URLs ────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

> **Note:** The `CLERK_PEM_PUBLIC_KEY` spans multiple lines — wrap the entire value in double quotes as shown above.

> **Security:** Never commit `.env` to version control. It is already listed in `.gitignore`.

---

## 6. Run Locally

```bash
bun dev
```

In another shell, from `agent/`:

```bash
python agent.py dev
```

Open [http://localhost:3000](http://localhost:3000). The page alone is the dashboard. Malitos joins only when this worker is running and LiveKit can reach it.

Unauthenticated visitors are automatically redirected to `/sign-in`. After signing in with Clerk, they land on the dashboard.

### Check for vulnerabilities

```bash
bun audit
```

The project is configured with `overrides` in `package.json` to keep all transitive dependencies at 0 known vulnerabilities.

---

## 9. Project Structure

```text
app/
  (dashboard)/          # Protected dashboard pages (overview, revenue, tickets, settings)
  sign-in/              # Clerk sign-in page
  globals.css           # CSS variables, brand colors, global styles
  icon.svg              # Favicon (auto-registered by Next.js)
  layout.tsx            # Root layout with ClerkProvider + ThemeProvider

actions/
  avatar.ts             # LiveKit room and Malitos dispatch
agent/
  agent.py              # Malitos worker (Synthesia avatar, speech, tools)
  instructions.py       # Greeting and tool rules

components/
  agent/                # Malitos AI panel (agent-card, client-tool-handlers)
  layout/               # Shell, sidebar, topbar, providers, logo
  overlays/             # Info panel modal
  overview/             # Overview page components
  revenue/              # Revenue page components
  settings/             # Settings page components
  tickets/              # Tickets page components
  ui/                   # Shared UI primitives (button, card, etc.)

lib/
  avatar.ts             # Character ID, personality, start script
  demo-data.ts          # Deterministic demo revenue fixtures
  demo-store.ts         # In-memory ticket state
  tools.ts              # All Malitos tool definitions
  utils.ts              # cn() helper
```

---

## 8. Available Scripts

```bash
bun dev          # Start development server (hot reload)
bun build        # Production build
bun start        # Start production server
bun typecheck    # TypeScript type check (no emit)
bun lint         # ESLint
bun test         # Vitest unit tests
bun audit        # Check for dependency vulnerabilities
```

---

## 9. Features Overview

### Dashboard pages

| Route | Description |
|-------|-------------|
| `/` | KPI overview, recent activity, quick actions |
| `/revenue` | 7/30/90-day revenue chart, CSV export, anomaly panel |
| `/tickets` | Support queue, filters, create/update tickets |
| `/settings` | Theme toggle, alerts, character details, call readiness |

### Malitos (AI avatar)

Malitos is a Synthesia video avatar on a LiveKit call, in a collapsible side panel. Skit is the other assistant on those same Synthesia and LiveKit services. This repository runs Malitos. During a call, Malitos can:

- Navigate between pages
- Scroll to and highlight any UI element
- Explain revenue data, trends, and anomalies
- Show ticket queue insights
- Create and update tickets in real time
- Open contextual information panels
- Respond to screen share for visual diagnosis

### Authentication

All dashboard routes are protected by Clerk. Unauthenticated requests are redirected to `/sign-in`. The `UserButton` in the top bar handles sign-out and profile management.

### Theming

Light and dark modes are supported via `next-themes`. The brand color is **orange `#f97316`** applied consistently via CSS variables across both themes.

### Sidebar

The sidebar can be collapsed to icon-only mode (72px wide). The state persists in `localStorage` across page refreshes.

---

## License

MIT © [Malit Mohamut](https://github.com/mawlid1431) — see [LICENSE](./LICENSE)
