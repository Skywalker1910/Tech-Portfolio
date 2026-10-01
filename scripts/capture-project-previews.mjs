// Run only against a fresh, isolated headless Edge CDP session on localhost:9333.
// Public screens only: no login, form submission, inference or account data.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const targets = [
  {id:"movies",url:"https://movies.adityamore.dev",scroll:[0,80,160,240,320,240,160,80,0]},
  {id:"neurallog",url:"https://neurallog.adityamore.dev",scroll:[0],note:"Public sign-in screen; no authenticated dashboard recorded."},
  {id:"bb8",url:"https://chat.adityamore.dev/",scroll:[0,50,100,150,100,50,0]},
  {id:"portfolio",url:"https://www.adityamore.dev",scroll:[0,100,200,300,200,100,0]},
];
const pages=await (await fetch("http://localhost:9333/json/list")).json();
const page=pages.find(p=>p.type==="page");if(!page)throw new Error("Start an isolated headless Edge CDP session first.");
const socket=new WebSocket(page.webSocketDebuggerUrl);let sequence=0;const pending=new Map();
await new Promise((resolve,reject)=>{socket.addEventListener("open",resolve,{once:true});socket.addEventListener("error",reject,{once:true});});
socket.addEventListener("message",event=>{const result=JSON.parse(event.data);const task=pending.get(result.id);if(!task)return;pending.delete(result.id);if(result.error)task.reject(new Error(result.error.message));else task.resolve(result.result);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await mkdir("public/project-previews",{recursive:true});
await send("Page.enable");await send("Emulation.setDeviceMetricsOverride",{width:1366,height:900,deviceScaleFactor:1,mobile:false});
try {
  for(const target of targets) {
    await send("Page.navigate",{url:target.url});await delay(4500);
    const state=await send("Runtime.evaluate",{expression:"JSON.stringify({url:location.href,title:document.title,text:document.body.innerText.slice(0,160)})",returnByValue:true});
    console.log(target.id,state.result.value);
    if(target.id==="portfolio") {
      // Opening the public chat shell makes no generation request.
      await send("Runtime.evaluate",{expression:"document.querySelector('button[aria-label=\"Open BB-8 chat\"]')?.click()"});
      await delay(500);
    }
    const frames=[];
    for(const y of target.scroll) {
      await send("Runtime.evaluate",{expression:`window.scrollTo({top:${y},behavior:'instant'})`});await delay(180);
      const capture=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
      frames.push(await sharp(Buffer.from(capture.data,"base64")).resize(960,632,{fit:"cover"}).ensureAlpha().raw().toBuffer());
    }
    await sharp(frames[0],{raw:{width:960,height:632,channels:4}}).webp({quality:80}).toFile(`public/project-previews/${target.id}.webp`);
    if(frames.length>1)await sharp(Buffer.concat(frames),{raw:{width:960,height:632*frames.length,channels:4,pageHeight:632}})
      .webp({quality:72,loop:0,delay:target.scroll.map((_,i)=>i===0?1800:300)}).toFile(`public/project-previews/${target.id}-motion.webp`);
    console.log(`Captured ${target.id}: ${frames.length} real public-page frames. ${target.note ?? ''}`);
  }
} finally {socket.close();}
