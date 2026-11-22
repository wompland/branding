// Horizontal and stacked lockups: the tile plus the name in Archivo 600, outlined. Isomorphic.
//
// Lockup spec, in modules (u = 1/9 of the tile):
//   name cap height 5u; tracking -0.01em; camelCase as written
//   horizontal: the name starts 3u right of the tile; caps centred on the tile (cap top 2u, baseline 7u)
//   stacked: tile centred over the name; 2u from the tile bottom to the cap top
// The tile never changes between grounds; only the name switches from ink (light grounds) to paper (reverse, dark grounds).
import { TILE, FILE_UNIT, svgDoc, tileBody } from './geometry.js';
import { textToPath, metrics } from './text.js';

export const WORD_INK = '#141414';
export const WORD_REVERSE = '#EEECE6';
export const LOCKUP = { capU: 5, gapU: 3, stackGapU: 2, tracking: -0.01 };

/** Minimum sizes from the system spec (DESIGN.md, the Tile Lockup Rule). */
export const MIN_SIZES = [
  { name: 'Horizontal lockup', px: 120, print: '30 mm', note: 'width' },
  { name: 'Stacked lockup', px: 72, print: '20 mm', note: 'width' },
  { name: 'Tile, full art', px: 24, print: '8 mm', note: 'width' },
  { name: 'Tile, favicon art', px: 16, print: '—', note: 'below 24 px, use the favicon art' },
];
/** Clear space on every side, in modules. */
export const CLEAR_U = 2;

function nameAt(font, brand, unit, x, y) {
  const size = (LOCKUP.capU / metrics(font, 1).capHeight) * unit;
  return textToPath(font, brand.name, { x, y, size, tracking: LOCKUP.tracking });
}

const wordFillOf = ({ reverse = false, wordFill } = {}) => wordFill ?? (reverse ? WORD_REVERSE : WORD_INK);

/**
 * Horizontal lockup children. Returns { width, height, body } in px at `unit` px per module.
 * opts: { unit = 8, reverse = false, wordFill, field, glyph } (field/glyph override the tile colors, e.g. CSS vars).
 */
export function horizontalLockup(brand, palette, font, opts = {}) {
  const { unit = FILE_UNIT, field, glyph } = opts;
  const probe = nameAt(font, brand, unit, 0, 0);
  const x = (TILE + LOCKUP.gapU) * unit - probe.bbox.x1;
  const baseline = ((TILE + LOCKUP.capU) / 2) * unit;
  const t = nameAt(font, brand, unit, x, baseline);
  return {
    width: t.bbox.x2 + 0.5 * unit,
    height: Math.max(TILE * unit, t.bbox.y2),
    body: tileBody(brand, palette, { unit, field, glyph }) + `<path fill="${wordFillOf(opts)}" d="${t.d}"/>`,
  };
}

/** Stacked lockup children. Same options and return shape as horizontalLockup. */
export function stackedLockup(brand, palette, font, opts = {}) {
  const { unit = FILE_UNIT, field, glyph } = opts;
  const probe = nameAt(font, brand, unit, 0, 0);
  const w = probe.bbox.x2 - probe.bbox.x1;
  const width = Math.max(w, TILE * unit);
  const baseline = (TILE + LOCKUP.stackGapU + LOCKUP.capU) * unit;
  const t = nameAt(font, brand, unit, (width - w) / 2 - probe.bbox.x1, baseline);
  return {
    width,
    height: Math.max(baseline, t.bbox.y2) + 0.2 * unit,
    body: tileBody(brand, palette, { unit, x: (width - TILE * unit) / 2, field, glyph }) + `<path fill="${wordFillOf(opts)}" d="${t.d}"/>`,
  };
}

/** Standalone horizontal lockup SVG document. opts as horizontalLockup. */
export function horizontalSVG(brand, palette, font, opts = {}) {
  return svgDoc({ ...horizontalLockup(brand, palette, font, opts), title: `${brand.name} horizontal logo` });
}

/** Standalone stacked lockup SVG document. opts as stackedLockup. */
export function stackedSVG(brand, palette, font, opts = {}) {
  return svgDoc({ ...stackedLockup(brand, palette, font, opts), title: `${brand.name} stacked logo` });
}
