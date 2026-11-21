// Brand data: the dev save API when it exists, the static build output otherwise.
import bundledPalette from '../../../brands/palette.json';

const SOURCE_KEYS = ['slug', 'name', 'role', 'color', 'glyph', 'shapes'];
export const sourceOf = (b) => Object.fromEntries(SOURCE_KEYS.map((k) => [k, b[k]]));

const isJson = (res) => (res.headers.get('content-type') || '').includes('application/json');

/** Every brand and the palette. `live` is true when the dev API answered (editing allowed). */
export async function loadAll() {
  try {
    const res = await fetch('/__brands', { cache: 'no-store' });
    if (res.ok && isJson(res)) {
      const j = await res.json();
      if (j.ok) return { live: true, palette: j.palette, brands: j.brands };
    }
  } catch {
    /* fall through to the static files */
  }
  const index = await (await fetch('/brands/index.json', { cache: 'no-store' })).json();
  const brands = await Promise.all(
    index.brands.map(async (b) => sourceOf(await (await fetch(`/brands/${b.slug}/brand.json`, { cache: 'no-store' })).json())),
  );
  return { live: false, palette: bundledPalette, brands };
}

async function call(method, path, body) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, errors: ['The dev server did not answer. Check that npm run dev is still running, then try again.'] };
  }
  if (!isJson(res)) return { ok: false, errors: [`The save API answered ${res.status} without JSON. Editing runs under npm run dev.`] };
  return res.json();
}

export const saveBrand = (brand) => call('PUT', `/__brands/${brand.slug}`, sourceOf(brand));
export const createBrand = (name) => call('POST', '/__brands', { name });
export const deleteBrand = (slug) => call('DELETE', `/__brands/${slug}`);
