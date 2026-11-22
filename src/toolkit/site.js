// Shared runtime for the toolkit's read pages (home, brand guide, system guide).
// Brand data always comes from the generated static files (public/brands/), so the pages
// behave the same under `npm run dev` and in the static build. Only writes use the dev API.
import palette from '../../brands/palette.json';
import { apply } from '../shared/mode.js';
import { loadFont, horizontalLockup, stackedLockup, tileBody, TILE, esc } from '../brand/index.js';

export { palette, esc };
/** True under `npm run dev`, where the /__brands save API exists. */
export const DEV = import.meta.env.DEV;

let stamp = Date.now();
const bust = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${stamp}`;
/** Cache-busted public URL for a generated file (changes after every save). */
export const fresh = bust;

async function getJSON(url) {
  const res = await fetch(bust(url), { cache: 'no-store' });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** The brand list from public/brands/index.json: master first, then subs by slug. */
export async function loadIndex() {
  const data = await getJSON('/brands/index.json');
  return data?.brands ?? [];
}

/** One generated brand.json (source + colors, themes, tokens, assets), or null if there is no such brand. */
export async function loadBrand(slug) {
  if (!/^[a-z]+$/.test(slug ?? '')) return null;
  return getJSON(`/brands/${slug}/brand.json`);
}

/** Every brand.json, master first. */
export async function loadAllBrands() {
  const index = await loadIndex();
  const all = await Promise.all(index.map((b) => loadBrand(b.slug)));
  return all.filter(Boolean);
}

let fontPromise;
/** Archivo 600, parsed once. */
export const font = () => (fontPromise ??= loadFont());

/** Inline SVG element markup from { width, height, body }. Decorative unless a label is given. */
export function inlineSVG({ width, height, body }, { label, cls = '' } = {}) {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}" class="${cls}" ${a11y}>${body}</svg>`;
}

/**
 * A lockup drawn from brand data. The tile keeps its palette colors on every ground;
 * the name follows the surrounding text color (ink on light grounds, paper on dark).
 */
export function lockup(brand, f, { kind = 'horizontal', unit = 8, label = `${brand.name} logo`, cls = 'logo', wordFill = 'currentColor' } = {}) {
  const build = kind === 'stacked' ? stackedLockup : horizontalLockup;
  return inlineSVG(build(brand, palette, f, { unit, wordFill }), { label, cls });
}

/** The tile alone. */
export function tile(brand, { unit = 8, label = `${brand.name} mark`, cls = 'logo-tile' } = {}) {
  const s = TILE * unit;
  return inlineSVG({ width: s, height: s, body: tileBody(brand, palette, { unit }) }, { label, cls });
}

/** Fill every [data-lockup="<slug>"] slot in the masthead with the brand's horizontal lockup. */
export async function renderMasthead() {
  const slots = document.querySelectorAll('[data-masthead-lockup]');
  if (!slots.length) return;
  const [index, f] = await Promise.all([loadIndex(), font()]);
  const masterSlug = index.find((b) => b.role === 'master')?.slug;
  const master = masterSlug && (await loadBrand(masterSlug));
  if (!master) return;
  for (const s of slots) s.innerHTML = lockup(master, f, { unit: 8, label: null, cls: 'logo' });
}

/** Re-run data-brand theme assignment after content is rendered. */
export const reapplyMode = () => apply(document.documentElement.dataset.pageMode || 'light');

/** Run `fn` whenever the dev server reports a brand write; refetches bypass caches. */
export function onBrandsChanged(fn) {
  if (!import.meta.hot) return;
  import.meta.hot.on('wompland:brands', (data) => {
    stamp = Date.now();
    fn(data);
  });
}

/** Dev shows the editing UI and hides the read-only wording; the static build strips dev-only markup (vite.config.js). */
export function gateDevOnly() {
  for (const el of document.querySelectorAll('[data-dev-only]')) el.hidden = !DEV;
  for (const el of document.querySelectorAll('[data-prod-only]')) el.hidden = DEV;
}

export { MIN_SIZES, CLEAR_U } from '../brand/index.js';

/** Pass / fail as a word plus a drawn mark, so the result never rests on color. */
export function verdict(pass) {
  const mark = pass
    ? '<path d="M2 7.5l3.5 3.5L12 3.5" fill="none" stroke="currentColor" stroke-width="2"/>'
    : '<path d="M3 3l8 8M11 3l-8 8" fill="none" stroke="currentColor" stroke-width="2"/>';
  return `<span class="verdict ${pass ? 'pass' : 'fail'}"><svg viewBox="0 0 14 14" aria-hidden="true">${mark}</svg>${pass ? 'Pass' : 'Fail'}</span>`;
}

/** A ratio as "4.52:1". */
export const ratio = (n) => `${n.toFixed(2)}:1`;

/** Copy text to the clipboard and announce the result in `status`. */
export async function copyText(text, status) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Copied';
  } catch {
    status.textContent = 'Copy failed: select the text and press Ctrl+C or Cmd+C';
  }
  clearTimeout(status._t);
  status._t = setTimeout(() => (status.textContent = ''), 2500);
}
