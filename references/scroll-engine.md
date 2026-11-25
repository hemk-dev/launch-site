# Scroll engine and scroll moments

A scroll moment is the page's one peak (`motion.md` §6 for the rules and budget). This file is the how: the engine, its devices, six recipes that fit small-business sites, and the checks. Calm pages, and balanced pages whose moment is `picture-develops`, need none of the engine.

## 1. Load it

Files: `assets/scroll/scrollcraft.js` (the engine, no dependencies; ~62 KB of commented source, 7.5 KB minified and gzipped) and `assets/scroll/scrollcraft.css` (device styles, reads the site tokens). Load both **only on pages that have a moment**.

```html
<link rel="stylesheet" href="/css/scrollcraft.css">
...
<script src="/js/scrollcraft.js" defer></script>
<script src="/js/site.js" defer></script>   <!-- after the engine: it mounts it -->
```

- `site.js` calls `ScrollCraft.mount(document)` when the engine is present and leaves reveals to it (same `data-sc-in` markup). Never mount twice.
- The engine adds `sc-ready` to `<html>` once mounted; the inline `js` failsafe in `starter.html` keeps content visible if neither script runs.
- In a client-routed app (Next.js), mount per page and call `destroy()` on leave: `const sc = ScrollCraft.mount(root); return () => sc.destroy();`.
- Ship it minified: a file served as-is from `public/` is not minified by the framework, so run `npx esbuild scrollcraft.js --minify --outfile=scrollcraft.min.js` and serve that (`performance.md` §3).

## 2. The device contract

Everything is attributes. Wrap a moment in an **act**; the engine measures its progress `p` from 0 to 1 and publishes it as `--sc-p` on the act element.

| Attribute | On | Does |
|---|---|---|
| `data-sc-act="pin"` | the act | holds its stage on screen while you scroll through it (`position: sticky`, no scroll-jacking) |
| `data-sc-act="scrub"` | the act | as pin, and plays a video (or image sequence) by scroll position |
| `data-sc-act="pan"` | the act | as pin, and moves a horizontal track sideways |
| `data-sc-act="flow"` (default) | the act | no pin; `p` runs while the act crosses the screen |
| `data-sc-span="2.5"` | pinned act | total height in screens (≥ 1.5; travel is span − 1) |
| `data-sc-stage` / `.sc-stage` | child of a pinned act | the part that sticks (one screen tall) |
| `data-sc-still` | pinned act | finished-still mode: without the engine and under reduced motion the act loses its pinned length and reads as an ordinary section (style the still in your own CSS) |
| `data-sc-cue="from to [rampIn rampOut]"` | copy inside the act | fades and rises in over its window of `p`, holds, fades out. Ramps are fractions of the window (default .3). `"0 0.4 0"` is visible from the start; `"0.6 1 0.3 0"` stays to the end; one value (`"0.2"`) fades in and stays |
| `data-sc-kinetic="lines\|words"` | a cue | splits it into masked lines or words that rise in turn (expressive; one headline per page) |
| `data-sc-reveal="down\|up\|left\|right\|iris"` + `data-sc-reveal-at="from to"` | an element | wipes it open with `clip-path` over that window (`down` uncovers from its foot upward) |
| `data-sc-parallax="-0.2"` | an image | moves at a rate against the scroll (images only, ±0.3 at most) |
| `data-sc-pan="80"` | the track in a pan act | the track; the number adds px of extra travel |
| `video[data-sc-scrub]` + `data-sc-src`, `data-sc-src-mobile` | in a scrub stage | the clip; the engine fetches it whole, seeks by scroll; `.sc-stage__poster` image shows until it is ready |
| `data-sc-count="0 12"` + `data-sc-count-at` | a number in an act | counts to a **real** figure as `p` crosses the window |
| `data-sc-in`, `data-sc-stagger="70"` | any block | the quiet reveal (`motion.md` §5) |
| `data-sc-tone="dark"` | an act | dark local stage (light text tokens inside) |
| `data-sc-tilt`, `data-sc-magnet`, `data-sc-spotlight` | expressive only | pointer effects, fine pointers only, off under reduced motion |

