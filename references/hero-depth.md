# Layered hero depth

A hero photograph split into planes (background, subject, foreground, atmosphere) that move at different rates as the visitor scrolls, so the picture gains real depth. It is the `layered-hero` moment: **optional**, and on a balanced site it takes the page's one moment slot (`motion.md` §1). Use it when the brand sells a place or an object that photographs in depth (a hotel terrace, a product on a plinth, a room seen through a doorway) and the client can supply or license the photograph. A plain hero with the CSS entrance is the default and is never a lesser choice.

Not for: clinics, firms and trades on the calm tier, a hero without a clear subject, or a page whose LCP budget is already tight.

## 1. Plan the depth before making assets

- Name the planes: background, focal subject, foreground, and any natural atmosphere (mist, steam, a curtain). Name what overlaps what, and what must stay physically joined (a person on the floor, a vase on the table).
- One camera idea, decided for the brand: the camera eases into the room; the headline recedes behind the subject; the foreground parts. Pick one.
- Depth must be visible: clearly different travel or scale rates and real occlusion. Planes moving as one picture are not depth.
- The opening frame is complete and the full headline readable. Never sacrifice reading to prove a subject can cover text.

## 2. Prepare real compositing assets

From the client's photograph (or a licensed one, credited per `media.md`):

1. A clean **background plate** with the subject removed and the space behind it rebuilt, so the moving cutout never exposes a duplicate or a hole.
2. The subject and foreground as genuine **alpha cutouts** (AVIF or WebP with alpha; inspect the channel: a checkerboard or white matte is not transparency).
3. Same framing, scale, light and perspective across planes; align them by measurement, not by eye.
4. Shared **contact points** stay anchored: give planes that touch a common pivot (`transform-origin` at the contact point).
5. Inspect edges against a contrasting colour and in motion; no halos, jagged hair or seams.
6. A **flattened poster**: the composed opening frame as one image. It is the LCP element.

Weights: poster within the hero budget (≤ 400 KiB, `media.md`); all planes together ≤ 600 KiB on desktop, with smaller phone crops.

## 3. Build it

The poster loads first with `fetchpriority="high"`; the planes load behind it at low priority, and `site.js` adds `is-layered` to the `[data-depth]` element only when **every** plane has decoded (and never under reduced motion). Until then, and when any plane fails, the poster is the hero.

```html
<section class="hero depth" data-depth data-sc-act="flow" aria-labelledby="hero-h">
  <div class="depth__scene" aria-hidden="true">
    <img class="depth__poster" src="/img/hero-poster-1600.avif" srcset="..." sizes="100vw"
         alt="" width="1600" height="1000" fetchpriority="high">
    <div class="depth__plane depth__plane--back" data-sc-parallax="-0.12"><img src="/img/hero-plate.avif" alt="" width="1600" height="1000" fetchpriority="low"></div>
    <div class="depth__plane depth__plane--subject" data-sc-parallax="-0.05"><img src="/img/hero-subject.avif" alt="" width="1600" height="1000" fetchpriority="low"></div>
    <div class="depth__plane depth__plane--front" data-sc-parallax="0.1"><img src="/img/hero-front.avif" alt="" width="1600" height="1000" fetchpriority="low"></div>
  </div>
  <div class="hero__inner container" data-enter>
    <h1 id="hero-h">...</h1>
    <p>...</p>
    <a class="btn btn--primary btn--lg" href="#book" data-hero-cta>...</a>
  </div>
</section>
```

```css
.depth { position: relative; isolation: isolate; overflow: clip; min-height: min(92svh, 56rem); display: grid; align-items: end; }
.depth__scene { position: absolute; inset: 0; z-index: -1; }
.depth__scene img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.depth__plane { position: absolute; inset: -6% 0; opacity: 0; }     /* bleed so travel never shows an edge */
.depth.is-layered .depth__plane { opacity: 1; }
.depth.is-layered .depth__poster { opacity: 0; }
.depth__plane--subject { transform-origin: 50% 92%; }               /* the contact point */
```

The poster carries `alt=""` because the scene is atmosphere and the h1 says what matters; if the photograph itself is information (the actual room), give the poster real alt text instead.

**Travel.** On a balanced site use a **flow** act as above: the planes drift at their rates while the hero leaves the screen, with no pinned length and no delay to the content. On an expressive site a short pin (`data-sc-act="pin" data-sc-span="1.5" data-sc-still`, stage = the hero) may add one second beat (a line arriving behind the subject); never longer than 1.6 screens. Rates within ±0.3; scale, if used, from 1 to 1.06 at most, driven by `--sc-p`.

**Copy and layers.** The h1, the line and the button are HTML above the scene (`z-index`), legible at every frame (4.5:1, a scrim pointed at the words when needed). Text passing behind the subject is a desktop-only effect and only when the whole headline is readable at the opening frame.

## 4. Art-direct the phone separately

Never just shrink the desktop scene. Give phones their own crops (`<picture>` sources at `max-width: 40em`), place the subject where the type is not, set the type above the subject, reduce travel by half, and keep the poster-only hero if the planes would push the subject off screen. No horizontal overflow.

## 5. Reduced motion, no script, failure

Reduced motion: the poster, never the planes. No script: the poster (the planes stay at opacity 0). A plane fails to load or decode: the poster. In every case the hero is complete, the h1 is first in reading order and the button works.

## 6. Accept

Look at the opening frame, a mid-scroll frame and the moment the hero hands over to the next section, on desktop and a phone (`scroll-shoot.mjs`, `scroll-engine.md` §4):

- [ ] Planes visibly move at different rates; occlusion reads as depth.
- [ ] No duplicate subject, hole, halo, floating contact point or seam.
- [ ] The headline is readable in the opening frame and in every frame after.
- [ ] LCP is the poster and stays within budget (`perf.mjs`); CLS < 0.1.
- [ ] Phone, reduced-motion and no-script heroes are complete.

A passing build does not prove the effect looks right; if the frames were not inspected, say so in the report.
