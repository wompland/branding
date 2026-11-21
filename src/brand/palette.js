// The curated field-color collection and its gates. Isomorphic: no Node APIs.
//
// A palette is an array of entries { id, name, field, pale, deep } (hex).
// A brand's tile is its entry's `field`; its glyph is the entry's `pale` or `deep`.
import { parse, wcagContrast, converter, differenceEuclidean } from 'culori';

export const WHITE = '#FFFFFF';
export const GRAPHITE = '#1D1E20';
/** Neighbourhoods a field must stay out of: WordPress cerulean, Gutenberg blue, Shopify lime. */
export const AVOID = { '#21759B': 'WordPress cerulean', '#3858E9': 'Gutenberg blue', '#95BF47': 'Shopify lime' };

export const GATES = {
  fieldOnGround: 3, // field vs white and vs graphite: the tile reads as a shape on either page
  glyphOnField: 3, // pale and deep on field: WCAG 1.4.11 graphic contrast
  lightness: [0.56, 0.62], // OKLCH lightness band shared by every field (equal visual weight)
  hueDrift: 12, // degrees: pale and deep keep the field's hue
  avoidDistance: 0.1, // OKLab distance from every AVOID color
  distinct: 0.045, // OKLab distance between any two fields, so neighbours stay tellable apart
};

const toOklch = converter('oklch');
const okDistance = differenceEuclidean('oklab');

export const contrast = (a, b) => wcagContrast(parse(a), parse(b));
const hueGap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

/** Every gate for one entry, as [{ label, value, min|max, pass }]. */
export function entryChecks(entry) {
  const f = toOklch(parse(entry.field));
  const checks = [];
  const atLeast = (label, value, min) => checks.push({ label, value, min, pass: value >= min });
  const atMost = (label, value, max) => checks.push({ label, value, max, pass: value <= max });
  atLeast('field vs white', contrast(entry.field, WHITE), GATES.fieldOnGround);
  atLeast('field vs graphite', contrast(entry.field, GRAPHITE), GATES.fieldOnGround);
  atLeast('pale on field', contrast(entry.pale, entry.field), GATES.glyphOnField);
  atLeast('deep on field', contrast(entry.deep, entry.field), GATES.glyphOnField);
  atLeast('field lightness', f.l, GATES.lightness[0]);
  atMost('field lightness', f.l, GATES.lightness[1]);
  for (const k of ['pale', 'deep']) atMost(`${k} hue drift`, hueGap(toOklch(parse(entry[k])).h, f.h), GATES.hueDrift);
  for (const [hex, label] of Object.entries(AVOID)) atLeast(`distance to ${label}`, okDistance(entry.field, hex), GATES.avoidDistance);
  return checks;
}

/** { ok, errors[] } for a whole palette: shape, unique ids, and every entry gate. */
export function validatePalette(palette) {
  const errors = [];
  if (!Array.isArray(palette) || palette.length === 0) return { ok: false, errors: ['palette must be a non-empty array'] };
  const seen = new Set();
  palette.forEach((e, i) => {
    const at = `palette[${i}]${e?.id ? ` (${e.id})` : ''}`;
    if (!e || typeof e.id !== 'string' || !/^[a-z]+$/.test(e.id)) return errors.push(`${at}: id must be lowercase letters`);
    if (seen.has(e.id)) errors.push(`${at}: duplicate id`);
    seen.add(e.id);
    if (typeof e.name !== 'string' || !e.name) errors.push(`${at}: name is required`);
    const bad = ['field', 'pale', 'deep'].filter((k) => typeof e[k] !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(e[k]));
    if (bad.length) return errors.push(`${at}: ${bad.join(', ')} must be #RRGGBB`);
    for (const c of entryChecks(e)) {
      if (!c.pass) errors.push(`${at}: ${c.label} = ${c.value.toFixed(3)} (needs ${'min' in c ? '>= ' + c.min : '<= ' + c.max})`);
    }
  });
  if (errors.length) return { ok: false, errors };
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const d = okDistance(palette[i].field, palette[j].field);
      if (d < GATES.distinct) errors.push(`${palette[i].id} and ${palette[j].id} are too close: OKLab distance ${d.toFixed(3)} (needs >= ${GATES.distinct})`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export const paletteEntry = (palette, id) => palette.find((e) => e.id === id);

/** The colors a brand draws with: { id, name, field, pale, deep, glyph }. Throws on an unknown palette id. */
export function brandColors(brand, palette) {
  const e = paletteEntry(palette, brand.color);
  if (!e) throw new Error(`Unknown palette color "${brand.color}" for ${brand.slug}`);
  return { id: e.id, name: e.name, field: e.field, pale: e.pale, deep: e.deep, glyph: e[brand.glyph] };
}
