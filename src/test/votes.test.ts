import { describe, expect, it } from "vitest";
import { countVotes, tallyResults, validateVote } from "@/lib/votes";
import type { Participant } from "@/lib/types";

function vote(voter: string, target: string) {
  return { voterParticipantId: voter, targetParticipantId: target };
}

describe("validateVote", () => {
  it("accepts a valid vote when justification is not required", () => {
    expect(validateVote(vote("a", "b"), { requireVoteJustification: false })).toEqual({ ok: true });
  });

  it("rejects voting for yourself", () => {
    expect(validateVote(vote("a", "a"), { requireVoteJustification: false })).toEqual({
      ok: false,
      error: "self_vote",
    });
  });

  it("requires a justification when the setting is on", () => {
    expect(validateVote(vote("a", "b"), { requireVoteJustification: true })).toEqual({
      ok: false,
      error: "justification_required",
    });
    expect(validateVote({ ...vote("a", "b"), justification: "   " }, { requireVoteJustification: true }).ok).toBe(false);
    expect(
      validateVote({ ...vote("a", "b"), justification: "miente mucho" }, { requireVoteJustification: true }),
    ).toEqual({ ok: true });
  });
});

describe("countVotes", () => {
  it("tallies votes per target", () => {
    const votes = [vote("a", "x"), vote("b", "x"), vote("c", "y")];
    expect(countVotes(votes)).toEqual({ x: 2, y: 1 });
  });

  it("returns an empty object for no votes", () => {
    expect(countVotes([])).toEqual({});
  });
});

describe("tallyResults", () => {
  const participants: Participant[] = [
    { id: "x", roomId: "r", displayName: "Ana", role: "impostor", hasSeenCard: true, awayCount: 0, reloadedCount: 0, joinedAt: "" },
    { id: "y", roomId: "r", displayName: "Beto", role: "student", hasSeenCard: true, awayCount: 0, reloadedCount: 0, joinedAt: "" },
    { id: "z", roomId: "r", displayName: "Caro", role: "student", hasSeenCard: true, awayCount: 0, reloadedCount: 0, joinedAt: "" },
  ];

  it("sorts by votes desc and flags a caught impostor", () => {
    const votes = [vote("y", "x"), vote("z", "x"), vote("x", "y")];
    const result = tallyResults(votes, participants);
    expect(result.rows[0]).toMatchObject({ participantId: "x", votes: 2 });
    expect(result.topTargetIds).toEqual(["x"]);
    expect(result.impostorCaught).toBe(true);
  });

  it("reports impostor not caught when a student leads", () => {
    const votes = [vote("x", "y"), vote("z", "y")];
    const result = tallyResults(votes, participants);
    expect(result.topTargetIds).toEqual(["y"]);
    expect(result.impostorCaught).toBe(false);
  });

  it("handles no votes", () => {
    const result = tallyResults([], participants);
    expect(result.topTargetIds).toEqual([]);
    expect(result.impostorCaught).toBe(false);
    expect(result.rows.every((r) => r.votes === 0)).toBe(true);
  });
});
