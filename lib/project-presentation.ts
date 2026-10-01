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
// Older published DB records retain their admin-authored text; verified technical
// supplements are used only when these newly introduced fields are absent.
export function withProjectPresentation<T extends ProjectPresentation>(project:T):T & Pick<ProjectContent,"technicalDetails"|"evaluation"|"limitations"> {
  const bundled=DEFAULT_PROJECTS.find(p=>(project.id && p.id===project.id) || (project.github && p.github===project.github));
  return {...project,technicalDetails:project.technicalDetails ?? bundled?.technicalDetails,
    evaluation:project.evaluation ?? bundled?.evaluation,limitations:project.limitations ?? bundled?.limitations};
}
