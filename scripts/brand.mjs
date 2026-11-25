#!/usr/bin/env node
/*
  launch-site brand.mjs - turns a trade or a client's brand colours into a ready tokens block.
  Node 18 or later, no packages. Data: ../library/palettes.json and ../library/type.json (from taste-skill, MIT).

  node brand.mjs deal  --trade spa [--kind place|service|product|software|gaming] [--count 3] [--seed any]
      Deals palette + type pairings for the trade. Same trade and seed give the same deal; change --seed for another.
  node brand.mjs css   --palette <id> --type <id> [--kind ...] [--radius sharp|soft|round]
      Prints the BRAND block for assets/tokens.css from a library palette and type pairing.
  node brand.mjs brand --bg <hex> --ink <hex> --accent <hex> [--surface <hex>] [--muted <hex>] --type <id> [--radius ...]
      Same, from the client's own brand colours (logo, guidelines, existing site).
  node brand.mjs list  [--trade spa]        palettes (filtered) and every type id

  Every colour pair is checked against WCAG (text 4.5:1, UI 3:1). A colour that fails is moved in lightness only,
  keeping its hue, and the change is reported as a comment, so the brand stays recognisable and the block passes
  scripts/contrast.py. Output colours are hex because contrast.py does not evaluate color-mix().
*/
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const PALETTES = JSON.parse(readFileSync(join(here, '..', 'library', 'palettes.json'), 'utf8'));
const TYPES = JSON.parse(readFileSync(join(here, '..', 'library', 'type.json'), 'utf8'));

const die = (m) => { console.error(m); process.exit(1); };
const [cmd, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith('--')) die(`unexpected argument: ${rest[i]}`);
  const k = rest[i].slice(2);
  args[k] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
}

// ------------------------------------------------------------ trades
const TRADES = [...new Set(PALETTES.flatMap((p) => p.trades))];
const ALIASES = {
  wellness: 'spa salon beauty hair hairdresser nails barber yoga pilates massage skincare esthetician aesthetics meditation retreat wellbeing',
  studio: 'interior interiors architect architecture designer design photographer photography art gallery tattoo ceramics',
  clinic: 'dentist dental physio physiotherapy chiropractor doctor medical vet veterinary therapy therapist optician pharmacy',
  law: 'lawyer legal attorney solicitor accountant accounting notary consultant consulting insurance',
  restaurant: 'bistro bar pub diner pizzeria food catering',
  cafe: 'coffee tea roaster juice',
  bakery: 'patisserie pastry cake dessert',
  hotel: 'bnb inn guesthouse resort hospitality villa rental realestate real-estate property',
  wedding: 'florist events planner venue',
  retail: 'shop store boutique fashion jewellery jewelry',
  workshop: 'carpenter joinery plumber electrician builder construction trades repair garage mechanic bike landscaping cleaning',
  agency: 'marketing creative branding',
};
const MULTI = { fitness: ['wellness', 'agency'], gym: ['wellness', 'agency'], school: ['studio', 'clinic'], education: ['studio', 'clinic'], tutor: ['studio', 'clinic'] };
const KIND_OF = { wellness: 'place', cafe: 'place', bakery: 'place', restaurant: 'place', hotel: 'place', retail: 'place', workshop: 'place',
  studio: 'service', clinic: 'service', law: 'service', wedding: 'service', agency: 'service',
  saas: 'software', devtool: 'software', fintech: 'software', ai: 'software', game: 'gaming', hardware: 'product', 'consumer-product': 'product' };
