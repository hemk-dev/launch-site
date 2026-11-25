# Design system

Every visual decision lives in tokens; components use tokens; pages compose components. Re-branding a site means regenerating one block in one file. The files: `assets/tokens.css` (tokens), `assets/base.css` (reset, type, layout, components), `assets/motion.css` (interaction layer, `motion.md`).

## 1. Brand to tokens

1. **Collect the brand**: logo (SVG), brand colours, fonts, photography style. A logo's colours are the brand's colours: sample them (the main mark colour is usually the accent, the darkest text colour the ink).
2. **Generate the BRAND block**:
   ```bash
   node <skill>/scripts/brand.mjs brand --bg '#f7f3ec' --ink '#2a2622' --accent '#7a4a2c' --type instrument-serif   # client colours
   node <skill>/scripts/brand.mjs deal --trade interior                                                              # no brand: 3 deals
   node <skill>/scripts/brand.mjs css --palette warm-paper-walnut --type instrument-serif                             # a dealt pair
   node <skill>/scripts/brand.mjs list --trade spa                                                                   # browse
   ```
   It prints a hex `:root` block (colours, display and body fonts, display weight and tracking, radius), the font packages and a Google Fonts link for prototypes. Any colour that fails contrast is moved in lightness only (hue kept) and the change is listed in a comment: tell the client when a brand colour was darkened for text use.
3. **Paste it** between `BRAND:START` and `BRAND:END` in `tokens.css`.
4. **Check**: `python3 <skill>/scripts/contrast.py styles/tokens.css` must print `0 below minimum`.

Choosing between deals: match the vertical's mood (`verticals.md`), the photographs the client has (a palette should sit with their colours, not fight them), and avoid the defaults every similar site uses: cream + brass + espresso for every craft and wellness brand, violet gradients for every tech brand. The library rotates through earth, stone, cold neutral, deep green, cobalt and two-tone families on purpose.

## 2. Colour

- **Semantic aliases only in components**: `--color-bg, --color-surface, --color-surface-raised, --color-text, --color-text-muted, --color-border, --color-border-strong, --color-primary, --color-primary-hover, --color-primary-contrast, --color-link, --color-accent, --color-accent-contrast, --color-accent-text, --color-focus, --color-danger, --color-success, --color-section-brand-bg/-text`. Never a raw hex or scale step in a component.
- **One accent owns one role.** `--color-primary` is the main action and key highlights; the raw brand accent (`--color-accent`) is for fills such as a badge, used sparingly. Scattered small accents are confetti.
- **Muted text is tinted**, never flat grey; **no pure black** for text or grounds.
- **Contrast**: body text ≥ 4.5:1, large text (≥ 24px, or ≥ 18.66px bold) and UI boundaries/focus ≥ 3:1. Give every fill a matching text colour. `contrast.py` resolves hex, rgb, OKLCH, `var()` and `calc()` (not `color-mix()`, which is why the BRAND block is hex).
- **Inverted sections** (`.section--brand`) restate `color` along with the tokens; `color` inherits as a computed value, so a token redefined on a subtree does not re-ink text that already resolved.
- **Dark mode is opt-in** (`data-theme="auto"` or `"dark"` on `<html>`). Most brand palettes are designed for one ground; the generic dark theme swaps them for brand-tinted neutrals. Ship it only when the brief asks for it and both themes pass `contrast.py`; otherwise delete the two dark blocks. A palette whose ground is already dark is the site's only theme.

## 3. Typography

- **Two families at most** (display + text, or one family). Self-hosted woff2, subset, `font-display: swap`, preload only the display file the hero uses, four font files at most.
- **Pairings come from `library/type.json`** via `brand.mjs` (tested for weights, tracking and scale). Inter, Roboto, Open Sans, Lato, Montserrat and Poppins are not defaults: they read as no decision. Use them only when the brand already does.
- **Headlines at `--display-weight`** (400, or 500 for tech), carried by size and tight tracking, never bold-and-big; text at 400 and 500 only. Emphasis inside a headline uses italic or weight of the same family, never a second face.
- **Fluid scale** `--step--1 … --step-5` with `clamp()`; nothing under 14px for content (13px for small labels). h1 never smaller than an h2 on phones; at most three lines at every width.
- Body line-height 1.5–1.7, headings 1.1–1.25; measure 45–75ch (`--measure: 65ch`). `text-wrap: balance` on headings, `pretty` on paragraphs, `tabular-nums` for prices, hours and figures.
- Light text on a dark ground needs a touch more line-height and one step more weight.

## 4. Layout

