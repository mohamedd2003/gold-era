import fs from "node:fs";
import path from "node:path";

const outDir = process.env.TEMP + "\\gold-era-theme";

const list = await (await fetch("http://127.0.0.1:9333/json/list")).json();
const page = list.find((t) => t.type === "page") ?? list[0];
if (!page) throw new Error("No CDP page");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});

let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
});

function send(method, params = {}) {
  const nextId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(nextId, { resolve, reject });
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false,
});

async function screenshot(name) {
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  fs.writeFileSync(path.join(outDir, name), Buffer.from(data, "base64"));
  console.log("wrote", name);
}

async function goto(url) {
  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 800));
  await send("Runtime.evaluate", {
    expression: `localStorage.removeItem('theme')`,
  });
  await send("Page.reload");
  await new Promise((r) => setTimeout(r, 2200));
}

async function setScheme(value) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value }],
  });
}

async function clickToggle() {
  await send("Runtime.evaluate", {
    expression: `document.querySelector('button[aria-label*="mode"]')?.click()`,
  });
  await new Promise((r) => setTimeout(r, 500));
}

async function scrollTo(sel) {
  await send("Runtime.evaluate", {
    expression: `document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({block:'start'})`,
  });
  await new Promise((r) => setTimeout(r, 500));
}

await setScheme("dark");
await goto("http://localhost:3000/");
await screenshot("v-home-dark.png");
await scrollTo("#features");
await screenshot("v-features-dark.png");
await scrollTo("#solutions");
await screenshot("v-solutions-dark.png");
await scrollTo("#pricing");
await screenshot("v-pricing-dark.png");
await send("Runtime.evaluate", {
  expression: `window.scrollTo(0, document.body.scrollHeight)`,
});
await new Promise((r) => setTimeout(r, 500));
await screenshot("v-footer-dark.png");

await goto("http://localhost:3000/login");
await screenshot("v-login-dark.png");
await goto("http://localhost:3000/register");
await screenshot("v-register-dark.png");

await setScheme("light");
await goto("http://localhost:3000/");
await clickToggle();
await screenshot("v-home-light.png");
await goto("http://localhost:3000/login");
await screenshot("v-login-light.png");

ws.close();
process.exit(0);
