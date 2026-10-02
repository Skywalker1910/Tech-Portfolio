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
    const body = url.endsWith("/admin/content/projects") ? fixtures.map(withProjectPresentation)
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
  await evaluate("Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Mandatory only')?.click()");
  await evaluate("Array.from(document.querySelectorAll('h2')).find(e=>e.textContent.includes('Featured Projects'))?.scrollIntoView()");
  await delay(1000);
  console.log("desktop", (await evaluate("JSON.stringify({overflow:document.documentElement.scrollWidth>innerWidth,previews:Array.from(document.querySelectorAll('img[src*=\"project-previews\"]')).map(e=>({loaded:e.complete&&e.naturalWidth>0,alt:e.alt}))})")).result.value);
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
  const cards=JSON.parse((await evaluate("JSON.stringify({heights:Array.from(document.querySelectorAll('article')).filter(e=>e.textContent.includes('Explore project details')).map(e=>Math.round(e.getBoundingClientRect().height)),expandedEvidenceVisible:document.body.innerText.includes('NDCG'),newNames:document.body.innerText.includes('BB8 Co-Pilot x Tech Portfolio')&&document.body.innerText.includes('Movie Recommendation Engine'),concepts:document.body.textContent.includes('Concept illustration')})")).result.value);
  console.log("cards",cards);assert.equal(cards.heights.length,12);assert.ok(cards.heights.every(height=>height===560));assert.equal(cards.expandedEvidenceVisible,false);assert.equal(cards.newNames,true);assert.equal(cards.concepts,true);
  await screenshot("gallery");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(700);await screenshot("gallery-mobile");
  await evaluate("Array.from(document.querySelectorAll('h3')).find(e=>e.textContent.includes('Movie Recommendation Engine'))?.closest('article')?.click()");
  await delay(900);
  await screenshot("details");
  console.log("details", (await evaluate("JSON.stringify({methodology:document.body.innerText.includes('Evaluation'),ranking:document.body.innerText.includes('NDCG')})")).result.value);
  for(const width of [1366,390]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:844,deviceScaleFactor:1,mobile:width===390});await delay(500);
    const start=JSON.parse((await evaluate("(()=>{const e=document.querySelector('[data-project-overlay]');const d=e.querySelector('[role=dialog]');return JSON.stringify({scrollable:e.scrollHeight>e.clientHeight,width:d.getBoundingClientRect().width,overflow:d.getBoundingClientRect().right>innerWidth});})()")).result.value);
    assert.equal(start.scrollable,true);assert.equal(start.overflow,false);if(width===1366)assert.ok(start.width>=1000);
    await evaluate("(()=>{const e=document.querySelector('[data-project-overlay]');e.scrollTop=e.scrollHeight;})()");await delay(200);
    const bottom=JSON.parse((await evaluate("(()=>{const e=document.querySelector('[data-project-overlay]');const links=e.querySelectorAll('a');const last=links[links.length-1].getBoundingClientRect();const close=e.querySelector('button[aria-label=\"Close project details\"]').getBoundingClientRect();return JSON.stringify({lastActionVisible:last.top>=0&&last.bottom<=innerHeight,closeVisible:close.top>=0&&close.bottom<=innerHeight,scroll:e.scrollTop});})()")).result.value);
    console.log("expanded overlay",{viewport:width,...start,...bottom});assert.equal(bottom.lastActionVisible,true);assert.equal(bottom.closeVisible,true);await screenshot(`details-bottom-${width}`);
  }
  await evaluate("document.querySelector('button[aria-label=\"Close project details\"]')?.click()");await delay(400);
  assert.equal((await evaluate("document.body.style.overflow==='hidden'")).result.value,false);
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
