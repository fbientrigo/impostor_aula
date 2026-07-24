# Frontend design system

Operational reference for making visual and structural changes without
re-deriving the design from scratch. Pairs with `README.md` (architecture,
setup, security invariant).

## Product principles

- One primary action per screen. Everything else is secondary and either
  de-emphasized or tucked into the drawer/disclosures.
- Teacher and student are visually distinct: teacher screens use multi-column
  panels and a phase indicator; student screens are single-column, large-touch,
  and privacy-first (role card requires a deliberate tap to reveal).
- Progressive disclosure over dashboards: settings and concept authoring live
  behind `<Disclosure>`, not inline in the main view.

## Navigation model

- `src/components/AppHeader.tsx` — the only app shell header. Wordmark + a
  single hamburger button that opens `<Drawer>` (`src/components/ui/drawer.tsx`).
  Drawer contents: Home, page-specific extras (e.g. "Leave room" on `/join`),
  "How to play", language toggle. The drawer never carries a screen's primary
  action.
- Page-specific drawer items are passed via `<AppHeader drawerExtras={...}>`
  using `<DrawerItem>`.
- Destructive actions (new round, leave room) go through `<ConfirmDialog>`
  (`src/components/ui/dialog.tsx`), never fire directly from a click.

## Design tokens

All colors are CSS variables defined in `src/app/globals.css` under `:root`,
mapped to Tailwind semantic names in `tailwind.config.ts`. Never use raw hex
values in components — use the Tailwind class names below.

| Token (Tailwind class root) | Purpose |
| --- | --- |
| `paper` | page background |
| `surface` | elevated surface (panels, dialogs) |
| `ink`, `ink-secondary`, `ink-muted` | text hierarchy |
| `edge`, `edge-strong` | borders (edge-strong for form controls) |
| `leaf`, `leaf-strong`, `leaf-soft`, `leaf-deep` | primary action / student identity |
| `coral`, `coral-strong`, `coral-soft`, `coral-deep` | danger / impostor identity |
| `success`, `warning`, `info` (+ `-soft`) | status colors |

To change the palette: edit the `--color-*` values in
`src/app/globals.css`; the Tailwind config never needs to change.

Typography: `font-sans` (system UI stack) for body text, `font-display`
(system serif stack — Georgia/Charter fallbacks, no font download) for
headings via `<ScreenTitle>` and screen `<h2>`s.

## Component hierarchy

```
src/components/ui/          shared primitives — no Supabase, no game logic
  button.tsx                 Button, IconButton
  surface.tsx                Panel, ScreenTitle, SectionLabel
  field.tsx                   Field, Label, TextInput, TextArea, Select,
                               ToggleRow, NumberRow
  feedback.tsx                Spinner, ErrorText, EmptyState, WaitingHint
  drawer.tsx                   Drawer, DrawerItem
  dialog.tsx                   ConfirmDialog
  disclosure.tsx               Disclosure
  stepper.tsx                  PhaseIndicator
  icons.tsx                    inline SVG icon set (no emoji, no icon library)
  index.ts                     barrel — screens import from "@/components/ui"

src/components/               app-wide composed components
  AppHeader.tsx                shell header + drawer composition
  QrCode.tsx, RoomCodeBadge.tsx, SettingsForm.tsx, AwayAlerts.tsx

src/components/teacher/       host-only screens (CreateRoomScreen,
                               TeacherLobbyScreen, TeacherRoundControlScreen,
                               TeacherVotingScreen, TeacherResultsScreen,
                               ConceptForm)
src/components/student/       participant screens (JoinRoomScreen,
                               StudentWaitingScreen, CardViewer,
                               StudentCardScreen, StudentDiscussionScreen,
                               StudentVotingScreen, StudentResultsScreen)

src/app/{host,join}/[code]/page.tsx   phase-driven controllers (data loading
                                       + composition only, no visual logic)

src/lib/presentation.ts       pure formatting helpers (phase step index,
                               room-code grouping) — unit tested, no React
```

## Responsive rules

- Mobile-first: student routes are single-column up to `lg:`; teacher routes
  use `lg:grid-cols-*` for multi-panel layouts, collapsing to one column below
  that breakpoint.
- No fixed pixel widths on containers; `max-w-*` + `mx-auto` throughout.
- Drawer is the nav pattern at every width (no separate desktop nav bar) to
  keep one navigation implementation to maintain.

## Accessibility rules

- Every icon-only control uses `IconButton` (mandatory `label` prop) or has an
  explicit `aria-label`.
- Focus is visible everywhere (`:focus-visible` in `globals.css`) and never
  suppressed.
- `Drawer` and `ConfirmDialog` share `useFocusTrap` (`src/hooks/useFocusTrap.ts`):
  focus moves in on open, Tab cycles within, Escape closes, focus returns to
  the opener on close.
- Impostor vs. student is distinguished by color **and** icon **and** text
  label (`CardViewer.tsx`) — never color alone.
- Async state changes that matter to screen readers use `aria-live` (join
  spinner, participant list, vote counts, seen-card count).
- `prefers-reduced-motion` collapses all animation durations globally in
  `globals.css`.

## Where to make common changes

- **Colors** → `src/app/globals.css` (`--color-*` variables).
- **Typography** → `tailwind.config.ts` (`fontFamily`), or per-heading in the
  component using `font-display`.
- **Drawer contents** → `src/components/AppHeader.tsx` for global items;
  pass `drawerExtras` from the page for page-specific items.
- **Host lobby layout** → `src/components/teacher/TeacherLobbyScreen.tsx`
  (projection zone vs. preparation zone split).
- **Student role card** → `src/components/student/CardViewer.tsx`.
- **Reusable copy / Spanish strings** → `src/lib/i18n.ts`.
