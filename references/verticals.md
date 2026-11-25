# Vertical Playbook

Use this to turn "a site for X" into concrete sitemap, sections, visual direction, CTAs and structured data. These are starting points, not rules — the brief (audience, positioning, region) always refines them. If a vertical isn't listed, pick the closest one or combine two (e.g. "vet clinic" = Healthcare + Local services).

## Contents
1. How to derive a theme for any vertical
2. Healthcare / clinics / wellness
3. Dental
4. Legal / accounting / consulting (professional services)
5. Finance / fintech / insurance
6. SaaS / software / AI products
7. Agency / studio / portfolio
8. E-commerce / D2C retail
9. Restaurant / café / food
10. Hospitality / hotel / travel
11. Real estate / property
12. Construction / home services / trades
13. Education / courses / schools
14. Fitness / gym / sports
15. Beauty / salon / spa
16. Non-profit / NGO / community
17. Events / conferences / weddings
18. Automotive / dealership
19. Manufacturing / industrial / B2B
20. Logistics / transport
21. Personal brand / creator / coach
22. Laboratory / scientific / medical equipment & chemicals

---

## 1. Deriving a theme for any vertical

Answer four questions, then choose:

1. **Trust vs excitement** — Does the visitor need reassurance (health, money, law) or inspiration (food, travel, fashion)? Trust → calmer palette, more whitespace, restrained motion, proof elements high on the page. Excitement → bolder imagery, stronger contrast, more motion.
2. **Price position** — Premium → fewer colors, more space, serif or refined sans display type, large photography. Budget/value → clearer prices, denser info, stronger CTAs.
3. **Audience** — Age, tech-savviness, device (mostly mobile for local services and food), language/region (RTL? Indic scripts need fonts with that coverage, e.g. Noto Sans Devanagari).
4. **Action** — What single action wins? Make it the primary button style and repeat it (header, hero, mid-page, footer, sticky mobile bar for local businesses).

Palette and type: if the client has brand colours or a logo, start from them (`node <skill>/scripts/brand.mjs brand --bg … --ink … --accent … --type <id>`). Otherwise deal from the library with the trade key in the table below (`brand.mjs deal --trade <key>`), using the vertical's direction further down to choose between the deals. Both print a contrast-checked BRAND block for `assets/tokens.css` (`design-system.md`).

Typography: one display face + one text face (or one variable family with weight contrast), self-hosted. The type names below are directions; `brand.mjs` prints the library's tested pairings. Inter, Roboto, Open Sans, Lato, Montserrat and Poppins are never the default choice, only when the brand already uses them.

### Motion tier and palette key per vertical

The tier sets how much moves (`motion.md`); the moment is the scroll moment a balanced or expressive site takes (recipes in `scroll-engine.md`; a calm site has none); the key feeds `brand.mjs deal --trade`. The brief can move a site one tier up or down (a luxury spa may go expressive; a budget salon may stay calm).

