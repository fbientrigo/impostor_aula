// Vote validation, counting, and result tallying. All pure.

import type { Participant, RoomSettings, Vote } from "./types";

export interface Validation {
  ok: boolean;
  error?: string;
}

export interface VoteInput {
  voterParticipantId: string;
  targetParticipantId: string;
  justification?: string;
}

/**
 * Validate a single vote against room settings.
 * - A participant may not vote for themselves.
 * - When `requireVoteJustification` is on, a non-empty justification is required.
 * (Duplicate votes are handled at the data layer as an upsert: one vote per voter.)
 */
export function validateVote(vote: VoteInput, settings: Pick<RoomSettings, "requireVoteJustification">): Validation {
  if (!vote.voterParticipantId || !vote.targetParticipantId) {
    return { ok: false, error: "missing_participant" };
  }
  if (vote.voterParticipantId === vote.targetParticipantId) {
    return { ok: false, error: "self_vote" };
  }
  if (settings.requireVoteJustification && !vote.justification?.trim()) {
    return { ok: false, error: "justification_required" };
  }
  return { ok: true };
}

/** Count votes per target participant id. */
export function countVotes(votes: Pick<Vote, "targetParticipantId">[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of votes) {
    counts[v.targetParticipantId] = (counts[v.targetParticipantId] ?? 0) + 1;
  }
  return counts;
}

export interface TallyRow {
  participantId: string;
  displayName: string;
  role: Participant["role"];
  votes: number;
}

export interface TallyResult {
  rows: TallyRow[];
  /** Most-voted participant id(s). Empty when there are no votes. */
  topTargetIds: string[];
  /** True when at least one most-voted participant is actually an impostor. */
  impostorCaught: boolean;
}

/**
 * Produce a sorted result table (votes desc, then name) plus whether the class
 * "caught" an impostor (a most-voted participant is an impostor).
 */
export function tallyResults(votes: Pick<Vote, "targetParticipantId">[], participants: Participant[]): TallyResult {
  const counts = countVotes(votes);

  const rows: TallyRow[] = participants
    .map((p) => ({
      participantId: p.id,
      displayName: p.displayName,
      role: p.role,
      votes: counts[p.id] ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes || a.displayName.localeCompare(b.displayName));

  const maxVotes = rows.reduce((m, r) => Math.max(m, r.votes), 0);
  const topTargetIds = maxVotes > 0 ? rows.filter((r) => r.votes === maxVotes).map((r) => r.participantId) : [];
  const impostorCaught = rows.some((r) => r.votes === maxVotes && maxVotes > 0 && r.role === "impostor");

  return { rows, topTargetIds, impostorCaught };
}