const MOODS = { wellness: ['calm', 'refined', 'warm', 'friendly'], studio: ['refined', 'calm', 'classic', 'precise'], clinic: ['calm', 'trusted', 'friendly'],
  law: ['trusted', 'classic', 'refined'], restaurant: ['warm', 'classic', 'refined'], cafe: ['warm', 'friendly', 'playful'], bakery: ['warm', 'friendly', 'playful'],
  hotel: ['refined', 'classic', 'calm'], wedding: ['refined', 'classic', 'warm'], retail: ['friendly', 'refined', 'bold'], workshop: ['trusted', 'bold', 'warm'],
  agency: ['bold', 'precise', 'playful'], saas: ['precise', 'friendly', 'calm'], devtool: ['technical', 'precise'], fintech: ['trusted', 'precise'],
  ai: ['precise', 'technical', 'calm'], game: ['bold', 'playful'], hardware: ['technical', 'precise', 'bold'], 'consumer-product': ['friendly', 'playful', 'bold'] };
const CALM = new Set(['clinic', 'law', 'wellness', 'hotel', 'studio']);

function resolveTrade(word) {
  const w = String(word).toLowerCase().trim();
  if (TRADES.includes(w)) return [w];
  if (MULTI[w]) return MULTI[w];
  for (const [t, list] of Object.entries(ALIASES)) if (list.split(' ').includes(w)) return [t];
  die(`unknown trade "${word}". Library trades: ${TRADES.join(', ')}\nAliases also work, e.g. spa, salon, interior, dentist, lawyer, florist, gym.`);
}

