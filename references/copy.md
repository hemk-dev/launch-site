# Copy

Say what the business is and what the visitor gets, in words a stranger understands in five seconds. Every sentence is one you would say out loud to a customer. Specifics come from the brief and the client's own words, never from style: when the brief lacks a fact, write a plainer line, not an invented one.

Check every finished page:

```bash
node <skill>/scripts/copy-lint.mjs dist/ --kind place     # or a page; kinds: place, service, product, software, tech, gaming
```

FAIL (fix every one): chatbot residue, a `{{TOKEN}}` or `[NEED]` left in, markdown on the page, the slop words and stock phrases below, a device used past twice its budget. WARN: fix it, or keep it and say why in the report. `--json` for scripts; exit 1 on any FAIL. It does not judge truth or tone; the read-aloud does.

## 1. Five rules

1. **The h1 names the category and, for a business nobody knows yet, the place or the buyer**, in 2 to 8 words. "Day spa in Koregaon Park", "Interior design studio for small flats in Leith", "Hair salon on Mill Street". Never a riddle, a mood, a command or a slogan with the facts pushed into the sub-line.
2. **The first screen holds one hard fact**: a price from, today's hours, the neighbourhood, a date.
3. **Every heading names a thing**: the service, the place, a section noun (prices, treatments, rooms, opening hours, questions, getting here, visit) or makes a short plain claim ("Open late on Thursdays"). 1 to 6 words. No questions as headings (FAQ entries aside), no colon reveals, no line that only makes sense after reading the page. One brand line a page at most, never the h1, with a fact in the line under it.
4. **Buttons are a verb plus what the visitor gets**, 1 to 5 words: Book a massage, Request a quote, See prices, Get directions, Call us. Never "Learn more", "Read more", "Discover", "Explore", "Click here".
5. **Few actions, one wording each**: at most two in the hero (one on a place). The main action names the transaction and reads the same in the nav, hero, close and phone bar. Ten different button labels a page at most.

## 2. Lengths

- **Hero sub-line**: service and product: what it is and the main benefit, 15 to 20 words. A place: the fact, 80 characters at most ("Massage, facials and a heated pool, open from 10:00 Tuesday to Sunday.").
- **Under a section heading**: one line to two sentences (10 to 40 words). **Card body**: 1 or 2 sentences, 25 words at most, one concrete detail.
- **Words per screen** stay low (about 35 to 50); a page about 900 words at most. Long copy goes to sub-pages.
- **Numbers** sit in sentences with their unit ("a 60-minute massage, 2,400 ₹"), uneven where real. A price does the selling, not a mood heading.
- **Form words**: a label says what goes in ("Preferred date"), never a placeholder in its place; an error names the field and what to type; the sent line names what was sent ("Your booking request is in. We reply within a day.").

## 3. Facts: nothing invented

- **Prices, hours, services, addresses, phone numbers, names and dates come from the brief.** When the brief lacks them: hours and prices may be assumed only on a place, plausible and uneven for the trade (3.60, not 4.00), each one listed in the report as the client's to confirm. Anything else stays out: a service with no price says "Price on request" or shows none.
- **Contact details**: print the name, address and phone **exactly as the brief gives them**, with the same wording in the visit block, the footer and the JSON-LD (consistent NAP is what local search needs). Never invent a street, house number, phone number, email or social account; leave the element out and list it as missing. Directions open a map search for the given address; no map iframe loads with the page.
- **No invented proof**: no made-up reviews, ratings, review counts, testimonials, client logos, awards, press lines, statistics or team members. Real reviews only word for word with the reviewer's name or town, as the client supplies them. Without proof, a strip of plain facts from the brief, or nothing.
- **No placeholders on a finished page**: no brackets, `{{tokens}}`, lorem ipsum, "coming soon" (unless the brief says so), links to `#` or empty hrefs.
- **No captions under pictures** describing the picture; a heading names the set.
- **Each fact once**: an opening time, a price or an address has one value and one wording everywhere it repeats.
- **Credits**: one short line at the end of the footer naming the sources of stand-in photographs ("Photographs via Unsplash and Pexels"), never a credit link per photo (`media.md`).

## 4. Names

