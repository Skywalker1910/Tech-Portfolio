import { DEFAULT_PROJECTS } from "./content/defaults";
import type { ProjectContent } from "./content/types";

export type ProjectPresentation = Pick<ProjectContent,"title"|"demo"|"github"|"technicalDetails"|"evaluation"|"limitations"> & {id?:string};
type Capture = {poster:string;motion?:string;caption:string;capturedAt:string;sourceUrl:string};
const CAPTURES:Record<string,Capture>={
  "www.adityamore.dev":{poster:"/project-previews/portfolio.webp",motion:"/project-previews/portfolio-motion.webp",caption:"Public portfolio · captured interface",capturedAt:"2026-09-30",sourceUrl:"https://www.adityamore.dev"},
  "movies.adityamore.dev":{poster:"/project-previews/movies.webp",motion:"/project-previews/movies-motion.webp",caption:"Public movie app · scrolling capture",capturedAt:"2026-09-30",sourceUrl:"https://movies.adityamore.dev"},
  "neurallog.adityamore.dev":{poster:"/project-previews/neurallog.webp",caption:"Public sign-in · dashboard requires an account",capturedAt:"2026-09-30",sourceUrl:"https://neurallog.adityamore.dev"},
  "chat.adityamore.dev":{poster:"/project-previews/bb8.webp",motion:"/project-previews/bb8-motion.webp",caption:"Live Transformer playground · no inference recorded",capturedAt:"2026-09-30",sourceUrl:"https://chat.adityamore.dev/"},
};
export function projectCapture(demo?:string):Capture|null {
  if(!demo)return null;
  try {const url=new URL(demo);return url.protocol==="https:" && url.pathname==="/" && !url.search && !url.hash ? CAPTURES[url.hostname] ?? null : null;}catch{return null;}
}
const LEGACY_TITLES:Record<string,string>={
  "AI-Powered Tech Portfolio (RAG-based System)":"bb8-rag",
  "AI-Powered Tech Portfolio (RAG Based System)":"bb8-rag",
  "Personalized Movie Recommendation System":"movie-recommendation",
};
// Narrow compatibility handling: preserve custom titles, publication choices,
// rankings and prose. Only known superseded names and absent URLs are repaired.
export function withProjectPresentation<T extends ProjectPresentation>(project:T):T & Pick<ProjectContent,"demo"|"technicalDetails"|"evaluation"|"limitations"> {
  const legacyId=LEGACY_TITLES[project.title];
  const bundled=DEFAULT_PROJECTS.find(p=>(project.id && p.id===project.id) || (project.github && p.github===project.github) || p.id===legacyId);
  return {...project,title:legacyId && bundled ? bundled.title : project.title,
    demo:project.demo ?? bundled?.demo,technicalDetails:project.technicalDetails ?? bundled?.technicalDetails,
    evaluation:project.evaluation ?? bundled?.evaluation,limitations:project.limitations ?? bundled?.limitations};
}

export function featuredWork(projects:ProjectContent[]):ProjectContent[] {
  return projects.filter(p=>p.published && p.featured)
    .sort((a,b)=>(a.featuredOrder ?? a.sortOrder)-(b.featuredOrder ?? b.sortOrder) || a.sortOrder-b.sortOrder || a.id.localeCompare(b.id))
    .map(withProjectPresentation);
}
