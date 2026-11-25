# Motion

Motion explains something (this is clickable, this changed, this arrived, look here) and never stands between the visitor and the content. This file holds every motion number and rule; `assets/motion.css` implements the layer, `scroll-engine.md` the scroll moments.

## 1. Layers and tiers

Every page has the same layers; the tier (`brief-and-planning.md` §5) decides how many are switched on.

| Layer | calm | balanced | expressive |
|---|---|---|---|
| **Micro-interactions**: hover, press, focus, links, cards, photos, fields, menu | ✓ | ✓ | ✓ |
| **Hero entrance**: once on load, CSS only | ✓ | ✓ | ✓ |
| **Section reveals**: quiet, fire once | ✓ (optional) | ✓ | ✓ |
| **Scroll moment** (`scroll-engine.md`) | none | 1 | up to 2 (long pages) |
| **Layered hero depth** (`hero-depth.md`) | none | optional, counts as the one moment | optional, counts as one of the two |
| **Scrub video** | none | none (photo moments only) | 1 at most |
| **Pointer effects** (tilt, magnet, spotlight) | none | none | sparingly, one kind |

Nothing else moves: no autoplay carousels or sliders, no marquees on service businesses, no looping background video behind text, no tickers, no animated counters for invented numbers, no loaders or intro gates.

## 2. Tokens and curves

`--m-in` 150ms (hover in) · `--m-out` 120ms (hover out) · `--m-press` 90ms · `--m-panel` 200ms (menu opening) · `--m-image` 600ms in / `--m-image-out` 400ms (photo zoom) · `--m-enter` 700ms (one hero item).

Curves: `--ease` cubic-bezier(.2,.8,.2,1) for every UI step; `--ease-out` cubic-bezier(.22,1,.36,1) for entrances and reveals settling; `--ease-in-out` cubic-bezier(.65,0,.35,1) for travel only. Never `ease-in` on UI, never an overshoot or bounce, never `transition: all`. Move only `transform`, `scale` and `opacity` (colours on hover; `clip-path` and `filter` inside a scroll moment). Never animate width, height, margin, padding, top or left.

## 3. The micro-interaction layer (`motion.css`)

Hover moves only for a fine pointer (`(hover: hover) and (pointer: fine)`); keyboard focus shows the same state on any device; nothing resizes or pushes a neighbour.

| Part | Motion | Time |
|---|---|---|
| Button | fill steps to `--color-primary-hover` (secondary: border darkens, faint fill); box rises 1px (2px on `.btn--lg`); press sinks 1px and scales .985 | 150 in / 120 out / 90 press |
| Link in text, `.link` | rests on a 45% underline; the full line draws left to right, leaves to the right; `.link__arrow` nudges 3px | 150 / 120 |
| Nav word | a 1px line draws under the word; the current page keeps a still 2px bar (`aria-current="page"`) | 150 / 120 |
| Phone menu (`<dialog>`) | fades in with an 8px drop | 200 |
| Card with a link | lifts 2px, border darkens a step, soft shadow `--shadow-2`; keyboard focus rings the whole card | 180 in / 120 out |
| Card without a link | nothing (`.m-nolift`) | |
| Photo in a link or linked card (`.m-zoom`, `.card__media`) | scales 1.03 inside its frame; the frame never grows; never dims or takes an overlay | 600 in / 400 out |
| Focus ring | 2px in `--color-focus`, 2px offset, drawn at once | none |
| Field | focus border + 4px soft ring, at once; hover darkens the border | 120 |
| FAQ `<details>` | opens instantly; no height animation | |
| Phone action bar | slides up once the hero button has scrolled away | 240 |

Page CSS never overrides a `.btn`'s `transform` or `transition`. No tilt, glow, shine sweep, magnetic button or custom cursor on the micro layer.

## 4. The hero entrance

Once per page load, CSS only, starting at first paint (no script gate, so it never delays LCP):

- Mark the text column `data-enter`: its children rise 12px and fade in one after another (the h1 first, 700ms; the next items 560ms each at 90, 160 and 230ms). The h1 rises **whole**, never split into word or letter masks.
- Mark the picture's frame `data-enter-media`: the photo settles from scale 1.05 to 1 over 1.1s inside the frame. The picture is **never hidden or faded**, so it can be the LCP element.
- About 1s in all, then the hero stands. Never a second entrance, never on scroll back, never a loader.
- Reduced motion, print and no-CSS-animation browsers show the hero as written.

