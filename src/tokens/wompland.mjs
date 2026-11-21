// WompLand brand themes: one light and one dark theme per brand in brands/*.json.
// Theme names: wompland-<slug>-<light|dark>. Neutrals, status colors and shape come from
// src/brand/theme.js (BASE); each brand adds the tokens fromField() derives from its palette field.
// Every theme also carries every brand's tile colors as --f-<slug> / --f-glyph-<slug>, so brands mix on one page.
import { BASE, brandTheme } from '../brand/theme.js';
import { brandColors } from '../brand/palette.js';
import { loadPalette, loadBrands } from '../../scripts/lib/brand-store.mjs';

const palette = loadPalette();
const brands = loadBrands();

const tileVars = Object.fromEntries(
  brands.flatMap((b) => {
    const c = brandColors(b, palette);
    return [[`--f-${b.slug}`, c.field], [`--f-glyph-${b.slug}`, c.glyph]];
  }),
);

export default {
  ...BASE,
  defaultBrand: brands.find((b) => b.role === 'master').slug,
  brands: Object.fromEntries(brands.map((b) => [b.slug, brandTheme(b, palette)])),
  extra: { light: { ...BASE.extra.light, ...tileVars }, dark: { ...BASE.extra.dark, ...tileVars } },
};