Copy on a full-bleed picture sits in `.sc-copy` (`--lead` lower left, `--center`, `--trail` lower right) over a scrim (`.sc-scrim--lead`, `--trail`, `--band`, `--bottom`, `--left`, `--right`) pointed at the words; measure 4.5:1 on the composited frame. Stages pin below the sticky header (`--sc-safe-top`, from `--header-h`); anything placed at the foot of a stage adds `--sc-safe-bottom`, which clears the phone action bar. Not used here: scroll-craft's world-flight (one continuous camera through several scenes): it is a launch-film device, too heavy for a local business.

## 3. Recipes

Each recipe is a section of its own, under its h2 and lead, with real HTML copy. The recipe's CSS goes in the page or component stylesheet; its default rules **are the still** (no script, reduced motion), and the moving layout is added only under `.sc-ready` with motion allowed.

| id | Tier | Fits | Engine |
|---|---|---|---|
| `picture-develops` | balanced | one strong photograph: a room, a treatment, a finished piece | no |
| `word-highlight` | balanced | one statement of belief, 12–30 words | yes |
| `photo-chapters` | balanced | a story in 3–5 photographs: a visit, a project from brief to finish | yes |
| `pinned-steps` | balanced | how it works in 3–4 steps (booking, a design process) | yes |
| `project-rail` | expressive | a portfolio of 4–8 projects moving sideways | yes |
| `scrub-film` | expressive | a short shot clip scrubbed by scroll (a room revealed, a pour) | yes, plus video |
| `layered-hero` | balanced / expressive | the hero photo in depth planes | see `hero-depth.md` |

A place (spa, salon, café) usually takes `photo-chapters` or `picture-develops`; a studio (interior designer, architect, photographer) `photo-chapters`, `pinned-steps` or, if expressive, `project-rail`; a clinic or firm `word-highlight` or `pinned-steps`. The first and second choice per vertical are in `verticals.md`; take the one the client's photographs can carry.

### picture-develops

The photograph comes up out of a faint grey print, darks first, then colour, once, as it enters (1.6s). No engine: the reveal in `site.js` adds `sc-in`.

```html
<figure class="frame ratio-3x2 develop" data-sc-in>
  <img src="/img/room-1200.avif" srcset="..." sizes="(min-width: 64em) 60vw, 100vw"
       alt="The treatment room at dusk, a single lamp lit" width="1200" height="800"
       loading="lazy" decoding="async">
</figure>
```

```css
.js .develop[data-sc-in] { opacity: 1; transform: none; }
@media (prefers-reduced-motion: no-preference) {
  .js .develop[data-sc-in] img { filter: grayscale(1) contrast(.55) brightness(1.18); transition: filter 1.6s var(--ease-out); }
  .js .develop.sc-in img { filter: none; }
}
```

Never on the hero (it is the LCP image) and once per page.

### word-highlight

One statement is pinned; its words light from muted to ink as you scroll. Each step keeps 4.5:1 because both ends do (`--color-text-muted` is fitted to 4.6:1).

```html
<section class="statement" aria-labelledby="belief-h">
  <h2 id="belief-h" class="visually-hidden">What we believe</h2>
  <div data-sc-act="pin" data-sc-span="1.8" data-sc-still>
    <div class="statement__stage" data-sc-stage>
      <p class="statement__text" style="--n:14">
        <span style="--i:0">Rooms</span> <span style="--i:1">should</span> <span style="--i:2">feel</span> ...
      </p>
    </div>
  </div>
</section>
```

```css
.statement__stage { display: grid; place-items: center; padding: var(--section-y) var(--gutter); }
.statement__text { max-width: 22ch; font-family: var(--font-display); font-size: var(--step-4); line-height: 1.15; text-wrap: balance; }
@media (prefers-reduced-motion: no-preference) {
  .sc-ready .statement__text span {
    --on: clamp(0, calc((var(--sc-p) * 1.3 - 0.1) * var(--n) - var(--i)), 1);
    color: color-mix(in oklab, var(--color-text) calc(var(--on) * 100%), var(--color-text-muted));
  }
}
```

Generate the spans at build time (Astro: `{words.map((w, i) => <><span style={`--i:${i}`}>{w}</span>{' '}</>)}`); set `--n` to the word count. A strict CSP without `'unsafe-inline'` styles needs classes (`.w0`…`.w29`) instead of inline custom properties.

