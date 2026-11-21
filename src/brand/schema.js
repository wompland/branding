// Brand source schema. Isomorphic: no Node APIs.
//
// A brand file (brands/<slug>.json):
//   { slug, name, role: "master"|"sub", color: <palette id>, glyph: "pale"|"deep", shapes: Shape[] }
// Shapes live on the 7 x 7 glyph field (x, y in 0..6, origin top-left, y down):
//   { type: "cell", x, y }                 1 x 1 square
//   { type: "ring", x, y, size: 2..4, rot } quarter band, 1 module thick, in a size x size box
//   { type: "pie",  x, y, size: 1..4, rot } filled quarter disc in a size x size box
// rot names the box corner that holds the circle's centre, clockwise from top-left:
//   0 = top-left, 1 = top-right, 2 = bottom-right, 3 = bottom-left.
// Equivalently, rot k is the rot-0 shape (centre top-left, arc bulging to the bottom-right) turned k quarter turns clockwise.
// Shapes union into one fill; their order does not matter.
import { paletteEntry } from './palette.js';

export const FIELD_SIZE = 7;
export const SHAPE_TYPES = ['cell', 'ring', 'pie'];
export const SIZE_RANGE = { cell: [1, 1], ring: [2, 4], pie: [1, 4] };
export const ROLES = ['master', 'sub'];
export const GLYPH_TONES = ['pale', 'deep'];
export const MASTER = { slug: 'wompland', name: 'WompLand' };
export const SUB_NAME = /^[a-z]+Womp$/;

const BRAND_KEYS = ['slug', 'name', 'role', 'color', 'glyph', 'shapes'];
const isInt = (n) => Number.isInteger(n);

/** Errors for one shape; `at` prefixes messages. */
export function shapeErrors(s, at = 'shape') {
  if (!s || typeof s !== 'object') return [`${at}: must be an object`];
  if (!SHAPE_TYPES.includes(s.type)) return [`${at}.type: must be one of ${SHAPE_TYPES.join(', ')}`];
  const errors = [];
  const allowed = s.type === 'cell' ? ['type', 'x', 'y'] : ['type', 'x', 'y', 'size', 'rot'];
  for (const k of Object.keys(s)) if (!allowed.includes(k)) errors.push(`${at}.${k}: not allowed on a ${s.type}`);
  const size = s.type === 'cell' ? 1 : s.size;
  const [lo, hi] = SIZE_RANGE[s.type];
  if (s.type !== 'cell') {
    if (!isInt(s.size) || s.size < lo || s.size > hi) errors.push(`${at}.size: ${s.type} size must be an integer ${lo}..${hi}`);
    if (!isInt(s.rot) || s.rot < 0 || s.rot > 3) errors.push(`${at}.rot: must be an integer 0..3`);
  }
  for (const k of ['x', 'y']) {
    if (!isInt(s[k]) || s[k] < 0) errors.push(`${at}.${k}: must be an integer >= 0`);
    else if (isInt(size) && s[k] + size > FIELD_SIZE) errors.push(`${at}.${k}: ${s.type} leaves the 7 x 7 field (${k} + size must be <= 7)`);
  }
  return errors;
}

/**
 * Validate a brand source object.
 * Pass `brands` (the other brands in the collection) to also check slug uniqueness and the single master.
 * Returns { ok, errors[] }.
 */
export function validateBrand(obj, palette, { brands } = {}) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, errors: ['brand must be an object'] };
  const errors = [];
  for (const k of Object.keys(obj)) if (!BRAND_KEYS.includes(k)) errors.push(`${k}: unknown field`);
  for (const k of BRAND_KEYS) if (!(k in obj)) errors.push(`${k}: required`);

  if (!ROLES.includes(obj.role)) errors.push(`role: must be "master" or "sub"`);
  if (typeof obj.name !== 'string') errors.push('name: must be a string');
  else if (obj.role === 'master' && obj.name !== MASTER.name) errors.push(`name: the master brand is named "${MASTER.name}"`);
  else if (obj.role === 'sub' && !SUB_NAME.test(obj.name)) errors.push('name: a sub-brand name is lowercase letters followed by "Womp", e.g. blogWomp');
  if (typeof obj.name === 'string' && obj.slug !== obj.name.toLowerCase()) errors.push(`slug: must be the lowercase name ("${obj.name.toLowerCase()}")`);

  if (typeof obj.color !== 'string' || !paletteEntry(palette, obj.color)) errors.push(`color: must be a palette id (${palette.map((e) => e.id).join(', ')})`);
  if (!GLYPH_TONES.includes(obj.glyph)) errors.push('glyph: must be "pale" or "deep"');

  if (!Array.isArray(obj.shapes)) errors.push('shapes: must be an array');
  else obj.shapes.forEach((s, i) => errors.push(...shapeErrors(s, `shapes[${i}]`)));

  if (brands) {
    const others = brands.filter((b) => b.slug !== obj.slug);
    if (obj.role === 'master' && others.some((b) => b.role === 'master')) errors.push('role: there is already a master brand');
    if (obj.role === 'sub' && !others.some((b) => b.role === 'master')) errors.push('role: the collection needs exactly one master brand');
  }
  return { ok: errors.length === 0, errors };
}

/** Validate a whole collection: every brand, unique slugs, exactly one master. */
export function validateCollection(brands, palette) {
  const errors = [];
  const slugs = new Set();
  for (const b of brands) {
    if (slugs.has(b?.slug)) errors.push(`${b.slug}: duplicate slug`);
    slugs.add(b?.slug);
    for (const e of validateBrand(b, palette).errors) errors.push(`${b?.slug ?? '?'}: ${e}`);
  }
  const masters = brands.filter((b) => b?.role === 'master').length;
  if (masters !== 1) errors.push(`collection: needs exactly one master brand, found ${masters}`);
  return { ok: errors.length === 0, errors };
}

const shapeKey = (s) => `${SHAPE_TYPES.indexOf(s.type)}:${s.y}:${s.x}:${s.size ?? 1}:${s.rot ?? 0}`;

/** Canonical form of a valid brand: stable key order, shapes deduplicated and sorted (type, y, x). */
export function normalizeBrand(b) {
  const shapes = new Map();
  for (const s of b.shapes) {
    const n = s.type === 'cell' ? { type: s.type, x: s.x, y: s.y } : { type: s.type, x: s.x, y: s.y, size: s.size, rot: s.rot };
    shapes.set(shapeKey(n), n);
  }
  const sorted = [...shapes.entries()].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })).map(([, s]) => s);
  return { slug: b.slug, name: b.name, role: b.role, color: b.color, glyph: b.glyph, shapes: sorted };
}

/** Pretty, stable JSON for a brand file: one shape per line. */
export function formatBrand(b) {
  const n = normalizeBrand(b);
  const head = BRAND_KEYS.slice(0, -1).map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(n[k])},`);
  const shapes = n.shapes.map((s) => '    ' + JSON.stringify(s).replace(/([,:])/g, '$1 ').replace(/^\{/, '{ ').replace(/\}$/, ' }'));
  const body = shapes.length ? `[\n${shapes.join(',\n')}\n  ]` : '[]';
  return `{\n${head.join('\n')}\n  "shapes": ${body}\n}\n`;
}

/** A fresh sub-brand from a name: the first palette color no brand uses yet, a pale glyph, an empty field. */
export function newSubBrand(name, palette, brands = []) {
  const used = new Set(brands.map((b) => b.color));
  const color = (palette.find((e) => !used.has(e.id)) ?? palette[0]).id;
  return { slug: String(name).toLowerCase(), name, role: 'sub', color, glyph: 'pale', shapes: [] };
}