| Vertical | Motion tier | Moment, first choice / second | Palette key |
|---|---|---|---|
| Healthcare, dental, clinics | calm | (`pinned-steps` for a treatment journey if balanced) | `clinic` (or `dentist`) |
| Legal, accounting, consulting | calm | (`word-highlight` if balanced) | `law` |
| Finance, insurance | calm | (`pinned-steps` if balanced) | `fintech` (software) or `law` (advisers) |
| Beauty, salon, spa, wellness, yoga | balanced | `photo-chapters` / `picture-develops` | `spa` / `salon` / `yoga` (all map to wellness) |
| Interior design, architecture, photography | balanced (expressive for a portfolio-led studio) | `photo-chapters` / `pinned-steps`; expressive: `project-rail` | `interior` / `architect` / `photographer` (studio) |
| Restaurant, café, bakery | balanced | `picture-develops` / `photo-chapters` | `restaurant` / `cafe` / `bakery` |
| Hotel, guesthouse, real estate | balanced | `photo-chapters` / `layered-hero` | `hotel` / `realestate` |
| Retail, boutique, florist | balanced | `picture-develops` / `word-highlight` | `retail` / `florist` |
| Construction, trades, home services | calm | (`pinned-steps` if balanced) | `workshop` (or `plumber`, `builder`...) |
| Education, courses | calm | (`word-highlight` if balanced) | `school` |
| Fitness, gym | expressive | `scrub-film` / `photo-chapters` | `gym` |
| Agency, creative studio, events | expressive | `project-rail` / `scrub-film` | `agency` / `events` |
| SaaS, AI, devtools | balanced (expressive for a launch page) | `pinned-steps` / `word-highlight`; expressive: `scrub-film` (product footage) | `saas` / `ai` / `devtool` |
| E-commerce, D2C, hardware | balanced | `layered-hero` / `picture-develops` | `consumer-product` / `hardware` |
| Non-profit, personal brand | calm | (`word-highlight` if balanced) | the closest trade (`studio` for a coach, `cafe`-like warmth for community) |
| Manufacturing, laboratory, logistics | calm | (`pinned-steps` if balanced) | `hardware` |

---

## 2. Healthcare / clinics / wellness
- **Mood**: calm, clean, trustworthy, human. **Palette**: teal, soft blue, sage green; warm neutral backgrounds; avoid aggressive red except for alerts. **Type**: humanist sans (Figtree, Source Sans 3, Nunito Sans) or a soft serif headline (Fraunces, Lora).
- **Sitemap**: Home, Services/Treatments (+ detail pages), Doctors/Team (+ profiles), About, Patient info (insurance, FAQ, forms), Locations, Blog/Resources, Contact/Book.
- **Home sections**: hero with booking CTA + phone, services grid, why-us, doctors, testimonials/ratings (only real ones the client supplies), insurance accepted, FAQ, location map + hours, final CTA.
- **CTA**: Book appointment, Call now. Sticky mobile call/book bar.
- **Schema**: `MedicalClinic`/`MedicalBusiness`, `Physician`, `MedicalProcedure`, `FAQPage`, `LocalBusiness` hours/geo.
- **Notes**: no patient data in analytics or URLs; forms collecting health info need a compliant backend (HIPAA/DPDP etc.) — flag this to the user; accessibility is critical (older audience): larger base font (18px), high contrast.

## 3. Dental
- As Healthcare, with friendlier tone. **Palette**: fresh aqua/mint + white, a warm accent. Before/after gallery (with consent), treatment pricing ranges, emergency dental CTA.
- **Schema**: `Dentist`.

## 4. Legal / accounting / consulting
- **Mood**: authoritative, precise, discreet. **Palette**: navy, deep green, burgundy or charcoal + a gold/brass accent. **Type**: serif headings (Playfair Display, Libre Baskerville, Source Serif) + clean sans body.
- **Sitemap**: Home, Practice areas (+ detail), Team/Attorneys (+ bios), Case results/Clients, Insights/Blog, About, Contact/Consultation.
- **Sections**: credentials/awards bar, practice areas, process, results, team, testimonials, consultation CTA.
- **Schema**: `LegalService`/`Attorney`, `AccountingService`, `ProfessionalService`, `Person`.
- **Motion**: minimal — fades only.

## 5. Finance / fintech / insurance
- **Mood**: secure, modern, clear. **Palette**: deep blue/indigo or dark green, bright accent (emerald, electric blue). **Type**: geometric/grotesk sans (Manrope, IBM Plex Sans, Geist), tabular numbers for figures.
- **Sections**: value prop + app/dashboard visual, trust (regulation, security, partner logos), product features, calculators, pricing/rates, FAQ, compliance disclosures in footer.
- **Schema**: `FinancialService`, `FinancialProduct`, `Organization`.
- **Notes**: regulatory disclaimers, accessible data tables, number formatting per locale.

