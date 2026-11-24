// Key scenarios of the homepage (Playwright from ~/.veon/tools, Chrome of the computer; nothing installed in the project).
// Usage: node tests/e2e.mjs http://localhost:4321/ [screenshot-dir]
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const tools = path.join(os.homedir(), ".veon", "tools");
const require = createRequire(path.join(tools, "package.json"));
const { chromium } = require("playwright");
let executablePath;
try { executablePath = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".veon", "env.json"), "utf8")).chrome_path; } catch { /* Playwright Chromium */ }

const url = process.argv[2] || "http://localhost:4321/";
const out = process.argv[3];
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const res = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"} ${name} ${extra}`.trim());

for (const w of [320, 375, 390, 768, 1024, 1280, 1440, 1920]) {
  const p = await browser.newPage({ viewport: { width: w, height: 800 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  ok(`no horizontal scroll @${w}`, sw[0] <= sw[1], JSON.stringify(sw));
  const over = await p.evaluate(() => {
    const W = document.documentElement.clientWidth;
    return [...document.querySelectorAll("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return r.width && cs.visibility !== "hidden" && cs.position !== "fixed" && (r.right > W + 1 || r.left < -1)
          && !e.closest("[hidden]") && !e.closest(".future-link__note") && !e.closest(".skip-link")
          && !e.closest(".visually-hidden") && !e.closest(".mobile-menu") && !e.closest(".hero__price-pre");
      })
      .slice(0, 5)
      .map((e) => `${e.tagName}.${e.className} ${Math.round(e.getBoundingClientRect().right)}`);
  });
  ok(`nothing past the edge @${w}`, over.length === 0, over.join(" | "));
  ok(`no JS errors @${w}`, errs.length === 0, errs.join(";"));

  if (w === 390) {
    const call = await p.locator(".hero .btn--hero").boundingBox();
    ok("390: «Подзвонити» in the first screen at 667", !!call && call.y + call.height <= 667, JSON.stringify(call));
    const price = await p.locator(".hero__price").boundingBox();
    ok("390: price in the first screen at 667", !!price && price.y + price.height <= 667);
    ok("390: call is tel:", (await p.locator(".hero .btn--hero").getAttribute("href")) === "tel:+380983466428");
    await p.click("[data-menu-toggle]");
    ok("menu opens", await p.locator("#mobile-menu").isVisible());
    await p.click('#mobile-menu a[href="#ciny"]');
    await p.waitForTimeout(1500);
    ok("menu closes on anchor", !(await p.locator("#mobile-menu").isVisible()));
    const land = async (id) => p.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
    const near = (t) => t >= 40 && t <= 80;
    let t = await land("ciny");
    ok("menu «Ціни» scrolls to #ciny", near(t), `top=${t} hash=${new URL(p.url()).hash}`);
    for (const id of ["sytuacii", "umovy", "komanda", "kontakty"]) {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(300);
      await p.click("[data-menu-toggle]");
      await p.click(`#mobile-menu a[href="#${id}"]`);
      await p.waitForTimeout(1500);
      t = await land(id);
      ok(`menu «${id}» scrolls to target`, near(t), `top=${t}`);
    }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(300);
    await p.click('.hero a[href="#ciny"]');
    await p.waitForTimeout(1500);
    t = await land("ciny");
    ok("«Усі ціни» scrolls to #ciny", near(t), `top=${t}`);
    ok("bottom bar shown after the first screen", await p.locator("[data-bottom-bar]").evaluate((e) => e.classList.contains("is-shown")));
    await p.locator("[data-bottom-bar] summary").click();
    ok("bottom bar «Написати» opens messengers", await p.locator("[data-bottom-bar] .write__list").isVisible());
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(500);
    ok("bottom bar hidden on the first screen", !(await p.locator("[data-bottom-bar]").evaluate((e) => e.classList.contains("is-shown"))));
    const b2 = p.locator("[data-sit]").nth(1);
    await b2.scrollIntoViewIfNeeded();
    await b2.click();
    ok("accordion opens the 2nd and closes the 1st", (await b2.getAttribute("aria-expanded")) === "true" && (await p.locator("[data-sit]").nth(0).getAttribute("aria-expanded")) === "false");
    await b2.click();
    ok("accordion closes again", (await b2.getAttribute("aria-expanded")) === "false");
  }

  if (w === 1440) {
    await p.locator("#tab-care").click();
    ok("price tabs switch", (await p.locator("#price-care").isVisible()) && !(await p.locator("#price-stay").isVisible()));
    await p.keyboard.press("ArrowRight");
    ok("price tabs: arrow key", (await p.locator("#tab-out").getAttribute("aria-selected")) === "true");
    const ink = await p.locator(".tabs__ink").evaluate((e) => e.style.transform);
    ok("tab indicator moves", /translateX\(\d+/.test(ink), ink);
    await p.locator("[data-sit]").nth(4).click();
    ok("situations: 5th shown, 1st hidden", (await p.locator("#sit-doglyad-panel").isVisible()) && !(await p.locator("#sit-insult-panel").isVisible()));
    await p.locator("[data-sit]").nth(4).click();
    ok("situations: one panel stays open", await p.locator("#sit-doglyad-panel").isVisible());
    await p.locator(".site-header__write summary").click();
    ok("«Написати» opens messengers", await p.locator(".site-header__write .write__list").isVisible());
    const hrefs = await p.locator(".site-header__write .write__item").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    ok("messenger links", hrefs.length === 3, hrefs.join(" "));
    await p.keyboard.press("Escape");
    ok("Escape closes «Написати»", !(await p.locator(".site-header__write .write__list").isVisible()));
    await p.locator(".site-header .future-link").first().focus();
    await p.waitForTimeout(300);
    ok("FutureLink note on focus", (await p.locator(".site-header .future-link__note").first().evaluate((e) => getComputedStyle(e).opacity)) === "1");
    const h1 = await p.evaluate(() => [...document.querySelectorAll("h1")].map((h) => h.textContent));
    ok("one H1, exact text", h1.length === 1 && h1[0].replace(/\s+/g, " ").trim() === "Реабілітаційний центр з проживанням в Одесі", JSON.stringify(h1));
    const ids = await p.evaluate(() => ["top", "sytuacii", "ciny", "umovy", "komanda", "kontakty"].map((i) => (document.getElementById(i)?.getBoundingClientRect().top ?? -1e9) + window.scrollY));
    ok("sections in concept order", ids.every((v, i) => v >= 0 && (i === 0 || v > ids[i - 1])), ids.join(","));
    const links = await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
    ok("no links to the current client site", !links.some((h) => /djerelo\.life/.test(h) && !h.startsWith("mailto:")));
    ok("no empty links", !links.some((h) => h === "" || h === "#"));
    const heroImg = await p.locator(".hero__media img").evaluate((i) => i.getAttribute("fetchpriority"));
    ok("hero image fetchpriority=high", heroImg === "high");
    const lazy = await p.evaluate(() => [...document.querySelectorAll("main img")].slice(1).every((i) => i.loading === "lazy" && i.getAttribute("width") && i.getAttribute("height")));
    ok("other images lazy with width/height", lazy);
    await p.click('.site-nav a[href="#ciny"]');
    await p.waitForTimeout(1500);
    const tc = await p.locator("#ciny").evaluate((e) => Math.round(e.getBoundingClientRect().top));
    ok("desktop anchor «Ціни» lands under the header", tc >= 60 && tc <= 80, String(tc));
    await p.click('.site-nav a[href="#kontakty"]');
    await p.waitForTimeout(1200);
    const top = await p.locator("#kontakty").evaluate((e) => Math.round(e.getBoundingClientRect().top));
    ok("anchor lands under the sticky header", top >= 60 && top <= 80, String(top));
    if (out) await p.screenshot({ path: path.join(out, "e2e-1440-kontakty.png") });
  }
  await p.close();
}

const rm = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 800 } });
const p = await rm.newPage();
await p.goto(url, { waitUntil: "networkidle" });
ok("reduced motion: hero photo still", (await p.locator(".hero__media img").evaluate((i) => getComputedStyle(i).animationName)) === "none");
ok("reduced motion: photos in place", await p.evaluate(() => [...document.querySelectorAll("[data-reveal]")].every((e) => getComputedStyle(e).opacity === "1" && getComputedStyle(e).transform === "none")));

const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 800 } });
const q = await nojs.newPage();
await q.goto(url, { waitUntil: "networkidle" });
ok("no JS: situations, prices and photos visible", await q.evaluate(() => [...document.querySelectorAll(".sit__panel, .price-panel, [data-reveal]")].every((e) => e.offsetParent !== null && getComputedStyle(e).opacity === "1")));

await browser.close();
console.log(res.join("\n"));
const failed = res.filter((r) => r.startsWith("FAIL")).length;
console.log(failed ? `E2E: FAIL (${failed})` : `E2E: PASS (${res.length} checks)`);
process.exit(failed ? 1 : 0);
