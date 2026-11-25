# Content Model — making the site fully data-driven

Goal: a non-developer (or a future you) can add pages, sections, services, team members, FAQs and translations by editing data, and the site renders it correctly with valid SEO — no component edits.

## 1. Site config

One typed file (`site.config.ts` / `.json` / Django settings module / Laravel config) — see `assets/site.config.example.json`:
- identity: name, legal name, logo, URL (absolute, used for canonical/sitemap/OG), kind (place/service/product/software), vertical, schema.org type
- contact: phone, email, address, geo, opening hours, directions link (exactly as the brief gives them; empty when not given, never invented)
- social profiles (also feeds JSON-LD `sameAs`)
- navigation: header items (with children), footer columns, CTA button
- SEO defaults: title template (`%s | Brand`), default description, default OG image, twitter handle, locale(s)
- theme: library palette and type ids (or the client's brand colours), radius, motion tier, the chosen scroll moment, dark mode on/off; the BRAND block in `tokens.css` is generated from these with `scripts/brand.mjs`
- features: flags such as `blog`, `newsletter`, `analytics`, `phoneActionBar`
- integrations: form endpoint, analytics ID (IDs from env, not secrets in the file)

## 2. Collections

Define a schema per content type and validate at build time, so bad content fails the build rather than breaking a page in production.

Example (Zod, works in Astro/Next/Nuxt/SvelteKit):
```ts
export const service = z.object({
  title: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().max(160),          // doubles as meta description
  icon: z.string().optional(),
  image: z.object({ src: z.string(), alt: z.string().min(1) }).optional(),
  priceFrom: z.number().optional(),
  order: z.number().default(0),
  seo: seoOverride.optional(),           // title/description/ogImage/noindex
  faqs: z.array(faq).default([]),
  draft: z.boolean().default(false),
});
```
Python: Pydantic models (`model_config = ConfigDict(extra="forbid")`); PHP: Laravel form requests / casts; Rails: model validations.

**Make schemas strict.** Zod's default `z.object` silently *drops* unknown keys, so a typo'd or mis-parsed field passes the build and the page ships with missing text. Use `z.strictObject(...)` (Zod 4) / `.strict()` for page sections and their nested items, so unknown keys fail the build with the exact path (`sections.4.items.0: Unrecognized key: "not claimed"`).

**Write prose in block-style YAML, never flow style.** In `- { title: Measured, not claimed }` the comma starts a new key, so the title becomes "Measured". In `[In-house design, testing and support]` one bullet becomes two. Use block style (`title: Measured, not claimed` on its own line) or quote the string. Strict schemas catch the first case; only reading the rendered page catches the second.

**References must resolve.** Collection `reference()` helpers check shape, not existence. Add a build-time integrity check that throws when a `category`, `related`, `author` or similar id points at nothing.

Typical collections: `pages`, `services`, `products`, `team`, `testimonials`, `faqs`, `posts`, `authors`, `locations`, `projects/case-studies`, `jobs`, `events`.

## 3. Pages as section blocks

```yaml
# content/pages/home.yaml
title: Pediatric Dentist in Pune
description: Gentle dental care for kids…
sections:
  - type: hero
    variant: split
    heading: Happy teeth, happy kids
    subheading: …
    cta: { label: Book a visit, href: /book }
    image: { src: /images/hero.jpg, alt: Dentist smiling with child patient }
  - type: services-grid
    source: services        # pulls from the collection
    limit: 6
  - type: testimonials
    source: testimonials
  - type: faq
    items: [...]
  - type: cta-banner
    ref: default-cta        # reusable block
```

Collection-backed blocks (`source: services`) need a **resolve step**: a `lib/sections.ts` that loads each block's data before rendering (components stay data-agnostic) and also collects the JSON-LD the visible sections imply (an `faq` block → `FAQPage`, a product grid → `ItemList`), so structured data always matches what's on the page.

A `SectionRenderer` maps `type` → component through a registry object. Unknown types should fail loudly in development and be skipped (with a logged warning) in production. Each section validates its own props with a schema (discriminated union on `type`).

```ts
const registry = { hero: Hero, 'services-grid': ServicesGrid, faq: Faq, ... } as const;
```

**Content vs microcopy.** Headings, sentences and lists belong in the page's data. Short UI strings (button labels, form labels and hints, validation messages, aria labels, "Close menu") go in one `ui` strings dictionary (`content/ui.json`), which is also where translation starts. Form *definitions* (fields, options, required) can live in data too when clients will want to change them.

## 4. Derived data

Generate from the same content, never duplicate by hand:
- routes (`getStaticPaths` / `generateStaticParams`)
- page metadata (title, description, canonical, OG image — with fallbacks to config defaults)
- JSON-LD (e.g. `faq` section → `FAQPage`; services → `Service`; config → `Organization`/`LocalBusiness`)
- sitemap entries (exclude `draft`/`noindex`), RSS, breadcrumbs, nav "active" state, related items.

## 5. i18n

If more than one locale: locale-prefixed routes (`/en/...`, `/hi/...`) or domains; UI strings in message files; content per locale (`content/services/en/…`); `hreflang` alternates + `x-default`; `lang` and `dir` attributes per page; locale-aware date/number/currency formatting (`Intl`). Design for text expansion (+30–40%) and RTL (logical CSS properties: `margin-inline-start`, `padding-block`).

## 6. Dynamic features

When data changes at runtime (listings, inventory, bookings, user content):
- Keep pages statically rendered and revalidate (ISR / on-demand revalidate / cache purge via CMS webhook) when possible.
- Use SSR only for truly per-request pages (search results, personalized, authenticated).
- API/server code: validate input (schema), parameterized queries/ORM, auth checks server-side, rate-limit public endpoints, never expose secrets to the client, return typed errors.
- Client fetching (search-as-you-type, filters): debounce, show loading/empty/error states, keep URLs shareable (state in query params), and render the initial state on the server for SEO.
