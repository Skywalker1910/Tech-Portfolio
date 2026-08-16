export type KnowledgeSection = {
  heading: string;
  content: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  route: string;
  sections: KnowledgeSection[];
};

export type PortfolioChunk = {
  id: string;
  documentId: string;
  title: string;
  section: string;
  href: string;
  content: string;
  searchText: string;
};

export type RetrievalMode = "s3-vectors" | "local-keyword";

export type RetrievedChunk = PortfolioChunk & {
  score?: number;
  distance?: number;
};

export type RetrievalResult = {
  mode: RetrievalMode;
  chunks: RetrievedChunk[];
  durationMs: number;
  fallbackReason?: "disabled" | "missing-config" | "query-failed";
};

export type ChatSource = {
  title: string;
  section: string;
  href: string;
};
