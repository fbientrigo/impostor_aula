// Pure, deterministic bot logic. No LLM, no network, no privileged cheating.
//
// Bots exist so a teacher/developer can fill a classroom and exercise the whole
// game loop at different accuracy levels without extra humans. "Difficulty" is
// PROBABILITY, not intelligence: an Easy bot simply guesses right less often.
//
// Everything here is a pure function driven by an injected RNG (src/lib/rng.ts),
// so the server is reproducible per round and tests need no mocks.

import type { Rng } from "./roomCode";
import { pickResponse, resolveResponsePool, type ResponsePool } from "./botResponses";

export type BotDifficulty = "easy" | "medium" | "hard";

export const BOT_DIFFICULTIES: BotDifficulty[] = ["easy", "medium", "hard"];

/**
 * Probability that a NON-impostor bot behaves "correctly" (votes for an actual
 * impostor). Tune these three numbers to retune the whole bot system.
 */
export const BOT_ACCURACY: Record<BotDifficulty, number> = {
  easy: 0.25,
  medium: 0.5,
  hard: 0.9,
};

export function isBotDifficulty(value: unknown): value is BotDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

/** Server-side (Spanish) display names for bots; app default language is es. */
const BOT_BASE_NAME: Record<BotDifficulty, string> = {
  easy: "Bot Fácil",
  medium: "Bot Medio",
  hard: "Bot Difícil",
};

/**
 * A room-unique bot display name. Reuses the base name ("Bot Fácil") and only
 * appends a counter when needed ("Bot Fácil 2"), matching the case-insensitive
 * uniqueness rule enforced on participant names.
 */
export function botDisplayName(difficulty: BotDifficulty, existingNames: string[]): string {
  const base = BOT_BASE_NAME[difficulty];
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base} ${n}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

/** Minimal participant view the bot logic needs. Never includes card content. */
export interface VoteParticipant {
  id: string;
  isImpostor: boolean;
}

export interface BotVoter extends VoteParticipant {
  difficulty: BotDifficulty;
}

export interface BotDecision {
  targetId: string;
  /** True when the bot ended up voting for an actual impostor. */
  correct: boolean;
}

/**
 * Decide who a single bot votes for. Consumes exactly two RNG draws for a
 * non-impostor (accuracy roll + target pick) and one for an impostor (target
 * pick), keeping sequences reproducible.
 *
 * Rules:
 * - A bot never votes for itself and only ever targets a real participant.
 * - Non-impostor bot: with probability BOT_ACCURACY[difficulty] it picks an
 *   actual impostor; otherwise it picks among the valid NON-impostor
 *   participants (an honest wrong guess).
 * - Impostor bot: picks a plausible target uniformly among the other
 *   participants. It does NOT read who the other impostors are — no privileged
 *   information a human impostor wouldn't have.
 */
export function decideBotVote(voter: BotVoter, participants: VoteParticipant[], rng: Rng): BotDecision | null {
  const candidates = participants.filter((p) => p.id !== voter.id);
  if (candidates.length === 0) return null;

  if (voter.isImpostor) {
    // No cheating: uniform over everyone else, ignoring hidden roles.
    const pick = candidates[Math.floor(rng() * candidates.length)];
    return { targetId: pick.id, correct: pick.isImpostor };
  }

  const impostors = candidates.filter((p) => p.isImpostor);
  const others = candidates.filter((p) => !p.isImpostor);

  const roll = rng();
  const wantCorrect = roll < BOT_ACCURACY[voter.difficulty] && impostors.length > 0;
  const pool = wantCorrect ? impostors : others.length > 0 ? others : impostors;

  const pick = pool[Math.floor(rng() * pool.length)];
  return { targetId: pick.id, correct: pick.isImpostor };
}

/** Convenience wrapper: just the target id (or null when no valid target). */
export function chooseBotVoteTarget(voter: BotVoter, participants: VoteParticipant[], rng: Rng): string | null {
  return decideBotVote(voter, participants, rng)?.targetId ?? null;
}

export interface BotRosterEntry extends VoteParticipant {
  isBot: boolean;
  difficulty?: BotDifficulty | null;
}

export interface BotVote {
  voterId: string;
  targetId: string;
  justification?: string;
}

export interface RunBotVotesOptions {
  rng: Rng;
  /** When true, attach a pre-authored justification to each bot vote. */
  requireJustification?: boolean;
  /** Concept-specific response pools; generic fallbacks fill any gaps. */
  responses?: ResponsePool | null;
}

/**
 * Compute the votes for every bot in a room, deterministically. Bots are
 * processed in a stable order (by id) so the RNG sequence is reproducible.
 * Each bot produces exactly one vote (mirrors the one-vote-per-voter DB
 * constraint). Non-bots and difficulty-less rows are ignored.
 *
 * Impostor bots only ever draw an `impostor_safe` justification, so their
 * response can never reveal card information.
 */
export function runBotVotes(roster: BotRosterEntry[], opts: RunBotVotesOptions): BotVote[] {
  const pool = resolveResponsePool(opts.responses);
  const participants: VoteParticipant[] = roster.map((r) => ({ id: r.id, isImpostor: r.isImpostor }));

  const bots = roster
    .filter((r) => r.isBot && isBotDifficulty(r.difficulty))
    .sort((a, b) => a.id.localeCompare(b.id));

  const votes: BotVote[] = [];
  for (const bot of bots) {
    const decision = decideBotVote(
      { id: bot.id, isImpostor: bot.isImpostor, difficulty: bot.difficulty as BotDifficulty },
      participants,
      opts.rng,
    );
    if (!decision) continue;

    let justification: string | undefined;
    if (opts.requireJustification) {
      const kind = bot.isImpostor ? "impostor_safe" : decision.correct ? "correct" : "incorrect";
      justification = pickResponse(pool, kind, opts.rng);
    }

    votes.push({ voterId: bot.id, targetId: decision.targetId, justification });
  }
  return votes;
}
