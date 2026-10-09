import game from "@/data/arcade/game.json";
import countries from "@/data/arcade/countries.json";
export const NAME_MAX = 20;
export const GAME_VERSION = game.version;
export const MAX_SCORE = 999_999_999;
export const COUNTRIES = countries as Array<{code:string; name:string}>;
const countryCodes = new Set(COUNTRIES.map(country => country.code));
export class ArcadeError extends Error {
  constructor(message:string, readonly status=400) { super(message); }
}
export function validateName(input:unknown):string {
  if (typeof input !== "string") throw new ArcadeError("Enter a gaming name.");
  const name = input.normalize("NFKC").trim().replace(/ +/g, " ");
  if (!name || name.length > NAME_MAX) throw new ArcadeError("Gaming names must be 1–20 characters.");
  if (!/^[A-Za-z0-9 _.-]+$/.test(name)) throw new ArcadeError("Use letters, numbers, spaces, underscores, dots, or hyphens.");
  return name;
}
export function validateCountry(input:unknown):string {
  if (typeof input !== "string" || !countryCodes.has(input.toLowerCase())) throw new ArcadeError("Select a country from the list.");
  return input.toLowerCase();
}
export function integer(input:unknown, label:string, min:number, max:number):number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < min || input > max) throw new ArcadeError(`Invalid ${label}.`);
  return input;
}
export type RunIdentity = { gameRunId:string; seed:number; version:string };
export function validateRunIdentity(body:Record<string,unknown>):RunIdentity {
  const seed = integer(body.seed, "seed", 1, 2**31-1);
  const gameRunId = body.gameRunId;
  if (typeof gameRunId !== "string" || gameRunId.length > 48 || !new RegExp(`^${seed}-[1-9][0-9]*$`).test(gameRunId)) throw new ArcadeError("Invalid game run.");
  if (body.version !== GAME_VERSION) throw new ArcadeError("This game version is not eligible for this leaderboard.");
  return { seed, gameRunId, version:GAME_VERSION };
}
export function maskedName(name:string, appropriate:boolean):string {
  return appropriate ? name : "*".repeat(name.length);
}
