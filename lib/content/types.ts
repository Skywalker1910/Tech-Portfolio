export type ContentKind = "projects" | "experience";

export type BaseContent = {
  id: string;
  title: string;
  published: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectContent = BaseContent & {
  kind: "project";
  blurb: string;
  description: string;
  highlights: string[];
  tags: string[];
  year: number;
  status: "completed" | "in-progress" | "planned";
  featured: boolean;
  github?: string;
  demo?: string;
  link?: string;
};

export type ExperienceContent = BaseContent & {
  kind: "experience";
  organization: string;
  department: string;
  subdepartment?: string;
  location: string;
  period: string;
  type: string;
  summary?: string;
  researchAreas?: string;
  bulletHeading?: string;
  tagHeading?: string;
  bullets: string[];
  tags: string[];
  logo?: string;
  accent: "orange" | "violet" | "teal" | "blue" | "pink" | "purple";
  showOnTimeline: boolean;
};

export type PortfolioContent = ProjectContent | ExperienceContent;

export type RagRuntimeSettings = {
  enabled: boolean;
  topK: number;
  maxDistance: number;
  updatedAt?: string;
};
