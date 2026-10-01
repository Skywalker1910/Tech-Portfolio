// Visual smoke check using an isolated Edge CDP session and local fixtures.
// Intercept every local API request: this check never writes production analytics.
import { writeFile } from "node:fs/promises";
import { DEFAULT_PROJECTS, DEFAULT_EXPERIENCE } from "../lib/content/defaults.ts";

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
    const body = url.endsWith("/content/projects") ? { projects: DEFAULT_PROJECTS }
      : url.endsWith("/content/experience") ? { experience: DEFAULT_EXPERIENCE } : {};
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
  await evaluate("Array.from(document.querySelectorAll('h3')).find(e=>e.textContent.includes('Movie Recommendation Engine'))?.closest('article')?.click()");
  await delay(900);
  await screenshot("details");
  console.log("details", (await evaluate("JSON.stringify({methodology:document.body.innerText.includes('Evaluation'),ranking:document.body.innerText.includes('NDCG')})")).result.value);
} finally {
  await send("Fetch.disable");
  socket.close();
}