## 6. SaaS / software / AI products
- **Mood**: sharp, confident, product-forward. **Palette**: strong brand hue (violet, blue, lime, orange) with dark-mode-first option; gradients used sparingly. **Type**: Geist, Satoshi or Bricolage Grotesque headings with a plain text face.
- **Sitemap**: Home, Product/Features, Solutions (by role/industry), Pricing, Customers, Docs/Changelog, Blog, Company, Contact/Demo, Login/Sign up.
- **Sections**: hero with product shot/video + primary CTA (Start free) + secondary (Book demo), logo cloud (real customers only), feature blocks, integrations, metrics (real only), testimonials, pricing teaser, FAQ, final CTA.
- **Schema**: `SoftwareApplication`, `Organization`, `Product` with `Offer`.
- **Motion**: product UI animations, one scroll moment, subtle parallax; keep LCP element static.

## 7. Agency / studio / portfolio
- **Mood**: distinctive, editorial, confident. **Palette**: often monochrome + one bold accent; or expressive brand colors. **Type**: expressive display (Clash Display, Syne, Space Grotesk, a strong serif) + neutral body.
- **Sitemap**: Home, Work (+ case studies), Services, About/Team, Process, Insights, Careers, Contact.
- **Sections**: big statement hero, selected work grid, services, clients, process, testimonials, contact CTA.
- **Schema**: `Organization`/`ProfessionalService`, `CreativeWork` for case studies.
- **Motion**: the place for richer motion — page transitions, hover reveals, marquee, split-text — still reduced-motion safe.

## 8. E-commerce / D2C retail
- **Mood**: depends on the product; imagery leads. **Palette**: neutral canvas so product photos pop + brand accent for buy buttons. **Type**: clean sans, maybe a display face for brand.
- **Sitemap**: Home, Collections/Categories, Product detail, Cart, Checkout, Search, Account, About/Story, Shipping & Returns, FAQ, Contact, Blog/Lookbook.
- **Sections**: hero campaign, featured collections, bestsellers, USP bar (free shipping, returns), reviews, UGC/Instagram, newsletter.
- **Stack**: Shopify (Hydrogen or theme), Next.js + Commerce API (Shopify Storefront, Medusa, Saleor, BigCommerce), or WooCommerce. Don't build payments yourself — use the provider's hosted checkout/elements.
- **Schema**: `Product`, `Offer`, `AggregateRating`, `BreadcrumbList`, `ItemList`.
- **Perf**: image CDN, product listing pagination, faceted URLs canonicalized.

## 9. Restaurant / café / food
- **Mood**: appetizing, warm, local. **Palette**: warm (terracotta, mustard, olive, deep red, cream) or brand-led. **Type**: characterful display (a serif or retro face) + readable sans.
- **Sitemap**: Home, Menu (HTML, not a PDF), Reservations/Order online, About/Story, Gallery, Events/Private dining, Locations & hours, Contact.
- **Sections**: hero food photo + Reserve/Order CTA, signature dishes, menu highlights, ambience gallery, reviews, hours & map.
- **Schema**: `Restaurant`/`CafeOrCoffeeShop`, `Menu`, `MenuItem`, `openingHoursSpecification`, `servesCuisine`, `acceptsReservations`.
- **Notes**: mobile-first (most traffic is "near me" on phones), click-to-call, a directions link (no map embed loading with the page).

## 10. Hospitality / hotel / travel
- **Mood**: aspirational, immersive. **Palette**: drawn from location (sea blues, sand, forest greens, desert ochre). **Type**: elegant serif display + light sans.
- **Sitemap**: Home, Rooms/Packages (+ detail), Amenities, Dining, Experiences/Destinations, Gallery, Offers, Location, Book.
- **Sections**: full-bleed hero (image/video poster), booking widget, rooms grid or swipe rail (never auto-advancing), amenities, experiences, reviews, location.
- **Schema**: `Hotel`/`LodgingBusiness`, `HotelRoom`, `TouristTrip`, `Offer`.
- **Perf**: background video only with poster, muted, `preload="none"` on mobile; or skip on slow connections.

