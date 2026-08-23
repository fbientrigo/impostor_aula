import { describe, expect, it } from "vitest";
import {
  BOT_ACCURACY,
  BOT_DIFFICULTIES,
  botDisplayName,
  chooseBotVoteTarget,
  decideBotVote,
  isBotDifficulty,
  runBotVotes,
  type BotRosterEntry,
  type VoteParticipant,
} from "@/lib/bots";
import { DEFAULT_BOT_RESPONSES, pickResponse, resolveResponsePool } from "@/lib/botResponses";
import { makeRng } from "@/lib/rng";
import { assignRoles } from "@/lib/roles";
import { buildCardPayload } from "@/lib/cards";

/** Stub RNG that yields the given values in order (cycling). */
function seq(...vals: number[]) {
  let i = 0;
  return () => vals[i++ % vals.length];
}

const P: VoteParticipant[] = [
  { id: "v", isImpostor: false },
  { id: "imp", isImpostor: true },
  { id: "y", isImpostor: false },
  { id: "z", isImpostor: false },
];

describe("difficulty constants", () => {
  it("exposes the tunable accuracy baseline", () => {
    expect(BOT_ACCURACY).toEqual({ easy: 0.25, medium: 0.5, hard: 0.9 });
    expect(BOT_DIFFICULTIES).toEqual(["easy", "medium", "hard"]);
  });

  it("validates difficulty strings", () => {
    expect(isBotDifficulty("easy")).toBe(true);
    expect(isBotDifficulty("hard")).toBe(true);
    expect(isBotDifficulty("impossible")).toBe(false);
    expect(isBotDifficulty(undefined)).toBe(false);
  });
});

describe("decideBotVote — non-impostor bot", () => {
  it("votes for an actual impostor when the accuracy roll succeeds", () => {
    const d = decideBotVote({ id: "v", isImpostor: false, difficulty: "easy" }, P, seq(0, 0));
    expect(d).toEqual({ targetId: "imp", correct: true });
  });

  it("makes an honest wrong guess (a non-impostor) when the roll fails", () => {
    const d = decideBotVote({ id: "v", isImpostor: false, difficulty: "easy" }, P, seq(0.9, 0));
    expect(d?.correct).toBe(false);
    expect(["y", "z"]).toContain(d?.targetId);
    expect(d?.targetId).not.toBe("imp");
  });

  it("never targets itself", () => {
    for (let i = 0; i < 50; i++) {
      const d = decideBotVote({ id: "v", isImpostor: false, difficulty: "medium" }, P, makeRng(`s${i}`));
      expect(d?.targetId).not.toBe("v");
    }
  });

  it("higher difficulty catches the impostor more often over many rounds", () => {
    const rate = (difficulty: "easy" | "hard") => {
      let hits = 0;
      const N = 400;
      for (let i = 0; i < N; i++) {
        const d = decideBotVote({ id: "v", isImpostor: false, difficulty }, P, makeRng(`acc-${difficulty}-${i}`));
        if (d?.correct) hits++;
      }
      return hits / N;
    };
    expect(rate("hard")).toBeGreaterThan(rate("easy"));
  });
});

describe("decideBotVote — impostor bot", () => {
  it("picks a plausible target and never itself, using one draw", () => {
    const voter = { id: "v", isImpostor: true, difficulty: "hard" as const };
    const d = decideBotVote(voter, P, seq(0));
    expect(d?.targetId).toBe("imp"); // candidates[0] after excluding self
    expect(d?.targetId).not.toBe("v");
  });

  it("only ever targets a valid participant (never invalid/self)", () => {
    const ids = new Set(P.map((p) => p.id));
    for (let i = 0; i < 50; i++) {
      const target = chooseBotVoteTarget({ id: "v", isImpostor: true, difficulty: "easy" }, P, makeRng(`imp${i}`));
      expect(target).not.toBeNull();
      expect(ids.has(target!)).toBe(true);
      expect(target).not.toBe("v");
    }
  });
});

describe("chooseBotVoteTarget — edge cases", () => {
  it("returns null when there is no one else to vote for", () => {
    const only: VoteParticipant[] = [{ id: "v", isImpostor: false }];
    expect(chooseBotVoteTarget({ id: "v", isImpostor: false, difficulty: "hard" }, only, seq(0))).toBeNull();
  });
});

describe("runBotVotes — one deterministic vote per bot", () => {
  const roster: BotRosterEntry[] = [
    { id: "h1", isImpostor: false, isBot: false },
    { id: "imp", isImpostor: true, isBot: false },
    { id: "b_easy", isImpostor: false, isBot: true, difficulty: "easy" },
    { id: "b_hard", isImpostor: false, isBot: true, difficulty: "hard" },
  ];

  it("produces exactly one vote per bot and none for humans", () => {
    const votes = runBotVotes(roster, { rng: makeRng("room:voting") });
    expect(votes).toHaveLength(2);
    const voters = votes.map((v) => v.voterId).sort();
    expect(voters).toEqual(["b_easy", "b_hard"]);
    // Each bot votes at most once.
    expect(new Set(voters).size).toBe(voters.length);
  });

  it("only targets valid participants and never itself", () => {
    const ids = new Set(roster.map((r) => r.id));
    const votes = runBotVotes(roster, { rng: makeRng("room:voting") });
    for (const v of votes) {
      expect(ids.has(v.targetId)).toBe(true);
      expect(v.targetId).not.toBe(v.voterId);
    }
  });

  it("is deterministic for a fixed seed", () => {
    const a = runBotVotes(roster, { rng: makeRng("same-seed") });
    const b = runBotVotes(roster, { rng: makeRng("same-seed") });
    expect(a).toEqual(b);
  });

  it("returns nothing when the room has no bots", () => {
    const humansOnly: BotRosterEntry[] = [
      { id: "h1", isImpostor: false, isBot: false },
      { id: "h2", isImpostor: true, isBot: false },
    ];
    expect(runBotVotes(humansOnly, { rng: makeRng("x") })).toEqual([]);
  });
});

