// Typed browser -> API helpers. Each function attaches the right auth headers and
// throws an Error(code) on failure so callers can map the code to a message.

import type { CardPayload, Concept, Role, Room, RoomSettings, RoomStatus } from "./types";

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `http_${res.status}`);
  }
  return data as T;
}

const hostHeaders = (token: string) => ({ "x-host-token": token });
const partHeaders = (participantId: string, secret: string) => ({
  "x-participant-id": participantId,
  "x-participant-secret": secret,
});
const jsonHeaders = { "Content-Type": "application/json" };

// ---- public room state ----------------------------------------------------

export interface PublicRoom {
  code: string;
  status: RoomStatus;
  settings: RoomSettings;
  createdAt: string;
  conceptId?: string | null;
}

export function createRoom(settings?: Partial<RoomSettings>) {
  return call<{ code: string; hostToken: string; room: Room }>("/api/rooms", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ settings }),
  });
}

export function getRoom(code: string, hostToken?: string) {
  return call<{ room: PublicRoom; concept?: Concept | null }>(`/api/rooms/${code}`, {
    headers: hostToken ? hostHeaders(hostToken) : undefined,
    cache: "no-store",
  });
}

// ---- participants ---------------------------------------------------------

export interface RosterEntry {
  id: string;
  displayName: string;
  hasSeenCard: boolean;
  awayCount: number;
  reloadedCount: number;
  joinedAt: string;
  role?: Role;
}

export function getParticipants(code: string) {
  return call<{ participants: RosterEntry[] }>(`/api/rooms/${code}/participants`, { cache: "no-store" });
}

export function joinRoom(code: string, displayName: string) {
  return call<{ participantId: string; secret: string }>(`/api/rooms/${code}/join`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ displayName }),
  });
}

// ---- concepts (host only) -------------------------------------------------

export function getConcepts(code: string, hostToken: string) {
  return call<{ concepts: Concept[] }>(`/api/concepts?roomCode=${code}`, {
    headers: hostHeaders(hostToken),
    cache: "no-store",
  });
}

export function createConcept(code: string, hostToken: string, concept: Omit<Concept, "id">) {
  return call<{ concept: Concept }>(`/api/concepts?roomCode=${code}`, {
    method: "POST",
    headers: { ...jsonHeaders, ...hostHeaders(hostToken) },
    body: JSON.stringify(concept),
  });
}

// ---- host round control ---------------------------------------------------

export function startRound(code: string, hostToken: string, conceptId: string, settings: RoomSettings) {
  return call<{ status: RoomStatus }>(`/api/rooms/${code}/start`, {
    method: "POST",
    headers: { ...jsonHeaders, ...hostHeaders(hostToken) },
    body: JSON.stringify({ conceptId, settings }),
  });
}

export function setPhase(code: string, hostToken: string, to: RoomStatus) {
  return call<{ status: RoomStatus }>(`/api/rooms/${code}/phase`, {
    method: "POST",
    headers: { ...jsonHeaders, ...hostHeaders(hostToken) },
    body: JSON.stringify({ to }),
  });
}

export function resetRoom(code: string, hostToken: string) {
  return call<{ status: RoomStatus }>(`/api/rooms/${code}/reset`, {
    method: "POST",
    headers: hostHeaders(hostToken),
  });
}

// ---- participant actions --------------------------------------------------

export function getCard(code: string, participantId: string, secret: string) {
  return call<{ card: CardPayload }>(`/api/rooms/${code}/card`, {
    headers: partHeaders(participantId, secret),
    cache: "no-store",
  });
}

export function postAway(code: string, participantId: string, secret: string, type: "away" | "reload") {
  return call<{ ok: boolean }>(`/api/rooms/${code}/away`, {
    method: "POST",
    headers: { ...jsonHeaders, ...partHeaders(participantId, secret) },
    body: JSON.stringify({ type }),
    keepalive: true,
  });
}

export function castVote(
  code: string,
  participantId: string,
  secret: string,
  targetParticipantId: string,
  justification?: string,
) {
  return call<{ ok: boolean }>(`/api/rooms/${code}/votes`, {
    method: "POST",
    headers: { ...jsonHeaders, ...partHeaders(participantId, secret) },
    body: JSON.stringify({ targetParticipantId, justification }),
  });
}

export function getVotes(code: string, hostToken?: string) {
  return call<{ counts: Record<string, number>; total: number }>(`/api/rooms/${code}/votes`, {
    headers: hostToken ? hostHeaders(hostToken) : undefined,
    cache: "no-store",
  });
}

// ---- results --------------------------------------------------------------

export interface ResultsTallyRow {
  participantId: string;
  displayName: string;
  role: Role;
  votes: number;
}

export interface ResultsPayload {
  concept: Concept | null;
  impostors: string[];
  tally: ResultsTallyRow[];
  impostorCaught: boolean;
  votes: { voter: string; target: string; justification?: string }[];
}

export function getResults(code: string) {
  return call<ResultsPayload>(`/api/rooms/${code}/results`, { cache: "no-store" });
}
