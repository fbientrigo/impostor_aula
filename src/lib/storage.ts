// SSR-safe localStorage helpers for account-less identity. Host tokens and
// participant secrets live only in the browser that created/joined the room.

"use client";

export interface ParticipantIdentity {
  participantId: string;
  secret: string;
  displayName: string;
}

const hostKey = (code: string) => `impostor:host:${code}`;
const participantKey = (code: string) => `impostor:participant:${code}`;
export const LANG_KEY = "impostor:lang";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function getHostToken(code: string): string | null {
  return read(hostKey(code));
}
export function setHostToken(code: string, token: string): void {
  write(hostKey(code), token);
}

export function getParticipant(code: string): ParticipantIdentity | null {
  const raw = read(participantKey(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParticipantIdentity;
  } catch {
    return null;
  }
}
export function setParticipant(code: string, identity: ParticipantIdentity): void {
  write(participantKey(code), JSON.stringify(identity));
}
export function clearParticipant(code: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(participantKey(code));
  } catch {
    /* ignore */
  }
}
