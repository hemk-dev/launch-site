# SEO

Technical SEO is a build feature: generated from content data, consistent on every page, and verified by `scripts/audit_site.py`.

## Per page (rendered in server HTML, not injected by client JS)

```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pediatric Dentist in Pune | Bright Smiles</title>          <!-- unique, ≤60 chars incl. the "| Brand" suffix; drop the suffix when a long page title would exceed 60 -->
  <meta name="description" content="…">                              <!-- unique, 120–155 chars, has a reason to click -->
  <link rel="canonical" href="https://example.com/services/braces/">  <!-- absolute, consistent trailing slash -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="…"> <meta property="og:description" content="…">
  <meta property="og:url" content="…"> <meta property="og:image" content="https://…/og/braces.png"> <!-- 1200×630 -->
  <meta property="og:site_name" content="…"> <meta property="og:locale" content="en_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#…">
  <link rel="icon" href="/favicon.ico" sizes="32x32"> <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png"> <link rel="manifest" href="/manifest.webmanifest">
  <link rel="alternate" hreflang="hi" href="…">  <!-- only if multilingual; include x-default -->
  <script type="application/ld+json">…</script>
</head>
```
- `noindex` for thank-you pages, internal search results, drafts, staging (staging also behind auth or `X-Robots-Tag: noindex`).
- OG images: generate per page at build (Satori/`@vercel/og`/`astro-og-canvas`) or a branded default.

## Content & structure
- One `h1` per page containing the main topic; logical `h2/h3` hierarchy; headings describe content (not "Welcome").
- Descriptive, lowercase, hyphenated URLs (`/services/teeth-whitening/`), shallow depth, no IDs/query strings for content pages.
- Internal links: nav, breadcrumbs, related items, contextual links with descriptive anchor text (not "click here").
- Every image: meaningful `alt` (empty `alt=""` for decorative), descriptive filenames.
- Unique, substantial copy per page; for local businesses, per-service and per-area pages with genuinely distinct content (not doorway pages).
- Blog/resources: author, dates (`datePublished`/`dateModified`), table of contents for long posts.

## Structured data (JSON-LD)

Build from data with helper functions; validate with Google's Rich Results Test / Schema Markup Validator.
- Site-wide: `Organization` (or the `LocalBusiness` subtype from `verticals.md`) with `name, url, logo, sameAs, contactPoint`, and for local: `address, geo, telephone, openingHoursSpecification, priceRange, areaServed`. `WebSite` on the home page.
- Quote-only products have no price: `Product` without `offers`/`review`/`aggregateRating` is valid but **not eligible for Google's product rich results** (Search Console may warn). Keep it for entity understanding; **never invent prices, ratings or reviews**. Details in `catalogue.md` §12.
- Category/listing pages: `ItemList` of the products or articles shown.
- Per type: `BreadcrumbList` on inner pages, `FAQPage` where an FAQ is visible on the page, `Service`, `Product` + `Offer` + `AggregateRating` (only real reviews), `Article`/`BlogPosting`, `Event`, `Course`, `JobPosting`, `Person`.
- Structured data must match visible content.

## Site-level
- `sitemap.xml` (auto-generated, only canonical indexable URLs, `lastmod` from content), referenced in `robots.txt`.
- `robots.txt`: allow everything public; disallow admin/api/search; never block CSS/JS.
- 301 redirects for changed URLs (keep a `redirects` map in config); custom 404 with navigation and search. On static hosts emit real 301s (`_redirects` on Netlify/Cloudflare Pages, `vercel.json`, S3/CloudFront rules) rather than meta-refresh stub pages, which some frameworks generate by default.
- Consistent host (https, www or apex) and trailing-slash policy enforced by redirects.
- Hreflang pairs reciprocal; each locale self-canonical.
- Fast, mobile-friendly, HTTPS — CWV is a ranking signal (see `performance.md`).

## Local SEO (any local business)
- NAP (name, address, phone) identical across site, Google Business Profile and directories.
- Embedded map (lazy, click-to-load), directions link, hours, service area pages, reviews.

## Analytics & consent
- Privacy-friendly analytics (Plausible, Umami, Fathom) or GA4 via Partytown/deferred; consent banner where required (GDPR/DPDP); no PII in events or URLs. Set up Google Search Console + Bing Webmaster and submit the sitemap (tell the user; this needs their account).
