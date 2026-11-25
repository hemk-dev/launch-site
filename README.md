# launch-site

An agent skill for building **fast, mobile-first, SEO-ready websites for small businesses**: spas, salons, interior designers, clinics, cafés, studios, trades. It gives your AI assistant a complete workflow, a brand-fitted design system, honest copy rules, tasteful motion (micro-interactions, a CSS hero entrance, one scroll moment) and the scripts to check the result.

Works with **Claude Code**, **Claude.ai / Claude Desktop** and **Cursor**.

```
"Build a website for Lotus Day Spa in Pune. Calm, premium, booking is the main action."
```

## What you get

- **A guided workflow:** brief → stack → brand tokens → content as data → page → copy and photos → motion → SEO, performance, accessibility → verify → report.
- **Brand in one command:** `brand.mjs` deals palette + font pairings for a trade (64 palettes, 39 type pairings), or fits the client's own colours to WCAG contrast.
- **Motion by tier:** calm (clinics, firms), balanced (spa, salon, interiors: one scroll moment), expressive (agencies, gyms). Every moment has a readable fallback with JavaScript off and with reduced motion.
- **Ready assets:** design tokens, base CSS, an interaction layer, a 1 KB site script (menu, reveals, forms, phone action bar) and a complete one-page starter template.
- **Checks:** SEO/accessibility audit, contrast check, copy lint (catches invented facts, filler and leftover placeholders), performance budget, responsive screenshots, scroll-scene contact sheets.

## Install

The repository root **is** the skill folder (it contains `SKILL.md`), so clone it straight into your skills directory.

### Claude Code

Personal (all projects):

```bash
git clone https://github.com/hemk-dev/launch-site.git ~/.claude/skills/launch-site
```

Windows (PowerShell):

```powershell
git clone https://github.com/hemk-dev/launch-site.git "$env:USERPROFILE\.claude\skills\launch-site"
```

Or for one project only, clone into `.claude/skills/launch-site` inside that project. Restart Claude Code; the skill loads automatically when you ask for a website.

### Cursor

Personal (all projects):

```bash
git clone https://github.com/hemk-dev/launch-site.git ~/.cursor/skills/launch-site
```

Windows (PowerShell):

```powershell
git clone https://github.com/hemk-dev/launch-site.git "$env:USERPROFILE\.cursor\skills\launch-site"
```

Or for one project only, clone into `.cursor/skills/launch-site` in that project. Reload the window; the agent picks the skill up when your request matches, or you can mention it by name ("use the launch-site skill").

### Claude.ai / Claude Desktop

1. Download this repository as a ZIP (**Code → Download ZIP**), or zip the `launch-site` folder yourself so `SKILL.md` sits inside the top folder.
2. In Claude, open **Settings → Capabilities**, make sure code execution is on, and under **Skills** choose **Upload skill**.
3. Upload the ZIP and enable it.

On Claude.ai the scripts run in Claude's sandbox; scripts that need Chrome (`perf.mjs`, `scroll-shoot.mjs`) work best in Claude Code or Cursor on your own machine.

### Update

```bash
cd ~/.claude/skills/launch-site   # or ~/.cursor/skills/launch-site
git pull
```

## Requirements

Only needed for the scripts; the guides and assets work without them.

| Tool | Used by |
|---|---|
| Node.js 18+ (22+ for `perf.mjs` and `copy-lint.mjs`) | brand, copy lint, performance, server, screenshots |
| Python 3 | `audit_site.py`, `contrast.py` |
| Google Chrome (installed) | `perf.mjs`, `scroll-shoot.mjs` |
| `npm i -D playwright` / `playwright-core` in the site project | `screenshots.mjs` / `scroll-shoot.mjs` |
| ffmpeg + bash | `encode-scrub.sh` (expressive tier, scroll-scrubbed video only) |

## Use it

Just describe the site. Good prompts name the business, the town, the main action and any brand assets:

```
Make a one-page site for Atelier Nine, an interior design studio in Leith.
Main action: request a consultation. Logo colours are #2b2420 and #8a5a3c.
Balanced motion, portfolio photos are in ./photos.
```

```
Rebuild our salon site (Astro) to be faster on mobile and better for local SEO.
Keep the motion calm.
```

```
Audit https://example-clinic.com for design, copy, SEO, performance and accessibility.
```

The agent will ask at most a few questions (main action, real photos, contact details, existing brand), write a brief to `docs/BRIEF.md`, build, run the checks and report what still needs the client's input.

You can also run the tools yourself:

```bash
node scripts/brand.mjs deal --trade spa                 # three palette + type options for a spa
node scripts/brand.mjs brand --bg '#f6f1ea' --ink '#2b2420' --accent '#8a5a3c' --type fraunces
python3 scripts/contrast.py path/to/tokens.css          # WCAG contrast, light and dark
node scripts/copy-lint.mjs dist                         # copy tells and leftover {{TOKENS}}
python3 scripts/audit_site.py dist                      # SEO + accessibility audit of the build
node scripts/perf.mjs dist --root dist                  # performance budget at 1440 and 390 px
```

## What's inside

```
launch-site/
  SKILL.md          entry point the agent reads: workflow, file map, hard rules
  assets/           tokens.css, base.css, motion.css, site.js, starter.html,
                    site.config.example.json, scroll/ (scroll engine + styles)
  library/          palettes.json, type.json
  references/       brief-and-planning, design-system, copy, media, motion,
                    scroll-engine, hero-depth, seo, performance, quality-checklist,
                    stacks, content-model, verticals, catalogue
  scripts/          brand, contrast, copy-lint, audit_site, perf, screenshots,
                    serve, scroll-shoot, encode-scrub
```

## Principles

- **Nothing invented.** Names, addresses, phone numbers, prices, reviews and numbers come from you, or stay as visible placeholders the lint refuses to ship.
- **Calm by default, one peak.** Motion explains; it never blocks reading.
- **Readable without script.** Content, menu, forms and every scroll scene work with JavaScript off and reduced motion on.
- **Fast first.** Static output, ~1 KB of site script, the scroll engine only on pages that use it.

## Credits and licence

Built from three skills: website-builder, [taste-skill](https://github.com/leonxlnx/taste-skill) by Leonxlnx (MIT) and [scroll-craft](https://github.com/nateherkai/scroll-craft) by Nate Herk (MIT). See [NOTICE.md](NOTICE.md) for what came from each and the full licence texts.
