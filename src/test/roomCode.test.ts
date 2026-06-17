import { describe, expect, it } from "vitest";
import { generateRoomCode, isValidRoomCode, ROOM_CODE_LENGTH } from "@/lib/roomCode";

describe("generateRoomCode", () => {
  it("produces a numeric code of the default length", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(ROOM_CODE_LENGTH);
    expect(/^[0-9]+$/.test(code)).toBe(true);
  });

  it("respects a custom length", () => {
    expect(generateRoomCode(Math.random, 4)).toHaveLength(4);
  });

  it("is deterministic with an injected RNG", () => {
    // rng returns 0.05, 0.15, 0.25, ... -> floor(*10) -> 0,1,2,3,4
    let n = 0;
    const rng = () => (n++ * 10 + 5) / 100;
    expect(generateRoomCode(rng, 5)).toBe("01234");
  });

  it("allows leading zeros", () => {
    const code = generateRoomCode(() => 0, 5);
    expect(code).toBe("00000");
  });

  it("rejects an invalid length", () => {
    expect(() => generateRoomCode(Math.random, 0)).toThrow();
  });
});

describe("isValidRoomCode", () => {
  it("accepts a well-formed code", () => {
    expect(isValidRoomCode("04821")).toBe(true);
  });
  it("rejects wrong length or non-digits", () => {
    expect(isValidRoomCode("1234")).toBe(false);
    expect(isValidRoomCode("12a45")).toBe(false);
    expect(isValidRoomCode("123456")).toBe(false);
  });
});
