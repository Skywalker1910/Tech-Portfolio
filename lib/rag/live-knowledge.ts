import { listContent } from "@/lib/content/repository";
import type { ExperienceContent, ProjectContent } from "@/lib/content/types";
import { buildChunksFromDocuments, PORTFOLIO_DOCUMENTS } from "./knowledge";
import type { KnowledgeDocument } from "./types";

function projectDocument(project: ProjectContent): KnowledgeDocument {
  return { id:`project-${project.id}`, title:project.title, route:"/projects", sections:[
    { heading:"Overview", content:`${project.blurb} ${project.description}` },
    { heading:"Highlights", content:project.highlights.join(" ") },
    { heading:"Technologies", content:`${project.tags.join(", ")}. Status: ${project.status}. Year: ${project.year}.` },
  ].filter((section) => section.content.trim()) };
}

function experienceDocument(role: ExperienceContent): KnowledgeDocument {
  return { id:`experience-${role.id}`, title:role.title, route:"/experience", sections:[
    { heading:"Role", content:`${role.title} at ${role.organization}${role.subdepartment ? `, ${role.subdepartment}` : ""}. ${role.period}. ${role.location}. ${role.type}.` },
    { heading:"Summary", content:[role.summary, role.researchAreas].filter(Boolean).join(" ") },
    { heading:"Contributions", content:role.bullets.join(" ") },
    { heading:"Technologies", content:role.tags.join(", ") },
  ].filter((section) => section.content.trim()) };
}

export async function buildCurrentPortfolioChunks() {
  const [projects, experience] = await Promise.all([listContent("projects"), listContent("experience")]);
  const staticDocuments = PORTFOLIO_DOCUMENTS.filter((document) => document.id !== "projects" && document.id !== "experience");
  const projectReference = PORTFOLIO_DOCUMENTS.find((document) => document.id === "projects");
  const sourceControlledCaseStudies = projectReference ? [{
    ...projectReference,
    sections:projectReference.sections.filter((section) => /Adversarial Attacks|LLM Defense|Tech Portfolio Website/i.test(section.heading)),
  }] : [];
  return buildChunksFromDocuments([
    ...staticDocuments,
    ...sourceControlledCaseStudies,
    ...(projects as ProjectContent[]).map(projectDocument),
    ...(experience as ExperienceContent[]).map(experienceDocument),
  ]);
}
