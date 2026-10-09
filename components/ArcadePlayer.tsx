"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Pause, Play, RotateCcw, X, Zap, ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./ArcadePlayer.module.css";
import { AlienIcon } from "./ArcadeIcons";
import ArcadeLeaderboard, { type FinishedRun } from "./ArcadeLeaderboard";

type Phase = "idle"|"loading"|"ready"|"playing"|"over"|"error";
const basePath = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Tech-Portfolio" : "";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--tag-bg)] disabled:opacity-40 disabled:cursor-not-allowed";

export default function ArcadePlayer() {
  const frame=useRef<HTMLIFrameElement>(null), dialog=useRef<HTMLDialogElement>(null), stage=useRef<HTMLDivElement>(null);
  const [expanded,setExpanded]=useState(false), [viewport,setViewport]=useState({width:0,height:0});
  const configured=useRef(false), activeRun=useRef(""), ticket=useRef<Promise<string>>(Promise.resolve(""));
  const [phase,setPhase]=useState<Phase>("idle"), [paused,setPaused]=useState(false), [briefing,setBriefing]=useState(false);
  const [score,setScore]=useState(0), [level,setLevel]=useState(1), [lives,setLives]=useState(3);
  const [attempt,setAttempt]=useState(0), [origin,setOrigin]=useState("");
  const [completed,setCompleted]=useState<FinishedRun|null>(null), [suggested,setSuggested]=useState<{name:string;country:string}|null>(null);
  const mounted = !["idle","error"].includes(phase);
  const setConfigured=useCallback((value:boolean)=>{configured.current=value;},[]);
  const send=useCallback((type:string,fields:Record<string,unknown>={})=>{
    frame.current?.contentWindow?.postMessage({target:"alien-invasion",type,...fields},window.location.origin);
  },[]);

  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if (event.origin!==window.location.origin || event.source!==frame.current?.contentWindow) return;
      const data=event.data;
      if (!data || typeof data!=="object" || data.source!=="alien-invasion") return;
      if (data.type==="ready") setPhase("ready");
      if (data.type==="run_started") {
        activeRun.current=data.run_id; setPhase("playing");setPaused(false);setCompleted(null);setSuggested(null);
        ticket.current=configured.current ? fetch("/api/arcade/runs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gameRunId:data.run_id,seed:data.seed,version:data.version})}).then(async response=>{const result=await response.json();return response.ok?result.ticket:"";}).catch(()=>"") : Promise.resolve("");
      }
      if (data.type==="state") {
        if (Number.isSafeInteger(data.score) && data.score>=0) setScore(data.score);
        if (Number.isSafeInteger(data.level) && data.level>0) setLevel(data.level);
        if (Number.isSafeInteger(data.lives) && data.lives>=0) setLives(data.lives);
        if (typeof data.paused==="boolean") setPaused(data.paused);
        if (data.state==="title") setPhase("ready");
        if (data.state==="playing") setPhase("playing");
        if (data.state==="game_over") setPhase("over");
      }
      if (data.type==="paused" || data.type==="resumed") setPaused(data.type==="paused");
      if (data.type==="briefing_started" || data.type==="briefing_finished") setBriefing(data.type==="briefing_started");
      if (data.type==="run_abandoned") {activeRun.current="";setCompleted(null);setBriefing(false);}
      if (data.type==="game_over" && data.run_id===activeRun.current) {
        setPhase("over");setPaused(false);setBriefing(false);
        const runId=data.run_id;
        void ticket.current.then(token=>{
          if (activeRun.current===runId) setCompleted({gameRunId:runId,seed:data.seed,version:data.version,score:data.score,level:data.level,wave:data.wave,kills:data.kills,ticks:data.ticks,duration:data.duration,ticket:token});
        });
      }
      if (data.type==="score_saved" && data.run_id===activeRun.current && typeof data.name==="string" && typeof data.country==="string") setSuggested({name:data.name,country:data.country});
    };
    window.addEventListener("message",receive);
    const hidden=()=>{if(document.hidden)send("pause");};
    document.addEventListener("visibilitychange",hidden);
    return ()=>{window.removeEventListener("message",receive);document.removeEventListener("visibilitychange",hidden);};
  },[send]);
  useEffect(()=>{
    if(phase!=="loading")return;
    const timeout=window.setTimeout(()=>setPhase("error"),120_000);
    return ()=>window.clearTimeout(timeout);
  },[phase,attempt]);

  useEffect(()=>{
    if (!expanded) return;
    const element=dialog.current;
    element?.showModal();
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const observer=new ResizeObserver(entries=>{
      const {width,height}=entries[0].contentRect;
      const fittedWidth=Math.min(width,height*1.5);
      setViewport({width:fittedWidth,height:fittedWidth/1.5});
    });
    if(stage.current)observer.observe(stage.current);
    return ()=>{observer.disconnect();element?.close();document.body.style.overflow=previous;};
  },[expanded]);
  function close() {
    send("pause");setExpanded(false);setPhase("idle");setPaused(false);setBriefing(false);activeRun.current="";
  }

  async function load() {
    setExpanded(true);
    setOrigin(window.location.origin);setPhase("loading");setAttempt(value=>value+1);setScore(0);setLevel(1);setLives(3);setPaused(false);setBriefing(false);setCompleted(null);activeRun.current="";
    try {const response=await fetch(`${basePath}/games/alien-invasion/index.html`,{method:"HEAD"});if(!response.ok)setPhase("error");}catch{setPhase("error");}
  }
  function input(event:PointerEvent<HTMLButtonElement>,key:string,pressed:boolean) {
    event.preventDefault();if(pressed)event.currentTarget.setPointerCapture(event.pointerId);send("input",{[key]:pressed});
  }
  const status=phase==="loading"?"Loading game…":phase==="ready"?"Ready to launch":phase==="over"?"Game over":phase==="playing"?paused?"Paused":briefing?"Mission briefing":"In flight":phase==="error"?"Game could not load":"Ready when you are";
  return <>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg" aria-label="Alien Invasion game preview">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3"><span className="inline-flex items-center gap-2 text-sm font-semibold"><AlienIcon className="h-5 w-5"/>Alien Invasion</span><span className="text-xs text-[var(--muted)]">Python arcade · v3.2</span></div>
        <div className="flex aspect-[3/2] flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_top,var(--tag-bg),var(--surface)_75%)] p-6 text-center">
          <AlienIcon className="h-12 w-12 text-[var(--hero-accent)]"/>
          <h2 className="text-xl font-semibold sm:text-2xl">Your mission starts here</h2>
          <p className="max-w-sm text-sm text-[var(--muted)]">Alien fleets, boss battles, shields, and a ship full of upgrades. Ready, pilot?</p>
          <button onClick={load} className="cta-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"><Play size={17}/>Play game</button>
          <p className="text-xs text-[var(--muted)]">Opens in a larger game window. First load downloads Python.</p>
        </div>
        {completed && <p className="border-t border-[var(--border)] p-4 text-sm">Last mission: {completed.score.toLocaleString()} points. Check the leaderboard to publish your score.</p>}
      </section>
      <ArcadeLeaderboard completed={completed} suggested={suggested} onConfigured={setConfigured}/>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="arcade-window-title" onCancel={event=>{event.preventDefault();close();}}>
      {expanded && <div className={styles.window}>
        <header className={styles.header}>
          <span id="arcade-window-title" className="inline-flex items-center gap-2 font-semibold"><AlienIcon className="h-5 w-5 text-[var(--hero-accent)]"/>Alien Invasion</span>
          <span className={styles.score}>Score {score.toLocaleString()} · Level {level} · Lives {lives}</span>
          <button className={buttonClass} onClick={close} aria-label="Close game"><X size={18}/><span className="hidden sm:inline">Close game</span></button>
        </header>
        <div ref={stage} className={styles.stage}>
          {mounted && <iframe key={attempt} ref={frame} src={`${basePath}/games/alien-invasion/index.html?parentOrigin=${encodeURIComponent(origin)}`} title="Alien Invasion Python game" allow="autoplay" style={{width:viewport.width,height:viewport.height}} className="shrink-0 border-0" onError={()=>setPhase("error")}/>}
          {phase==="loading" && <span role="status" className={styles.loading}>Loading game…</span>}
          {phase==="error" && <div className="p-5 text-center text-white"><p className="mb-4">Unable to load the game. Check your connection and try again.</p><button className={buttonClass} onClick={load}>Retry loading</button></div>}
        </div>
        <footer className={styles.controls}>
          <div className="flex flex-wrap items-center gap-2">
            <span role="status" aria-live="polite" className="mr-auto text-xs text-[var(--muted)]">{status}</span>
            <button className={buttonClass} disabled={!["ready","over"].includes(phase)} onClick={()=>{send("start");frame.current?.focus();}}><RotateCcw size={15}/>{phase==="over"?"Play again":"Start round"}</button>
            <button className={buttonClass} disabled={phase!=="playing"} onClick={()=>send(paused?"resume":"pause")}>{paused?<Play size={15}/>:<Pause size={15}/>} {paused?"Resume":"Pause"}</button>
            {briefing && <button className={buttonClass} onClick={()=>send("skip_briefing")}>Skip briefing</button>}
            {phase==="over" && <button className={buttonClass} onClick={close}>View leaderboard</button>}
          </div>
          <div className={styles.touch} aria-label="Touch game controls">{[["left","←"],["up","↑"],["fire","Fire"],["down","↓"],["right","→"]].map(([key,label])=><button key={key} aria-label={key==="fire"?"Fire":`Move ${key}`} className={`${buttonClass} touch-none select-none`} disabled={phase!=="playing"||paused||briefing} onPointerDown={event=>input(event,key,true)} onPointerUp={event=>input(event,key,false)} onPointerCancel={event=>input(event,key,false)} onLostPointerCapture={()=>send("input",{[key]:false})} onKeyDown={event=>{if(["Enter"," "].includes(event.key)){event.preventDefault();send("input",{[key]:true});}}} onKeyUp={()=>send("input",{[key]:false})} onBlur={()=>send("input",{[key]:false})}>{label}</button>)}
            <button className={buttonClass} aria-label="Previous weapon" disabled={phase!=="playing"||paused||briefing} onClick={()=>send("switch",{direction:-1})}><ArrowLeft size={14}/></button>
            <button className={buttonClass} aria-label="Next weapon" disabled={phase!=="playing"||paused||briefing} onClick={()=>send("switch",{direction:1})}><ArrowRight size={14}/></button>
            <button className={buttonClass} aria-label="Shockwave" disabled={phase!=="playing"||paused||briefing} onClick={()=>send("special")}><Zap size={14}/></button>
          </div>
          <p className={styles.hint}>Arrows / WASD: move · Space: fire · Q/E: weapons · Shift: shockwave · P/Esc: pause. Click inside the game to use your keyboard.</p>
        </footer>
      </div>}
    </dialog>
  </>;
}