## 5. Section reveals

`data-sc-in` on a block, or `data-sc-in data-sc-stagger="70"` on a group: opacity 0 → 1 and a 14px rise over 620ms on `--ease-out`, fired once when the block is 12% inside the viewport. Revealed by `site.js`, or by `scrollcraft.js` when the page loads the engine (same markup).

- **One reveal group per section**, usually the section head or one text column; 2 to 4 staggered children, 30–80ms apart (`motion.css` caps anything past the fourth).
- **Never** on the hero or the LCP element, on a whole card grid, on prices, forms, FAQs or the footer, or on every heading of the page. Calm sites may skip reveals entirely; the page must read the same without them.
- Content never re-hides on scroll up. A fade with no rise reads as a glitch; a rise past 24px reads as a slide.

**Visible without JavaScript.** Hidden starting states apply only under `html.js`, set by one inline line in `<head>` (in `starter.html`), which also removes the class after 3s if no script took over (`ls-ready` from `site.js`, `sc-ready` from the engine). Anything already on screen when `site.js` starts is revealed at once. In hydrated frameworks (Next.js), keep reveals below the first screen and load `site.js` as a plain deferred script, not inside a client component.

## 6. Scroll moments

The one peak of the page (`brief-and-planning.md` §4). Rules for all of them; recipes in `scroll-engine.md`:

- Each lives in **its own section**, pinned only with `position: sticky` inside that section, and is driven by the native scroll position (no scroll-jacking: the wheel, keys and scrollbar behave normally).
- Its copy is real HTML, readable at every step (4.5:1 on the composited frame) and complete in the reduced-motion and no-script states, which show the **finished still** without extra pinned length.
- It never moves prices, forms, FAQs, quotes or the footer.
- Phones run the light moments (photo-led, type-led); scrub video and layered planes get a mobile art direction or the still.
- Budget: calm 0, balanced 1, expressive 2 (a long page of eight or more sections). Each costs its weight in `performance.md`.

## 7. Smooth scrolling

- **Anchor links** glide with native `scroll-behavior: smooth` (set in `base.css`, off under reduced motion) and land below the sticky header (`scroll-padding-top`).
- **Scroll moments feel smooth** because the engine lerps its playhead toward the scroll position each frame; the page itself is never hijacked.
- **No smooth-scroll library** (Lenis, Locomotive, ScrollSmoother) by default. Only when an expressive brief explicitly asks for it: disabled under reduced motion, keyboard and anchor navigation intact, and verified with `perf.mjs` for long tasks.

## 8. Reduced motion, phones, print

- `prefers-reduced-motion: reduce`: colours still change, a press shows as a deeper tone, the menu appears without travel, reveals show at once, the hero stands as written, scroll moments show their finished still, video clips are never fetched, pointer effects are off, anchor jumps are instant.
- Phones get no hover states and no pointer effects; the hero entrance and light moments still run.
- Print shows every element at rest.

## 9. Never

- A card, row or tile grid that fades or staggers in as the page scrolls; a reveal on every section heading; parallax on body text.
- An entrance longer than about 1.1s, a second entrance, an entrance that hides text a visitor could already read, a loader or intro gate.
- Autoplay carousels, self-advancing sliders, rotating notices, logo marquees on a local business, looping background video behind copy.
- Scroll-jacking, scroll-snap on the whole page, a page held by script.
- Tilting, glowing or pointer-following cards on calm and balanced sites; a magnetic button anywhere but one expressive CTA.
- Twinkling, flickering, hue cycling, scrambled text: every change shows a state or real data.
- A hover slower than its token, an overshooting ease, a delayed button, an animated focus ring, an animated width, height or margin.

## 10. Check

- Throttle CPU 4× in DevTools: interactions stay smooth, no long tasks during scroll.
- Reduced motion on: nothing travels, all content visible. JavaScript off: all content visible.
- CLS < 0.1 with all motion running (`perf.mjs`).
- Hover a linked card and a linked photograph at desktop width: the card rises 2px, the photo scales 1.03.
