# Product Catalogue & B2B Sites

Read this when the site's job is to present many products and turn interest into enquiries or orders: manufacturers, distributors, traders, lab/medical/industrial equipment, chemicals, machinery and spare parts, components, packaging, auto parts, furniture showrooms. It complements the vertical entry in `verticals.md` (mood, palette) with the structure these sites need.

## Contents
1. Decide the commerce model
2. Information architecture
3. Product data model
4. Product page anatomy
5. Category pages, search and filter
6. Enquiry / RFQ basket (no cart)
7. Datasheets and downloads
8. Spares, service and repeat business
9. Trust for professional buyers
10. Export and international buyers
11. Imagery when there are no product photos
12. Structured data
13. Scale: from a spreadsheet to thousands of SKUs

---

## 1. Decide the commerce model

Ask in the brief: **how many products/SKUs, where the product data lives (spreadsheet, ERP/PIM export, PDFs), whether prices are shown, and whether buyers check out or request a quote.**

| Model | Use when | Build |
|---|---|---|
| **Catalogue + RFQ** (most B2B) | Prices depend on configuration, volume, freight; buyers need a formal quotation | Static catalogue + enquiry basket + form endpoint. No cart, no payments |
| **Catalogue + price list** | Standard consumables with list prices | As above plus prices, maybe "add to order request" |
| **E-commerce** | Card payment, stock, shipping rates | Use `verticals.md` §8 (Shopify/headless commerce); never hand-roll checkout |

Don't push a B2B equipment maker into a cart. "Add to cart" with no price confuses buyers; "Add to enquiry" doesn't.

## 2. Information architecture

- **Tree:** Category → (Sub-category) → Product. URLs `/products/<category>/<product>/`. They're readable, carry keywords, and give breadcrumbs for free. Keep slugs stable; changing them later needs 301s.
- **Mega menu** under "Products" listing categories *and* their products. Buyers in niche markets search by the product's name ("BOD incubator"), not the category.
- **Category sidebar** on category and product pages (the convention buyers expect in this niche): sticky on desktop, collapsible or moved below the content on mobile, current item marked with `aria-current`.
- **Cross-links:** related products, "compatible with" (spares ↔ machines), industries → recommended products, product ↔ services (installation, calibration, AMC).
- **Minimum set (build this unless asked for more):** Home, Products (all categories), category pages, product pages, About, Enquiry, Contact, Privacy, 404. Fold "why us", certifications and industries served into Home/About as short sections.
- **Possible additions (suggest; build only when asked):** Spare parts, Services, Industries/Applications, Quality & certifications page, Downloads centre, FAQ, News/Insights, Terms.
- **Features, same rule:** the single-product enquiry link (`/enquiry/?product=<slug>`) is the baseline. A multi-product basket (§6), catalogue search/filter (§5), mega menus, theme toggles and sticky quote bars are additions for large catalogues or when the client asks.

## 3. Product data model

One validated collection per product type, generated pages, no product facts in templates. A good default shape:

```ts
product = z.strictObject({
  name, slug, model,                 // model/part number shown prominently (mono font)
  category: reference('categories'),
  summary: z.string().max(155),      // doubles as meta description
  description,                       // Markdown body
  highlights: z.array(z.string()).max(6),           // "at a glance" bullets
  keySpecs: z.array(spec).max(4),                    // shown near the CTA
  specs: z.array(z.strictObject({ group: z.string().optional(), label: z.string(), value: z.string(), unit: z.string().optional() })),
  variants: z.strictObject({ columns: z.array(z.string()), rows: z.array(z.array(z.string())) }).optional(), // capacities/models
  compliance: z.array(z.string()),   // "GMP design", "21 CFR Part 11 ready", "CE", "ISO 13485"
  applications: z.array(z.string()),
  industries: z.array(reference('industries')),
  related: z.array(reference('products')), compatibleWith: z.array(reference('products')).optional(),
  documents: z.array(z.strictObject({ label: z.string(), file: z.string(), kind: z.enum(['datasheet','manual','brochure','certificate','sds','coa']) })),
  image: z.string().optional(),      // or an illustration id (see §11)
  leadTime, warranty, featured, order, draft, illustrative: z.boolean().default(false),
  // domain block when needed, e.g. chemicals: { grade, cas, purity, packSizes, storage, hazard }
});
```