- **One container width** for header, sections and footer (`.container`), so the left and right edges line up all the way down. Full-bleed only for a photograph or ground that sits behind its section.
- **The hero is exactly the first screen** (`min-height: calc(100svh - header)`): h1 at most three lines, a sub-line of about 20 words at most (80 characters on a place), at most two actions (one on a place), the action visible without scrolling at every width, nothing of the next section showing at load. No more than four text elements in the hero.
- **The place hero** (spa, salon, café, shop, hotel): one real daylight photograph of the place, full width under the header with nothing on it, the h1 and the action on the ground below (`.hero--photo`). The client's own room, counter, chair or shopfront, never a mood shot. Until the client's photograph arrives, a licensed stand-in of the same kind of room holds the place and is listed in the report as one to replace before launch (`media.md` §1).
- **Sections** hold 0.5 to 1.25 screens of content each and are separated by a change of ground (`.section--surface`, `.section--brand`) or by space, never by rules, shadows or inset boxes. A block too short to stand alone (a quote, a logo row, three facts) merges into the section above.
- **Splits**: text left, picture right, top-aligned, the same way on every split of the page (never zig-zagging more than twice). On phones the text comes first, then the picture.
- **More space above a heading than below it**; group by proximity before reaching for a border or a box.
- **Mobile-first**: base styles for 360px, enhance at 40/48/64/80em; no horizontal scroll at 320px; touch targets ≥ 44px; no fixed heights on text containers.
- **No popups**, newsletter modals, chat bubbles, cookie walls beyond what the law requires, back-to-top buttons or award strips. The only fixed elements are the header and the phone action bar.

## 5. Components (in `base.css`)

| Component | Notes |
|---|---|
| `.container`, `.section`, `.section--surface`, `.section--brand`, `.section__head`, `.stack`, `.grid`, `.split` | Layout primitives |
| `.site-header`, `.nav`, `.nav__link`, `.menu-button`, `dialog.menu-sheet` | Desktop nav from 64em; phone menu is a native `<dialog>` (focus trap, Esc, inert page) opened by `site.js`, which restores focus on close (WebKit doesn't). Current page: `aria-current="page"` |
| `.hero`, `.hero--photo`, `.hero__text`, `.hero__media`, `.hero__actions` | `data-enter` on the text column, `data-enter-media` on the picture (`motion.md`) |
| `.btn--primary`, `.btn--secondary`, `.btn--lg`, `.link` (+ `.link__arrow`) | `<a>` for navigation, `<button>` for actions; one line at desktop; label = verb + object (`copy.md`) |
| `.card`, `.card__media`, `.card__title`, `.card__meta` | One real link (the title) stretched over the card; the card lifts only if it holds a link |
| `.frame` + `.ratio-4x5/4x3/3x2/1x1`, `.rail` | Photographs in fixed ratios (one ratio per row); `.rail` is a swipe row that never auto-advances |
| `.rows` | Price lists and opening hours (`<dl>`) |
| `.faq` | Native `<details>`; no height animation |
| `.form`, `.field`, `.field__error`, `.check`, `.form__status`, `.hp` | Labels always visible; Safari-safe `<select>`; honeypot; status region announced |
| `.site-footer`, `.legal` | Brand, address, links, hours; legal row with year, Privacy, the photo-credit line |
| `.action-bar` | Phone-only bar with the main action, shown once the hero's button has scrolled away |
| `.visually-hidden`, `.skip-link` | Accessibility helpers |

Also: logo links whose accessible name contains the visible text (`Name<span class="visually-hidden">, home</span>`); wide tables in a focusable scroll region; icons from one family and stroke weight (inline SVG, Lucide or similar), never emoji.

## 6. Depth and surfaces

- **Three elevation steps** (`--shadow-1/2/3`), each with offset and blur, tinted to the brand hue; never a zero-offset coloured glow. If everything is raised, nothing is.
- **Overlap** (a photograph crossing a ground change) gives more depth than shadow. On dark photographic stages, grain (`.sc-grain`, 4–5%) stops banding.
- **One radius scale per site** (`brand.mjs --radius sharp|soft|round`): pill buttons on square cards look broken, not eclectic.
- **Browser surfaces are themed** in `base.css`: selection, caret, accent-color, focus ring, scrollbar, underline offset, tabular numerals. Keep them when you fork.

## 7. Text over photographs

Prefer copy on the ground beside or below the picture. When copy must sit on a photograph:

- **Mask the image away from the text** (`mask-image` or a clip ending where the column starts) when the copy holds one side, or use a scrim sized to the copy: a corner (`.sc-scrim--lead/--trail`) or a bottom band (`.sc-scrim--band`), never a full-frame darkening layer.
- The scrim is a sibling of the copy, not a pseudo-element of it, and its contrast is measured on the render (`scroll-shoot.mjs` reports composited contrast), not tuned by eye.
- `width` and `height` attributes come in pairs: overriding one in CSS without the other distorts the box. Use `width: 100%; height: auto`, or a fixed frame with `object-fit: cover`.

## 8. The refuse list

Category defaults to avoid unless the brief's own words ask for them:

- **Structure**: a grid of identical icon + heading + text cards as the page's structure (service cards with a real photograph and a price are content, not this); nested cards; the same section layout three times in a row; a hero-metric template (big number, small label).
- **Labels**: an eyebrow over every heading (two a page at most); section numbers (`01 / 06`); "scroll" cues and animated mouse icons; decorative word strips; pills overlaid on photographs.
- **Surface**: gradient text, neon or outer glows, glass and blur as decoration, coloured `border-left` callouts, custom cursors, monospace as costume.
- **Content**: em dashes in visible copy; fake screenshots or dashboards built from divs; text baked into images; invented numbers, reviews or logos (`copy.md`).

**The squint test**: blur the page until detail is gone. You should still name the primary element, the secondary element and the major groups, in that order. If everything greys into one field, fix the hierarchy before adding anything.
