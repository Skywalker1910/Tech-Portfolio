// Visual smoke check using an isolated Edge CDP session and local fixtures.
// Intercept every local API request: this check never writes production analytics.
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { DEFAULT_PROJECTS, DEFAULT_EXPERIENCE } from "../lib/content/defaults.ts";
import { withProjectPresentation } from "../lib/project-presentation.ts";

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