Use the client's name. Coin one only when the brief asks: not a dictionary word, not a business that exists in that trade (search the name with its trade and as a domain; coin another if a same-trade business or a famous person has it in the first results), and never a name models keep coining (Kestrel, Halcyon, Lumen, Nimbus, Fieldnote, Brightloop, Acme, Northwind, Apex, Zenith, Vertex). People's names come only from the brief.

## 5. Copy tells

What makes copy read as machine-written, with the fix. One tell proves little; clusters and repetition are the signal. `copy-lint` ids in brackets.

**Ban outright**
- **Slop words** [copy-slop-word]: delve, tapestry, testament to, realm, embark, beacon, multifaceted, paradigm, myriad, plethora, meticulous, intricate, interplay, garner, boasts; elevate, unlock, unleash, empower, harness, supercharge, seamless, effortless, cutting-edge, revolutionary, transformative, holistic, next-level, next-generation, world-class, best-in-class, game-changing, state-of-the-art, bespoke, synergy, leverage, reimagine, powerful, robust, nestled, unparalleled. Each stands in for a fact: replace it with the fact. A word literal for the trade stays (bespoke tailoring, a holistic therapy the client actually offers by that name).
- **Stock lines** [copy-stock-phrase]: "In today's fast-paced world", "Unlock the power of", "Say goodbye to", "Whether you're A or B", "Join thousands of", "Look no further", "one-stop shop", "X made simple", "at your fingertips", "It's not just X, it's Y".
- **Residue** [copy-residue]: "Certainly!", "[Company Name]", `{{tokens}}`, markdown `**` or `##` on the page.
- **Puffery and dead metaphors** [copy-puffery]: serves as, stands as, plays a key role, landscape, ecosystem, journey (unless travel), "in the heart of", "where X meets Y". Name the street or the thing.
- **Process talk** [copy-reveal]: "The result?", "One thing changed: X", "Below you'll find", "This section shows". The page never talks about itself.
- **Virtue words about the business** [copy-virtue]: honest, calm, quiet, actually, genuinely, truly, simply, thoughtful, carefully. Show it with a fact (a quiet room is literal and fine).
- **Invented specifics**: "Room 9 at 6:12 a.m.", "Batch No. 047", "38% fewer". Detail produced as decoration.

**Fine once, a tell when repeated**
- Two-fragment headings "X. Y." [copy-two-fragment] (one a page); number-pair headings "Four rooms, four moods" [copy-number-pair].
- Contrast frames "not X but Y", "rather than", "instead of", "without the" [copy-contrast] (two a page, counted together); negation runs "No forms, no waiting" [copy-negation] (one).
- "-ing" riders ", ensuring a smooth visit" [copy-ing-rider]; "since 2009" [copy-since]; response-time promises [copy-response-time].
- Eyebrow labels over headings [copy-eyebrows]; step numbers on things that are not steps [copy-numbered]; a strip of three or four figures over one-word labels [copy-stat-strip].
- Em dashes [copy-em-dash]: none in visible copy (use a comma, colon, full stop or brackets); exclamation marks [copy-exclaim]: none.
- A footer sign-off line ("Made with love in Pune") [copy-footer-signoff]; a stale copyright year [copy-stale-year].

**Over-correction to avoid**: banning em dashes breeds comma splices (use colons and full stops); banning hype breeds a calm-word voice (put a fact in place of the adjective); "be specific" breeds invented numbers (use the brief or a plainer line); "short sentences" breeds a drumbeat of fragments (let one sentence a section run long); "end strong" breeds a quip on every paragraph (end on information).

**Not tells**: plain "is" and "has", correct grammar, a list of three when there are three things, selling on a sales page, copy the client wrote themselves.

## 6. Plain versions

| Vague | Plain |
|---|---|
| "Where calm begins" | Day spa with a heated pool in Koregaon Park |
| "Spaces that tell your story" | Interior design for flats under 80 m² |
| "Your best look awaits" | Haircuts from 650 ₹, colour from 2,200 ₹ |
| "Come unwind" | Book a 60-minute massage |

**Self-check**: read every line aloud to a customer. Is it clear what is offered, where, and for how much? If not, rewrite it.
