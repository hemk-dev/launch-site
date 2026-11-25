# Quality gate

Walk this before reporting done. Run the scripts, look at the screenshots, and mark anything you could not verify; say so in the final report rather than claiming it.

## 1. The scripts (run from the project, against the build)

```bash
python3 scripts/audit_site.py dist                       # SEO, a11y basics, links, SVGs; exit 1 on errors
python3 scripts/contrast.py src/styles/tokens.css        # every semantic pair, light and dark; exit 1 below minimum
node scripts/copy-lint.mjs dist                          # copy tells and leftover {{TOKENS}}; reads <meta name="site-kind">, or pass --kind place|service|product|software
node scripts/perf.mjs dist --root dist                   # budget at 1440 and 390; exit 1 on FAIL
node scripts/screenshots.mjs http://localhost:4321 ./screenshots / /services/ /contact/
```

- `screenshots.mjs` needs `npm i -D playwright`; set `THEMES=light` when the site has no dark mode (`theme.darkMode: "off"`), and `BROWSERS=chromium,firefox,webkit` once before handover. Its dark captures use `prefers-color-scheme`, which the site follows only with `data-theme="auto"`.
- Pages with a scroll moment: `serve.mjs` + `scroll-shoot.mjs` at desktop, 375 wide and `--reduced-motion` (`scroll-engine.md` §4).
- `python3` is `python` or `py` on Windows.

## 2. Build and code

- [ ] Production build passes with zero errors; typecheck and lint clean.
- [ ] No client facts hard-coded in components: everything from `site.config` or content collections (`content-model.md`).
- [ ] No secrets in the repo; `.env.example` with placeholders.
- [ ] No console errors or warnings; no 404s for assets.
- [ ] No leftover `{{TOKENS}}`, lorem ipsum or sample content (copy-lint fails on tokens); anything the client must still supply is listed in the report.
- [ ] README covers setup, structure, editing content, changing the brand (`brand.mjs`), deployment.

## 3. Brand and design

- [ ] Tokens come from `brand.mjs` (dealt palette and type, or the client's colours fitted); the BRAND block is the only edited part of `tokens.css`.
- [ ] Two font families at most; display face not one of the overused defaults unless it is the brand's (`design-system.md`).
- [ ] One accent used with intent: buttons, links, focus, one band. Not on every heading.
- [ ] The squint test: at a glance each screen has one clear focal point and the primary action is findable.
- [ ] Nothing from the refuse list (`design-system.md` §8): no icon-card grid as structure, eyebrows over every heading, gradient text, decorative glass, invented numbers; no stand-in photograph posing as the client's team or work (`media.md` §1).
- [ ] Looked at a full-page screenshot (`FULL=1`) of every page template at 390 and 1440: no empty frames, truncated copy or broken crops.

## 4. Copy

- [ ] copy-lint passes; the WARN lines read and either fixed or deliberate.
- [ ] Every claim is the client's (`copy.md` §3): no invented years, counts, awards, reviews or quotes. Testimonials and numbers only when real.
- [ ] Name, address and phone exactly as given, identical in the header, footer, contact page and JSON-LD.
- [ ] The hero says what the business is, for whom, and where, in the first screen; one primary action repeated at the end.

## 5. Motion

- [ ] The tier matches the plan (`brief-and-planning.md` §5): calm has no scroll moment, balanced one, expressive at most two.
- [ ] Hero entrance is CSS only, about 1 s, and never hides the LCP image.
- [ ] Reveals: one group per section at most, never on the hero, prices, forms, FAQ or a whole card grid.
- [ ] Hover a button, a text link, a linked card and a linked photo at desktop width: each answers within its token time; nothing resizes.
- [ ] Reduced motion on: nothing travels; scroll moments show the still; all content visible.
- [ ] JavaScript off: all content visible, the menu reachable (the nav is in the footer too), forms post.
- [ ] Throttled CPU 4×: scrolling through every moment stays smooth; no long tasks.
- [ ] Nothing from the never-list (`motion.md` §9).

## 6. Responsive and cross-browser

- [ ] No horizontal scroll at 320; layouts checked at 320 / 390 / 768 / 1024 / 1440 (screenshots report overflow).
- [ ] Touch targets ≥ 44 px; the phone menu opens, closes with Esc and the backdrop, and returns focus; the action bar appears after the hero and never covers the footer text.
- [ ] Images crop sensibly at every size; the hero has a phone crop if needed.
- [ ] WebKit run (Safari, iOS) clean: `<dialog>`, `<select>` height, sticky stages, `100svh`.
- [ ] Landscape phone and 200% zoom usable.

## 7. Accessibility (WCAG 2.2 AA)

- [ ] `lang` set; skip link; header, nav, main, footer landmarks; one h1; headings in order.
- [ ] Everything reachable and operable by keyboard; visible focus ring on every control, including linked cards.
- [ ] Contrast passes in every theme the site ships (`contrast.py`: 0 below minimum); text over photographs measured on the frame.
- [ ] Visible text is part of each control's accessible name; icon-only buttons are labelled; decorative images `alt=""`.
- [ ] Forms: visible labels, errors linked with `aria-describedby` and not colour-only, the status line announced (`role="status"`).
- [ ] No auto-playing media without a pause control.
- [ ] axe shows no violations on every page (`@axe-core/playwright` over the sitemap URLs).

## 8. SEO

- [ ] Unique title and description on every page; canonical; Open Graph and Twitter tags; favicons and manifest (`seo.md`).
- [ ] JSON-LD for the business type, matching the visible content (hours, address, phone).
- [ ] sitemap.xml, robots.txt, a 404 page; `noindex` on utility pages and staging.
- [ ] Internal links resolve (`audit_site.py`); external links in new tabs use `rel="noopener noreferrer"`.

## 9. Performance

- [ ] `perf.mjs` with no FAIL; Lighthouse mobile ≥ 95 Performance on the home page and one inner page (or the reason it could not run).
- [ ] LCP element eager with `fetchpriority="high"`; every image sized; fonts self-hosted and preloaded only where above the fold.
- [ ] The engine loaded only on pages with a moment, and minified.
- [ ] Third-party scripts deferred or behind facades, each with a reason.

## 10. Behaviour and security

- [ ] Forms validated in the browser and on the server, with the honeypot and rate limiting; a test submission actually delivered, or clearly stubbed and reported.
- [ ] Security headers for the host (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors).
- [ ] Consent handling if analytics or marketing scripts run and the region requires it.
- [ ] Legal pages as needed: privacy, terms, cookies, accessibility statement, vertical disclaimers.
