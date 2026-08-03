
**Promo:** 50% off one month of any paid plan with code **`SKILLS50`**.

# Fintech Finance — AI Dashboard with Malitos

Fintech Finance is a Next.js 16 dashboard featuring **Malitos**, a realtime Runway AI video character. Malitos can navigate pages, explain dashboard data, manage tickets, and respond to what's visible on screen via screen share.

Authentication is handled by **Clerk** — unauthenticated users are redirected to `/sign-in` before accessing the dashboard.

## Quick start

Requirements: Node 22.13+, Bun, a Runway API key with Characters credits, and a Clerk account.

```bash
bun install
cp .env.example .env
```

Fill in `.env` with your Runway and Clerk credentials (see [DOCUMENTATION.md](./DOCUMENTATION.md) for the full setup guide), then:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

For the complete setup guide — including Clerk account creation, Runway character setup, environment variable reference, and character description — see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

## Project structure

```text
app/
  (dashboard)/             # Protected pages: overview, revenue, tickets, settings
  sign-in/                 # Clerk sign-in page
actions/
  avatar.ts                # Runway session action and RPC handler
  demo.ts                  # Ticket server actions
components/
  agent/                   # Malitos side panel
  layout/                  # Shell, sidebar, topbar, providers, logo
  overlays/                # Info panel
  overview/ revenue/ settings/ tickets/ ui/
lib/
  avatar.ts                # Character ID, personality, start script
  demo-data.ts             # Deterministic demo fixtures
  demo-store.ts            # In-memory ticket state
  tools.ts                 # All 13 Malitos tool definitions
```

## Malitos tools

Everything Malitos can do has an equivalent manual path.

| Type | Tool | Malitos action | Manual equivalent |
|------|------|----------------|-------------------|
| Page Action | `scroll_to` | Scroll a target into view | Scroll normally |
| Page Action | `highlight` | Pulse a target | Overview Page Actions preview |
| Page Action | `click` | Click a visible target | Click the link, card, or button |
| Client | `set_date_range` | Show 7, 30, or 90 days | Range control on Revenue |
| Client | `filter_tickets` | Show All, Open, or Billing | Queue filter on Tickets |
| Client | `open_panel` | Open an information panel | Click any insight or ticket row |
| Client | `refresh_tickets` | Reload the queue | Click **Refresh** on Tickets |
| Server | `get_overview_insights` | Speak the overview brief | Click **Overview insight** |
| Server | `get_revenue` | Speak revenue totals and trends | Click **Revenue insight** |
| Server | `get_ticket_insights` | Speak queue workload | Click **Queue insight** |
| Server | `get_ticket` | Speak one ticket by ID | Click its row |
| Server | `create_ticket` | Add a ticket | Click **New ticket** and submit |
| Server | `update_ticket_status` | Close or reopen a ticket | Open a ticket, click its status |

## Scripts

```bash
bun dev          # Development server
bun build        # Production build
bun typecheck    # TypeScript check
bun lint         # ESLint
bun test         # Unit tests (no Runway credits used)
bun audit        # Dependency vulnerability check
```

## License

MIT © [Malit Mohamut](https://github.com/mawlid1431) — see [LICENSE](./LICENSE)
