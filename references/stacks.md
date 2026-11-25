# Stack Selection & Project Structure

## Contents
1. Decision guide
2. Shared structure principles
3. Astro (default for content sites)
4. Next.js (App Router)
5. Nuxt / SvelteKit
6. Plain HTML + Vite (no framework)
7. Server-rendered backends (Django, Laravel, Rails, Express, Go, .NET, Spring)
8. CMS options
9. Styling options
10. Hosting & deployment
11. Non-interactive scaffolding
12. Forms on static sites

---

## 1. Decision guide

| Situation | Recommended | Why |
|---|---|---|
| **Default when no stack is named**: brochure, local business, portfolio, catalogue, blog, docs | **Astro (TypeScript) + content collections**, static output | Zero framework JS by default, so the motion layer, `site.js` and the scroll engine are the only scripts; plain files on any host; see §3 |
| One-page site, or "no framework" | `assets/starter.html` + Plain HTML/Vite (§6) | Smallest possible output; same CSS/JS assets |
| The project already uses Next.js, or the team maintains Next.js sites | Next.js (App Router) static export (`output: 'export'`) | Keep the house stack; ~100 KB of React runtime is the cost, so keep client components few (§4) |
| Marketing site + app/dashboard/auth in same repo | Next.js (App Router), static marketing routes + server where needed | React ecosystem, server components, route-level rendering choices |
| Vue team | Nuxt (prerender marketing routes) | Same idea as Next for Vue |
| Lean interactive app, small bundles | SvelteKit (prerender where possible) | Small runtime, great DX |
| Explicitly "no framework" / tiny site | HTML + Vite, partials via a small build script or Eleventy | Simple, fast, no runtime |
| Python / PHP / Ruby / Java / Go / .NET backend team | That framework's templates (Jinja/Django, Blade, ERB, Thymeleaf, Go templates, Razor) + Vite assets + HTMX/Alpine for interactivity | Server-rendered HTML is fast and SEO-ready; avoids two codebases |
| E-commerce | Shopify (theme or Hydrogen), Next.js + headless commerce, or WooCommerce | Never hand-roll payments/checkout |
| WordPress required | Block theme (FSE) with theme.json tokens, or headless WP + Astro/Next | Editors keep WP; output stays fast |

When the user names a language (e.g. "in Python", "in PHP"), use that language's best-practice web framework from the table.

## 2. Shared structure principles (any stack)

Separate these concerns, whatever the folder names are in a given framework:

```
config/      site.config (identity, nav, SEO defaults, theme, flags)
content/     data: collections + page definitions (or CMS adapter)
styles/      tokens.css, base.css (reset + typography), utilities
components/
  ui/        atomic, content-agnostic (Button, Card, Icon, Container, Section)
  sections/  page blocks fed by data (Hero, Features, FAQ, CTA…)
  layout/    Header, Footer, MobileNav, SEO/Head, SkipLink
lib/         content loading, schema validation, seo/jsonld builders, utils
pages|app/   routes only: fetch data → render layout + sections
public/      static files: favicons, robots.txt (or generated), og images
scripts/     build-time helpers (image processing, sitemap if not built-in)
tests/       unit (lib), e2e/smoke (Playwright), a11y (axe)
```