## 11. Real estate / property
- **Mood**: premium, spacious, credible. **Palette**: charcoal/black + gold, or navy + white, or earthy for residential. **Type**: refined serif or modern grotesk.
- **Sitemap**: Home, Listings/Projects (+ detail with gallery, floor plans, amenities, map), Search/filter, About, Agents, Testimonials, Contact/Enquire, Blog/Market insights.
- **Schema**: `RealEstateAgent`, `Residence`/`Apartment`/`House`, `Offer`, `Place` with geo.
- **Notes**: listing pages dynamic (SSG + ISR or SSR), map lazy-loaded on interaction, lead forms everywhere.

## 12. Construction / home services / trades
- **Mood**: reliable, practical, local. **Palette**: strong primary (safety orange, yellow, blue, green) + dark neutral. **Type**: sturdy sans (Barlow, Barlow Condensed headings, Rethink Sans).
- **Sitemap**: Home, Services (+ per-service and per-area landing pages), Projects/Gallery, About, Reviews, Service areas, Free quote, Contact.
- **Sections**: hero with "Get a free quote" + phone, services, trust badges (licensed, insured, years), project gallery, process, reviews, service area map.
- **Schema**: `HomeAndConstructionBusiness`, `Plumber`, `Electrician`, `RoofingContractor`, `GeneralContractor`, `areaServed`.

## 13. Education / courses / schools
- **Mood**: encouraging, clear, structured. **Palette**: friendly brights for K-12/edtech; navy/maroon/green for institutions. **Type**: legible sans; serif for institutions.
- **Sitemap**: Home, Programs/Courses (+ detail: syllabus, outcomes, fees, schedule), Admissions, Faculty, Campus/Student life, Results/Testimonials, Events, Blog/News, Contact.
- **Schema**: `EducationalOrganization`/`School`/`CollegeOrUniversity`, `Course`, `Event`.

## 14. Fitness / gym / sports
- **Mood**: energetic, bold. **Palette**: dark base + neon/high-energy accent (lime, orange, red). **Type**: condensed bold display (Oswald, Bebas Neue, Anton) + sans body.
- **Sections**: hero video/photo, classes/programs, schedule, trainers, membership pricing, transformations, free trial CTA.
- **Schema**: `ExerciseGym`/`SportsActivityLocation`, `Event` for classes, `Offer`.

## 15. Beauty / salon / spa
- **Mood**: indulgent, soft, elegant. **Palette**: blush, nude, champagne, sage, or black + gold for luxury. **Type**: elegant serif display (Cormorant, Playfair) + light sans.
- **Sections**: hero, services menu with prices/durations, booking CTA, gallery, stylists, reviews, gift cards, location.
- **Schema**: `BeautySalon`/`DaySpa`/`HairSalon`, `Service`, `Offer`.

## 16. Non-profit / NGO / community
- **Mood**: human, hopeful, transparent. **Palette**: warm and approachable; one strong "Donate" color. **Type**: friendly sans + optional serif.
- **Sitemap**: Home, About/Mission, Programs/Impact, Stories, Get involved (volunteer, partner), Donate, Reports/Transparency, News, Contact.
- **Schema**: `NGO`/`Organization`, `DonateAction`, `Event`.

## 17. Events / conferences / weddings
- **Mood**: celebratory, time-bound. **Palette**: event brand; high contrast. **Type**: expressive display.
- **Sections**: hero with date/venue + countdown + Register/RSVP, speakers/agenda, venue, tickets, sponsors, FAQ.
- **Schema**: `Event` (startDate, location, offers, performer), `Place`.

## 18. Automotive / dealership
- **Mood**: powerful, sleek. **Palette**: black/graphite + brand red/blue/silver. **Type**: wide/technical sans.
- **Sections**: inventory search, featured vehicles, finance calculator, service booking, test drive CTA.
- **Schema**: `AutoDealer`, `Car`/`Vehicle`, `Offer`, `AutoRepair`.

