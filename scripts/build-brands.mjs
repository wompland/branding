// Generates every brand's assets from brands/*.json into public/brands/<slug>/, plus public/brands/index.json,
// and copies the Archivo 600 woff to public/fonts/ for in-browser outlining.
//   node scripts/build-brands.mjs            all brands (prunes folders of deleted brands)
//   node scripts/build-brands.mjs blogwomp   one brand (index.json is still rewritten for all)
// Exits non-zero if the palette or any brand fails validation.
import { mkdirSync, readFileSync, readdirSync, copyFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { validatePalette, brandColors } from '../src/brand/palette.js';
import { validateCollection } from '../src/brand/schema.js';
import { tileSVG, faviconSVG } from '../src/brand/geometry.js';
import { fontFromBuffer } from '../src/brand/text.js';
import { horizontalSVG, stackedSVG } from '../src/brand/lockup.js';
import { brandTheme, brandThemeCSS, themeName } from '../src/brand/theme.js';
import { ROOT, PUBLIC_BRANDS, loadPalette, loadBrands, writeFileAtomic } from './lib/brand-store.mjs';

const { Resvg } = createRequire(import.meta.url)('@resvg/resvg-js');

const FONT_FILE = 'archivo-latin-600-normal.woff';
const FONT_SRC = resolve(ROOT, 'node_modules/@fontsource/archivo/files', FONT_FILE);

/** Public URL of every asset a brand gets, keyed by role. */
export function assetPaths(slug) {
  const b = `/brands/${slug}`;
  return {
    mark: `${b}/mark.svg`,
    horizontal: `${b}/horizontal.svg`,
    horizontalReverse: `${b}/horizontal-reverse.svg`,
    stacked: `${b}/stacked.svg`,
    stackedReverse: `${b}/stacked-reverse.svg`,
    favicon: `${b}/favicon.svg`,
    faviconIco: `${b}/favicon.ico`,
    png16: `${b}/icon-16.png`,
    png32: `${b}/icon-32.png`,
    appleTouch: `${b}/apple-touch-icon.png`,
    png192: `${b}/icon-192.png`,
    png512: `${b}/icon-512.png`,
    theme: `${b}/daisyui-theme.css`,
    brand: `${b}/brand.json`,
  };
}

const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

/** Pack PNG images into an ICO container (PNG entries, Vista+). images: [{ size, data }]. */
export function packIco(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2); // palette colors
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
}

function writeBrand(brand, palette, font) {
  const dir = resolve(PUBLIC_BRANDS, brand.slug);
  mkdirSync(dir, { recursive: true });
  const put = (name, data) => writeFileSync(resolve(dir, name), data);

  const mark = tileSVG(brand, palette);
  const favicon = faviconSVG(brand, palette);
  put('mark.svg', mark);
  put('favicon.svg', favicon);
  put('horizontal.svg', horizontalSVG(brand, palette, font));
  put('horizontal-reverse.svg', horizontalSVG(brand, palette, font, { reverse: true }));
  put('stacked.svg', stackedSVG(brand, palette, font));
  put('stacked-reverse.svg', stackedSVG(brand, palette, font, { reverse: true }));

  // Below 24px the favicon art (snapped to a 16px grid); from 180px up, the mark.
  const p16 = png(favicon, 16);
  const p32 = png(favicon, 32);
  put('icon-16.png', p16);
  put('icon-32.png', p32);
  put('apple-touch-icon.png', png(mark, 180));
  put('icon-192.png', png(mark, 192));
  put('icon-512.png', png(mark, 512));
  put('favicon.ico', packIco([{ size: 16, data: p16 }, { size: 32, data: p32 }]));

  put('daisyui-theme.css', `/* ${brand.name} DaisyUI themes, generated from brands/${brand.slug}.json. Import this file (or paste all of it) after @plugin "daisyui". */\n\n${brandThemeCSS(brand, palette)}\n`);
  const theme = brandTheme(brand, palette);
  const resolved = {
    ...brand,
    colors: brandColors(brand, palette),
    themes: { light: themeName(brand.slug, 'light'), dark: themeName(brand.slug, 'dark') },
    tokens: { light: theme.light, dark: theme.dark },
    assets: assetPaths(brand.slug),
  };
  writeFileAtomic(resolve(dir, 'brand.json'), JSON.stringify(resolved, null, 2) + '\n');
  return resolved;
}

/**
 * Validate and generate. Returns { brands: resolved brand.json objects written this run }.
 * Throws with every validation error on a bad palette or collection.
 */
export function buildBrands({ only } = {}) {
  const palette = loadPalette();
  const brands = loadBrands();
  const errors = [...validatePalette(palette).errors, ...validateCollection(brands, palette).errors];
  if (only && !brands.some((b) => b.slug === only)) errors.push(`${only}: no such brand`);
  if (errors.length) throw Object.assign(new Error(`Brand validation failed:\n  ${errors.join('\n  ')}`), { errors });

  const buf = readFileSync(FONT_SRC);
  const font = fontFromBuffer(buf);
  mkdirSync(resolve(ROOT, 'public/fonts'), { recursive: true });
  copyFileSync(FONT_SRC, resolve(ROOT, 'public/fonts', FONT_FILE));

  mkdirSync(PUBLIC_BRANDS, { recursive: true });
  const written = brands.filter((b) => !only || b.slug === only).map((b) => writeBrand(b, palette, font));

  if (!only) {
    const keep = new Set(brands.map((b) => b.slug));
    for (const d of readdirSync(PUBLIC_BRANDS, { withFileTypes: true })) {
      if (d.isDirectory() && !keep.has(d.name)) rmSync(resolve(PUBLIC_BRANDS, d.name), { recursive: true, force: true });
    }
  }
  const index = brands.map((b) => ({ slug: b.slug, name: b.name, role: b.role, color: b.color, glyph: b.glyph, colors: brandColors(b, palette), assets: assetPaths(b.slug) }));
  writeFileAtomic(resolve(PUBLIC_BRANDS, 'index.json'), JSON.stringify({ brands: index }, null, 2) + '\n');
  return { brands: written };
}

if (import.meta.main) {
  try {
    const { brands } = buildBrands({ only: process.argv[2] });
    for (const b of brands) console.log(`✓ public/brands/${b.slug}: ${Object.keys(b.assets).length} files (${b.colors.name} field, ${b.glyph} glyph)`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
