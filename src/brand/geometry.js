// Tile and glyph geometry. Isomorphic: no Node APIs.
//
// Units: one module (u). The tile is 9u square; the 7 x 7 glyph field sits inside a 1u margin.
// Shapes are described in ./schema.js (cell, ring, pie; rot = centre corner clockwise from top-left).
import { brandColors } from './palette.js';

export const TILE = 9;
export const MARGIN = 1;
/** px per module in the standalone SVG files (mark.svg is 72 x 72). */
export const FILE_UNIT = 8;
/** Favicon art: a 16 x 16 grid, 1px margin, 2px modules, so every edge lands on a whole pixel. */
export const FAVICON = { grid: 16, margin: 1, unit: 2 };

export const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const p = (n) => round(n, 3);

/** Escape text for SVG/XML content and attributes. */
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Wrap children in a standalone SVG document. */
export function svgDoc({ width, height, title, body, viewBox }) {
  const vb = viewBox ?? `0 0 ${round(width)} ${round(height)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${round(width)}" height="${round(height)}" role="img" aria-labelledby="t">\n<title id="t">${esc(title)}</title>\n${body}\n</svg>\n`;
}

const DIRS = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
// rot -> [centre corner offset (in box sizes), arc from, arc to]; arcs run clockwise.
const ROT = [
  [0, 0, 'right', 'bottom'], // 0: centre top-left, curve bulges to the bottom-right
  [1, 0, 'bottom', 'left'], // 1: centre top-right
  [1, 1, 'left', 'top'], // 2: centre bottom-right
  [0, 1, 'top', 'right'], // 3: centre bottom-left
];

/** Centre (in modules, field coordinates) and the outer/inner radius of a ring or pie. */
export function arcOf(shape) {
  const [kx, ky, from, to] = ROT[shape.rot];
  return { cx: shape.x + kx * shape.size, cy: shape.y + ky * shape.size, R: shape.size, r: shape.type === 'ring' ? shape.size - 1 : 0, from, to };
}

function rectPath(x, y, w, h) {
  return `M${p(x)} ${p(y)}h${p(w)}v${p(h)}h${p(-w)}Z`;
}

/**
 * Path data for one shape at `unit` px per module, with the field origin at [ox, oy].
 * Every subpath winds clockwise, so overlapping shapes union under the default nonzero fill.
 */
export function shapePath(shape, unit = 1, [ox, oy] = [0, 0]) {
  if (shape.type === 'cell') return rectPath(ox + shape.x * unit, oy + shape.y * unit, unit, unit);
  const { cx: mx, cy: my, R: mR, r: mr, from, to } = arcOf(shape);
  const cx = ox + mx * unit;
  const cy = oy + my * unit;
  const R = mR * unit;
  const r = mr * unit;
  const [ax, ay] = DIRS[from];
  const [bx, by] = DIRS[to];
  const P = (rad, dx, dy) => `${p(cx + rad * dx)} ${p(cy + rad * dy)}`;
  let d = `M${P(R, ax, ay)}A${p(R)} ${p(R)} 0 0 1 ${P(R, bx, by)}`;
  d += r > 0 ? `L${P(r, bx, by)}A${p(r)} ${p(r)} 0 0 0 ${P(r, ax, ay)}Z` : `L${p(cx)} ${p(cy)}Z`;
  return d;
}

/** Merge unit cells into the fewest rectangles: vertical runs per column, then side-by-side identical runs. */
export function cellRects(cells) {
  const on = new Set(cells.map((c) => `${c.x},${c.y}`));
  const runs = [];
  for (let x = 0; x < TILE; x++) {
    for (let y = 0; y < TILE; y++) {
      if (!on.has(`${x},${y}`)) continue;
      let h = 1;
      while (on.has(`${x},${y + h}`)) h++;
      runs.push({ x, y, w: 1, h });
      y += h - 1;
    }
  }
  const rects = [];
  for (const run of runs) {
    const left = rects.find((r) => r.y === run.y && r.h === run.h && r.x + r.w === run.x);
    if (left) left.w++;
    else rects.push({ ...run });
  }
  return rects;
}

/** Path data for a whole glyph: cells merged into rectangles, then every curve. */
export function glyphPath(shapes, unit = 1, [ox, oy] = [0, 0]) {
  const cells = shapes.filter((s) => s.type === 'cell');
  const rects = cellRects(cells).map((r) => rectPath(ox + r.x * unit, oy + r.y * unit, r.w * unit, r.h * unit));
  const curves = shapes.filter((s) => s.type !== 'cell').map((s) => shapePath(s, unit, [ox, oy]));
  return rects.join('') + curves.join('');
}

/**
 * Tile children (field square + glyph) with the tile's top-left at [x, y], `unit` px per module.
 * `field` / `glyph` override the brand colors (e.g. CSS vars for theme-aware inline use).
 */
export function tileBody(brand, palette, { unit = FILE_UNIT, x = 0, y = 0, field, glyph } = {}) {
  const c = brandColors(brand, palette);
  const d = glyphPath(brand.shapes, unit, [x + MARGIN * unit, y + MARGIN * unit]);
  return (
    `<rect x="${round(x)}" y="${round(y)}" width="${round(TILE * unit)}" height="${round(TILE * unit)}" fill="${field ?? c.field}"/>` +
    (d ? `<path fill="${glyph ?? c.glyph}" d="${d}"/>` : '')
  );
}

/** The mark: a standalone square SVG document, `size` px wide (default 72 = 8px modules). */
export function tileSVG(brand, palette, { size = TILE * FILE_UNIT, title = `${brand.name} mark` } = {}) {
  const unit = size / TILE;
  return svgDoc({ width: size, height: size, title, body: tileBody(brand, palette, { unit }) });
}

/** Favicon art on its 16px grid, scaled to `size` px (default 32). Use this, not the mark, below 24px. */
export function faviconSVG(brand, palette, { size = 32, title = `${brand.name} favicon` } = {}) {
  const c = brandColors(brand, palette);
  const { grid, margin, unit } = FAVICON;
  const d = glyphPath(brand.shapes, unit, [margin, margin]);
  const body = `<rect width="${grid}" height="${grid}" fill="${c.field}"/>` + (d ? `<path fill="${c.glyph}" d="${d}"/>` : '');
  return svgDoc({ width: size, height: size, viewBox: `0 0 ${grid} ${grid}`, title, body });
}
