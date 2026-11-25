# Photographs, video and icons

A small business is sold by its pictures: the room, the work, the people who do it. This file covers where pictures come from, how they are prepared, and how they go on the page. Budgets repeat `performance.md`.

## 1. Where pictures come from

1. **The client's own photographs** first: the actual space, team and work. Ask for them in the brief (`brief-and-planning.md`). A few good phone photos of the real room beat a perfect stock picture.
2. **Licensed stand-ins** only when the client has none yet: Unsplash or Pexels (free licences) or Wikimedia Commons (check each file's licence: CC0, CC BY, CC BY-SA). Pick frames of the same trade with one consistent light; never a recognisable brand, a watermark, or a face that implies a real staff member.
3. **Never** pass off a stand-in as the client's own: no stand-in in "our team", "our work", "before/after" or a testimonial. Portfolio, gallery and team sections wait for real pictures (leave a `{{PHOTO_...}}` token and list it in the report).
4. No AI-generated people, rooms or work presented as real. A generated texture or abstract background is fine.

**Credits.** One line in the footer's legal row naming only the sources used ("Photographs via Unsplash and Wikimedia Commons"), linking a credits page that lists each file, photographer and licence (CC BY and BY-SA require it). No credit, caption or "sample" note under any picture. `starter.html` carries the line as `{{PHOTO_CREDIT_LINE}}`; delete it when every picture is the client's. The final report lists every stand-in so the client can replace it.

## 2. Choosing and cropping

- One subject per picture, readable at phone width. Same light and colour temperature across a page (all warm daylight, or all evening lamps).
- Crop to the ratios in `base.css` (`.ratio-4x5`, `4x3`, `3x2`, `1x1`) and keep one ratio per row or rail.
- The hero picture leaves calm space where the h1 and button sit, or the copy sits beside it (`.hero` split) rather than on top. Text on a photograph needs a scrim pointed at the words and 4.5:1 measured on the actual frame (`design-system.md`, text over photos).
- Phones get their own crop for the hero when the subject would be lost (`<picture>` with a `media="(max-width: 40em)"` source).

## 3. Preparing files

Export AVIF (with WebP fallback via `<picture>` if the stack does not negotiate formats) at 2× the shown width, never more:

| Use | Widths | Budget |
|---|---|---|
| Full-bleed hero | 640, 960, 1440, 1920, 2880 | ≤ 400 KiB at the size a 1440 screen loads |
| Split hero / large feature | 480, 800, 1200, 1600 | ≤ 250 KiB |
| Card, gallery item | 400, 640, 960 | ≤ 150 KiB (≤ 250 KiB any photo) |
| Whole page at 1440 | | ≤ 1,200 KiB images ideal, 2,400 KiB fails `perf.mjs` |

Astro's `<Image>`/`<Picture>` and Next's `next/image` produce the widths and formats; for a hand-built page, `npx sharp-cli` or Squoosh. Strip metadata (GPS from phone photos especially).

## 4. Markup

```html
<!-- hero: never lazy, preloaded in <head>, the LCP element -->
<img src="/img/hero-1440.avif" srcset="/img/hero-960.avif 960w, /img/hero-1440.avif 1440w, /img/hero-2880.avif 2880w"
     sizes="(min-width: 64em) 55vw, 100vw" alt="The front room of the spa, two treatment chairs by the window"
     width="1440" height="960" fetchpriority="high" decoding="async">

<!-- everything below the first screen -->
<img src="..." srcset="..." sizes="(min-width: 48em) 33vw, 100vw" alt="..." width="960" height="720"
     loading="lazy" decoding="async">
```

- `width` and `height` (or an `aspect-ratio` frame) on every image: no layout shift.
- `loading="lazy"` below the first screen, never in it; the hero has `fetchpriority="high"` and a matching `<link rel="preload" as="image" imagesrcset imagesizes>`.
- Below-the-fold pictures are `<img>`, not CSS backgrounds (they can't be lazy-loaded or described).
- The frame shows `--color-surface` while the image loads.
- **Alt text** says what the picture shows that matters to the visitor ("A finished kitchen in pale oak with brass handles"), not "image of"; decorative pictures get `alt=""`. A linked image's alt names the destination when it is the only content of the link.

## 5. Galleries and portfolios

- A `.rail` (native swipe with scroll-snap) or a simple grid; never an autoplay carousel, never a lightbox library by default. If a lightbox is needed, a `<dialog>` with the larger image and a close button, Esc to close, focus returned.
- Each project: one strong lead picture, a title, one line (place, scope, year), a link to its page. No "view more" walls of 40 thumbnails.

## 6. Video

- **Background or ambient video**: avoid on service sites; if the brief insists, muted, `playsinline`, a poster, paused under reduced motion and Save-Data, with a visible pause button, never behind body text, ≤ 2.5 MB.
- **Scrub video** (expressive only): encode with `scripts/encode-scrub.sh` and follow `scroll-engine.md`, scrub-film.
- **Embedded video** (YouTube, Vimeo): a facade (poster image + play button) that loads the player on click; `youtube-nocookie.com`.

## 7. Cutouts and depth planes

For `hero-depth.md` only: genuine alpha (AVIF/WebP with alpha), edges checked on a contrasting colour, a rebuilt background plate, a flattened poster.

## 8. Icons and logos

- Icons only where they help scanning (contact rows, amenities). One set, one stroke weight, inline SVG with `aria-hidden="true"` next to a text label; never an icon as the only label, never emoji as icons.
- The client's logo as SVG in the header (with the business name as its accessible name) and as the favicon source (`seo.md`). Never redraw or recolour a logo without the client's files.
- Maps: a "Get directions" link to OpenStreetMap or Google Maps rather than an embedded map (an embed costs 500 KB+ of script); if an embed is required, load it on click.
