// Seed Packet Allotment logo system.
// Rule: every Womp is the same printed packet (crimped top, arched window, soil bed).
// The packet is printed in the Womp's own ink from the pool; the window grows the job's core object as a plant.
// Writes standalone SVGs to public/logos/seed/ and refreshes the inline copies in identities/seed.html.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, formatHex } from 'culori';
import opentype from 'opentype.js';
import { loadFont, svgDoc, round } from '../../scripts/lib/text-path.mjs';

// Same contract as text-path.mjs textToPath, but coordinates are rounded before serializing:
// opentype.js roundDecimal() emits NaN for values whose fractional part prints in exponent form (e.g. 343.00000000000006).
function textToPath(font, text, { x = 0, y = 0, size = 100, tracking = 0 } = {}) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const path = new opentype.Path();
  let cursor = x;
  glyphs.forEach((g, i) => {
    path.extend(g.getPath(cursor, y, size));
    cursor += g.advanceWidth * scale;
    if (i < glyphs.length - 1) cursor += font.getKerningValue(g, glyphs[i + 1]) * scale + tracking * size;
  });
  for (const cmd of path.commands) for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) if (k in cmd) cmd[k] = round(cmd[k]);
  return { d: path.toPathData({ decimalPlaces: 2, optimize: false, flipY: false }), width: cursor - x };
}

const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'public/logos/seed');
const page = resolve(root, 'identities/seed.html');
const tokens = await import(pathToFileURL(resolve(root, 'src/tokens/seed.mjs')).href + `?t=${Date.now()}`);
const hex = (c) => formatHex(parse(c));
const soil = tokens.soil.map(hex);
const font = loadFont('young-serif', 400);

const LW = 3; // the one line weight of the whole illustration system (mark units)
const W = 120;
const H = 150;

// ---------- packet geometry ----------
const crimp = (x0, x1, yPeak, yValley, n) => {
  const step = (x1 - x0) / n;
  let d = '';
  for (let i = 0; i < n; i++) d += `L${round(x0 + i * step + step / 2)} ${yPeak}L${round(x0 + (i + 1) * step)} ${yValley}`;
  return d;
};
const PACKET = `M8 14${crimp(8, 112, 5, 14, 13)}V141Q112 146 107 146H13Q8 146 8 141Z`;
const TICKS = Array.from({ length: 13 }, (_, i) => `M${12 + i * 8} 19V25`).join('');
const WINDOW = 'M22 128V76A38 38 0 0 1 98 76V128Z';
const MOUND = 'M22 128V119Q60 107 98 119V128Z';

