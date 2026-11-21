// Letterpress Stationery logos.
// Rule: a Womp's monogram is the roman didone W with the Womp's own initial in italic laid over it
// (letters in name order), inside one canted cartouche with a hairline double rule, printed in its own ink.
// The name sits beside it in Literata camelCase (see the lockup spec at typeset()).
// Writes standalone SVGs to public/logos/letterpress/ and refreshes inline copies in identities/letterpress.html.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, formatHex } from 'culori';
import { loadFont, textToPath, svgDoc, round } from '../../scripts/lib/text-path.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'public/logos/letterpress');
const page = resolve(root, 'identities/letterpress.html');
const { default: tokens } = await import(pathToFileURL(resolve(root, 'src/tokens/letterpress.mjs')).href + `?t=${Date.now()}`);
const hex = (c) => formatHex(parse(c));

const ROMAN = loadFont('bodoni-moda', 600, 'normal');
const ITALIC = loadFont('bodoni-moda', 600, 'italic');
const ROMAN_HEAVY = loadFont('bodoni-moda', 900, 'normal');
const ITALIC_HEAVY = loadFont('bodoni-moda', 800, 'italic');

// The family. `initial` is the Womp's own letter; `after` places it after the W (WompLand) instead of before.
const WOMPS = {
  wompland: { name: 'WompLand', initial: 'L', after: true, brand: 'womp' },
  blogwomp: { name: 'blogWomp', initial: 'b', after: false, brand: 'blog' },
  wikiwomp: { name: 'wikiWomp', initial: 'w', after: false, brand: 'wiki' },
  // Hypothetical future Womp, shown to prove the rule. Not themed; it brings its own ink and foil.
  listwomp: { name: 'listWomp', initial: 'l', after: false, ink: 'oklch(0.42 0.085 75)', foil: 'oklch(0.85 0.08 85)' },
};
const inkOf = (w) => hex(w.ink ?? tokens.brands[w.brand].light.primary);
const foilOf = (w) => hex(w.foil ?? tokens.brands[w.brand].dark.primary);
const PAPER = hex(tokens.modes.light.base100);
const CARD = hex(tokens.modes.dark.base100);

// ---------- geometry ----------
const S = 100; // W size in monogram units (cap height 75)
const OVERLAP = 0.21; // initial overlaps the W by 21% of the W's width
const GAP = 3.2; // knockout around the initial where it crosses the W

let uid = 0;
const nextId = (p) => `${p}${(uid++).toString(36)}`;

/** Monogram outlines with baseline at y=0, left edge at x=0. */
function monogram(womp, { heavy = false, gap = GAP } = {}) {
  const R = heavy ? ROMAN_HEAVY : ROMAN;
  const I = heavy ? ITALIC_HEAVY : ITALIC;
  const w0 = textToPath(R, 'W', { size: S });
  const i0 = textToPath(I, womp.initial, { size: S });
  const overlap = (w0.bbox.x2 - w0.bbox.x1) * (heavy ? OVERLAP * 1.75 : OVERLAP);
  let wx, ix;
  if (womp.after) {
    wx = -w0.bbox.x1;
    ix = wx + w0.bbox.x2 - overlap - i0.bbox.x1;
  } else {
    ix = -i0.bbox.x1;
    wx = ix + i0.bbox.x2 - overlap - w0.bbox.x1;
  }
  const W = textToPath(R, 'W', { x: wx, size: S });
  const N = textToPath(I, womp.initial, { x: ix, size: S });
  const x1 = Math.min(W.bbox.x1, N.bbox.x1);
  const x2 = Math.max(W.bbox.x2, N.bbox.x2);
  const y1 = Math.min(W.bbox.y1, N.bbox.y1);
  const y2 = Math.max(W.bbox.y2, N.bbox.y2);
  return { W: W.d, N: N.d, x1, x2, y1, y2, gap };
}