Rules that keep it clean long-term:
- Routes are thin. No business/content logic in route files beyond loading and composing.
- Components get data through typed props; they never import content files directly (sections may be given data by a page; that's it).
- One `Seo`/`Head` component + one `buildMetadata(page)` helper; one `jsonld.ts` with builders per schema type.
- Absolute imports via path aliases (`@/components/...`).
- Lint + format (ESLint/Prettier or Biome; Ruff/Black; PHP-CS-Fixer; RuboCop) and a `check` script that runs typecheck + lint + build.
- Env vars validated at startup (e.g. Zod / pydantic-settings); `.env.example` with placeholders, real `.env` gitignored.
- Copy the skill's `audit_site.py`, `contrast.py`, `copy-lint.mjs`, `perf.mjs` and `screenshots.mjs` into the project's `scripts/` and wire them as `npm run audit` / `contrast` / `copy` / `perf` / `screenshots` (or Makefile targets), so the checks keep working in CI and for the next developer without the skill folder.
- Assets from the skill go here: `tokens.css`, `base.css`, `motion.css` into `styles/`; `site.js` (and, only with a scroll moment, the minified engine `scrollcraft.min.js` + `scrollcraft.css`, `performance.md` §3) into `public/js` and `styles/`. In Astro, load them with `<script src="/js/site.js" defer is:inline>` from the layout (the engine's tag first, on the pages that use it) so they are not bundled into a module that waits; in Next.js use `<Script src="/js/site.js" strategy="afterInteractive">` (the engine's `<Script>` before it) and keep reveals below the first screen.
- Pin tool versions that are coupled: type-checkers have peer ranges (e.g. `@astrojs/check` may not support the newest TypeScript major). Install what the peer range allows, not blindly `@latest`. With TypeScript 6+, define `"paths": { "@/*": ["./src/*"] }` without `baseUrl` (deprecated).

## 3. Astro (default for content sites)

Scaffold: `npm create astro@latest` (choose TypeScript strict). Add integrations via `npx astro add` (sitemap, mdx, tailwind if used, react/svelte/vue only for islands that need them).

```
src/
  config/site.ts
  content/                 # collections (Content Layer API); schemas in src/content.config.ts
    services/*.md
    team/*.json
    pages/*.yaml           # section-block page definitions
  styles/{tokens.css,base.css,motion.css}   # + scrollcraft.css on pages with a moment
  components/{ui,sections,layout}/
  layouts/BaseLayout.astro # <html lang>, the js-class snippet, <Seo/>, header/footer, skip link, site.js
  lib/{seo.ts,jsonld.ts,content.ts}
  pages/
    index.astro
    [...slug].astro        # renders pages/*.yaml through a SectionRenderer
    services/[slug].astro
    404.astro
    rss.xml.ts (if blog)
public/js/                 # site.js, scrollcraft.min.js
astro.config.mjs           # site URL set (needed for canonical + sitemap)
```
- Use `astro:assets` `<Image>`/`<Picture>` for images.
- Islands: `client:visible` / `client:idle` for interactive widgets, never `client:load` unless above the fold and essential.
- View transitions: the native cross-document `@view-transition` rule in `motion.css` is enough. Avoid `<ClientRouter />` unless asked: it swaps pages without reloading, so `site.js` and the scroll engine would need re-running (and `destroy()`) on `astro:page-load`.
- Need dynamic routes at runtime (forms, auth)? Add an adapter (Node, Vercel, Netlify, Cloudflare) and mark only those routes `prerender = false`.
- **Scoped styles only match elements rendered by the same component.** A class passed to a child (`<Icon class="sun">`) isn't matched by the parent's `<style>`. Use `.parent :global(.sun)` (or style it inside the child). This silently shows things that should be hidden, such as both theme-toggle icons.
- **CSP:** `security.csp` hashes inline scripts and styles into a `<meta>` CSP per page. Inline `style=""` attributes are then blocked (use classes/`:nth-child`), Shiki code highlighting's inline styles conflict (`markdown.syntaxHighlight: false` or a class-based theme), and `frame-ancestors` can't be set via `<meta>`, so set it as a host header.
- **Static `redirects`** emit meta-refresh HTML stubs; for real 301s write the host's redirect file (`_redirects`, `vercel.json`) from the same config at build.
- **Fonts:** Astro's Fonts API (`fonts` in config) self-hosts and generates metric-matched fallbacks.
- **Dev server:** in Astro 7, `astro dev` starts a background server and returns. Stop it with `astro dev stop` (`astro dev status` / `logs` to inspect); killing the npm process doesn't stop it.

## 4. Next.js (App Router)

Scaffold: `npx create-next-app@latest` (TypeScript, ESLint, App Router, `src/`, alias `@/*`).

```
src/
  app/
    (marketing)/           # route group: static pages
      page.tsx
      [slug]/page.tsx      # generateStaticParams + generateMetadata from content
      services/[slug]/page.tsx
    (app)/                 # authenticated area if any
    api/ or actions/       # server actions / route handlers (form submit, etc.)
    layout.tsx             # fonts via next/font, <body>, header/footer
    sitemap.ts  robots.ts  manifest.ts  not-found.tsx  opengraph-image.tsx
  components/{ui,sections,layout}/
  config/site.ts
  content/                 # MD/MDX/JSON or CMS client in lib/cms
  lib/{seo.ts,jsonld.ts,content.ts,env.ts}
  styles/
```
- Server Components by default; `"use client"` only on leaf interactive components (menu toggle, filter, basket button). Pass them serialisable props; keep content and data loading in server components.
- `generateMetadata` per route (with `metadataBase` in the root layout so canonicals/OG URLs are absolute); `next/font` (self-hosts and creates metric-matched fallbacks).
- Dynamic segments: `generateStaticParams` + `export const dynamicParams = false` so unknown slugs 404 at build instead of rendering a shell.
- Validate server action inputs with Zod; return typed errors.

**Static export (`output: 'export'`)** for static sites:
- `next.config.ts`: `output: 'export'`, `trailingSlash: true` (folders with `index.html`, which every static host serves), `images: { unoptimized: true }` or a custom loader (the default image optimiser needs a server). Pre-size raster images at build, or use an image CDN loader.
- Not available in export: server actions, middleware, ISR/`revalidate`, cookies/headers at request time, and `headers()`/`redirects()`/`rewrites()` in `next.config`. Put headers and 301s in host files (`_headers`/`_redirects`, `vercel.json`) generated from config at build, and forms go through §12.
- Metadata routes work when static: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `opengraph-image.tsx` (add `export const dynamic = 'force-static'` where the build asks).
- `not-found.tsx` is exported three times: `404.html`, `404/index.html` and `_not-found/index.html`. The last two would answer **200** at `/404/` and `/_not-found/`, so delete them in a `postbuild` step and check that the host serves `404.html` with a 404 status.
- **Navigation: decide `<a>` vs `next/link` up front, and don't mix them.** Plain `<a>` keeps every page an independent static document: no prefetch traffic, simple state, and CSS cross-document view transitions (`@view-transition { navigation: auto }`) work. It needs `@next/next/no-html-link-for-pages` turned off, with a comment saying why. `next/link` gives instant client navigation, but the root layout stays mounted: close menus on `usePathname()` change, mark the current nav item in a client component, and use React's `<ViewTransition>` for transitions. For a static catalogue, plain `<a>` is the simpler default.
- Layouts don't know the current path: mark `aria-current` in a small client nav component with `usePathname()`, or render the header per page with a `path` prop.
- Public env vars need the `NEXT_PUBLIC_` prefix (e.g. `NEXT_PUBLIC_FORM_ENDPOINT`); they're inlined at build.
- Test `_headers`/`_redirects` locally with the host's CLI (`npx wrangler pages dev out`, `netlify serve`); `npx serve` and `python -m http.server` ignore them.
- CSP: Next inlines per-page scripts (the RSC payload), and nonces need request-time rendering, so a strict hashed CSP isn't practical with static export. Set the other security headers at the host; if a CSP is required, document the `'unsafe-inline'` trade-off for scripts.
- Output goes to `out/`. Run `audit_site.py out` and serve `out/` for screenshots (`npx serve out` or `python3 -m http.server -d out`).
- Client components hydrate with React, so a page ships ~100 KB of framework JS. Server-render everything you can, use CSS (`:target`, `<details>`, `:has()`) for simple toggles, and lazy-load heavy client widgets with `next/dynamic`.

## 5. Nuxt / SvelteKit

- **Nuxt**: `npx nuxi@latest init`; `@nuxt/content` for collections, `@nuxt/image`, `@nuxtjs/seo` (or `useSeoMeta` + `nuxt-schema-org`), `routeRules` to prerender marketing routes. Structure: `components/{ui,sections,layout}`, `content/`, `composables/`, `server/api/`.
- **SvelteKit**: `npx sv create`; `export const prerender = true` in marketing layouts; `+page.ts` load functions read content; `<svelte:head>` via a `Seo.svelte`; `enhanced:img` for images; form actions for submissions.

## 6. Plain HTML + Vite

For "no framework" requests or tiny sites:
```
src/
  partials/{head.html,header.html,footer.html}
  pages/{index.html,about.html,...}
  data/site.json, data/*.json
  styles/{tokens.css,base.css,components/*.css}
  scripts/{main.js, modules/*.js}   # ES modules, each feature self-initializes on [data-*] hooks
public/
vite.config.js                      # multi-page input; vite-plugin-handlebars or similar for partials + data
```
Consider Eleventy (11ty) instead when there are collections — it gives templating + data cascade with zero client JS. Keep JS progressive: the page works without it.

## 7. Server-rendered backends

Use the language's main framework and its template engine; add Vite for CSS/JS bundling with hashed assets.

| Language | Framework | Templates | Notes |
|---|---|---|---|
| Python | Django (content-heavy, admin) / FastAPI or Flask (light) | Django templates / Jinja2 | Django admin or Wagtail as CMS; `django-vite`; cache pages (`cache_page`) or export static (django-distill) |
| PHP | Laravel | Blade components | Filament/Statamic as CMS; `@vite`; Livewire or Alpine for interactivity |
| Ruby | Rails | ERB/ViewComponent | Hotwire (Turbo/Stimulus); `vite_ruby` or importmaps |
| JS/TS | Express/Fastify/Hono | Nunjucks/EJS/JSX | Or Astro with an adapter for the dynamic routes |
| Go | net/http + chi/echo | html/template + templ | Embed assets; very fast |
| Java/Kotlin | Spring Boot | Thymeleaf / JTE | HTMX for interactivity |
| C# | ASP.NET Core | Razor Pages | Tag helpers; output caching |

Mirror the shared structure: templates `layouts/`, `partials/sections/`, `components/`; content in DB models or flat files; SEO helper that fills a `meta` context for every view; sitemap view; parameterized queries/ORM only; CSRF on all forms.

## 8. CMS options

- **Git-based** (content in repo, free): Decap CMS, TinaCMS, Keystatic — great for small teams.
- **Headless SaaS**: Sanity, Contentful, Storyblok (visual editing), Hygraph.
- **Self-hosted headless**: Payload (TS, Next-native), Strapi, Directus.
- **Traditional**: WordPress (block theme or headless via WPGraphQL), Wagtail (Django), Statamic (Laravel).
Map CMS documents to the same content types as the local model so the CMS is swappable — put the CMS client behind `lib/content.ts`.

## 9. Styling options

- **Tailwind CSS** — fast and consistent if tokens are wired into the theme (`@theme` in v4); extract repeated patterns into components, not `@apply` soup.
- **Vanilla CSS + custom properties + cascade layers** (`@layer reset, tokens, base, components, utilities`) — zero dependency, great for long-lived sites. Native nesting and container queries are widely supported.
- **CSS Modules / scoped styles** (Astro/Vue/Svelte) for component isolation.
Avoid runtime CSS-in-JS for content sites (hurts performance).

## 10. Hosting & deployment

- Static: Cloudflare Pages, Netlify, Vercel, GitHub Pages, S3+CloudFront.
- SSR/hybrid: Vercel (Next), Netlify, Cloudflare Workers, Fly.io, Render, a container on AWS/GCP/Azure.
- Backend frameworks: container + reverse proxy (Caddy/Nginx) with a CDN in front.
- Always: HTTPS, compression (brotli), immutable caching for hashed assets, short cache + revalidation for HTML, preview deployments per PR, CI running `check` + build (+ Lighthouse CI if possible).
- Static hosts take headers and redirects as files: `_headers` / `_redirects` (Netlify, Cloudflare Pages), `vercel.json`, S3+CloudFront response-headers policies. Generate them from config at build so they never drift.

## 11. Non-interactive scaffolding

Agents can't answer CLI prompts. Pass flags (check `--help` for the installed version):

| Stack | Command |
|---|---|
| Astro | `npm create astro@latest -- <dir> --template minimal --typescript strict --no-install --no-git --skip-houston -y` |
| Next.js | `npx create-next-app@latest <dir> --ts --eslint --app --src-dir --import-alias "@/*" --use-npm --no-tailwind --yes` (swap `--tailwind` if wanted) |
| Nuxt | `npx nuxi@latest init <dir> --packageManager npm --gitInit false` |
| SvelteKit | `npx sv create <dir> --template minimal --types ts --no-add-ons --install npm` |
| Vite (vanilla) | `npm create vite@latest <dir> -- --template vanilla-ts` |
| Django | `django-admin startproject config <dir>` |
| Laravel | `composer create-project laravel/laravel <dir> --no-interaction` |
| Rails | `rails new <dir> --skip-git --css=tailwind` (or `--skip-javascript` for HTMX/Hotwire-light) |

## 12. Forms on static sites

There's no server, so validation and spam control happen in the browser *and* at whatever receives the post:
- **Endpoint from env:** `PUBLIC_FORM_ENDPOINT` (Formspree, Basin, Web3Forms, a Cloudflare/Netlify/Vercel function, a CRM webhook). Validate it at build (https only) so a typo fails the build instead of losing leads.
- **Progressive enhancement:** a real `<form action={endpoint} method="post">` that works without JS; JS upgrades it to `fetch` with inline errors, a busy state and a success/error message in a `role="status"` region.
- **No endpoint configured (demo/staging):** say so on the page ("This demo doesn't send messages"), offer a pre-filled `mailto:` and a copyable text summary. **Never show a success message for something that wasn't sent.**
- **Spam:** honeypot field + minimum fill time + the provider's own filtering/captcha (Turnstile/hCaptcha if needed).
- **CSP:** allow the endpoint in `connect-src` and `form-action`.
- **Privacy:** no personal data in URLs, query strings or analytics events; link the privacy policy next to the submit button; consent checkbox where the region requires it.
