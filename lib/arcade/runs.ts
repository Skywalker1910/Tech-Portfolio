import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ArcadeError, GAME_VERSION, integer, MAX_SCORE, validateRunIdentity, type RunIdentity } from "./policy";

export type RunTicket = RunIdentity & { id:string; issuedAt:number; expiresAt:number };
function secret() {
  const value = process.env.ARCADE_RUN_SECRET;
  if (!value || value.length < 32) throw new ArcadeError("Public scores are not configured yet.", 503);
  return value;
}
function signature(body:string) { return createHmac("sha256", secret()).update(body).digest("base64url"); }
export function issueRun(identity:RunIdentity, now=Date.now()):string {
  const ticket:RunTicket = { ...identity, id:randomUUID(), issuedAt:now, expiresAt:now+3*60*60_000 };
  const body = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return `${body}.${signature(body)}`;
}
export function verifyRun(input:unknown, now=Date.now()):RunTicket {
  if (typeof input !== "string" || input.length > 1500) throw new ArcadeError("Invalid run ticket.");
  const parts = input.split(".");
  if (parts.length !== 2) throw new ArcadeError("Invalid run ticket.");
  const expected = Buffer.from(signature(parts[0]));
  const received = Buffer.from(parts[1]);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new ArcadeError("Invalid run ticket.");
  let ticket:RunTicket;
  try { ticket = JSON.parse(Buffer.from(parts[0], "base64url").toString()); } catch { throw new ArcadeError("Invalid run ticket."); }
  validateRunIdentity(ticket);
  if (!/^[0-9a-f-]{36}$/.test(ticket.id) || !Number.isSafeInteger(ticket.issuedAt) || !Number.isSafeInteger(ticket.expiresAt) || ticket.issuedAt > now+1000 || ticket.expiresAt <= now) throw new ArcadeError("Run ticket expired or invalid. Start another round.");
  return ticket;
}
export type CompletedRun = { score:number; level:number; wave:number; kills:number; ticks:number; duration:number };
export function validateCompletedRun(body:Record<string,unknown>, ticket:RunTicket, now=Date.now()):CompletedRun {
  if (body.seed !== ticket.seed || body.gameRunId !== ticket.gameRunId || body.version !== GAME_VERSION) throw new ArcadeError("Result does not match this run.");
  const score = integer(body.score, "score", 1, MAX_SCORE);
  const level = integer(body.level, "level", 1, 10_000);
  const wave = integer(body.wave, "wave", 0, 10_000);
  const kills = integer(body.kills, "kills", 0, 1_000_000);
  const ticks = integer(body.ticks, "run length", 1, 3*60*60*60);
  const duration = body.duration;
  if (typeof duration !== "number" || !Number.isFinite(duration) || duration < 0 || Math.abs(duration-ticks/60) > 0.03 || duration > (now-ticket.issuedAt)/1000+10) throw new ArcadeError("Invalid run timing.");
  return { score, level, wave, kills, ticks, duration };
}
