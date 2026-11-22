// Writes the plain-text side of the public brand guide, for people and LLMs that do not run JavaScript:
//   public/llms.txt                   index (llmstxt.org format) linking every markdown page
//   public/llms-full.txt              every markdown page in one file
//   public/index.md                   the brand family and the palette
//   public/usage.md                   how to apply a brand (the public part of BRANDING.md)
//   public/toolkit/system.md          the brand system
//   public/brands/<slug>/guide.md     one brand's guide: files, colors, theme, contrast, install
// Links are absolute, rooted at SITE_URL (default https://brand.wompland.com).
// Run after scripts/build-brands.mjs, which writes the files these pages link to.
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { converter, parse } from 'culori';
import {
  brandColors, entryChecks, contrast, GATES, WHITE, GRAPHITE,
  brandTheme, themeColors, contrastChecks, themeName,
  LOCKUP, MIN_SIZES, CLEAR_U, TILE, FIELD_SIZE, SIZE_RANGE,
} from '../src/brand/index.js';
import { OBJECT_NOTES, BRAND_NOTES } from '../src/brand/notes.js';
import { ROOT, PUBLIC_BRANDS, loadPalette, loadBrands, writeFileAtomic } from './lib/brand-store.mjs';
import { assetPaths } from './build-brands.mjs';

const SITE = (process.env.SITE_URL || 'https://brand.wompland.com').replace(/\/+$/, '');
const url = (path) => `${SITE}${path}`;
const PUBLIC = resolve(ROOT, 'public');

const toOklch = converter('oklch');
const oklch = (hex) => {
  const c = toOklch(parse(hex));
  return `oklch(${(c.l * 100).toFixed(1)}% ${c.c.toFixed(3)} ${(c.h ?? 0).toFixed(1)})`;
};
const ratio = (n) => `${n.toFixed(2)}:1`;
const pass = (ok) => (ok ? 'Pass' : 'FAIL');
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
const guideMd = (slug) => `/brands/${slug}/guide.md`;
const guideHtml = (slug) => `/toolkit/brand.html?brand=${slug}`;

const palette = loadPalette();
const brands = loadBrands().sort((a, b) => (a.role === 'master' ? -1 : b.role === 'master' ? 1 : a.name.localeCompare(b.name)));
const master = brands.find((b) => b.role === 'master');
const subs = brands.filter((b) => b.role !== 'master');
const usedBy = (id) => brands.filter((b) => b.color === id).map((b) => b.name);

const SUMMARY = `WompLand is a family of small, self-hosted publishing apps. The master brand is WompLand; each app is a "Womp" named \`<job>Womp\` (blogWomp, wikiWomp, …). Every brand is an icon built from three modules (a square cell, a quarter ring and a filled quarter circle) on a 7 × 7 field inside a 9 × 9 tile, on one color from a shared palette, beside its name in Archivo 600.`;

// ---------- Pages ----------

function indexPage() {
  const row = (b) => {
    const c = brandColors(b, palette);
    return [`[${b.name}](${url(guideMd(b.slug))})`, b.role === 'master' ? 'Master brand' : 'Womp', `${c.name} \`${c.field}\``, `${b.glyph}`, `\`${themeName(b.slug, 'light')}\`, \`${themeName(b.slug, 'dark')}\``];
  };
  const pal = palette.map((e) => {
    const r = Object.fromEntries(entryChecks(e).map((k) => [k.label, k.value]));
    const users = usedBy(e.id);
    return [e.name, `\`${e.field}\``, `\`${e.pale}\``, `\`${e.deep}\``, ratio(r['field vs white']), ratio(r['field vs graphite']), ratio(r['pale on field']), ratio(r['deep on field']), users.length ? users.join(', ') : 'Unused'];
  });
  return `# WompLand brands

${SUMMARY}

Each brand's guide lists its logo files, colors, DaisyUI themes and contrast checks. Every file is generated from the brand's data.

## The family

${table(['Brand', 'Role', 'Field color', 'Glyph', 'Themes'], brands.map(row))}

## Palette

Every brand's tile is one of these field colors, with its pale or deep partner as the glyph. All fields share one lightness (OKLCH L ${GATES.lightness[0]} to ${GATES.lightness[1]}) so no Womp outweighs another. Each field reaches ${GATES.fieldOnGround}:1 against white (\`${WHITE}\`) and graphite (\`${GRAPHITE}\`); pale and deep reach ${GATES.glyphOnField}:1 on their field.

${table(['Color', 'Field', 'Pale', 'Deep', 'Field on white', 'Field on graphite', 'Pale on field', 'Deep on field', 'Used by'], pal)}

## More

- [How to apply a brand in a project](${url('/usage.md')})
- [The brand system: modules, lockups, palette rules, don'ts, type](${url('/toolkit/system.md')})
- Machine-readable: [${url('/brands/index.json')}](${url('/brands/index.json')})
`;
}