### photo-chapters

One photograph the width of the page per chapter; each next one is uncovered from its foot over the last, and the chapter (an h3 and two lines) sits on a solid panel at the lower left. About two thirds of a screen of scroll per chapter: span = chapters × 0.7 + 1, rounded (3 chapters: 3; 5 chapters: 4.5).

```html
<section class="chapters" aria-labelledby="story-h">
  <div class="container section__head"><h2 id="story-h">...</h2><p>...</p></div>
  <div data-sc-act="pin" data-sc-span="3" data-sc-still>
    <div class="chapters__stage" data-sc-stage>
      <article class="chapters__item">
        <img src="..." alt="..." width="1600" height="1000" loading="lazy" decoding="async">
        <div class="chapters__panel" data-sc-cue="0 0.36 0"><h3>...</h3><p>...</p></div>
      </article>
      <article class="chapters__item" data-sc-reveal="down" data-sc-reveal-at="0.3 0.44">
        <img ...>
        <div class="chapters__panel" data-sc-cue="0.32 0.68"><h3>...</h3><p>...</p></div>
      </article>
      <article class="chapters__item" data-sc-reveal="down" data-sc-reveal-at="0.64 0.78">
        <img ...>
        <div class="chapters__panel" data-sc-cue="0.66 1 0.3 0"><h3>...</h3><p>...</p></div>
      </article>
    </div>
  </div>
</section>
```

```css
/* the still: chapters side by side, each photograph over its words */
.chapters__stage { display: grid; gap: var(--space-6); padding-inline: var(--gutter); max-width: var(--container); margin-inline: auto; }
@media (min-width: 48em) { .chapters__stage { grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); } }
.chapters__item img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--radius-md); }
.chapters__panel { padding-top: var(--space-3); }

/* the moment */
@media (prefers-reduced-motion: no-preference) {
  .sc-ready .chapters__stage { display: block; padding: 0; max-width: none; }
  .sc-ready .chapters__item { position: absolute; inset: 0; }
  .sc-ready .chapters__item img { height: 100%; aspect-ratio: auto; border-radius: 0; }
  .sc-ready .chapters__panel {
    position: absolute; left: var(--gutter); bottom: calc(var(--sc-safe-bottom) + clamp(1.5rem, 8vh, 4rem)); max-width: 26rem;
    padding: var(--space-5); background: var(--color-surface); color: var(--color-text); border-radius: var(--radius-md);
  }
}
```

Never shares a page with `pinned-steps`. Photographs: one subject each, the subject clear of the lower-left panel, the same light across the set.

### pinned-steps

How it goes, in 3–4 steps: the step copy changes on the left while one frame on the right changes its picture. Same skeleton as photo-chapters with a split stage.

```html
<div class="steps" data-sc-act="pin" data-sc-span="2.8" data-sc-still>
  <div class="steps__stage container" data-sc-stage>
    <ol class="steps__list">
      <li class="steps__step" data-sc-cue="0 0.34 0"><h3>1. Consultation</h3><p>...</p></li>
      <li class="steps__step" data-sc-cue="0.33 0.67"><h3>2. Concept</h3><p>...</p></li>
      <li class="steps__step" data-sc-cue="0.66 1 0.3 0"><h3>3. Install</h3><p>...</p></li>
    </ol>
    <div class="steps__frame frame">
      <img src="..." alt="..." width="1200" height="1500" loading="lazy" decoding="async">
      <img src="..." alt="..." width="1200" height="1500" loading="lazy" decoding="async" data-sc-reveal="down" data-sc-reveal-at="0.3 0.42">
      <img src="..." alt="..." width="1200" height="1500" loading="lazy" decoding="async" data-sc-reveal="down" data-sc-reveal-at="0.63 0.75">
    </div>
  </div>
</div>
```

