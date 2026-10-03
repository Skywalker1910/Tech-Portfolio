"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ExternalLink, Pause, Play } from "lucide-react";
import { projectIllustration } from "@/lib/project-presentation";
import ProjectConceptPreview from "@/components/ProjectConceptPreview";

export default function ProjectApplicationPreview({title,demo,id}:{title:string;demo?:string;id?:string}) {
  const ref=useRef<HTMLDivElement>(null);const inView=useInView(ref,{amount:.2});const reducedMotion=useReducedMotion();
  const [paused,setPaused]=useState(false);const [failed,setFailed]=useState(false);
  const illustration=projectIllustration(title,demo,id);const playing=inView && reducedMotion===false && !paused;
  let host="Research / implementation";
  try{if(demo)host=new URL(demo).hostname;}catch{if(demo)host="Application demo";}
  return <div ref={ref} className="relative flex h-full min-h-44 flex-col overflow-hidden bg-[var(--surface)] text-[var(--text)]">
    <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2 text-[9px] text-[var(--sub-muted)]"><span className="h-1.5 w-1.5 rounded-full bg-orange-400"/><span className="truncate">{host}</span></div>
    <div className="relative min-h-32 flex-1 overflow-hidden">
      {illustration&&!failed ? <motion.div className="absolute inset-0" initial={false} animate={playing?{scale:[1.02,1.09,1.02],x:[0,-4,0],y:[0,-2,0]}:{scale:1.02,x:0,y:0}} transition={playing?{duration:16,repeat:Infinity,ease:"easeInOut"}:{duration:0}}><Image src={illustration} alt={`Illustrated interpretation of ${title}`} fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" onError={()=>setFailed(true)} className="object-cover"/></motion.div> : <ProjectConceptPreview title={title} animate={playing}/>}
      <button type="button" onClick={event=>{event.stopPropagation();setPaused(!paused);}} aria-label={paused?`Play ${title} illustration`:`Pause ${title} illustration`} aria-pressed={paused} disabled={Boolean(reducedMotion)} className="absolute bottom-2 right-2 rounded-full border border-white/20 bg-black/70 p-2 text-white disabled:hidden">{paused?<Play size={12}/>:<Pause size={12}/>}</button>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2 text-[9px] text-[var(--muted)]"><span>Project illustration · {playing?"gentle motion":"still"}</span>{demo&&<a href={demo} onClick={e=>e.stopPropagation()} target="_blank" rel="noreferrer" aria-label={`Open ${title} application`} className="shrink-0 text-[var(--text)]"><ExternalLink size={12}/></a>}</div>
  </div>;
}