function systemPage() {
  const describe = (s) => (s.type === 'cell' ? 'Cell' : `${s.type === 'ring' ? 'Quarter ring' : 'Filled quarter'}, size ${s.size}, rot ${s.rot}`);
  const counts = {};
  for (const s of master.shapes) counts[describe(s)] = (counts[describe(s)] ?? 0) + 1;
  const mc = brandColors(master, palette);
  const womp = (b) => {
    const c = brandColors(b, palette);
    return `- **${b.name}**: ${c.name} field, ${b.glyph} glyph. ${OBJECT_NOTES[b.slug] ?? ''} [Guide](${url(guideMd(b.slug))})`.replace(/\s+\[Guide\]/, ' [Guide]');
  };
  return `# The WompLand brand system

${SUMMARY}

## The module kit

One module is one ninth of the tile. Every curve is exactly one module thick, so rings and stems carry the same stroke. Coordinates are on the 7 × 7 field, origin top-left.

- **Cell**: 1 × 1. Dots, caps, bars and stems.
- **Quarter ring**: size ${SIZE_RANGE.ring[0]} to ${SIZE_RANGE.ring[1]}. A quarter band, outer radius = size, inner radius = size − 1; always one module thick.
- **Filled quarter**: size ${SIZE_RANGE.pie[0]} to ${SIZE_RANGE.pie[1]}. A solid quarter disc that rounds a corner of a block.

\`rot\` names the corner of the shape's box that holds the circle's centre, clockwise from top-left: 0 top-left, 1 top-right, 2 bottom-right, 3 bottom-left.

Stems, half rings, half discs and rounded blocks are not modules of their own: they are cells and quarters placed side by side, and shapes union into one glyph.

## The icon's construction

Like every Womp, WompLand is marked by an icon, not a letter: a picture built from the module kit on the ${FIELD_SIZE} × ${FIELD_SIZE} field inside a one-module margin, with every stroke one module thick. ${master.name}: ${mc.name} field, ${master.glyph} glyph. Nothing is drawn freehand.

${table(['Module', 'Count'], Object.entries(counts).map(([k, n]) => [k, String(n)]))}

## The lockup spec

A lockup is the tile plus the name in Archivo 600, measured in modules of the tile (u = 1/${TILE} of the tile).

- **Horizontal**: the name starts ${LOCKUP.gapU}u from the tile; its caps are ${LOCKUP.capU}u tall and centred on the tile.
- **Stacked**: the tile is centred over the name, ${LOCKUP.stackGapU}u from the tile to the cap top.
- Tracking ${LOCKUP.tracking}em. Names are camelCase as written (\`<job>\` + Womp), and outlined in every logo file, so no file depends on the font.
- The tile never changes between grounds; only the name switches from ink (light grounds) to paper (dark grounds, the \`-reverse\` files).
- **Clear space**: ${CLEAR_U}u on every side.
- **Minimum sizes**:

${table(['Use', 'Screen', 'Print'], MIN_SIZES.map((m) => [m.name, `${m.px} px`, m.print]))}

Below 24 px, use the favicon art: a 1 px margin instead of one module, snapped to whole pixels.

## One rule for every Womp

A Womp's glyph is the core object of its job, built from the module kit inside the ${FIELD_SIZE} × ${FIELD_SIZE} field, set on one palette color with that color's pale or deep partner, and followed by its name in Archivo 600. No new design work per app: pick the object the app is about, draw it, choose a color. The theme follows from the color.

${subs.map(womp).join('\n')}

## The palette rules

1. **Equal weight.** Every field sits in one lightness band (OKLCH L ${GATES.lightness[0]} to ${GATES.lightness[1]}), so no Womp shouts over another.
2. **Works on white and graphite.** Each field reaches ${GATES.fieldOnGround}:1 against white (\`${WHITE}\`) and graphite (\`${GRAPHITE}\`), so the tile reads as a shape on either page.
3. **Pale and deep partners.** Each field has a pale and a deep glyph color of the same hue (within ${GATES.hueDrift}°), both at ${GATES.glyphOnField}:1 or more on the field. A brand picks one.
4. **Distinct, and clear of look-alikes.** Neighbouring fields stay tellable apart, and every field keeps its distance from WordPress and Shopify colors. Blue is fine, but never blue plus a W.

The colors themselves: [the palette](${url('/index.md')}#palette).

## Don'ts

- Don't put a circle or ring around the icon.
- Don't stretch the tile. It is always square.
- Don't rotate or flip it. The icon has one upright, and turned it stops reading as itself.
- Don't set the name in another face, or build it from modules.
- Don't use a color outside the palette, even a familiar one.
- Don't put a W, or any letter or circled mark, on a blue tile. Blue plus a W reads as WordPress.

## The type scale

Archivo for everything people read: one family, seven sizes, tabular figures wherever numbers line up. JetBrains Mono is for code only.

${table(['Role', 'Size', 'Leading', 'Weight'], [
    ['Wordmark', `cap ${LOCKUP.capU}u`, '—', '600'],
    ['Display', '64 px', '0.98', '800'],
    ['Heading 1', '40 px', '1.10', '700'],
    ['Heading 2', '28 px', '1.10', '700'],
    ['Heading 3', '22 px', '1.10', '700'],
    ['Body', '18 px', '1.60', '400'],
    ['Small', '15 px', '1.50', '400'],
    ['Label', '13 px', '1.30', '600'],
    ['Code', '14 px', '1.60', '400'],
  ])}

Reading text is 18 pixels on a 68-character measure. Headings stay tight (−2%), labels open up (+4%) and run in capitals, and nothing is set below 13 pixels.
`;
}