/** Render a monogram at (x, y = baseline) with scale k. W is knocked out where the initial crosses it. */
function drawMonogram(m, { x, y, k, fill }) {
  const id = nextId('m');
  const t = `translate(${round(x)} ${round(y)}) scale(${round(k, 4)})`;
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-40" y="-120" width="400" height="200"><rect x="-40" y="-120" width="400" height="200" fill="#fff"/><path d="${m.N}" fill="#000" stroke="#000" stroke-width="${m.gap * 2}" stroke-linejoin="round"/></mask></defs>
<g transform="${t}" fill="${fill}"><path d="${m.W}" mask="url(#${id})"/><path d="${m.N}"/></g>`;
}

// One cartouche for every Womp, sized to the widest monogram so the card never changes shape.
const MONO = Object.fromEntries(Object.entries(WOMPS).map(([k, w]) => [k, monogram(w)]));
const MONO_W = Math.max(...Object.values(MONO).map((m) => m.x2 - m.x1));
const PAD_X = 26;
const PAD_Y = 22;
const CART = { w: round(MONO_W + PAD_X * 2), h: 75 + PAD_Y * 2 + 2, cant: 9 };

function cantedRect(x, y, w, h, c) {
  return `M${round(x + c)} ${round(y)}H${round(x + w - c)}L${round(x + w)} ${round(y + c)}V${round(y + h - c)}L${round(x + w - c)} ${round(y + h)}H${round(x + c)}L${round(x)} ${round(y + h - c)}V${round(y + c)}Z`;
}

/** Outer hairline + finer inner rule. Drawn as strokes in the ink. */
function cartouche(x, y, ink, { outer = 1.6, inner = 0.75, inset = 4.5 } = {}) {
  const { w, h, cant } = CART;
  const o = outer / 2;
  return `<path d="${cantedRect(x + o, y + o, w - outer, h - outer, cant)}" fill="none" stroke="${ink}" stroke-width="${outer}"/>
<path d="${cantedRect(x + inset, y + inset, w - inset * 2, h - inset * 2, cant - inset * 0.55)}" fill="none" stroke="${ink}" stroke-width="${inner}"/>`;
}

function markBody(key, ink, x = 0, y = 0) {
  const m = MONO[key];
  const mw = m.x2 - m.x1;
  const mx = x + (CART.w - mw) / 2 - m.x1;
  const base = y + CART.h / 2 + 75 / 2;
  return `${cartouche(x, y, ink)}\n${drawMonogram(m, { x: mx, y: base, k: 1, fill: ink })}`;
}

// The name: ordinary camelCase in Literata 500, the font's own kerning, no tracking.
// Lockup spec, in cartouche heights (H): name cap height 0.3H; horizontal gap from cartouche to name 0.25H,
// name cap height centred on the cartouche's centre line; stacked gap 0.2H, name centred under the cartouche.
const NAME = loadFont('literata', 500, 'normal');
const NAME_CAP = 0.3;
const NAME_GAP = 0.25;
const STACK_GAP = 0.2;
const nameCapRatio = (NAME.tables.os2?.sCapHeight || NAME.ascender * 0.7) / NAME.unitsPerEm;
function typeset(text, { x = 0, y = 0, cap = CART.h * NAME_CAP } = {}) {
  const size = cap / nameCapRatio;
  const t = textToPath(NAME, text, { x, y, size });
  return { d: t.d, width: t.width, bbox: t.bbox, size };
}

// ---------- documents ----------
const files = {};
const inline = {};
const title = (w, kind) => `${w.name} ${kind}`;

function emit(name, { width, height, title: t, body }) {
  files[name] = svgDoc({ width, height, title: t, body });
}

function mark(key) {
  const w = WOMPS[key];
  const v = (ink) => ({ width: CART.w, height: CART.h, title: title(w, 'monogram'), body: markBody(key, ink) });
  return v;
}

function horizontal(key) {
  const w = WOMPS[key];
  return (ink) => {
    const cap = CART.h * NAME_CAP;
    const x = CART.w + CART.h * NAME_GAP;
    const word = typeset(w.name, { x, y: CART.h / 2 + cap / 2 });
    return {
      width: Math.max(word.bbox.x2, x + word.width) + 2,
      height: Math.max(CART.h, word.bbox.y2 + 1),
      title: title(w, 'logo'),
      body: `${markBody(key, ink)}\n<path d="${word.d}" fill="${ink}"/>`,
    };
  };
}

function stacked(key) {
  const w = WOMPS[key];
  return (ink) => {
    const cap = CART.h * NAME_CAP;
    const probe = typeset(w.name, { cap });
    const width = Math.max(CART.w, probe.width) + 4;
    const base = CART.h + CART.h * STACK_GAP + cap;
    const word = typeset(w.name, { x: (width - probe.width) / 2, y: base, cap });
    return {
      width,
      height: word.bbox.y2 + 2,
      title: title(w, 'logo, stacked'),
      body: `${markBody(key, ink, (width - CART.w) / 2, 0)}\n<path d="${word.d}" fill="${ink}"/>`,
    };
  };
}

// Favicon (16-32px): the cartouche collapses to a solid ink block and the pair reduces to its own letter,
// cut heavy: the roman W for the house, the italic initial for each Womp. Didone hairlines need the room.
function favicon(key) {
  const w = WOMPS[key];
  const house = key === 'wompland';
  const font = house ? ROMAN_HEAVY : ITALIC_HEAVY;
  const ch = house ? 'W' : w.initial;
  const g = textToPath(font, ch, { size: S });
  return (block, letter) => {
    const size = 32;
    const bw = g.bbox.x2 - g.bbox.x1;
    const bh = g.bbox.y2 - g.bbox.y1;
    const k = Math.min((size - 6) / bw, (size - 7) / bh);
    const x = size / 2 - (g.bbox.x1 + bw / 2) * k;
    const y = size / 2 - (g.bbox.y1 + bh / 2) * k;
    return {
      width: size,
      height: size,
      title: `${w.name} favicon`,
      body: `<path d="${cantedRect(0, 0, 32, 32, 4)}" fill="${block}"/>\n<path transform="translate(${round(x)} ${round(y)}) scale(${round(k, 4)})" d="${g.d}" fill="${letter}"/>`,
    };
  };
}

const builders = {};
for (const key of Object.keys(WOMPS)) {
  const ink = inkOf(WOMPS[key]);
  const foil = foilOf(WOMPS[key]);
  builders[`${key}-mark`] = mark(key);
  builders[`${key}-horizontal`] = horizontal(key);
  if (key === 'wompland') builders[`${key}-stacked`] = stacked(key);
  builders[`${key}-word`] = (fill) => {
    const word = typeset(WOMPS[key].name, { x: 1, y: CART.h * NAME_CAP + 1 });
    return { width: word.width + 2, height: word.bbox.y2 + 1, title: WOMPS[key].name, body: `<path d="${word.d}" fill="${fill}"/>` };
  };
  for (const kind of ['mark', 'horizontal', 'stacked']) {
    const b = builders[`${key}-${kind}`];
    if (!b) continue;
    emit(`${key}-${kind}`, b(ink));
    emit(`${key}-${kind}-reverse`, b(foil));
  }
  const fav = favicon(key);
  builders[`favicon-${key}`] = fav;
  const favName = { wompland: 'womp', blogwomp: 'blog', wikiwomp: 'wiki', listwomp: 'list' }[key];
  emit(`favicon-${favName}`, fav(ink, PAPER));
  emit(`favicon-${favName}-reverse`, fav(foil, CARD));
}

for (const [name, svg] of Object.entries(files)) writeFileSync(resolve(out, `${name}.svg`), svg);

// ---------- inline copies for the brand page ----------
// <!-- logo:NAME[:class] --> ... <!-- /logo --> blocks are rewritten with currentColor geometry.
const CC = 'currentColor';
function inlineSvg(name, cls = '') {
  const base = name;
  let doc;
  if (base.startsWith('favicon-')) {
    doc = builders[base](CC, 'var(--color-base-100)');
  } else if (base === 'blank-mark') {
    // Uninked: the same canted double rule, drawn as grooves for a blind deboss (CSS adds the light and shadow).
    doc = { width: CART.w, height: CART.h, title: 'An unprinted cartouche, blind-debossed, waiting for the next Womp', body: cartouche(0, 0, CC, { outer: 3, inner: 2, inset: 13 }) };
  } else if (base === 'lockup-spec') {
    doc = lockupSpec();
  } else if (base.startsWith('dont-')) {
    doc = dont(base);
  } else {
    doc = builders[base](CC);
  }
  const vb = `0 0 ${round(doc.width)} ${round(doc.height)}`;
  const id = nextId('t');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${cls}" role="img" aria-labelledby="${id}"><title id="${id}">${doc.title}</title>${doc.body.replace(/\n/g, '')}</svg>`;
}

