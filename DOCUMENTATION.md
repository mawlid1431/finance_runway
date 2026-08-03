# Fintech Finance — Complete Setup Documentation

> **Promo:** 50% off one month of any paid plan with code **`SKILLS50`**.

This guide walks you through everything needed to clone this repo, configure all third-party services, and run the project locally.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Clerk Authentication Setup](#3-clerk-authentication-setup)
4. [Runway Character Setup](#4-runway-character-setup)
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

## 4. Runway Character Setup

Runway powers the AI video avatar (Malitos) that can navigate the dashboard, explain data, and manage tickets.

### 4.1 Create a Runway account

Go to [https://runwayml.com](https://runwayml.com) and sign up.

For Characters (avatar API) access, visit the developer console:
- **Dev console:** [https://dev.runwayml.com](https://dev.runwayml.com)
- **API reference:** [https://docs.dev.runwayml.com](https://docs.dev.runwayml.com)
- **Characters docs:** [https://docs.dev.runwayml.com/characters/overview/](https://docs.dev.runwayml.com/characters/overview/)

### 4.2 Get your API key

1. Log in to [https://dev.runwayml.com](https://dev.runwayml.com)
2. Go to **API Keys** → **Create API key**
3. Copy the key — it starts with `key_`

This becomes your `RUNWAYML_API_SECRET` in `.env`.

### 4.3 Create your Character (Malitos)

1. In the dev console, navigate to **Characters**
2. Click **Create character**
3. Set the character name to **Malitos**
4. Upload a profile image if desired
5. After creation, copy the **Character ID** (a UUID like `4a9864c9-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

This becomes your `NEXT_PUBLIC_RUNWAY_CHARACTER_ID` in `.env`.

### 4.4 Character description (recommended)

When setting up Malitos, use this description in the Runway console:

```
Malitos is an AI Software Engineer, Product Architect, and Technology Consultant.
Malitos helps founders, startups, and developers build modern, scalable digital
products. Knowledgeable in AI, web development, mobile apps, SaaS platforms,
fintech, CRM systems, cloud technologies, APIs, automation, and software
architecture. Responses are clear, professional, practical, and easy to understand.
Always focused on solving real business problems, creating scalable software,
improving user experience, and delivering long-term value.
```

**Start script** (what Malitos says when a call begins):

```
Hello, I'm Malitos, your AI Software Engineer and Technology Consultant.
I can help you with software development, AI solutions, web and mobile applications,
SaaS platforms, system architecture, APIs, cloud deployment, debugging, and product
strategy. Whether you're starting a new project, improving an existing system, or
solving a technical challenge, I'll provide practical guidance and reliable solutions.
Tell me about your project or idea, and we'll build the best solution together.
```

---

## 5. Environment Variables

Create a `.env` file at the project root with the following values:

```env
# ── Runway ────────────────────────────────────────────────────────────
RUNWAYML_API_SECRET=key_your_runway_api_key_here
NEXT_PUBLIC_RUNWAY_CHARACTER_ID=your-character-uuid-here

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

Open [http://localhost:3000](http://localhost:3000).

Unauthenticated visitors are automatically redirected to `/sign-in`. After signing in with Clerk, they land on the dashboard.

### Check for vulnerabilities

```bash
bun audit
```

The project is configured with `overrides` in `package.json` to keep all transitive dependencies at 0 known vulnerabilities.

---

## 7. Project Structure

```text
app/
  (dashboard)/          # Protected dashboard pages (overview, revenue, tickets, settings)
  sign-in/              # Clerk sign-in page
  globals.css           # CSS variables, brand colors, global styles
  icon.svg              # Favicon (auto-registered by Next.js)
  layout.tsx            # Root layout with ClerkProvider + ThemeProvider

actions/
  avatar.ts             # Runway session creation and RPC handler
  demo.ts               # Ticket CRUD server actions

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

Malitos is a Runway video character that lives in a collapsible side panel. During a call, Malitos can:

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
