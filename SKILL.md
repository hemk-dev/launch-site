---
name: launch-site
description: Build fast, mobile-first, SEO-ready websites for small and local businesses (spa, salon, interior designer, architect, clinic, café, restaurant, hotel, studio, trades, boutique, coach) with a brand-fitted design system, strong typography, honest copy, micro-interactions and tasteful scroll animation. Use when the user asks to create, design, rebuild, redesign or improve a website, landing page, one-page site, homepage, portfolio or business site, even if they only name the business ("a site for my spa"), or ask for something "minimal", "animated", "with scroll effects", "SEO friendly", "fast on mobile" or "premium". Also use it to audit an existing small-business site for design, motion, copy, SEO, performance or accessibility.
---

# Launch Site

Build a site that looks made for this business, reads in its voice, loads fast on a phone and ranks for its town. The order never changes: **brief → stack → brand tokens → content as data → page from components → copy and pictures → motion by tier → SEO, performance, accessibility → verify → report.** Settling tokens, content shape and the motion tier before building pages is what keeps the result consistent and cheap to change.

Three ideas run through every step:

- **Calm by default, one peak.** Every page gets the micro-interaction layer and a CSS hero entrance; motion beyond that is chosen by tier (calm, balanced, expressive), and a balanced page has exactly one scroll moment.
- **Nothing invented.** Names, address, phone, prices, years, reviews and numbers come from the brief or are left as visible `{{TOKENS}}` that the lint fails on.
- **Readable without any script.** Content, menu, forms and every moment's finished still work with JavaScript off and with reduced motion.

## Files

| File | Read or use when |
|---|---|
| `references/brief-and-planning.md` | Step 1: the brief, scope, page journey, feeling curve, choosing the motion tier |
| `references/verticals.md` | Steps 1–3: sections, CTAs, schema types, motion tier, scroll moment and palette key per vertical |
| `references/stacks.md` | Step 2: stack choice, folder structure, where the assets go, forms on static sites |
| `references/design-system.md` | Step 3: brand to tokens, colour, type, layout, components, the refuse list |
| `references/content-model.md` | Step 4: `site.config`, collections, pages as section blocks |
| `references/catalogue.md` | Only for a business with a product range (catalogue, RFQ, datasheets) |
| `references/copy.md` | Step 5: voice, lengths, facts, copy tells, `copy-lint` |
| `references/media.md` | Step 5: photographs (client first, credited stand-ins), sizing, alt text, video, icons |
| `references/motion.md` | Step 6: tiers, every motion value, hero entrance, reveals, smooth scrolling, the never-list |
| `references/scroll-engine.md` | Step 6, balanced or expressive: the engine, its devices, six recipes, scroll verification |
| `references/hero-depth.md` | Step 6, only for the `layered-hero` moment |
| `references/seo.md` | Step 7: metadata, JSON-LD, sitemap, local SEO |
| `references/performance.md` | Step 7: budgets, motion cost, fonts, `perf.mjs`, Lighthouse |
| `references/quality-checklist.md` | Step 8: the gate before calling it done |
| `assets/tokens.css` | Design tokens; only the BRAND block is replaced per client |
| `assets/base.css`, `assets/motion.css` | Reset, type, layout, components; the interaction layer and hero entrance |
| `assets/site.js` | The one content script: phone menu, reveals, layered-hero swap, action bar, forms |
| `assets/starter.html` | Complete one-page template (every client fact a `{{TOKEN}}`); also the reference anatomy for framework builds |
| `assets/site.config.example.json` | Shape of the site config (a day spa example) |
| `assets/scroll/scrollcraft.js`, `.css` | Scroll engine and device styles, only on pages with a moment |
| `library/palettes.json`, `library/type.json` | Palette and type library read by `brand.mjs` |

| Script | Does | Needs |
|---|---|---|
| `scripts/brand.mjs` | Deals palette + type for a trade, or fits the client's colours; prints the BRAND block | Node 18+ |
| `scripts/contrast.py` | WCAG contrast of every token pair, light and dark | Python 3 |
| `scripts/copy-lint.mjs` | Counts copy tells and leftover tokens in built pages | Node 22+ |
| `scripts/audit_site.py` | SEO and accessibility audit of the built HTML, links, SVGs | Python 3 |
| `scripts/perf.mjs` | Performance budget at 1440 and 390 | Node 22+, installed Chrome |
| `scripts/screenshots.mjs` | Responsive, cross-browser screenshots, overflow and console check | `npm i -D playwright` |
| `scripts/serve.mjs` | Local static server for scroll verification | Node 18+ |
| `scripts/scroll-shoot.mjs` | Shoots the scroll of each act into contact sheets | `npm i -D playwright-core`, installed Chrome |
| `scripts/encode-scrub.sh` | Encodes a clip for scroll scrubbing | bash, ffmpeg |

`<skill>` below is this folder. Copy the checks into the project (`stacks.md` §2) so they keep working without it.

## Step 1: Brief

Read `brief-and-planning.md`. Infer what you can from the request and any existing site or repo; ask one round of at most four questions, only about what changes the build (usually: the main action, real photographs, contact facts, existing brand). With almost nothing given, take defaults from `verticals.md`, list the assumptions and proceed.

Fix in the brief: business, audience and town; the one primary action (book, call, visit, enquire); pages; brand assets; the facts that may be printed; the **motion tier** and, if balanced or expressive, the **scroll moment** (first choice from `verticals.md`, the one the photographs can carry). Build what was asked plus the essentials (404, privacy, contact, SEO files); list everything else under "Possible additions". Write it to `docs/BRIEF.md`.