## 19. Manufacturing / industrial / B2B
- **Mood**: capable, precise, global. **Palette**: steel blue, industrial grey, safety accent. **Type**: technical sans (IBM Plex Sans, Barlow).
- **Sitemap**: Home, Products/Capabilities (+ spec pages, downloadable datasheets), Industries served, Quality/Certifications, Facilities, About, Careers, RFQ/Contact.
- **Schema**: `Organization`, `Product` with `additionalProperty` specs.
- **Structure**: read `catalogue.md`. Product catalogues need a category tree, mega menu + sidebar, spec tables, an RFQ basket instead of a cart, datasheets, spares and service pages, and evidence-based trust rather than reviews.
- **Personality**: "engineering precision". Blueprint grids, monospaced model numbers and spec values, sharp radii, restrained motion (an instrument-panel hero, not floating blobs). Avoid generic factory stock photos; technical line-art reads as more credible.

## 20. Logistics / transport
- **Mood**: fast, reliable, connected. **Palette**: deep blue/orange or brand. **Sections**: services, network/coverage map, tracking widget, industries, quote CTA. **Schema**: `Organization`, `Service`, `areaServed`.

## 21. Personal brand / creator / coach
- **Mood**: personal, authentic. **Palette**: personal; often one signature color. **Type**: personality-driven display.
- **Sitemap**: Home, About, Offerings (coaching, courses, speaking), Content (blog/podcast/videos), Testimonials, Newsletter, Contact/Book a call.
- **Schema**: `Person`, `Service`, `Course`, `PodcastSeries`.

## 22. Laboratory / scientific / medical equipment & chemicals
- **Who buys**: QC/QA managers, lab heads, procurement at pharma, biotech, hospitals, food testing, universities. They compare specs, compliance and service support, then request quotations, often shared over WhatsApp/email with colleagues.
- **Mood**: precise, clean, trustworthy, quietly modern. **Palette**: steel/instrument blue or clinical teal + one signal accent (amber/orange "indicator light", or green "pass"), cool neutral greys. **Type**: IBM Plex Sans + Plex Mono, Geist + Geist Mono, or Source Sans 3 + Source Code Pro (mono for model numbers, ranges, tolerances).
- **Sitemap**: Home, Products (categories → products), Spare parts, Services (installation, IQ/OQ/PQ validation, calibration/mapping, AMC), Industries/Applications, Quality & certifications, Downloads, About (plant, R&D), News/Application notes, FAQ, Enquiry/RFQ, Contact, Privacy, Terms.
- **Home sections**: hero with an instrument-style visual and "Request a quote" + "Browse catalogue", stats (installed base, countries, years), category grid, featured products, why us (in-house engineering, validation docs, service network), industries served, compliance/certifications strip, process (enquiry → design → FAT → install → qualify), testimonials/clients, CTA.
- **Compliance language**: "GMP design", "21 CFR Part 11 *ready*", "ICH Q1A conditions", "USP/EP/IP test methods". Claim only what's true, mark sample data as illustrative.
- **Chemicals/reagents**: catalogue table with grade (AR/LR/HPLC), CAS number, purity/assay, pack sizes, storage; CoA and SDS per lot; hazard pictograms where relevant.
- **Schema**: `Organization`, `Product` (no `Offer` when quote-only), `ItemList`, `Service`, `LocalBusiness` for the plant.
- **Motion**: calm. Quiet section reveals, counting stats only for real figures; nothing that suggests imprecision.

---

## Universal sections library

Most pages in any vertical are compositions of these blocks — build them once, configure via data:
`hero` (variants: centered, split image, full-bleed, video), `logo-cloud`, `features` (grid, alternating, tabs), `stats`, `process/steps`, `services-grid`, `team`, `testimonials` (grid; real quotes only), `gallery` (grid, swipe rail, lightbox), `pricing`, `comparison-table`, `faq` (accordion), `cta-banner`, `contact` (form + map + details), `blog-list`, `newsletter`, `locations`, `timeline`, `rich-text`, `video`, `map`.
