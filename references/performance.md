# Performance

A small-business site is visited on a phone, often on mobile data, by someone deciding whether to call. It must be fast before it is anything else. Every motion and every picture spends from these budgets.

## 1. Budgets (mobile, mid-range phone, 4G)

| Metric | Target |
|---|---|
| LCP | < 2.5 s (aim < 1.8 s) |
| INP | < 200 ms |
| CLS | < 0.1 |
| TTFB | < 0.8 s (static/CDN: < 0.2 s) |
| Own JS (gzip) | content page: `site.js` ≈ 1.2 KB; with the minified engine ≈ 9 KB; Next.js adds its runtime (~100 KB), keep own client code ≤ 30 KB |
| CSS (gzip) | ≤ 50 KB total; `tokens + base + motion` is ≈ 9 KB |
| Fonts | ≤ 2 families, ≤ 4 files, ≤ 160 KiB |
| Images | hero ≤ 400 KiB, any other ≤ 250 KiB, page ≤ 1,200 KiB at 1440 (`media.md`) |
| Total page weight (home) | ≲ 1 MB on a calm or balanced page (a scrub clip is fetched separately, only when needed) |
| Lighthouse (mobile) | ≥ 95 Performance, 100 Accessibility, Best Practices and SEO where achievable |

## 2. Rendering

- Static generation first (Astro by default, `stacks.md`), then ISR or edge caching; SSR only where data is per-request.
- Ship HTML, not JavaScript: Astro components without `client:*`, Next.js server components. The site's interactivity is `site.js` (menu, reveals, action bar, forms) and, on a page with a moment, the engine. Nothing else needs hydrating.
- Third-party widgets (booking, chat, reviews, maps) behind a facade or loaded on interaction; each needs a reason in the report.

## 3. What motion may cost

- Animate only `transform` and `opacity` (plus colours on hover, `clip-path` and `filter` inside a moment). No layout properties (`motion.md` §2).
- The hero entrance is CSS and starts at first paint; it never hides the LCP image and never waits for script.
- Reveals use one IntersectionObserver; the engine uses one rAF loop that sleeps when nothing is live.
- `will-change` comes from `scrollcraft.css` on the elements the engine moves; never add it page-wide.
- A scroll moment's assets (photographs, planes, a clip) load lazily and never compete with the hero.
- **Engine minification**: `scrollcraft.js` is ~62 KB of commented source (19 KB gzip); minified it is ~21 KB (7.5 KB gzip). Astro and Next minify it when it is imported into the build; a file served as-is from `public/` is not minified, so ship `scrollcraft.min.js` there (`npx esbuild assets/scroll/scrollcraft.js --minify --outfile=scrollcraft.min.js`). Load it only on pages with a moment.
- No smooth-scroll library, animation library (GSAP, Framer Motion, AOS) or Lottie by default; CSS and the engine cover every recipe.

## 4. Images

`media.md` §3–4: AVIF/WebP via `srcset` at 2× the shown width, explicit `width`/`height`, hero eager with `fetchpriority="high"` and preloaded, everything else `loading="lazy" decoding="async"`, no CSS-background photographs below the fold.

## 5. Fonts

- Self-host woff2 through the framework (Astro Fonts API, `next/font`) or Fontsource (`brand.mjs css` prints the package name). Google Fonts' CDN only for a one-page `starter.html` build, with `preconnect`.
- Variable fonts when using 3 or more weights; subset to the scripts the copy needs.
- `font-display: swap`, preload only the display font file used by the h1 (and the body file if it differs and is above the fold).
- Metric-matched fallback (`size-adjust`, which `next/font` and Fontsource generate) so the swap shifts nothing.

## 6. CSS and JavaScript

- `tokens.css`, `base.css`, `motion.css` in that order (one bundle in a framework build); `scrollcraft.css` only with the engine. No `@import` chains, no render-blocking third-party CSS.
- `content-visibility: auto` with `contain-intrinsic-size` on long below-the-fold sections (never on a section holding a pinned act: it breaks `position: sticky`).
- No jQuery, no UI kit; native `<details>`, `<dialog>`, `popover`. Event handlers do little and yield for good INP.

## 7. Network and caching

- HTTP/2 or 3, Brotli, a CDN for static files. Hashed asset names with `Cache-Control: public, max-age=31536000, immutable`; HTML `max-age=0, must-revalidate`.
- `preconnect` only to critical third-party origins (≤ 2). No redirect chains.

## 8. Measure

**`scripts/perf.mjs`** (Node 22+, an installed Chrome, no packages) loads a built page at 1440 and 390 wide, scrolls it to the bottom, and reports PASS / WARN / FAIL against this budget, the median of 3 runs:

```bash
node scripts/perf.mjs dist/index.html          # a file, a folder (--root dist for root-relative links) or a URL
node scripts/perf.mjs http://localhost:4321 --runs 5 --json perf.json
```

| Check | WARN above | FAIL above |
|---|---|---|
| Total transfer | 1,500 KiB | 3,000 KiB |
| Images | 1,200 KiB | 2,400 KiB |
| One image | 350 KiB | 700 KiB |
| JavaScript | 450 KiB | 900 KiB |
| CSS | 120 KiB | 250 KiB |
| Fonts | 160 KiB, 2 families, 4 files | 320 KiB, 3 families, 6 files |
| Requests | 60 | 110 |
| Blocking time | 1,500 ms | 4,000 ms |
| Long tasks | 8 | 20 |
| FCP / LCP (CPU-rendered) | 2.5 s / 4.5 s | 4.5 s / 8 s |
| Layout shift | 0.1 | 0.25 |

It also flags images without size attributes, lazy images in the first screen, oversized or upscaled images, and broken requests. Its timings are rendered on the CPU: compare builds with each other, and use Lighthouse for the absolute numbers. Exit code 1 on any FAIL.

**Lighthouse** for the targets in §1:

```bash
npx -y lighthouse@latest http://localhost:4321 --form-factor=mobile --quiet --chrome-flags="--headless=new" --output=json --output-path=lh.json
```

Set `CHROME_PATH` if Lighthouse can't find Chrome. A local server without compression or caching costs a few points; judge those on the real host or PageSpeed Insights after deploy.

**By hand**: DevTools Performance with CPU 4× throttle while scrolling through every moment (no long tasks, no dropped frames on the moment); Network tab with "Fast 4G" for the first screen.