## Step 2: Stack

Follow `stacks.md`: an existing project's stack first; otherwise **Astro** (static, content collections) for multi-page sites and `assets/starter.html` for a one-page site. Next.js when the project already uses it or needs app features. Check the current stable version and scaffold with the official CLI; pin the runtime.

## Step 3: Brand and tokens

Follow `design-system.md` §1:

```bash
node <skill>/scripts/brand.mjs deal --trade spa                       # no brand yet: three palette + type deals
node <skill>/scripts/brand.mjs brand --bg '#f6f1ea' --ink '#2b2420' --accent '#8a5a3c' --type fraunces   # client colours
python3 <skill>/scripts/contrast.py src/styles/tokens.css             # must print 0 below minimum
```

Paste the printed block between `BRAND:START` and `BRAND:END` in `tokens.css`; tell the client if a brand colour was darkened for text. Two font families at most, self-hosted. Dark mode only when asked (`data-theme`), otherwise delete the two dark blocks.

## Step 4: Content as data

Follow `content-model.md` with `site.config.example.json` as the shape: identity, contact, hours, nav, theme, features and integrations in one config; services, team, projects, testimonials and FAQs as typed collections; pages as lists of section blocks. No sentence a client might change lives in a component.

## Step 5: Build the page, write the copy, place the pictures

- Build from `base.css` components, mobile-first, semantic landmarks, one h1. `starter.html` is the anatomy of a small-business home page: header with one action → hero (the first screen) → services with prices → about split → the scroll moment → gallery rail → real testimonials → FAQ → visit (address, phone, hours, directions, form) → closing band → footer → phone action bar.
- Write every word per `copy.md`: plain, specific, the client's facts only, contact details exactly as given. Run `copy-lint` on the build.
- Pictures per `media.md`: the client's own first; licensed stand-ins credited in one footer line and listed in the report; AVIF/WebP at 2× with sizes; the hero eager and preloaded.
- Forms post to a real endpoint (or are clearly stubbed and reported); success shows only after the server says so.

## Step 6: Motion by tier

Follow `motion.md`:

1. **Every site**: the micro layer from `motion.css` (buttons, links, nav, cards, photos, fields, menu) and the CSS hero entrance (`data-enter`, `data-enter-media`).
2. **Reveals** where they help: `data-sc-in` on one group per section, never the hero or a whole grid.
3. **Balanced**: one scroll moment from `scroll-engine.md` (or `layered-hero` from `hero-depth.md`), each in its own section with its finished still. **Expressive**: up to two, scrub video and one kind of pointer effect allowed.
4. Load `scrollcraft.min.js` + `scrollcraft.css` only on pages with an engine moment, before `site.js`.

## Step 7: SEO, performance, accessibility

Built in, not bolted on: `seo.md` (unique titles and descriptions, canonical, OG, `LocalBusiness` JSON-LD from the config, sitemap, robots, local SEO), `performance.md` (LCP < 2.5 s, INP < 200 ms, CLS < 0.1; Lighthouse mobile ≥ 95), WCAG 2.2 AA (keyboard, focus, contrast, labels, reduced motion), security headers for the host.

## Step 8: Verify

Build, then run the checks and **look at the result**:

```bash
python3 <skill>/scripts/audit_site.py dist
python3 <skill>/scripts/contrast.py src/styles/tokens.css
node <skill>/scripts/copy-lint.mjs dist
node <skill>/scripts/perf.mjs dist --root dist
THEMES=light FULL=1 node <skill>/scripts/screenshots.mjs http://localhost:4321 ./screenshots / /services/ /contact/
```

On pages with a moment, also `serve.mjs` + `scroll-shoot.mjs` at desktop, phone and reduced motion (`scroll-engine.md` §4). Open the screenshots and contact sheets: audits pass on pages with empty frames, clipped copy or an unreadable moment. Walk `quality-checklist.md`. On Windows PowerShell set env vars with `$env:THEMES='light'` and use `python` or `py`.

## Step 9: Report

Tell the user what was built (pages, stack, tier and moment), the brand decisions (palette, type, any colour adjusted), the check results (audit, contrast, copy-lint, perf, Lighthouse if run), what could not be verified, every `{{TOKEN}}` and stand-in photograph still to replace, and "Possible additions". Leave a README (setup, structure, editing content, changing the brand with `brand.mjs`, deployment), `.env.example` and `docs/BRIEF.md`.

## Hard rules

- No invented facts: contacts exactly as given; no made-up reviews, years, counts, awards or logos; testimonials and figures only when real.
- One primary action per page, visible in the first screen and repeated at the end; phones get the action bar.
- Tokens only in components; the BRAND block from `brand.mjs`; `contrast.py` at 0 failures in every shipped theme.
- Hero: the first screen, CSS entrance only, LCP image never hidden, lazy or animated in from opacity 0.
- Motion moves `transform` and `opacity` only, respects reduced motion, and leaves every word readable without script. No autoplay carousels, scroll-jacking, popups or loaders; no smooth-scroll or animation library unless an expressive brief asks for it (`motion.md` §7).
- Scroll moments: calm 0, balanced 1, expressive 2 at most; each with a finished still.
- No icon-card grid as page structure, no eyebrow over every heading, no gradient text or decorative glass, no em dashes in visible copy.
- Mobile-first: no horizontal scroll at 320 px, targets ≥ 44 px, readable type ≥ 16 px body.
- Budgets: images within `media.md`, own JS ≤ 30 KB gzip, two font families, `perf.mjs` with no FAIL.
- Never report a check as passed that was not run.