```css
/* the still: a numbered list, the pictures in a row under it */
.steps__list { display: grid; gap: var(--space-5); padding: 0; list-style: none; }
.steps__frame { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-top: var(--space-6); }
.steps__frame img { aspect-ratio: 4 / 5; object-fit: cover; }

@media (min-width: 48em) and (prefers-reduced-motion: no-preference) {
  .sc-ready .steps__stage { display: grid; grid-template-columns: 5fr 6fr; gap: var(--space-8); align-items: center; height: 100%; }
  .sc-ready .steps__list { display: grid; }
  .sc-ready .steps__step { grid-area: 1 / 1; }
  .sc-ready .steps__frame { display: block; position: relative; aspect-ratio: 4 / 5; max-height: 80svh; margin: 0; }
  .sc-ready .steps__frame img { position: absolute; inset: 0; width: 100%; height: 100%; }
}
/* phones read the list at their own pace: no pin */
@media (max-width: 47.99em) {
  .steps[data-sc-act] { height: auto !important; }
  .steps .sc-stage { position: relative; height: auto; overflow: visible; }
  .steps [data-sc-cue] { opacity: 1 !important; transform: none !important; }
  .steps [data-sc-reveal] { clip-path: none !important; }
}
```

### project-rail (expressive)

A pinned row of project cards travels sideways as you scroll down. On a balanced site use the native swipe `.rail` from `base.css` instead.

```html
<div data-sc-act="pan" data-sc-span="2.4" data-sc-still>
  <div class="pan__stage" data-sc-stage>
    <ul class="pan__track" data-sc-pan="80" role="list">
      <li class="pan__card card"> ... </li>
    </ul>
  </div>
</div>
```

```css
.pan__stage { display: flex; align-items: center; }
.pan__track { gap: var(--space-5); padding-inline: var(--gutter); margin: 0; list-style: none; }
.pan__card { flex: 0 0 min(78vw, 26rem); }
html:not(.sc-ready) .pan__stage { overflow-x: auto; scroll-snap-type: x proximity; }
html:not(.sc-ready) .pan__card { scroll-snap-align: start; }
```

Under reduced motion the engine hands the travel back as a normal horizontal scroll region. Every card stays a real link reachable by Tab.

### scrub-film (expressive)

A short clip (3–6s, shot or licensed, never generated people passed off as clients) played by scroll. Encode it for seeking, not playback:

```bash
bash scripts/encode-scrub.sh in.mp4 public/media/room.mp4            # desktop: 1080p, keyframe every 8
bash scripts/encode-scrub.sh in.mp4 public/media/room-m.mp4 mobile   # phone: 720p, keyframe every 4
```

```html
<div data-sc-act="scrub" data-sc-span="3">
  <div class="sc-stage" data-sc-stage>
    <img class="sc-stage__poster" src="/media/room-poster.avif" alt="" width="1920" height="1080">
    <video data-sc-scrub data-sc-src="/media/room.mp4" data-sc-src-mobile="/media/room-m.mp4" muted playsinline preload="none" aria-hidden="true"></video>
    <div class="sc-scrim sc-scrim--lead"></div>
    <div class="sc-copy sc-copy--lead" data-sc-cue="0.15 0.85"><h2>...</h2><p>...</p></div>
  </div>
</div>
```

Budget: desktop file ≤ 6 MB, phone ≤ 2.5 MB; fetched only when the act nears the screen, never under reduced motion or Save-Data (the poster stands). The poster is the first frame and carries no essential information.

## 4. Verify

The engine fetches clips as blobs, so `file://` proves nothing. Serve the build and shoot the scroll:

```bash
node scripts/serve.mjs --root dist --port 4500                  # --lan to test on a real phone
npm i -D playwright-core                                         # once, in the project
node scripts/scroll-shoot.mjs --url http://localhost:4500 --out lab/desktop
node scripts/scroll-shoot.mjs --url http://localhost:4500 --width 375 --height 812 --out lab/mobile
node scripts/scroll-shoot.mjs --url http://localhost:4500 --reduced-motion --out lab/reduced
```

Read the contact sheets, not single frames:

- [ ] Every cue reaches full opacity on a plateau, and the copy is readable (4.5:1) in every frame.
- [ ] No dead stretch: something changes in each third of every pinned act; no frame of empty stage.
- [ ] A scrub clip actually moves between frames (a frozen poster means the clip failed).
- [ ] Reduced motion: the still layouts, every chapter and step readable, no extra pinned length on `data-sc-still` acts.
- [ ] JavaScript off: the same stills.
- [ ] Phone: copy inside the screen, panels clear of the subject, no sideways scroll on the page.
- [ ] `perf.mjs`: no long tasks while scrolling, CLS < 0.1.
