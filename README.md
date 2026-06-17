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

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**, then copy the env template and fill it in from
   *Project Settings → API*:

   ```bash
   cp .env.local.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key (Realtime only)
   - `SUPABASE_SERVICE_ROLE_KEY` — service-role secret (server-only)
   - `NEXT_PUBLIC_BASE_URL` — optional; the base used for QR join links
     (defaults to the browser origin)

3. **Run the database migration.** Open the Supabase SQL editor and run
   `supabase/migrations/0001_init.sql`. It creates the tables, enables RLS, and
   seeds a Spanish health/med-tech concept pack.

4. **Start the app**

   ```bash
   npm run dev
   ```

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build                     |
| `npm test`          | Run the Vitest suite                 |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm run lint`      | `next lint`                          |

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
- `src/hooks/**` — realtime channel, card visibility, away tracking.

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
