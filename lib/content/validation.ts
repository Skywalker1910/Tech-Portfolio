import type { ContentKind, ExperienceContent, PortfolioContent, ProjectContent } from "./types";

const text = (value: unknown, max = 2_000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const list = (value: unknown, maxItems = 20, maxLength = 240) => Array.isArray(value) ? value.map((v) => text(v, maxLength)).filter(Boolean).slice(0, maxItems) : [];
const safeUrl = (value: unknown) => {
  const candidate = text(value, 500);
  if (!candidate) return undefined;
  if (candidate.startsWith("/")) return candidate;
  try { const url = new URL(candidate); return url.protocol === "https:" ? url.toString() : undefined; } catch { return undefined; }
};
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || crypto.randomUUID();

export function validateContent(kind: ContentKind, input: unknown): PortfolioContent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const title = text(raw.title, 160);
  if (!title) return null;
  const id = slug(text(raw.id, 100) || title);
  const base = { id, title, published:raw.published !== false, sortOrder:Number.isFinite(Number(raw.sortOrder)) ? Math.max(0, Math.round(Number(raw.sortOrder))) : 0, createdAt:text(raw.createdAt, 40) || undefined };
  if (kind === "projects") {
    const statuses = new Set(["completed", "in-progress", "planned"]);
    const status = statuses.has(String(raw.status)) ? String(raw.status) as ProjectContent["status"] : "planned";
    return { ...base, kind:"project", blurb:text(raw.blurb, 360), description:text(raw.description, 4_000), highlights:list(raw.highlights), tags:list(raw.tags, 24, 60), year:Math.min(2100, Math.max(1900, Number(raw.year) || new Date().getFullYear())), status, featured:Boolean(raw.featured), github:safeUrl(raw.github), demo:safeUrl(raw.demo), link:safeUrl(raw.link) };
  }
  const accents = new Set(["orange","violet","teal","blue","pink","purple"]);
  const accent = accents.has(String(raw.accent)) ? String(raw.accent) as ExperienceContent["accent"] : "orange";
  const organization = text(raw.organization, 160);
  const period = text(raw.period, 100);
  if (!organization || !period) return null;
  return { ...base, kind:"experience", organization, department:text(raw.department, 160), subdepartment:text(raw.subdepartment, 160) || undefined, location:text(raw.location, 160), period, type:text(raw.type, 100), summary:text(raw.summary, 2_000) || undefined, researchAreas:text(raw.researchAreas, 1_000) || undefined, bulletHeading:text(raw.bulletHeading, 100) || undefined, tagHeading:text(raw.tagHeading, 100) || undefined, bullets:list(raw.bullets, 30, 500), tags:list(raw.tags, 30, 80), logo:safeUrl(raw.logo), accent, showOnTimeline:raw.showOnTimeline !== false };
}
