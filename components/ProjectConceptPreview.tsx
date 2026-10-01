"use client";
import { motion } from "framer-motion";
import { Brain, ShieldCheck, CloudSun, ScanLine, Gamepad2, Trophy, Film, Layers } from "lucide-react";

// Code-native illustration, explicitly not a capture or a claimed live dashboard.
export default function ProjectConceptPreview({title,animate}:{title:string;animate:boolean}) {
  const name=title.toLowerCase();
  const kind=/aqi|skynet|air quality/.test(name)?"forecast":/football|fifa/.test(name)?"tournament":/jailbreak|defense|adversarial/.test(name)?"security":/license|alpr|covid/.test(name)?"vision":/alien|game/.test(name)?"game":/movie/.test(name)?"movies":/learning|transformer|bb.?8/.test(name)?"neural":"pipeline";
  const icons={forecast:CloudSun,tournament:Trophy,security:ShieldCheck,vision:ScanLine,game:Gamepad2,movies:Film,neural:Brain,pipeline:Layers};
  const Icon=icons[kind];
  return <div className="flex h-full flex-col items-center justify-center gap-2 overflow-hidden bg-[var(--tag-bg)] px-4 text-center">
    <div className="relative flex h-24 w-60 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 240 96" className="absolute inset-0 h-full w-full text-[var(--accent)]">
        {kind==="forecast" ? <><path d="M15 78H225M15 78V10" stroke="currentColor" strokeOpacity=".2" fill="none"/>{[25,45,35,65,52,75,63].map((height,i)=><motion.rect key={i} x={28+i*27} y={78-height} width="15" height={height} rx="3" fill="currentColor" fillOpacity=".35" animate={animate?{opacity:[.3,.8,.3],scaleY:[.85,1,.85]}:{opacity:.5}} transition={{duration:3,delay:i*.15,repeat:Infinity}}/>)}</> : <>
          {[0,1,2].map(row=>[0,1,2,3].map(col=><g key={`${row}-${col}`}><path d={`M${25+col*60} ${18+row*30} L120 48`} stroke="currentColor" strokeOpacity=".2"/><motion.circle cx={25+col*60} cy={18+row*30} r={kind==="vision"?4:5} fill="currentColor" animate={animate?{opacity:[.25,.85,.25]}:{opacity:.45}} transition={{duration:2.6,delay:(row+col)*.25,repeat:Infinity}}/></g>))}
          {kind==="vision"&&<motion.path d="M12 48H228" stroke="currentColor" animate={animate?{y:[-30,30,-30]}:{y:0}} transition={{duration:3,repeat:Infinity}}/>}
        </>}
      </svg>
      <motion.div className="z-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--accent)]" animate={animate?{y:[0,-4,0]}:{y:0}} transition={{duration:3,repeat:Infinity}}><Icon size={25}/></motion.div>
    </div>
    <p className="line-clamp-2 max-w-sm text-xs font-semibold text-[var(--text)]">{title}</p>
    <p className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Concept illustration · not a live screen</p>
  </div>;
}
