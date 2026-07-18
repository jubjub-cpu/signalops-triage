import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url);
const port = Number(process.env.SIGNALOPS_TEST_PORT || 4191);
const deployed = process.env.SIGNALOPS_BASE_URL?.trim();
const base = deployed ? `${deployed.replace(/\/$/, "")}/` : `http://127.0.0.1:${port}/`;
const target = process.env.PLAYWRIGHT_MODULE || "playwright";
const specifier = /^[A-Za-z]:[\\/]/.test(target) ? pathToFileURL(target).href : target;
const { chromium } = await import(specifier);
const desktopShot = fileURLToPath(new URL("../docs/screenshots/signalops-approved-workflow.png", import.meta.url));
const mobileShot = fileURLToPath(new URL("../docs/screenshots/signalops-mobile-workflow.png", import.meta.url));
const server = deployed ? null : spawn(process.execPath, ["tools/static-server.mjs", "--port", String(port)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"]
});

async function ready() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("SignalOps server did not start");
}

let browser;
try {
  await ready();
  browser = await chromium.launch({ headless: true });

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  const errors = [];
  const failed = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => failed.push(request.url()));
  await page.goto(base, { waitUntil: "networkidle" });

  assert.equal(await page.locator("[data-id]").count(), 3);
  assert.match(await page.locator(".severity").innerText(), /high/i);
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("skip-link")), true);
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => location.hash), "#main");

  await page.locator('[data-id="KSK-118"]').click();
  assert.equal(await page.locator('[data-id="KSK-118"]').getAttribute("aria-pressed"), "true");
  assert.match(await page.locator("#incident-text").inputValue(), /clinic check-in kiosk/i);
  await page.locator("#classify").click();
  assert.match(await page.getByRole("heading", { name: "Classification", exact: true }).locator("..").innerText(), /software stability/i);
  assert.match(await page.getByRole("heading", { name: "Repeated-Failure Signal", exact: true }).locator("..").innerText(), /watch triggered/i);
  assert.match(await page.locator(".audit-list").innerText(), /classification run completed/i);

  await page.locator("#approve").click();
  assert.match(await page.locator(".audit-list").innerText(), /approved by human reviewer/i);
  await page.locator("#reject").click();
  assert.match(await page.locator(".audit-list").innerText(), /returned for more context/i);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: desktopShot, fullPage: true });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(base, { waitUntil: "networkidle" });
  await mobilePage.locator('[data-id="LKR-77"]').click();
  await mobilePage.locator("#classify").click();
  await mobilePage.locator("#reject").click();
  assert.match(await mobilePage.locator(".audit-list").innerText(), /returned for more context/i);
  assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  await mobilePage.evaluate(() => document.activeElement?.blur());
  await mobilePage.screenshot({ path: mobileShot, fullPage: true });
  await mobile.close();

  console.log("SIGNALOPS BROWSER TESTS PASSED");
  console.log(JSON.stringify({
    target: deployed ? "deployed" : "local",
    incidents: 3,
    classification: true,
    recurrence: true,
    humanApproval: true,
    humanReturn: true,
    keyboard: true,
    desktopOverflow: false,
    mobileOverflow: false,
    consoleErrors: errors.length,
    failedRequests: failed.length
  }));
} finally {
  if (browser) await browser.close();
  if (server) server.kill();
}
