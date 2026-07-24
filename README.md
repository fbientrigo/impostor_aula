# Impostor Aula

A lightweight, browser-based classroom activity for health / medical-technology
classes. The teacher creates a room, projects a QR code, students join from their
phones (no accounts, no email), receive **private role cards**, discuss in person,
vote, and the teacher reveals the result and explains the concept.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase
  (Postgres + Realtime) · Vitest
- **Bilingual UI:** Spanish by default, English via the toggle (top-right).

## Core security invariant

> An impostor's client **never** receives the exact concept title.

This is enforced server-side. All data access goes through Next.js API routes
using the Supabase **service-role** key; Row Level Security is enabled on every
table with **no policies** (deny-by-default), so browsers can't read tables
directly. The per-player card is built in `src/lib/cards.ts` and returned by
`GET /api/rooms/[code]/card` — the impostor branch is constructed without the
`title` field. The browser's anon key is used **only** to subscribe to Realtime
*broadcast* channels (pings to re-fetch), so nothing sensitive ever flows over it.

Identity without accounts: room creation returns a **host token** and joining
returns a **participant secret**, both stored in `localStorage` and sent as
headers to authorize host/participant actions.

> Note: this is a *soft* classroom tool, not an exam-locking system. It hides the
> card on tab-switch/blur and counts away/reload events for the teacher's
> dashboard — it does not prevent a determined student from cheating in person.

## Setup (local development)

Development runs against a **local Supabase stack in Docker** — it never talks
to a hosted project. Requires [Docker](https://www.docker.com/) running.

1. **Install dependencies** (includes the project-pinned Supabase CLI)

   ```bash
   npm install
   ```

2. **Start the local Supabase stack**

   ```bash
   npm run db:start
   ```

   First run pulls Docker images and can take a few minutes. This starts
   Postgres, the API (`http://127.0.0.1:54321`), Realtime, and Studio
   (`http://127.0.0.1:54323`), all bound to loopback only.

3. **Apply migrations to the local database**

   ```bash
   npm run db:reset
   ```

   Applies `supabase/migrations/*.sql` from scratch, including RLS setup and
   the seeded Spanish health/med-tech concept pack.

4. **Configure `.env.local`**

   ```bash
   cp .env.local.example .env.local
   npx supabase status -o env
   ```

   Copy the printed local `API URL`, `ANON_KEY`, and `SERVICE_ROLE_KEY` into
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` respectively. `.env.local` is git-ignored and
   never committed. Also set `HEALTHCHECK_SECRET` and `CRON_SECRET` to any
   local placeholder values.

   In development, the app refuses to start against a hosted `*.supabase.co`
   URL — if you see that error, the local stack isn't running or `.env.local`
   still points at a hosted project.

5. **Start the app**

   ```bash
   npm run dev
   ```

6. **Stop the stack when done**

   ```bash
   npm run db:stop
   ```

Local and production Supabase are deliberately separate: production is
configured entirely through Vercel environment variables and is never read
from repository files. The local stack is loopback-only and not exposed to
the LAN — a phone opening the app over your PC's LAN/Tailscale address can
reach Next.js but not `127.0.0.1:54321` directly, so on-device testing relies
on the app's polling fallback rather than local Realtime.

## Scripts

| Command              | Description                                    |
| --------------------- | ----------------------------------------------- |
| `npm run dev`        | Start the dev server                            |
| `npm run build`      | Production build                                |
| `npm test`           | Run the Vitest suite                            |
| `npm run typecheck`  | `tsc --noEmit`                                  |
| `npm run lint`       | `next lint`                                     |
| `npm run db:start`   | Start the local Supabase stack (Docker)         |
| `npm run db:stop`    | Stop the local Supabase stack                   |
| `npm run db:status`  | Show local stack URLs/keys                      |
| `npm run db:reset`   | Reset the **local** database to current migrations |
| `npm run db:types`   | Generate TypeScript types from the local schema |

## How a round works

`lobby → card_reveal → discussion → voting → results`

1. Teacher creates a room → QR + 5-digit code.
2. Students scan/enter the code and join with a name or group name.
3. Teacher picks a concept, configures settings, and starts the round.
4. Roles are assigned randomly server-side. Normal students see the concept;
   impostors see only "You are the impostor" plus (optionally) category/hint.
5. Teacher advances phases; students vote (with justification if required).
6. Teacher reveals results: impostor(s), vote counts, concept, explanation, and
   teacher notes.

## Architecture map

- `src/lib/*.ts` — pure, framework-free logic (room codes, role assignment, card
  payload, phase rules, vote tally, name validation, card auto-hide). Fully unit
  tested in `src/test/`.
- `src/app/api/**` — server route handlers (service-role; the only place secrets
  are read).
- `src/app/{host,join}/[code]/page.tsx` — phase-driven controllers.
- `src/components/{teacher,student}/**` — the screens.
- `src/components/ui/**` — shared design-system primitives (buttons, panels,
  drawer, dialogs, form fields). No Supabase or game logic — see
  `docs/frontend-design-system.md`.
- `src/hooks/**` — realtime channel, card visibility, away tracking, focus trap.

Frontend design system, tokens, and "where to change X" map:
`docs/frontend-design-system.md`.

## Verifying the security invariant

With a round started, open DevTools → Network on an **impostor's** device and
inspect the `GET /api/rooms/<code>/card` response: it contains `role:"impostor"`
and (optionally) `category`/`hint`, but **no `title`**. A normal student's
response does include `title`. The same property is asserted in
`src/test/cards.test.ts` across every settings combination.

## Tests

```bash
npm test
```

Covers room-code generation, role assignment, invalid impostor counts, duplicate
display names, phase transitions, all card-payload variants (including
"impostor never receives the title"), vote counting, vote-justification
enforcement, and the card auto-hide reducer.

## Healthchecks

The deployed app has two server-side healthcheck paths:

- `GET /api/healthcheck` verifies Vercel and Supabase, requires
  `Authorization: Bearer $HEALTHCHECK_SECRET`, writes to
  `public.app_healthcheck`, and returns
  `{"ok":true,"service":"vercel+supabase","checked_at":"..."}`
- `GET /api/cron/healthcheck` is called by Vercel Cron twice weekly, writes the
  same row, and returns `{"ok":true,"source":"vercel-cron","checked_at":"..."}`
  Vercel automatically sends `CRON_SECRET` as an `Authorization: Bearer ...`
  token to cron endpoints.

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HEALTHCHECK_SECRET`
- `CRON_SECRET`

Required GitHub repository secrets:

- `HEALTHCHECK_URL` — deployed endpoint URL, for example
  `https://your-app.vercel.app/api/healthcheck`
- `HEALTHCHECK_SECRET` — same value as the Vercel env var

Manual success test:

```bash
curl --fail --show-error --silent \
  --header "Authorization: Bearer $HEALTHCHECK_SECRET" \
  "$HEALTHCHECK_URL"
```

Expected success output:

```json
{"ok":true,"service":"vercel+supabase","checked_at":"2026-06-17T12:00:00.000Z"}
```

Manual auth failure test:

```bash
curl --include --show-error --silent "$HEALTHCHECK_URL"
```

Expected failure output:

```http
HTTP/2 401
{"error":"unauthorized"}
```

If Supabase is unavailable or misconfigured, the endpoint returns HTTP 500 with
a JSON error body, and the GitHub Actions workflow fails.
