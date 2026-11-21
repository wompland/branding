// Brand files on disk: brands/palette.json and brands/<slug>.json. Node only.
import { readFileSync, readdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatBrand } from '../../src/brand/schema.js';

export const ROOT = resolve(import.meta.dirname, '../..');
export const BRANDS_DIR = resolve(ROOT, 'brands');
export const PUBLIC_BRANDS = resolve(ROOT, 'public/brands');
const PALETTE_FILE = resolve(BRANDS_DIR, 'palette.json');

export const brandFile = (slug) => resolve(BRANDS_DIR, `${slug}.json`);

export function loadPalette() {
  return JSON.parse(readFileSync(PALETTE_FILE, 'utf8'));
}

/** Every brand source, master first, then by slug. */
export function loadBrands() {
  return readdirSync(BRANDS_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'palette.json')
    .map((f) => JSON.parse(readFileSync(resolve(BRANDS_DIR, f), 'utf8')))
    .sort((a, b) => (a.role === 'master' ? -1 : b.role === 'master' ? 1 : a.slug.localeCompare(b.slug)));
}

/** Write via a temp file in the same directory, then rename over the target (atomic on one filesystem). */
export function writeFileAtomic(file, text) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(tmp, text);
    renameSync(tmp, file);
  } catch (e) {
    rmSync(tmp, { force: true });
    throw e;
  }
}

/** Write a brand source file in canonical form. Validate before calling. */
export function saveBrand(brand) {
  writeFileAtomic(brandFile(brand.slug), formatBrand(brand));
}

/** Remove a brand source file and its generated assets. */
export function removeBrand(slug) {
  rmSync(brandFile(slug), { force: true });
  rmSync(resolve(PUBLIC_BRANDS, slug), { recursive: true, force: true });
}
