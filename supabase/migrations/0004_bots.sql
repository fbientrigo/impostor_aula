-- Impostor Aula — classroom bots.
--
-- Smallest safe, additive migration. Bots are ordinary `participants` rows that
-- the SERVER controls (no browser, no second Supabase client, no LLM). Two new
-- columns flag them and carry their difficulty; everything else (role, votes,
-- reset, the security model) reuses the existing schema unchanged.

-- 1) Participants gain a bot flag + a difficulty band.
--    - is_bot defaults false so every existing/human row is untouched.
--    - bot_difficulty is null for humans; constrained to the three bands for bots.
alter table participants
  add column if not exists is_bot boolean not null default false;

alter table participants
  add column if not exists bot_difficulty text
    check (bot_difficulty is null or bot_difficulty in ('easy', 'medium', 'hard'));

-- Integrity: a human never carries a difficulty; a bot always does.
-- (Kept as a table check so bad rows can't be written even by the service role.)
alter table participants
  drop constraint if exists participants_bot_difficulty_consistency;
alter table participants
  add constraint participants_bot_difficulty_consistency
    check (
      (is_bot = false and bot_difficulty is null)
      or (is_bot = true and bot_difficulty is not null)
    );

-- 2) Concept-specific, PRE-AUTHORED bot response pools (server-only).
--    Shape: { "correct": [], "plausible": [], "incorrect": [], "impostor_safe": [] }
--    A single JSONB column (not new tables) keeps this flexible and avoids
--    premature relational modelling. The `concepts` table is never exposed to
--    student clients, so these pools cannot leak private card information.
alter table concepts
  add column if not exists bot_responses jsonb not null default '{}'::jsonb;

-- Helpful when a room has many bots.
create index if not exists participants_room_bot_idx on participants (room_id, is_bot);