const leaf = (d, c) => `<path d="${d}" fill="${c.packet}" stroke="${c.line}" stroke-width="${LW}" stroke-linejoin="round"/>`;
const line = (d, c, extra = '') =>
  `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="${LW}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const pageLeaf = (x, y, c) =>
  `<path d="M${x} ${y}H${x + 12}L${x + 18} ${y + 6}V${y + 22}H${x}Z" fill="${c.packet}" stroke="${c.line}" stroke-width="${LW}" stroke-linejoin="round"/>` +
  line(`M${x + 12} ${y}V${y + 6}H${x + 18}`, c);

// Crops: the job's object grown as a plant. Drawn inside the window, line + flat ink fill.
const CROPS = {
  // WompLand: a plain two-leaf sprout.
  womp: (c) =>
    line('M60 114V80', c) +
    leaf('M60 88C53 72 42 66 29 67C33 81 45 90 60 88Z', c) +
    line('M58 86C50 79 42 74 35 71', c) +
    `<g class="sprout-r">${leaf('M60 80C64 64 75 57 86 58C85 71 76 81 60 80Z', c)}${line('M62 78C68 71 75 65 81 62', c)}</g>`,
  // blogWomp: the top leaf is a pen nib.
  blog: (c) =>
    line('M60 114V88', c) +
    leaf('M60 104C52 92 42 87 31 88C35 99 46 106 60 104Z', c) +
    `<path d="M54 82H66V89H54Z" fill="${c.line}"/>` +
    leaf('M60 43C66 53 74 61 74 69C74 76 70 80 67 82H53C50 80 46 76 46 69C46 61 54 53 60 43Z', c) +
    line('M60 48V64', c) +
    `<circle cx="60" cy="69" r="3.5" fill="${c.paper}" stroke="${c.line}" stroke-width="${LW}"/>`,
  // wikiWomp: a branching stem whose leaves are linked pages.
  wiki: (c) =>
    line('M60 114V67M60 100Q46 99 38 88M60 89Q74 88 82 82', c) +
    pageLeaf(29, 66, c) +
    pageLeaf(73, 60, c) +
    pageLeaf(51, 45, c) +
    `<circle cx="60" cy="100" r="3.5" fill="${c.paper}" stroke="${c.line}" stroke-width="${LW}"/>` +
    `<circle cx="60" cy="89" r="3.5" fill="${c.paper}" stroke="${c.line}" stroke-width="${LW}"/>`,
  // listWomp (hypothetical, follows the rule): a row of seedlings whose leaves are check marks.
  list: (c) =>
    [36, 60, 84]
      .map((x, i) => {
        const top = [96, 88, 100][i];
        return (
          line(`M${x} 116V${top}`, c) +
          leaf(`M${x} ${top + 2}C${x - 4} ${top - 3} ${x - 8} ${top - 5} ${x - 11} ${top - 5}C${x - 10} ${top} ${x - 6} ${top + 3} ${x} ${top + 2}Z`, c) +
          leaf(`M${x} ${top + 2}C${x + 4} ${top - 9} ${x + 9} ${top - 16} ${x + 15} ${top - 19}C${x + 15} ${top - 9} ${x + 9} ${top} ${x} ${top + 2}Z`, c)
        );
      })
      .join(''),
};

function mark(crop, c) {
  return (
    `<path d="${PACKET}" fill="${c.packet}"/>` +
    `<path d="${TICKS}" stroke="${c.paper}" stroke-width="${LW}" stroke-linecap="round" opacity=".55"/>` +
    `<path d="${WINDOW}" fill="${c.paper}"/>` +
    CROPS[crop](c) +
    `<path d="${MOUND}" fill="${c.line}"/>`
  );
}

// Blank packet: the slot a future Womp fills. Dashed, one seed in the bed.
function blank(c) {
  const dash = `fill="none" stroke="${c.line}" stroke-width="${LW}" stroke-dasharray="7 6" stroke-linejoin="round"`;
  return (
    `<path d="${PACKET}" ${dash}/>` +
    `<path d="${WINDOW}" ${dash}/>` +
    `<path d="M22 128V119Q60 107 98 119V128" fill="none" stroke="${c.line}" stroke-width="${LW}"/>` +
    `<ellipse cx="60" cy="118" rx="5" ry="3.5" fill="${c.line}" transform="rotate(-20 60 118)"/>`
  );
}

// Construction sheet for the crop spec: window grid, stem origin, line weight.
function construction(c) {
  const grid = [];
  for (let x = 22; x <= 98; x += 19) grid.push(`M${x} 38V128`);
  for (let y = 52; y <= 128; y += 19) grid.push(`M22 ${y}H98`);
  return (
    `<path d="${WINDOW}" fill="${c.paper}" stroke="${c.line}" stroke-width="1"/>` +
    `<path d="${grid.join('')}" stroke="${c.grid}" stroke-width=".75" stroke-dasharray="2 2"/>` +
    `<path d="${MOUND}" fill="${c.line}"/>` +
    `<path d="M60 114V62" stroke="${c.line}" stroke-width="${LW}" stroke-linecap="round"/>` +
    `<circle cx="60" cy="114" r="5" fill="none" stroke="${c.mark}" stroke-width="1.5"/>` +
    `<path d="M60 62C66 53 74 50 82 52C81 60 72 64 60 62Z" fill="${c.packet}" stroke="${c.line}" stroke-width="${LW}" stroke-linejoin="round"/>`
  );
}

// ---------- favicons ----------
// Drawn on a 16-unit grid: three crimp teeth, an arched paper window, one bold soil silhouette.
const FAV_PACKET = 'M1 2.9L3.33 .7L5.67 2.9L8 .7L10.33 2.9L12.67 .7L15 2.9V14.4Q15 15 14.4 15H1.6Q1 15 1 14.4Z';
const FAV_WINDOW = 'M2.5 13.5V7.2Q2.5 4.1 5.7 4.1H10.3Q13.5 4.1 13.5 7.2V13.5Z';
const FAV_BED = 'M2.5 13.5V12.4Q8 11.4 13.5 12.4V13.5Z';
const FAV_CROPS = {
  // two open leaves on a stem
  womp: (S) =>
    `<path d="M7.25 12.5V9h1.5v3.5zM8 9.4C7.2 6.6 5.4 5.3 3.3 5.6C3.3 8.1 5.2 9.6 8 9.4ZM8 9.4C8.8 6.6 10.6 5.3 12.7 5.6C12.7 8.1 10.8 9.6 8 9.4Z" fill="${S}"/>`,
  // pointed nib with a slit from the tip
  blog: (S, P) =>
    `<path d="M8 4.7L11.7 9.3L10.5 12.1H5.5L4.3 9.3Z" fill="${S}"/>` +
    `<path d="M8 6.4V10.1" stroke="${P}" stroke-width="1.2" stroke-linecap="square"/>`,
  // three solid squares on a fork
  wiki: (S) =>
    `<path d="M8 12.5V7.4M8 11.2 4.6 10.4M8 11.2l3.4-.8" stroke="${S}" stroke-width="1.3" fill="none"/>` +
    `<path d="M6.6 4.8h2.8v2.8H6.6zM3 7.9h3v3H3zM10 7.9h3v3h-3z" fill="${S}"/>`,
};

function favicon(crop, light, dark) {
  return (
    `<style>.p{fill:${light}}@media (prefers-color-scheme:dark){.p{fill:${dark}}}</style>` +
    `<path class="p" d="${FAV_PACKET}"/>` +
    `<path d="${FAV_WINDOW}" fill="${soil[0]}"/>` +
    FAV_CROPS[crop](soil[10], soil[0]) +
    `<path d="${FAV_BED}" fill="${soil[10]}"/>`
  );
}

const CROP_NAMES = { womp: 'a two-leaf sprout', blog: 'a sprout topped with a pen nib', wiki: 'a branching stem of linked pages', list: 'a row of check-mark seedlings' };

// ---------- wordmarks ----------
// Casing: camel case, job word first. The job word prints in the packet's text ink, "Womp" in soil.
const SIZE = 100;
const CAP = 75; // Young Serif cap height at size 100
function word(parts, x, baseline, size = SIZE) {
  let cursor = x;
  const paths = [];
  for (const [text, fill] of parts) {
    const t = textToPath(font, text, { x: cursor, y: baseline, size, tracking: -0.005 });
    paths.push(`<path d="${t.d}" fill="${fill}"/>`);
    cursor += t.width;
  }
  return { svg: paths.join(''), width: cursor - x };
}

const APPS = {
  womp: { file: 'wompland', name: 'WompLand', parts: (c) => [['Womp', c.womp], ['Land', c.word]], ink: 'beet' },
  blog: { file: 'blogwomp', name: 'blogWomp', parts: (c) => [['blog', c.word], ['Womp', c.womp]], ink: 'carrot' },
  wiki: { file: 'wikiwomp', name: 'wikiWomp', parts: (c) => [['wiki', c.word], ['Womp', c.womp]], ink: 'pea' },
  list: { file: 'listwomp', name: 'listWomp', parts: (c) => [['list', c.word], ['Womp', c.womp]], ink: 'borage' },
};

const themes = Object.fromEntries((await import(pathToFileURL(resolve(root, 'src/themes/seed.report.json')).href, { with: { type: 'json' } })).default.map((t) => [t.theme, t.colors]));

function palette(app, mode) {
  const ink = tokens.packets[mode][APPS[app].ink].ink;
  const brandTheme = themes[`seed-${app === 'list' ? 'womp' : app}-${mode}`];
  return {
    packet: hex(ink),
    paper: soil[0],
    line: soil[10],
    womp: mode === 'light' ? soil[10] : soil[0],
    word: app === 'list' ? hex(ink) : brandTheme.primary,
  };
}

// Inline (page) palette: follows the active DaisyUI theme of the nearest data-brand element.
const live = { packet: 'var(--packet)', paper: 'var(--paper)', line: 'var(--line)', womp: 'var(--color-base-content)', word: 'var(--color-primary)' };
const liveList = { ...live, packet: 'var(--ink-borage)', word: 'var(--ink-borage)' };

// Lockup geometry, mark units. Wordmark cap height = 0.5 of mark height, baseline on the soil bed line.
const textSize = (H * 0.5 * SIZE) / CAP;
const GAP = 26;
const baselineH = 128 - 4;
function horizontal(app, c) {
  const w = word(APPS[app].parts(c), W + GAP, baselineH, textSize);
  return { body: mark(app, c) + w.svg, width: W + GAP + w.width + 4, height: H };
}
function stacked(app, c) {
  const probe = word(APPS[app].parts(c), 0, 0, textSize);
  const width = Math.max(W, probe.width) + 8;
  const mx = (width - W) / 2;
  const baseline = H + 24 + textSize * 0.75;
  const w = word(APPS[app].parts(c), (width - probe.width) / 2, baseline, textSize);
  return { body: `<g transform="translate(${round(mx)} 0)">${mark(app, c)}</g>` + w.svg, width, height: baseline + textSize * 0.26 };
}

// ---------- write files ----------
const put = (name, doc) => writeFileSync(resolve(out, name), doc);

for (const app of ['womp', 'blog', 'wiki', 'list']) {
  const { file, name } = APPS[app];
  for (const mode of ['light', 'dark']) {
    const c = palette(app, mode);
    const sfx = mode === 'dark' ? '-reverse' : '';
    const label = mode === 'dark' ? ' (reverse, for dark grounds)' : '';
    put(`${file}-mark${sfx}.svg`, svgDoc({ width: W, height: H, title: `${name} seed packet mark${label}`, body: mark(app, c) }));
    const h = horizontal(app, c);
    put(`${file}-horizontal${sfx}.svg`, svgDoc({ width: h.width, height: h.height, title: `${name} horizontal logo${label}`, body: h.body }));
    if (app === 'womp') {
      const s = stacked(app, c);
      put(`${file}-stacked${sfx}.svg`, svgDoc({ width: s.width, height: s.height, title: `${name} stacked logo${label}`, body: s.body }));
    }
  }
  if (app !== 'list') {
    const p = tokens.packets;
    put(
      `favicon-${app}.svg`,
      svgDoc({ width: 32, height: 32, viewBox: '0 0 16 16', title: `${name} favicon`, body: favicon(app, hex(p.light[APPS[app].ink].ink), hex(p.dark[APPS[app].ink].ink)) }),
    );
  }
}
put('yourwomp-blank.svg', svgDoc({ width: W, height: H, title: 'Blank seed packet for a future Womp', body: blank({ line: soil[10] }) }));

// ---------- inline copies for the identity page ----------
// <!--logo:KEY-->...<!--/logo:KEY--> regions are regenerated from the same geometry with theme variables.
let n = 0;
function inline(key) {
  const [app, kind] = key.split('-');
  const c = app === 'list' ? liveList : live;
  let body, width, height, title, vb;
  const nm = app === 'your' ? 'yourWomp' : APPS[app]?.name;
  if (kind === 'blank') [body, width, height, title] = [blank({ line: 'currentColor' }), W, H, 'Blank seed packet for a future Womp'];
  else if (kind === 'mark') [body, width, height, title] = [mark(app, c), W, H, `${nm} seed packet mark`];
  else if (kind === 'horizontal') ({ body, width, height } = horizontal(app, c)), (title = `${nm} logo`);
  else if (kind === 'stacked') ({ body, width, height } = stacked(app, c)), (title = `${nm} stacked logo`);
  else if (kind === 'favicon') {
    [body, width, height, title] = [favicon(app, 'var(--packet)', 'var(--packet)').replace(/<style>.*<\/style>/, '').replace('class="p"', 'fill="var(--packet)"'), 16, 16, `${nm} favicon`];
  } else if (kind === 'window') {
    [body, title, vb] = [`<path d="${WINDOW}" fill="${c.paper}"/>` + CROPS[app](c) + `<path d="${MOUND}" fill="${c.line}"/>`, `${nm} crop: ${CROP_NAMES[app]}`, '20 36 80 94'];
  } else if (kind === 'construction') {
    [body, title, vb] = [construction({ ...live, grid: 'var(--soil-5)', mark: 'var(--color-primary)' }), 'Crop construction: window grid, stem origin on the soil bed, one leaf in ink', '18 34 84 98'];
  } else if (app === 'dont') {
    const wrong = { ...live, packet: 'var(--ink-pea)' };
    const misuse = {
      stretch: [`<g transform="translate(-24 22) scale(1.4 .72)">${mark('womp', live)}</g>`, 'Do not stretch or squash the packet'],
      ring: [`<circle cx="60" cy="75" r="72" fill="none" stroke="var(--packet)" stroke-width="8"/><g transform="translate(18 22) scale(.7)">${mark('womp', live)}</g>`, 'Do not put the packet inside a circle or badge'],
      swap: [mark('blog', wrong), 'Do not print one Womp crop in another Womp ink'],
      smooth: [mark('womp', live).replace(PACKET, 'M8 22Q8 14 16 14H104Q112 14 112 22V141Q112 146 107 146H13Q8 146 8 141Z').replace(/<path d="M12 19[^>]*>/, ''), 'Do not smooth off the crimped top'],
    }[kind];
    [body, title, vb] = [misuse[0], misuse[1], { ring: '-14 0 148 150', stretch: '-22 0 164 150' }[kind] ?? '0 0 120 150'];
  } else throw new Error(`Unknown inline logo ${key}`);
  const id = `lg${++n}`;
  return `<svg class="logo logo-${kind}" viewBox="${vb ?? `0 0 ${round(width)} ${round(height)}`}" role="img" aria-labelledby="${id}"><title id="${id}">${title}</title>${body}</svg>`;
}

if (existsSync(page)) {
  const html = readFileSync(page, 'utf8');
  const next = html.replace(/<!--logo:([a-z-]+)-->[\s\S]*?<!--\/logo:\1-->/g, (_, key) => `<!--logo:${key}-->${inline(key)}<!--/logo:${key}-->`);
  if (next !== html) writeFileSync(page, next);
}
