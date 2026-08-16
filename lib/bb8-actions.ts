export const PORTFOLIO_ROUTES = [
  "/",
  "/projects",
  "/experience",
  "/skills",
  "/contact",
  "/education",
  "/socials",
] as const;

export type PortfolioRoute = (typeof PORTFOLIO_ROUTES)[number];

export type BB8Action =
  | { type: "navigate"; href: PortfolioRoute; label: string }
  | { type: "resume"; href: "/resume.pdf"; label: string }
  | {
      type: "contact_draft";
      href: "/contact";
      label: string;
      draft: { firstName: string; lastName: string; email: string; message: string };
    };

export const CONTACT_DRAFT_KEY = "bb8-contact-draft";

export function isBB8Action(value: unknown): value is BB8Action {
  if (!value || typeof value !== "object") return false;
  const action = value as Record<string, unknown>;
  if (action.type === "navigate") {
    return typeof action.href === "string" &&
      PORTFOLIO_ROUTES.includes(action.href as PortfolioRoute) &&
      typeof action.label === "string";
  }
  if (action.type === "resume") {
    return action.href === "/resume.pdf" && typeof action.label === "string";
  }
  if (action.type === "contact_draft" && action.href === "/contact" && typeof action.label === "string") {
    const draft = action.draft;
    if (!draft || typeof draft !== "object") return false;
    const fields = draft as Record<string, unknown>;
    return ["firstName", "lastName", "email", "message"].every((key) => typeof fields[key] === "string");
  }
  return false;
}
