#!/usr/bin/env node
/**
 * Responsive, cross-browser screenshots + overflow/console check with real device emulation.
 *
 * Usage (from the project directory, with the site served locally):
 *   npm i -D playwright            # once; `npx playwright install chromium firefox webkit` for all engines
 *   node <skill-dir>/scripts/screenshots.mjs http://localhost:4321 ./screenshots / /about/ /products/
 *
 * Options (env vars):
 *   BROWSERS=chromium,firefox,webkit  engines to run (default chromium; webkit ≈ Safari, firefox = Gecko)
 *   WIDTHS=320,390,768,1024,1440      viewport widths
 *   THEMES=light,dark                 color schemes to capture
 *   FULL=1                            full-page captures for visual review (scrolls first so
 *                                     scroll-revealed sections are painted). Default: first 2400px.
 *   EXPECT_404=/no-such-page/         paths that are supposed to return 404 (not reported)
 *
 * Exits 1 if any page overflows horizontally, logs console/page errors, or a request fails.
 * Screenshots catch what automated checks can't (blank illustrations, truncated copy, broken
 * layout) — look at them, at least one per template, in both themes.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Resolve playwright from the project being tested, not from the skill folder.
const require = createRequire(join(process.cwd(), "noop.js"));
let pw;
try {
  pw = require("playwright");
} catch {
  console.error("playwright not found in this project. Run: npm i -D playwright");
  process.exit(2);
}

const [base, outDir = "screenshots", ...paths] = process.argv.slice(2);
if (!base) {
  console.error("usage: node screenshots.mjs <base-url> [out-dir] [paths...]");
  process.exit(2);
}
const pages = paths.length ? paths : ["/"];
const browsers = (process.env.BROWSERS || "chromium").split(",");
const widths = (process.env.WIDTHS || "320,390,768,1024,1440").split(",").map(Number);
const themes = (process.env.THEMES || "light,dark").split(",");
const full = process.env.FULL === "1";
const expect404 = new Set((process.env.EXPECT_404 || "").split(",").filter(Boolean));

// Prefer Playwright's own Chromium; fall back to an installed Chrome when its build isn't downloaded.
const systemChrome = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].find(existsSync);

async function launch(name) {
  try {
    return await pw[name].launch();
  } catch (err) {
    if (name === "chromium" && systemChrome) return pw.chromium.launch({ executablePath: systemChrome });
    console.log(`  ! ${name}: not available (${String(err).split("\n")[0]}). Run: npx playwright install ${name}`);
    return null;
  }
}

mkdirSync(outDir, { recursive: true });
const problems = [];
const notes = new Set();
let shots = 0;
for (const name of browsers) {
  const browser = await launch(name);
  if (!browser) continue;
  for (const theme of themes) {
    for (const width of widths) {
      const mobile = width < 768;
      const ctx = await browser.newContext({
        viewport: { width, height: mobile ? 844 : 900 },
        colorScheme: theme,
        // Firefox has no mobile emulation; it still lays out at the given width.
        ...(name === "firefox" ? {} : { deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }),
      });
      const page = await ctx.newPage();
      let errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));
      page.on("response", (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()}: ${r.url()}`));
      for (const p of pages) {
        errors = [];
        const res = await page.goto(new URL(p, base).href, { waitUntil: "networkidle" });
        if (expect404.has(p)) {
          errors = errors.filter((e) => !/HTTP 404|404 \(Not Found\)/.test(e));
          if (res && res.status() !== 404) errors.push(`expected 404, got ${res.status()}`);
        }
        if (full) {
          // Scroll through so IntersectionObserver reveals fire, then return to the top.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
              // "instant": with CSS scroll-behavior:smooth, queued smooth scrolls cancel each other
              scrollTo({ top: y, behavior: "instant" });
              await new Promise((r) => setTimeout(r, 120));
            }
            scrollTo({ top: 0, behavior: "instant" });
          });
        }
        // Let entrance animations settle so the shot shows the resting state.
        await page.waitForTimeout(600);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        // Record findings before capturing: Playwright injects a stylesheet while screenshotting,
        // which a strict CSP rightly blocks (and WebKit logs) — that error is not the site's.
        if (overflow > 0) problems.push(`[${name}] ${p} @${width}px ${theme}: horizontal overflow ${overflow}px`);
        for (const e of errors) {
          // WebKit logs this for its own <select> internals under a strict style-src CSP; the page's CSS is unaffected.
          if (name === "webkit" && /Refused to apply a stylesheet/.test(e)) notes.add(`[webkit] ${p}: ${e.slice(0, 60)}… (WebKit <select> + strict CSP quirk; harmless)`);
          else problems.push(`[${name}] ${p} @${width}px ${theme}: ${e}`);
        }
        const slug = p.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home";
        const height = await page.evaluate(() => document.body.scrollHeight);
        await page.screenshot({
          path: join(outDir, `${slug}-${width}-${theme}${browsers.length > 1 ? `-${name}` : ""}.png`),
          fullPage: full,
          clip: full ? undefined : { x: 0, y: 0, width, height: Math.min(2400, height) },
        });
        shots++;
      }
      await ctx.close();
    }
  }
  await browser.close();
}

console.log(`Captured ${shots} screenshot(s) → ${outDir}`);
for (const n of notes) console.log(`  · ${n}`);
if (problems.length) {
  console.log(problems.map((x) => `  ✗ ${x}`).join("\n"));
  process.exit(1);
}
console.log("  ✓ no horizontal overflow, console errors or failed requests");
