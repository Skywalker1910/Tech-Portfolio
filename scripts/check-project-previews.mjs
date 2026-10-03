// Visual smoke check using an isolated Edge CDP session and local fixtures.
// Intercept every local API request: this check never writes production analytics.
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { DEFAULT_PROJECTS, DEFAULT_EXPERIENCE } from "../lib/content/defaults.ts";
import { withProjectPresentation } from "../lib/project-presentation.ts";
import { RESUME_SKILL_CATEGORIES } from "../lib/resume-skills.ts";

// Reproduce the production legacy-record failure: hosted projects lack demo URLs.
const fixtures=DEFAULT_PROJECTS.map(item=>item.id === "bb8-rag" ? {...item,title:"AI-Powered Tech Portfolio (RAG-based System)",demo:undefined} : item.id === "movie-recommendation" ? {...item,title:"Personalized Movie Recommendation System",demo:undefined} : item);
const writes=[];

const pages = await (await fetch("http://localhost:9333/json/list")).json();
const page = pages.find(item => item.type === "page");
if (!page) throw new Error("Start an isolated headless Edge CDP session first.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Fetch.requestPaused") {
    const url = message.params.request.url;
    if(message.params.request.method === "PUT")writes.push(JSON.parse(message.params.request.postData));
    const body = url.includes("/admin/chat-review") ? {items:[{id:"2026-10-02T12:00:00.000Z#11111111-1111-4111-8111-111111111111",prompt:"Which projects use React?",occurredAt:"2026-10-02T12:00:00.000Z",successful:true,model:"fixture",retrievalMode:"keyword",retrievalFallback:false,status:"new"}],nextCursor:null} : url.endsWith("/admin/content/projects") ? fixtures.map(withProjectPresentation)
      : url.endsWith("/content/projects") ? fixtures
      : url.endsWith("/content/experience") ? DEFAULT_EXPERIENCE : {};
    void send("Fetch.fulfillRequest", {
      requestId: message.params.requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: Buffer.from(JSON.stringify(body)).toString("base64"),
    });
    return;
  }
  const task = pending.get(message.id);
  if (!task) return;
  pending.delete(message.id);
  if (message.error) task.reject(new Error(message.error.message));
  else task.resolve(message.result);
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const evaluate = expression => send("Runtime.evaluate", { expression, returnByValue: true });
const screenshot = async name => {
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`artifacts/project-preview-${name}.png`, Buffer.from(result.data, "base64"));
};
try {
  await send("Page.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "http://localhost:3007/api/*" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:3007" });
  await delay(5000);
  await evaluate("localStorage.clear(); sessionStorage.clear()");await send("Page.reload");await delay(1500);
  for(const width of [390,320]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:844,deviceScaleFactor:1,mobile:true});await delay(300);
    const banner=JSON.parse((await evaluate("(()=>{const e=document.querySelector('aside[aria-label=\"Privacy and analytics preferences\"]');return JSON.stringify({height:e.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,text:e.innerText});})()")).result.value);
    assert.ok(banner.height<140);assert.equal(banner.overflow,false);console.log("consent",width,banner);await screenshot(`consent-${width}`);
  }
  await evaluate("Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Essential')?.click()");
  await evaluate("Array.from(document.querySelectorAll('h2')).find(e=>e.textContent.includes('Featured Projects'))?.scrollIntoView()");
  await delay(1000);
  console.log("desktop", (await evaluate("JSON.stringify({overflow:document.documentElement.scrollWidth>innerWidth,previews:Array.from(document.querySelectorAll('img[src*=\"project-illustrations\"]')).map(e=>({loaded:e.complete&&e.naturalWidth>0,alt:e.alt}))})")).result.value);
  await screenshot("desktop");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate("Array.from(document.querySelectorAll('h2')).find(e=>e.textContent.includes('Featured Projects'))?.scrollIntoView()");
  await delay(900);
  await screenshot("mobile");
  console.log("mobile", (await evaluate("JSON.stringify({overflow:document.documentElement.scrollWidth>innerWidth})")).result.value);
  await send("Page.navigate", { url: "http://localhost:3007/projects" });
  await delay(4000);
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await evaluate("window.scrollTo(0,300)");await delay(800);
  const cards=JSON.parse((await evaluate("JSON.stringify({heights:Array.from(document.querySelectorAll('article')).filter(e=>e.textContent.includes('Explore project details')).map(e=>Math.round(e.getBoundingClientRect().height)),expandedEvidenceVisible:document.body.innerText.includes('NDCG'),newNames:document.body.innerText.includes('BB8 Co-Pilot x Tech Portfolio')&&document.body.innerText.includes('Movie Recommendation Engine'),concepts:document.body.textContent.includes('Project illustration')})")).result.value);
  console.log("cards",cards);assert.equal(cards.heights.length,12);assert.ok(cards.heights.every(height=>height===560));assert.equal(cards.expandedEvidenceVisible,false);assert.equal(cards.newNames,true);assert.equal(cards.concepts,true);
  await screenshot("gallery");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(700);await screenshot("gallery-mobile");
  await evaluate("Array.from(document.querySelectorAll('h3')).find(e=>e.textContent.includes('Movie Recommendation Engine'))?.closest('article')?.click()");
  await delay(900);
  await screenshot("details");
  console.log("details", (await evaluate("JSON.stringify({methodology:document.body.innerText.includes('Evaluation'),ranking:document.body.innerText.includes('NDCG')})")).result.value);
  for(const [width,height] of [[1366,844],[390,844],[320,568],[844,390]]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<500});await delay(500);
    await evaluate("document.querySelector('[data-project-scroll]').scrollTop=0");
    const start=JSON.parse((await evaluate("(()=>{const o=document.querySelector('[data-project-overlay]');const d=o.querySelector('[role=dialog]');const s=o.querySelector('[data-project-scroll]');const h=o.querySelector('[data-project-modal-header]');const b=o.querySelector('[data-project-badges]');const r=d.getBoundingClientRect(),hr=h.getBoundingClientRect(),br=b.getBoundingClientRect(),cr=o.querySelector('button[aria-label=\"Close project details\"]').getBoundingClientRect();return JSON.stringify({outerScrollable:o.scrollHeight>o.clientHeight,innerScrollable:s.scrollHeight>s.clientHeight,width:r.width,top:r.top,bottomGap:innerHeight-r.bottom,overflow:r.right>innerWidth,badgesInHeader:br.top>=hr.top&&br.bottom<=hr.bottom,badgesAtRight:innerWidth<640?Math.abs(br.right-cr.right)<=1:Math.abs(cr.left-br.right)<=16});})()")).result.value);
    assert.equal(start.outerScrollable,false);assert.equal(start.innerScrollable,true);assert.equal(start.overflow,false);assert.ok(start.top>=12);assert.ok(Math.abs(start.top-start.bottomGap)<=1);assert.equal(start.badgesInHeader,true);assert.equal(start.badgesAtRight,true);if(width===1366)assert.ok(start.width>=1000);
    await evaluate("(()=>{const e=document.querySelector('[data-project-scroll]');e.scrollTop=e.scrollHeight;})()");await delay(200);
    const bottom=JSON.parse((await evaluate("(()=>{const o=document.querySelector('[data-project-overlay]');const d=o.querySelector('[role=dialog]');const e=o.querySelector('[data-project-scroll]');const links=e.querySelectorAll('a');const last=links[links.length-1].getBoundingClientRect();const close=o.querySelector('button[aria-label=\"Close project details\"]').getBoundingClientRect();const r=d.getBoundingClientRect();return JSON.stringify({top:r.top,bottomGap:innerHeight-r.bottom,lastActionVisible:last.top>=r.top&&last.bottom<=r.bottom,closeVisible:close.top>=r.top&&close.bottom<=r.bottom,scroll:e.scrollTop});})()")).result.value);
    console.log("bounded expanded card",{viewport:[width,height],...start,...bottom});assert.equal(bottom.lastActionVisible,true);assert.equal(bottom.closeVisible,true);assert.ok(Math.abs(bottom.top-start.top)<=1);assert.ok(Math.abs(bottom.top-bottom.bottomGap)<=1);assert.ok(bottom.scroll>0);await screenshot(`details-bottom-${width}`);
  }
  await evaluate("document.querySelector('button[aria-label=\"Close project details\"]')?.click()");await delay(400);
  assert.equal((await evaluate("document.body.style.overflow==='hidden'")).result.value,false);
  await send("Page.navigate",{url:"http://localhost:3007/experience"});await delay(2000);
  for(const theme of ["light","dark"])for(const width of [1366,390,320]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await evaluate(`document.documentElement.classList.toggle('dark',${theme==="dark"})`);await delay(300);
    assert.equal((await evaluate("document.documentElement.scrollWidth>innerWidth")).result.value,false);
    await screenshot(`experience-${theme}-${width}`);
  }
  await evaluate("document.documentElement.classList.remove('dark')");
  await send("Page.navigate", { url:"http://localhost:3007/skills" });await delay(1500);
  for(const theme of ["light","dark"])for(const width of [1366,390,320]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await evaluate(`document.documentElement.classList.toggle('dark',${theme==="dark"})`);await delay(400);
    const skills=JSON.parse((await evaluate(`(()=>{
      const luminance=color=>{const c=color.match(/[\\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
      const contrast=(foreground,background)=>{const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
      const titles=Array.from(document.querySelectorAll('[data-skill-card] h2')).map(e=>contrast(getComputedStyle(e).color,getComputedStyle(e.closest('[data-skill-card]')).backgroundColor));
      const chips=Array.from(document.querySelectorAll('[data-skill-chip]')).map(e=>contrast(getComputedStyle(e).color,getComputedStyle(e).backgroundColor));
      return JSON.stringify({overflow:document.documentElement.scrollWidth>innerWidth,cards:titles.length,skills:Array.from(document.querySelectorAll('[data-skill-chip] span')).map(e=>e.textContent),minimumTitleContrast:Math.min(...titles),minimumChipContrast:Math.min(...chips)});
    })()`)).result.value);
    assert.equal(skills.overflow,false);assert.equal(skills.cards,5);assert.deepEqual(skills.skills,RESUME_SKILL_CATEGORIES.flatMap(c=>[...c.skills]));assert.ok(skills.minimumTitleContrast>=4.5);assert.ok(skills.minimumChipContrast>=4.5);
    console.log("skills",{theme,width,titleContrast:skills.minimumTitleContrast,chipContrast:skills.minimumChipContrast,overflow:skills.overflow});await screenshot(`skills-${theme}-${width}`);
  }
  await evaluate("document.documentElement.classList.remove('dark')");
  await send("Page.navigate", { url:"http://localhost:3007/admin/projects" });await delay(3000);
  await send("Emulation.setDeviceMetricsOverride", { width:1366,height:900,deviceScaleFactor:1,mobile:false });await delay(700);
  await screenshot("admin");
  console.log("admin", (await evaluate("JSON.stringify({selection:document.body.innerText.includes('Featured work'),rankControls:document.querySelectorAll('input[max=\"9999\"]').length})")).result.value);
  await send("Page.navigate",{url:"http://localhost:3007/admin/chat-review"});await delay(1000);
  assert.equal((await evaluate("document.body.innerText.includes('Prompt review') && document.body.innerText.includes('React')")).result.value,true);
  await evaluate("Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Mark reviewed')?.click()");await delay(200);
  assert.equal((await evaluate("document.body.innerText.includes('reviewed')")).result.value,true);
  await screenshot("prompt-review");
  await send("Page.navigate",{url:"http://localhost:3007/admin/projects"});await delay(1000);
  // Toggle a local fixture only; Fetch interception prevents any server mutation.
  await evaluate("document.querySelector('fieldset input[type=checkbox]')?.click()");
  await evaluate("(()=>{const e=document.querySelector('fieldset input[type=number]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'8');e.dispatchEvent(new Event('input',{bubbles:true}));})()");
  await evaluate("Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Save featured work')?.click()");await delay(500);
  console.log("mocked admin writes",writes.map(item=>({id:item.id,featured:item.featured,featuredOrder:item.featuredOrder})));
  assert.equal(writes.length,1);assert.equal(writes[0].featured,false);assert.equal(writes[0].featuredOrder,8);
} finally {
  await send("Fetch.disable");
  socket.close();
}