const FILES = [
  ['horizontal', 'Horizontal lockup', 'Main logo for light grounds. Site headers.'],
  ['horizontalReverse', 'Horizontal lockup, reverse', 'For dark grounds; the name switches to paper, the tile is identical.'],
  ['stacked', 'Stacked lockup', 'Tile centred over the name, for square-ish spaces on light grounds.'],
  ['stackedReverse', 'Stacked lockup, reverse', 'For dark grounds.'],
  ['mark', 'Mark', 'The icon tile alone, 72 × 72, scales freely. Avatars, app icons in UI.'],
  ['favicon', 'Favicon art (SVG)', 'Tuned for 16–32 px.'],
  ['faviconIco', 'favicon.ico', '16 and 32 px inside, for old browsers.'],
  ['png16', 'PNG 16', '16 × 16, favicon art.'],
  ['png32', 'PNG 32', '32 × 32, favicon art.'],
  ['appleTouch', 'Apple touch icon', '180 × 180.'],
  ['png192', 'PNG 192', '192 × 192, web app manifest.'],
  ['png512', 'PNG 512', '512 × 512, web app manifest.'],
  ['theme', 'DaisyUI themes', 'Light and dark theme blocks.'],
  ['brand', 'Brand data', 'Source, colors, theme tokens and asset paths (JSON).'],
];

function brandPage(b) {
  const c = brandColors(b, palette);
  const t = brandTheme(b, palette);
  const a = assetPaths(b.slug);
  const [L, D] = ['light', 'dark'].map((m) => contrastChecks(themeColors(b, palette, m)));
  const failed = [...L, ...D].filter((k) => !k.pass).length;
  const css = readFileSync(resolve(PUBLIC_BRANDS, b.slug, 'daisyui-theme.css'), 'utf8').trim();
  const prim = (m) => `- **${m === 'light' ? 'Light' : 'Dark'}** (\`${themeName(b.slug, m)}\`): primary \`${t[m].primary}\`, primary-content \`${t[m].primaryContent}\``;
  const note = BRAND_NOTES[b.slug];
  const object = OBJECT_NOTES[b.slug];
  return `# ${b.name} brand guide

${b.role === 'master' ? 'Master brand of the WompLand family.' : `A Womp, part of the [WompLand family](${url('/index.md')}).`} ${c.name} field, ${b.glyph} glyph. Themes \`${themeName(b.slug, 'light')}\` and \`${themeName(b.slug, 'dark')}\`.${object ? `\n\n**Icon.** ${object}` : ''}${note ? `\n\n**Note.** ${note}` : ''}

Visual version: ${url(guideHtml(b.slug))}

## Logo files

Every file is generated from the brand data. The names in the SVGs are outlined paths, so logos need no font installed.

${table(['File', 'Use', 'URL'], FILES.map(([k, name, use]) => [name, use, url(a[k])]))}

## On light and dark

- Light ground: \`horizontal.svg\` / \`stacked.svg\`. Dark ground: the \`-reverse\` versions. The tile never changes; only the name switches from ink to paper.
- Keep ${CLEAR_U} modules (${CLEAR_U}/${TILE} of the tile) clear on every side.
- Minimum sizes: ${MIN_SIZES.map((m) => `${m.name.toLowerCase()} ${m.px} px${m.print !== '—' ? ` (${m.print})` : ''}`).join('; ')}. Below 24 px, use the favicon art.

## Colors

The tile is the ${c.name} field with its ${b.glyph} partner as the glyph. Fields are surfaces: text on a field is only ever large (22px bold), because the glyph partner is gated at 3:1, which is AA for large text only. Text in the brand color uses the theme primary, which is derived from the field until it reaches 4.5:1 on both page grounds.

${table(['Role', 'Hex', 'OKLCH'], [
    [`Field (tile background)`, `\`${c.field}\``, oklch(c.field)],
    [`Pale (${b.glyph === 'pale' ? 'glyph' : 'partner'})`, `\`${c.pale}\``, oklch(c.pale)],
    [`Deep (${b.glyph === 'deep' ? 'glyph' : 'partner'})`, `\`${c.deep}\``, oklch(c.deep)],
  ])}