// The horizontal lockup with its measurements drawn on: H, the 0.25H gap, the 0.3H name cap height, the centre line.
function lockupSpec() {
  const H = CART.h;
  const cap = H * NAME_CAP;
  const pad = 46;
  const lock = horizontal('wompland')(CC);
  const gx = pad + CART.w;
  const nx = gx + H * NAME_GAP;
  const top = 30;
  const mid = top + H / 2;
  const dim = 'stroke="var(--muted)" stroke-width="1" fill="none"';
  const label = (x, y, t, anchor = 'middle') => {
    const g = typeset(t, { cap: 9 });
    const ax = anchor === 'middle' ? x - g.width / 2 : anchor === 'end' ? x - g.width : x;
    return `<path transform="translate(${round(ax)} ${round(y)})" d="${g.d}" fill="var(--muted)"/>`;
  };
  const tick = (x1, y1, x2, y2) => `<path d="M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}" ${dim}/>`;
  return {
    width: pad + lock.width + 62,
    height: top + H + 46,
    title: 'Lockup spec: cartouche height H; gap 0.25H; name cap height 0.3H, centred on the cartouche',
    body:
      `<g transform="translate(${pad} ${top})">${lock.body}</g>` +
      `<path d="M${pad - 8} ${round(mid)}H${round(pad + lock.width + 12)}" stroke="var(--muted)" stroke-width="0.75" stroke-dasharray="4 4" fill="none"/>` +
      tick(pad - 22, top, pad - 22, top + H) + tick(pad - 27, top, pad - 17, top) + tick(pad - 27, top + H, pad - 17, top + H) +
      label(pad - 30, mid + 4.5, 'H', 'end') +
      tick(gx, top + H + 14, nx, top + H + 14) + tick(gx, top + H + 9, gx, top + H + 19) + tick(nx, top + H + 9, nx, top + H + 19) +
      label((gx + nx) / 2, top + H + 36, '0.25H') +
      tick(nx + lock.width - CART.w - H * NAME_GAP + 12, mid - cap / 2, nx + lock.width - CART.w - H * NAME_GAP + 12, mid + cap / 2) +
      label(nx + lock.width - CART.w - H * NAME_GAP + 18, mid + 4.5, '0.3H', 'start'),
  };
}

