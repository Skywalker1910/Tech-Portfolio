import knowledgeJson from "@/data/portfolio-knowledge.json";
import type { KnowledgeDocument, PortfolioChunk } from "./types";

const MAX_CHUNK_CHARS = 1_200;
const CHUNK_OVERLAP_CHARS = 160;

export const PORTFOLIO_DOCUMENTS = knowledgeJson as KnowledgeDocument[];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function splitSection(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_CHUNK_CHARS) return [normalized];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + MAX_CHUNK_CHARS, normalized.length);
    if (end < normalized.length) {
      const sentenceEnd = normalized.lastIndexOf(". ", end);
      if (sentenceEnd > start + Math.floor(MAX_CHUNK_CHARS * 0.6)) end = sentenceEnd + 1;
    }

    chunks.push(normalized.slice(start, end).trim());
    if (end === normalized.length) break;
    start = Math.max(end - CHUNK_OVERLAP_CHARS, start + 1);
  }

  return chunks;
}

export function buildChunksFromDocuments(documents: KnowledgeDocument[]): PortfolioChunk[] {
  return documents.flatMap((document) =>
    document.sections.flatMap((section) =>
      splitSection(section.content).map((content, index) => {
        const id = `${document.id}-${slugify(section.heading)}-${index + 1}`;
        return {
          id,
          documentId: document.id,
          title: document.title,
          section: section.heading,
          href: document.route,
          content,
          searchText: `${document.title}\n${section.heading}\n${content}`,
        };
      }),
    ),
  );
}

export function buildPortfolioChunks(): PortfolioChunk[] {
  return buildChunksFromDocuments(PORTFOLIO_DOCUMENTS);
}
