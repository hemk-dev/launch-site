# Brief and planning

Decide what the site is for, what it says and where it moves before any code. Most messy sites come from building pages before the brief, the content shape and the motion budget are settled.

## 1. The brief

Infer what you reasonably can from the request, the existing repo and any current site; ask only what changes the build (one round, about four questions at most). If the user gives almost nothing ("a site for my salon"), don't stall: take the defaults from `verticals.md`, list your assumptions in one short block, and proceed.

| Pin down | Why it matters |
|---|---|
| **Business, audience, place**: "hair salon for working parents in Kothrud, Pune", not "beauty" | Drives copy, imagery, local SEO |
| **Kind**: `place` (people visit: spa, salon, café, hotel, shop), `service` (people hire: interior designer, lawyer, clinic, agency), `product`, `software` | Drives the hero, copy limits, `brand.mjs --kind`, `copy-lint --kind` |
| **Primary action**: book, call, order, request a quote, visit, sign up | One action, worded the same in nav, hero, close and phone bar |
| **Brand assets**: logo, colours, fonts, photographs, tone | Brand colours and logo beat any library palette (`design-system.md`) |
| **Facts**: services and prices, hours, address, phone, team, real reviews, real numbers | The only source of specifics; nothing is invented (`copy.md`) |
| **Static or dynamic**: who edits content, bookings, accounts, search | Decides the stack (`stacks.md`) |
| **Stack and hosting constraints**: existing repo, team skills, language | Honour them over the default |
| **Pages and locales** | Multi-language means i18n from day one |
| **Products** (if any): how many, where the data lives, priced or quoted | Read `catalogue.md` |

Write the brief to `docs/BRIEF.md` (or the repo's docs folder) with the stack, motion tier, palette and type ids, scroll moment, and the assumptions list, so later decisions trace back to it.

## 2. Scope: build what was asked, suggest the rest

Build the pages and features the user named, plus what every site needs: 404, privacy page, contact details, SEO files. Put everything else you think would help (blog, extra service pages, gift cards, newsletter, theme toggle, search) in a "Possible additions" list in the brief and the final report instead of building it. A simple first version that is clear and smooth beats one with many features: every extra feature is more for visitors to parse and more code to maintain.

## 3. Plan the page as a journey

Before writing sections, write the reader's questions in the order a stranger asks them, and give each a section that answers it. A typical local-business home page:

1. **What is this, where, is it for me?** Hero: category + place in the h1, one hard fact (price from, today's hours, the neighbourhood), the main action.
2. **What can I get, and for how much?** Services with prices and durations.
3. **Why here?** The place or the work: photographs, the short real story, the team (only real people from the brief).
4. **Can I trust it?** Real reviews, certifications or press the client supplies. None is fine; invented proof is not.
5. **Practical doubts.** FAQ: parking, cancellation, first visit, payment.
6. **How do I get there or book?** Visit block: address, hours, map link, form or booking link.
7. **Close.** The main action once more.

Merge or cut a section the brief has no material for; never pad it. A page is about 900 words at most; long copy moves to sub-pages.

## 4. The feeling curve: one peak

A page that moves everywhere has no moment. Plan where the energy sits:

- **The first screen** arrives once (the hero entrance) and then stands still so it can be read.
- **One peak** in the middle of the page: the scroll moment, if the tier allows one (`motion.md`). Put it where the business is most visual: the rooms of a spa, the before/after of an interior, the craft of a salon.
- **Everything else is calm**: hover and press feedback, at most one quiet reveal per section.

Write one line per motion with its purpose: "hero entrance: the name arrives, then what to do"; "photo-chapters in Rooms: three treatment rooms, one photograph and two lines each"; "hover: every link answers". A motion with no purpose is cut.

## 5. Choose the motion tier

Take the vertical's default from `verticals.md`, then adjust by one step for the brief (luxury and portfolio-led up, budget and older audiences down). Record it in the brief and in `site.config` (`theme.motionTier`).

| Tier | For | Gets |
|---|---|---|
| **calm** | clinics, legal, finance, trades, education | micro-interaction layer, CSS hero entrance, quiet section reveals |
| **balanced** | spa, salon, interior design, restaurant, hotel, retail | calm + one scroll moment (a layered hero counts as that moment) |
| **expressive** | agencies, creative studios, events, fitness, launches | balanced + a second scroll moment, scrub video, sparing pointer effects |

## 6. Plan the brand

- The client has a logo or brand colours: use them (`brand.mjs brand`); pick a type pairing from the library that suits the logo.
- No brand: `brand.mjs deal --trade <key>` deals three palette and type pairings for the trade; choose one with the vertical's mood and say why in the brief.
- Name: use the client's name. Only coin a name when the brief asks for one (`copy.md`, Names).