// Misuse examples, drawn from the real geometry.
function dont(name) {
  const m = MONO.wompland;
  const mw = m.x2 - m.x1;
  const cx = CART.w / 2;
  const base = CART.h / 2 + 75 / 2;
  const mono = (fill, extra = '') => drawMonogram(m, { x: cx - mw / 2 - m.x1, y: base, k: 1, fill }) + extra;
  if (name === 'dont-circle') {
    const r = CART.h / 2 + 18;
    return {
      width: CART.w,
      height: CART.h,
      title: 'Do not enclose the monogram in a circle or ring',
      body: `<g transform="translate(${cx} ${CART.h / 2}) scale(0.62) translate(${-cx} ${-CART.h / 2})"><circle cx="${cx}" cy="${CART.h / 2}" r="${r}" fill="none" stroke="currentColor" stroke-width="3"/>${mono(CC)}</g>`,
    };
  }
  if (name === 'dont-mix') {
    // Two inks in one mark: the W in the house ink, the initial in another Womp's ink.
    const id = nextId('m');
    const x = cx - mw / 2 - m.x1;
    return {
      width: CART.w,
      height: CART.h,
      title: 'Do not print one mark in two inks',
      body: `${cartouche(0, 0, CC)}<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-40" y="-120" width="400" height="200"><rect x="-40" y="-120" width="400" height="200" fill="#fff"/><path d="${m.N}" stroke="#000" stroke-width="${m.gap * 2}"/></mask></defs><g transform="translate(${round(x)} ${round(base)})"><path d="${m.W}" fill="currentColor" mask="url(#${id})"/><path d="${m.N}" fill="var(--dont-second-ink)"/></g>`,
    };
  }
  if (name === 'dont-caps') {
    const cap = CART.h * NAME_CAP;
    const x = CART.w + CART.h * NAME_GAP;
    const word = typeset('WOMPLAND', { x, y: CART.h / 2 + cap / 2 });
    return {
      width: x + word.width + 2,
      height: CART.h,
      title: 'Do not set the name in capitals or small caps',
      body: `${markBody('wompland', CC)}<path d="${word.d}" fill="currentColor"/>`,
    };
  }
  if (name === 'dont-tilt') {
    const c = CART;
    return {
      width: c.w * 1.5,
      height: c.h * 1.45,
      title: 'Do not rotate or overlap the cards',
      body: `<g transform="translate(${round(c.w * 0.08)} ${round(c.h * 0.2)}) rotate(-7 ${round(c.w / 2)} ${round(c.h / 2)})">${markBody('blogwomp', 'var(--dont-second-ink)')}</g><g transform="translate(${round(c.w * 0.42)} ${round(c.h * 0.32)}) rotate(5 ${round(c.w / 2)} ${round(c.h / 2)})"><path d="${cantedRect(0, 0, c.w, c.h, c.cant)}" fill="var(--color-base-100)"/>${markBody('wompland', CC)}</g>`,
    };
  }
  throw new Error(`unknown don't ${name}`);
}

if (existsSync(page)) {
  uid = 0;
  const html = readFileSync(page, 'utf8');
  const next = html.replace(/<!-- logo:([\w-]+)(?::([^>]*?))? -->[\s\S]*?<!-- \/logo -->/g, (_, name, cls = '') => `<!-- logo:${name}${cls ? ':' + cls : ''} -->${inlineSvg(name, cls)}<!-- /logo -->`);
  if (next !== html) writeFileSync(page, next);
}