// ------------------------------------------------------------ seeded random
function rng(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ------------------------------------------------------------ colour (sRGB <-> OKLCH, WCAG)
const hexRe = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function parseHex(h) {
  const m = hexRe.exec(String(h).trim());
  if (!m) die(`not a hex colour: ${h}`);
  let s = m[1];
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
}
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const delin = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
function toOklch(hex) {
  const [r, g, b] = parseHex(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
function oklchToRgb(L, C, H) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
function fromOklch(L, C, H) {
  L = Math.min(1, Math.max(0, L));
  const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  let rgb = oklchToRgb(L, C, H);
  if (!inGamut(rgb)) { // keep hue and lightness, reduce chroma until it fits
    let lo = 0, hi = C;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToRgb(L, mid, H))) lo = mid; else hi = mid; }
    rgb = oklchToRgb(L, lo, H);
  }
  return toHex(rgb.map(delin));
}
const lum = (hex) => { const [r, g, b] = parseHex(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function mix(a, b, t) { // in OKLab, t = share of b
  const A = toOklch(a), B = toOklch(b);
  const ax = A.C * Math.cos((A.H * Math.PI) / 180), ay = A.C * Math.sin((A.H * Math.PI) / 180);
  const bx = B.C * Math.cos((B.H * Math.PI) / 180), by = B.C * Math.sin((B.H * Math.PI) / 180);
  const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
  return fromOklch(A.L + (B.L - A.L) * t, Math.hypot(x, y), ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}
// Move lightness (hue and chroma kept) until hex reaches `min` against every colour in `against`.
// dir -1 darkens, +1 lightens; default: away from the first background.
function fit(hex, against, min, dir) {
  if (against.every((g) => ratio(hex, g) >= min)) return hex;
  const o = toOklch(hex);
  const d = dir ?? (lum(against[0]) > 0.18 ? -1 : 1);
  for (let L = o.L; L >= 0 && L <= 1; L += d * 0.005) {
    const c = fromOklch(L, o.C, o.H);
    if (against.every((g) => ratio(c, g) >= min)) return c;
  }
  return d < 0 ? '#000000' : '#ffffff';
}
const best = (fill, candidates) => candidates.reduce((a, b) => (ratio(fill, b) > ratio(fill, a) ? b : a));

// ------------------------------------------------------------ type
const SERIF_STACK = 'Georgia, "Times New Roman", serif';
const SANS_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const typeById = (id) => TYPES.find((t) => t.id === id) || die(`unknown type "${id}". Ids: ${TYPES.map((t) => t.id).join(', ')}`);
const typeKinds = (kind) => ({ place: ['service', 'product'], service: ['service'], product: ['product'], software: ['software', 'tech'], gaming: ['gaming'] })[kind] || ['service'];

function axisSpec(f, extraAxes = '') {
  if (f.w) {
    const axes = [];
    if (f.opsz) axes.push(['opsz', f.opsz]);
    if (f.wdth) axes.push(['wdth', f.wdth]);
    axes.push(['wght', f.w]);
    for (const k of ['SOFT', 'WONK']) if (f[k] && extraAxes.includes(`'${k}'`)) axes.push([k, f[k]]);
    return axes.map((a) => a[0]).join(',') + '@' + axes.map((a) => `${a[1][0]}..${a[1][1]}`).join(',');
  }
  return f.s && f.s.length ? 'wght@' + f.s.join(';') : '';
}
function fontLinks(t) {
  const fams = [[t.display, t.display.axes || '']];
  if (t.text.family !== t.display.family) fams.push([t.text, '']);
  if (t.mono) fams.push([t.mono, '']);
  const q = fams.map(([f, ax]) => { const s = axisSpec(f, ax); return 'family=' + f.family.replace(/ /g, '+') + (s ? ':' + s : ''); }).join('&');
  const pkgs = fams.map(([f]) => (f.w ? '@fontsource-variable/' : '@fontsource/') + f.family.toLowerCase().replace(/ /g, '-'));
  return { href: `https://fonts.googleapis.com/css2?${q}&display=swap`, pkgs };
}

// ------------------------------------------------------------ derive the block
const RADII = { sharp: ['0.125rem', '0.25rem', '0.375rem'], soft: ['0.375rem', '0.75rem', '1.25rem'], round: ['0.625rem', '1rem', '1.75rem'] };

function derive(p, t, kind, radius) {
  const notes = [];
  const note = (name, from, to, why) => { if (from.toLowerCase() !== to.toLowerCase()) notes.push(`${name}: ${from} -> ${to} (${why})`); };
  const bg = p.bg;
  const dark = lum(bg) < 0.18;
  const surface = p.surface || mix(bg, p.ink, 0.05);
  const ink = fit(p.ink, [bg, surface], 7); note('ink', p.ink, ink, '7:1 on bg and surface');
  const muted0 = p.muted || mix(bg, ink, 0.6);
  const muted = fit(muted0, [bg, surface], 4.6); note('muted', muted0, muted, '4.5:1 on bg and surface');

  const inks = [p.accentInk, '#ffffff', ink, bg, '#000000'].filter(Boolean);
  let primary = fit(p.accent, [bg, surface], 4.6);
  let primaryInk = best(primary, inks);
  primary = fit(primary, [primaryInk], 4.6, lum(primaryInk) > 0.5 ? -1 : 1);
  note('primary', p.accent, primary, '4.5:1 on bg, and with its button text');
  const po = toOklch(primary);
  const hover = fit(fromOklch(po.L + (lum(primaryInk) > 0.5 ? -0.06 : 0.06), po.C, po.H), [primaryInk], 4.6);

  let accent = p.accent;
  const accentInk = best(accent, inks);
  accent = fit(accent, [accentInk], 4.6, lum(accentInk) > 0.5 ? -1 : 1);
  note('accent fill', p.accent, accent, 'badge text 4.5:1');
  const accentText = fit(p.accent, [bg, surface], 4.6);

  const border = mix(bg, ink, 0.12);
  const borderStrong = fit(mix(bg, ink, 0.4), [bg, surface], 3.05);
  const focus = fit(p.accent, [bg], 3.05);
  const danger = fit(fromOklch(dark ? 0.72 : 0.52, 0.19, 25), [bg, surface], 4.6);
  const success = fit(fromOklch(dark ? 0.76 : 0.5, 0.13, 150), [bg, surface], 4.6);

  const fields = (p.fields || []).map((f) => ({ bg: f.bg, ink: fit(f.ink, [f.bg], 4.6) }));
  const band = fields[0] || (dark ? { bg: surface, ink } : { bg: ink, ink: bg });
  band.ink = fit(band.ink, [band.bg], 4.6, lum(band.bg) > 0.18 ? -1 : 1);

  const a = toOklch(primary);
  const d = t.display;
  const weight = ['software', 'gaming'].includes(kind) ? d.tech : 400;
  const serifish = ['serif', 'slab'].includes(t.class);
  const r = RADII[radius] || RADII[serifish ? 'sharp' : 'soft'];

  const lines = [
    `  /* BRAND:START  palette ${p.id || 'client'} + type ${t.id}${notes.length ? '\n     adjusted for contrast:\n       ' + notes.join('\n       ') : ''} */`,
    '  :root {',
    `    --brand-h: ${a.H.toFixed(0)}; --brand-c: ${Math.min(0.2, Math.max(0.02, a.C)).toFixed(3)}; --accent-h: ${toOklch(p.accent).H.toFixed(0)};`,
    `    --color-bg: ${bg};`,
    `    --color-surface: ${surface};`,
    `    --color-surface-raised: ${dark ? mix(surface, ink, 0.06) : bg};`,
    `    --color-text: ${ink};`,
    `    --color-text-muted: ${muted};`,
    `    --color-border: ${border};`,
    `    --color-border-strong: ${borderStrong};`,
    `    --color-primary: ${primary};`,
    `    --color-primary-hover: ${hover};`,
    `    --color-primary-contrast: ${primaryInk};`,
    `    --color-link: ${primary};`,
    `    --color-accent: ${accent};`,
    `    --color-accent-contrast: ${accentInk};`,
    `    --color-accent-text: ${accentText};`,
    `    --color-focus: ${focus};`,
    `    --color-danger: ${danger};`,
    `    --color-success: ${success};`,
    `    --color-section-brand-bg: ${band.bg};`,
    `    --color-section-brand-text: ${band.ink};`,
    ...fields.slice(1).map((f, i) => `    --color-field-${i + 2}-bg: ${f.bg}; --color-field-${i + 2}-text: ${f.ink};`),
    `    --font-display: "${d.family}", ${serifish ? SERIF_STACK : SANS_STACK};`,
    `    --font-body: "${t.text.family}", ${SANS_STACK};`,
    ...(t.mono ? [`    --font-mono: "${t.mono.family}", ui-monospace, SFMono-Regular, Menlo, monospace;`] : []),
    `    --display-weight: ${weight};`,
    `    --display-tracking: ${d.tracking}em;`,
    `    --display-tracking-xl: ${d.trackingXl}em;`,
    `    --display-stretch: ${d.stretch || '100%'};`,
    `    --display-axes: ${d.axes || 'normal'};`,
    `    --display-scale: ${d.scale || 1};`,
    `    --radius-sm: ${r[0]}; --radius-md: ${r[1]}; --radius-lg: ${r[2]};`,
    `    color-scheme: ${dark ? 'dark' : 'light'};`,
    '  }',
    '  /* BRAND:END */',
  ];
  return { css: lines.join('\n'), dark, fonts: fontLinks(t), notes };
}

function printBlock(p, t, kind) {
  const out = derive(p, t, kind, args.radius);
  console.log(out.css);
  console.log(`\n/* Fonts. Production: self-host woff2 (npm i ${out.fonts.pkgs.join(' ')}), preload the display file used above the fold, font-display: swap.
   Prototype only: <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                   <link rel="stylesheet" href="${out.fonts.href}"> */`);
  if (out.dark) console.log('/* This palette is dark-ground: delete both dark-theme blocks in tokens.css and leave <html> without data-theme. */');
  if (p.note) console.log(`/* How this palette is used: ${p.note} */`);
}

// ------------------------------------------------------------ commands
function dealTypes(trades, kind, rand) {
  const kinds = typeKinds(kind);
  const moods = [...new Set(trades.flatMap((t) => MOODS[t] || []))];
  return TYPES.map((t) => ({
    t,
    s: Math.max(...kinds.map((k) => t.kinds[k] || 0)) * 2 + t.moods.filter((m) => moods.includes(m)).length * 1.5 + (kind === 'place' && t.place ? 1 : 0) + rand() * 1.5,
  })).sort((a, b) => b.s - a.s).map((x) => x.t);
}

if (cmd === 'deal') {
  if (!args.trade) die('deal needs --trade <word>, e.g. --trade spa');
  const trades = resolveTrade(args.trade);
  const kind = args.kind || KIND_OF[trades[0]] || 'service';
  const count = Math.max(1, Number(args.count) || 3);
  const rand = rng(`${trades.join('+')}|${kind}|${args.seed ?? ''}`);
  const calm = trades.some((t) => CALM.has(t));
  const pals = PALETTES.filter((p) => p.trades.some((t) => trades.includes(t)))
    .map((p) => ({ p, s: (trades.includes(p.trades[0]) ? 1 : 0.5) - (calm && p.tags.some((g) => g === 'flat-loud' || g === 'dark-neutral') ? 0.8 : 0) + rand() }))
    .sort((a, b) => b.s - a.s).slice(0, count).map((x) => x.p);
  const types = dealTypes(trades, kind, rand);
  console.log(`trade ${args.trade} -> ${trades.join(' + ')} (kind: ${kind})\n`);
  pals.forEach((p, i) => {
    const t = types[i];
    console.log(`${i + 1}. ${p.name}  [${p.id}]  ${p.tags.join(', ')}${lum(p.bg) < 0.18 ? '  (dark ground)' : ''}`);
    console.log(`   bg ${p.bg}  surface ${p.surface}  ink ${p.ink}  muted ${p.muted}  accent ${p.accent}${p.fields ? '  fields ' + p.fields.map((f) => f.bg).join(' ') : ''}`);
    console.log(`   type: ${t.display.family} / ${t.text.family}  [${t.id}]  ${t.suits}`);
    console.log(`   ${p.note}`);
    console.log(`   -> node brand.mjs css --palette ${p.id} --type ${t.id}${args.kind ? ' --kind ' + kind : ''}\n`);
  });
  console.log('Pick one, or mix a palette with another type id. A client with brand colours uses `brand` instead.');
} else if (cmd === 'css') {
  if (!args.palette || !args.type) die('css needs --palette <id> --type <id>');
  const p = PALETTES.find((x) => x.id === args.palette) || die(`unknown palette "${args.palette}". See: node brand.mjs list`);
  printBlock(p, typeById(args.type), args.kind || KIND_OF[p.trades[0]] || 'service');
} else if (cmd === 'brand') {
  for (const k of ['bg', 'ink', 'accent', 'type']) if (!args[k] || args[k] === true) die(`brand needs --${k}`);
  const p = { id: 'client', bg: toHex(parseHex(args.bg)), ink: toHex(parseHex(args.ink)), accent: toHex(parseHex(args.accent)) };
  if (args.surface) p.surface = toHex(parseHex(args.surface));
  if (args.muted) p.muted = toHex(parseHex(args.muted));
  printBlock(p, typeById(args.type), args.kind || 'service');
} else if (cmd === 'list') {
  const trades = args.trade ? resolveTrade(args.trade) : null;
  for (const p of PALETTES) if (!trades || p.trades.some((t) => trades.includes(t))) console.log(`${p.id.padEnd(28)} ${p.bg} ${p.ink} ${p.accent}  ${p.tags.join(',')}  [${p.trades.join(' ')}]`);
  console.log('\ntypes:');
  for (const t of TYPES) console.log(`${t.id.padEnd(20)} ${(t.display.family + ' / ' + t.text.family).padEnd(40)} ${t.moods.join(',')}  - ${t.suits}`);
} else {
  die('usage: brand.mjs deal --trade <word> | css --palette <id> --type <id> | brand --bg --ink --accent --type <id> | list [--trade <word>]');
}
