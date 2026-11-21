// Outline text into SVG path data with an opentype.js Font, so logo files carry no font dependency.
// Isomorphic: takes a parsed Font; load one with fontFromBuffer() (Node: readFileSync, browser: fetch).
import * as opentype from 'opentype.js';

/** The Archivo 600 woff the browser loads (copied to public/fonts/ by scripts/build-brands.mjs). */
export const ARCHIVO_URL = '/fonts/archivo-latin-600-normal.woff';

// opentype.js is CommonJS under Node (default export) and ESM in the browser (named exports).
const ot = opentype.parse ? opentype : opentype.default;

/** Parse a font from an ArrayBuffer (or a Node Buffer). */
export function fontFromBuffer(buf) {
  const ab = buf instanceof ArrayBuffer ? buf : buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return ot.parse(ab);
}

/** Browser helper: fetch and parse a font, Archivo 600 by default. */
export async function loadFont(url = ARCHIVO_URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url} (${res.status})`);
  return fontFromBuffer(await res.arrayBuffer());
}

/**
 * Outline `text` with its alphabetic baseline at (x, y).
 * tracking is in em (0.02 = +2% of size). Kerning is applied.
 * Returns { d, width, bbox: {x1,y1,x2,y2} }.
 */
export function textToPath(font, text, { x = 0, y = 0, size = 100, tracking = 0, decimals = 2 } = {}) {
  const scale = size / font.unitsPerEm;
  let glyphs;
  try {
    glyphs = font.stringToGlyphs(text);
  } catch {
    // Some fonts carry GSUB lookups opentype.js cannot run (e.g. Pixelify Sans ccmp); map characters directly.
    glyphs = [...text].map((ch) => font.charToGlyph(ch));
  }
  const path = new ot.Path();
  let cursor = x;
  glyphs.forEach((g, i) => {
    path.extend(g.getPath(cursor, y, size));
    cursor += g.advanceWidth * scale;
    if (i < glyphs.length - 1) {
      cursor += font.getKerningValue(g, glyphs[i + 1]) * scale;
      cursor += tracking * size;
    }
  });
  // Round coordinates ourselves: opentype's roundDecimal emits NaN on values like 343.00000000000006.
  const f = 10 ** decimals;
  for (const cmd of path.commands) for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) if (k in cmd) cmd[k] = Math.round(cmd[k] * f) / f;
  const bb = path.getBoundingBox();
  return { d: path.toPathData({ decimalPlaces: decimals, flipY: false }), width: cursor - x, bbox: { x1: bb.x1, y1: bb.y1, x2: bb.x2, y2: bb.y2 } };
}

/** Ascender / cap-height / x-height in px at `size`, for vertical alignment of lockups. */
export function metrics(font, size = 100) {
  const s = size / font.unitsPerEm;
  const os2 = font.tables.os2 ?? {};
  return {
    ascender: font.ascender * s,
    descender: font.descender * s,
    capHeight: (os2.sCapHeight || font.ascender * 0.7) * s,
    xHeight: (os2.sxHeight || font.ascender * 0.5) * s,
  };
}