Theme primary:

${prim('light')}
${prim('dark')}

### Contrast gate

${failed ? `${failed} of ${L.length + D.length} checks fail.` : `All ${L.length + D.length} checks pass, light and dark.`} Body text 7:1, muted text and every color on its content 4.5:1, primary as text 4.5:1, interface colors 3:1.

${table(['Pair', 'Min', 'Light', 'Dark'], L.map((k, i) => [k.label, String(k.min), `${ratio(k.ratio)} ${pass(k.pass)}`, `${ratio(D[i].ratio)} ${pass(D[i].pass)}`]))}

## Install

Copy the files into the project's static folder, then add the favicons to \`<head>\`:

\`\`\`html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
\`\`\`

Save [\`daisyui-theme.css\`](${url(a.theme)}) next to the main stylesheet and import it after DaisyUI (Tailwind v4 + DaisyUI 5):

\`\`\`css
@import "tailwindcss";
@plugin "daisyui" { themes: false; }
@import "./daisyui-theme.css";
\`\`\`

The light theme is the default; the dark theme applies when the visitor prefers dark. Set \`data-theme="${themeName(b.slug, 'dark')}"\` on \`<html>\` to force it. Or paste the theme blocks directly:

\`\`\`css
${css}
\`\`\`

Full setup, the logo swap for light and dark, and the usage rules: [How to apply a brand](${url('/usage.md')}).
`;
}

function usagePage() {
  const src = readFileSync(resolve(ROOT, 'BRANDING.md'), 'utf8');
  const m = src.match(/<!-- public:start[^>]*-->\n([\s\S]*?)<!-- public:end -->/);
  if (!m) throw new Error('BRANDING.md: missing the <!-- public:start --> … <!-- public:end --> block');
  const body = m[1].trim().replace(/^(#+) \d+\. /gm, '$1 ');
  return `# How to apply a WompLand brand

Take the generated files from the brand's guide; never redraw, recolor or re-typeset the logo. Each brand's files live under \`${url('/brands/<slug>/')}\` (for example ${url('/brands/blogwomp/horizontal.svg')}), and its guide is \`${url('/brands/<slug>/guide.md')}\`. The examples below use blogWomp; swap in the slug of your brand.

${body}
`;
}

function llmsTxt() {
  return `# WompLand brand guide

> ${SUMMARY}

Every logo, icon and theme below is generated from each brand's data. Use the files as they are, pick the reverse logo for dark grounds, and take colors only from the brand's theme. Never invent a logo, color or theme for a Womp that is not listed here.

## Brands

${brands.map((b) => `- [${b.name}](${url(guideMd(b.slug))}): ${b.role === 'master' ? 'master brand' : 'Womp'}, ${brandColors(b, palette).name} field, ${b.glyph} glyph. Logo files, colors, DaisyUI themes, contrast checks and install snippets.`).join('\n')}

## Guides

- [The family and the palette](${url('/index.md')}): every brand and all palette colors with their contrast ratios.
- [How to apply a brand](${url('/usage.md')}): setup (Vite, Tailwind v4, DaisyUI 5, Archivo), favicons, manifest, light/dark logo swap, house style and the usage rules.
- [The brand system](${url('/toolkit/system.md')}): the module kit, the icon's construction, the lockup spec, the sub-brand rule, palette rules, don'ts and the type scale.

## Optional

- [Everything in one file](${url('/llms-full.txt')})
- [All brands as JSON](${url('/brands/index.json')}); each brand's \`brand.json\` is linked from its guide.
`;
}

// ---------- Write ----------
export function buildLlms() {
  const pages = [
    ['index.md', indexPage()],
    ['usage.md', usagePage()],
    ['toolkit/system.md', systemPage()],
    ...brands.map((b) => [`brands/${b.slug}/guide.md`, brandPage(b)]),
  ];
  const out = [...pages, ['llms.txt', llmsTxt()], ['llms-full.txt', pages.map(([, md]) => md.trim()).join('\n\n---\n\n') + '\n']];
  for (const [rel, text] of out) {
    const file = resolve(PUBLIC, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileAtomic(file, text);
  }
  return out.map(([rel]) => rel);
}

if (import.meta.main) {
  try {
    const files = buildLlms();
    console.log(`✓ llms.txt + ${files.length - 1} markdown files (${SITE})`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