- `reference()` checks the shape, not that the target exists. Add a build-time integrity check that throws on dangling `category`/`related`/`compatibleWith` ids.
- Mark fictional or unconfirmed data (`illustrative: true`) and show a visible "specifications illustrative" note. Professional buyers act on specs.
- Some categories read better as a **table** than as cards (chemicals, consumables, spares with part numbers): give the category a `layout: cards | table`.

## 4. Product page anatomy

Machinery and equipment makers' sites (pharma packaging, processing, lab equipment) converge on the same page. The best ones do it cleanly; the common failures to avoid are a missing H1, no structured data, repeated headings, discount pop-ups and three different forms on one page.

Top to bottom, mobile-first:
1. Breadcrumbs → image/illustration → category eyebrow → **H1 product name** → **model number** → one-sentence summary → compliance badges.
2. **Key specs at a glance** (2–4 values in a grid) and the **primary CTA** ("Request a quote") + secondary ("Add to enquiry"), then datasheet download, lead time.
3. In-page section nav (Overview · Specifications · Applications · Documents) for long pages.
4. Full **spec table**: `<table>` with `<caption>`, `<th scope="row">`, tabular numerals, units in a consistent column; on narrow screens a horizontally scrollable region (`role="region"`, `aria-labelledby`, `tabindex="0"`, `position: relative` on the wrapper so visually-hidden children can't escape it).
5. Variants/capacities table, applications/products handled (e.g. "tablets, capsules, ampoules"), industries served, documents list (brochure, datasheet).
6. **Short per-product FAQ** (4–6 real buyer questions: changeover time, output range, utilities, installation, warranty, validation docs), marked up as `FAQPage`.
7. **Video** of the machine running (lite YouTube embed, click to load; poster image) when one exists. Buyers of moving machinery expect it.
8. **Installations / clients** strip (photos or logos, with permission) and **related products**.
9. **One** enquiry path: a short "Ask for a quotation" form (name, company, phone/email, quantity, message, product pre-filled) in a sidebar or after the specs, or a button to the enquiry page. Don't stack several forms or pop-ups.
10. Optional: a sticky quote bar on mobile (appears after scrolling past the main CTA; doesn't cover content; respects safe-area insets).

## 5. Category pages, search and filter

- Category intro copy (unique, 80–200 words, for SEO), product grid or table, sub-category chips, FAQ for the category if useful.
- When a category has several models of one machine (e.g. blister machines of different speeds), a **model comparison table** (model, output, format size, key differences, link) at the top lets buyers pick before reading each page.
- Group the Products menu the way buyers think: by machine type (Processing, Packaging, Lab & QC, Spare & change parts) and, if useful, by industry (Pharma, Food, Cosmetics, Chemical) as a second route to the same products.
- **Up to ~200 products:** render every product into the page at build time and filter client-side with `data-*` attributes (text, category, industry, capacity). Keep the filter state in the URL (`?q=&category=&industry=`), announce the result count in a live region, show an empty state with a "clear filters" action and an enquiry CTA. Everything stays crawlable and works without JS (the full list shows).
- **Hundreds to thousands:** a static search index (**Pagefind**) plus paginated category pages (`/products/<category>/page/2/`, self-canonical), or a hosted search (Algolia, Meilisearch, Typesense) if the data changes often.
- `WebSite` + `SearchAction` JSON-LD only if the search URL really works with `?q=`.

## 6. Enquiry / RFQ basket (no cart): an addition, not the default

- "Add to enquiry" toggle on cards and product pages (`aria-pressed`, a polite live announcement, a header count badge). Persist in `localStorage` (wrapped in try/catch; works without it for the single-product path).
- `/enquiry/?product=<slug>` pre-fills from any product page link. This is also the no-JS path.
- The enquiry page lists the basket with quantities and remove buttons, then the form: name, company, email, phone (with country code), country, industry, message, consent. The selected products go in a hidden field as readable text.
- Submit to a form endpoint (see the static-forms recipe in `stacks.md`). Never show a success message unless the endpoint confirmed it.
- Don't put personal data in URLs or analytics events.

## 7. Datasheets and downloads

- A Downloads page (catalogue, datasheets by category, certificates, manuals) and per-product documents.
- When real PDFs don't exist yet, **generate placeholder PDFs from the product data at build time**, labelled as placeholders, so links work and audits pass. Never link to a 404.
- Decide per file type whether PDFs should be indexed; if not, send `X-Robots-Tag: noindex` for `/downloads/*` from the host.
- Gate nothing that a buyer needs to compare products. Gate only genuinely valuable content (e.g. a full price list) and say why.

## 8. Spares, service and repeat business

- **Spare parts:** list by part number with "compatible with" models, and an "order by serial number" form (the rating-plate photo/serial is how buyers identify parts).
- **Services:** installation & commissioning, qualification/validation (IQ/OQ/PQ), calibration, annual maintenance contracts (AMC), training. Each gets a page with scope, deliverables and response-time targets.
- These pages drive repeat revenue. Link them from every product page.

## 9. Trust for professional buyers

B2B buyers don't trust star ratings; they trust evidence. Replace review widgets with:
- Quality & certifications page (ISO, CE, GMP design, test reports), with certificate numbers once real.
- Documentation-pack contents (FAT/SAT, IQ/OQ/PQ templates, calibration certificates, CoA/SDS for chemicals).
- Plant/facility, in-house capabilities, years in business, installed base, countries served: stats only if real or clearly marked as sample data.
- Client logos and testimonials with name, role and company (with permission), or case studies.
- Careful compliance wording: "21 CFR Part 11 *ready* software", not "compliant" (compliance belongs to the user's validated system). Avoid unverifiable claims.
- Supplier-audit or factory-visit CTA.

## 10. Export and international buyers

- Country select in the RFQ, export/sales/service contacts listed separately, hours with time zone.
- WhatsApp click-to-chat is a primary channel in South Asia, the Middle East, Africa and Latin America.
- No currency on quote-only sites; `areaServed` in JSON-LD; consider `hreflang` locales only when translated content exists.

## 11. Imagery when there are no product photos

Common for demos and for industrial SMEs. Stock photos look generic and grey boxes look unfinished. Instead:
- **Technical line-art illustrations** as an SVG sprite (`<symbol id>` per product type, `<use href="/illustrations.svg#id">`), stroked with `currentColor` and an inherited `fill` for one accent so they follow the theme. Label them "Illustration, not to scale" and list them as placeholders in the README.
- Page CSS can't reach inside a `<use>` shadow tree; only inherited properties (`color`, `fill`, `stroke`, `stroke-width`) apply. Style through those.
- **One invalid attribute (e.g. a duplicated `stroke`) makes the browser drop the entire sprite** and every illustration renders blank with no console error. `audit_site.py` validates SVG files and `<use>` targets; still look at the screenshots.
- When real photos arrive: consistent background, angle and crop; `<picture>` with AVIF/WebP; explicit dimensions.

## 12. Structured data

- `Organization` site-wide; `LocalBusiness` (or a subtype) for the plant/office with address, geo, hours, on the contact page.
- `Product` per product page with `name`, `model`, `sku`, `brand`, `manufacturer`, `category`, `image`, `description`, and specs as `additionalProperty` (`PropertyValue`; upgrade to `QuantitativeValue` + UN/CEFACT `unitCode` when specs are stored as number + unit).
- **Quote-only products have no price, so `Product` without `offers`, `review` or `aggregateRating` is valid schema.org but not eligible for Google's product rich results** (Search Console may warn). That's fine. **Never invent prices, ratings or reviews** to get rich results.
- `ItemList` on category/catalogue pages, `BreadcrumbList` everywhere below home, `FAQPage` only where the FAQ is visible, `Service` for service pages.

## 13. Scale: from a spreadsheet to thousands of SKUs

- Clients usually have an Excel/CSV price list or an ERP export. Import it at build time with a small script (CSV → validated collection entries), rather than hand-typing YAML, and keep the source file in `content/import/` with a README on the columns.
- Validate on import (required columns, unique slugs and model numbers, units), fail loudly, and report rows skipped.
- For 500+ products: paginated categories, Pagefind, image CDN, and consider a headless CMS or PIM as the source of truth.