describe("runBotVotes — pre-authored justifications", () => {
  it("an impostor bot only ever uses an impostor_safe response", () => {
    const roster: BotRosterEntry[] = [
      { id: "h1", isImpostor: false, isBot: false },
      { id: "h2", isImpostor: false, isBot: false },
      { id: "b_imp", isImpostor: true, isBot: true, difficulty: "medium" },
    ];
    // Try many seeds; the impostor bot's justification must always be safe.
    for (let i = 0; i < 30; i++) {
      const votes = runBotVotes(roster, { rng: makeRng(`seed-${i}`), requireJustification: true });
      const impVote = votes.find((v) => v.voterId === "b_imp");
      expect(impVote?.justification).toBeTruthy();
      expect(DEFAULT_BOT_RESPONSES.impostor_safe).toContain(impVote!.justification);
    }
  });

  it("attaches no justification when the setting is off", () => {
    const roster: BotRosterEntry[] = [
      { id: "a", isImpostor: true, isBot: false },
      { id: "b", isImpostor: false, isBot: true, difficulty: "easy" },
    ];
    const [vote] = runBotVotes(roster, { rng: makeRng("q") });
    expect(vote.justification).toBeUndefined();
  });
});

describe("botDisplayName", () => {
  it("uses the plain base name when free", () => {
    expect(botDisplayName("easy", [])).toBe("Bot Fácil");
    expect(botDisplayName("medium", [])).toBe("Bot Medio");
    expect(botDisplayName("hard", [])).toBe("Bot Difícil");
  });

  it("disambiguates against existing names (case-insensitive)", () => {
    expect(botDisplayName("easy", ["Bot Fácil"])).toBe("Bot Fácil 2");
    expect(botDisplayName("easy", ["bot fácil", "BOT FÁCIL 2"])).toBe("Bot Fácil 3");
  });
});

describe("role assignment includes bots", () => {
  it("assigns roles to bots too, and a bot can become the impostor", () => {
    const ids = ["h1", "h2", "b1", "b2"];
    const roles = assignRoles(ids, 2, () => 0);
    // Every id (human and bot) receives a role.
    expect(Object.keys(roles).sort()).toEqual([...ids].sort());
    // With this deterministic RNG a bot ends up impostor.
    expect(roles["b1"]).toBe("impostor");
    expect(Object.values(roles).filter((r) => r === "impostor")).toHaveLength(2);
  });
});

describe("security — impostor bot never receives the concept title", () => {
  it("holds for the bot's would-be card payload across settings", () => {
    const concept = { title: "Resonancia magnética", category: "Imagenología", impostorHint: "sin rayos X" };
    for (const showCategoryToImpostor of [true, false]) {
      for (const showHintToImpostor of [true, false]) {
        const payload = buildCardPayload({
          role: "impostor",
          concept,
          settings: { showCategoryToImpostor, showHintToImpostor },
        });
        expect("title" in payload).toBe(false);
        expect(JSON.stringify(payload)).not.toContain(concept.title);
      }
    }
  });

  it("generic impostor_safe responses do not embed a concept title", () => {
    const title = "Resonancia magnética";
    for (const line of DEFAULT_BOT_RESPONSES.impostor_safe) {
      expect(line).not.toContain(title);
    }
  });
});

describe("response pools", () => {
  it("fills every kind from defaults when none authored", () => {
    const pool = resolveResponsePool(null);
    expect(pool.correct).toEqual(DEFAULT_BOT_RESPONSES.correct);
    expect(pool.impostor_safe).toEqual(DEFAULT_BOT_RESPONSES.impostor_safe);
  });

  it("lets an authored kind override, keeping defaults for the rest", () => {
    const pool = resolveResponsePool({ correct: ["Se le notó dudar."] });
    expect(pool.correct).toEqual(["Se le notó dudar."]);
    expect(pool.incorrect).toEqual(DEFAULT_BOT_RESPONSES.incorrect);
  });

  it("ignores blank authored entries and falls back", () => {
    const pool = resolveResponsePool({ correct: ["   ", ""] });
    expect(pool.correct).toEqual(DEFAULT_BOT_RESPONSES.correct);
  });

  it("pickResponse is deterministic for a fixed rng", () => {
    const pool = resolveResponsePool(null);
    expect(pickResponse(pool, "correct", seq(0))).toBe(pool.correct[0]);
    expect(pickResponse(pool, "correct", seq(0.999))).toBe(pool.correct[pool.correct.length - 1]);
  });
});

describe("full-round simulation with bots", () => {
  it("assigns roles, then every bot votes once for a valid target, deterministically", () => {
    const ids = ["h1", "h2", "b1", "b2", "b3"];
    const roles = assignRoles(ids, 1, makeRng("round-seed"));
    const roster: BotRosterEntry[] = ids.map((id) => ({
      id,
      isImpostor: roles[id] === "impostor",
      isBot: id.startsWith("b"),
      difficulty: id.startsWith("b") ? "medium" : undefined,
    }));

    const votes = runBotVotes(roster, { rng: makeRng("round-seed:voting") });
    expect(votes).toHaveLength(3); // b1, b2, b3

    const idSet = new Set(ids);
    for (const v of votes) {
      expect(idSet.has(v.targetId)).toBe(true);
      expect(v.targetId).not.toBe(v.voterId);
    }

    const again = runBotVotes(roster, { rng: makeRng("round-seed:voting") });
    expect(again).toEqual(votes);
  });
});
