// Right-hand inspector: color swatches, glyph tone, the contrast gate, and live previews of the unsaved brand.
import {
  GATES,
  contrast,
  brandColors,
  themeColors,
  contrastChecks,
  faviconSVG,
  tileSVG,
  horizontalSVG,
  stackedSVG,
  kebab,
  loadFont,
} from '../../brand/index.js';

const $ = (id) => document.getElementById(id);
const ratio = (n) => `${n.toFixed(2)}:1`;
const dataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

let fontPromise;
const font = () => (fontPromise ??= loadFont());

/** Build the swatch and tone radios once the palette is known. `onColor(id)` / `onTone(tone)` commit edits. */
export function buildInspector(palette, { onColor, onTone }) {
  $('swatches').innerHTML = palette
    .map(
      (e) => `<label class="swatch">
        <input type="radio" name="color" value="${e.id}">
        <span class="sw-tile" style="background:${e.field}" aria-hidden="true">
          <span class="sw-chip" style="background:${e.pale}"></span><span class="sw-chip" style="background:${e.deep}"></span>
          <span class="sw-check"><svg viewBox="0 0 18 18"><path d="M4 9.5 7.5 13 14 5.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></span>
        </span>
        <span class="sw-name">${esc(e.name)}</span>
        <span class="sw-used" data-used="${e.id}"></span>
      </label>`,
    )
    .join('');
  $('tones').innerHTML = ['pale', 'deep']
    .map(
      (t) => `<label class="tone">
        <input type="radio" name="tone" value="${t}">
        <span class="tone-tile" data-tone-tile="${t}" aria-hidden="true"><span></span></span>
        <span class="tone-text"><span class="tone-name">${t === 'pale' ? 'Pale' : 'Deep'}</span>
        <span class="tone-ratio num" data-tone-ratio="${t}"></span></span>
      </label>`,
    )
    .join('');
  $('swatches').addEventListener('change', (e) => onColor(e.target.value));
  $('tones').addEventListener('change', (e) => onTone(e.target.value));
}

/** Gate results for both modes: { light: checks[], dark: checks[], failures: [{mode, check}] }. */
export function gate(brand, palette) {
  const out = { failures: [] };
  for (const mode of ['light', 'dark']) {
    // The core labels some pairs "base100"; show them as the token names ("base-100").
    out[mode] = contrastChecks(themeColors(brand, palette, mode)).map((k) => ({ ...k, label: k.label.replace(/base(\d)/g, 'base-$1') }));
    for (const k of out[mode]) if (!k.pass) out.failures.push({ mode, check: k });
  }
  return out;
}

/** Brand-owned checks first: these are the ones a color change moves. */
const BRAND_LABELS = ['primary on base-100', 'primary on base-200', 'primary-content on primary'];

function checksHTML(g, glyphRatio) {
  const row = (label, value, min, pass) =>
    `<tr class="${pass ? '' : 'fail'}"><th scope="row">${esc(label)}</th><td class="num">${ratio(value)}</td><td class="num">${min}:1</td><td class="res">${pass ? 'Pass' : 'Fail'}</td></tr>`;
  const head = '<thead><tr><th scope="col">Pair</th><th scope="col">Ratio</th><th scope="col">Needs</th><th scope="col">Result</th></tr></thead>';
  const summary = ['light', 'dark']
    .map((mode) => {
      const pass = g[mode].filter((k) => k.pass).length;
      const total = g[mode].length;
      const ok = pass === total;
      return `<li class="${ok ? 'ok' : 'fail'}"><span>${mode === 'light' ? 'Light' : 'Dark'} theme</span><span class="num">${pass} of ${total}</span><span class="ck-res">${ok ? 'Pass' : 'Fail'}</span></li>`;
    })
    .join('');
  const brandRows = ['light', 'dark']
    .flatMap((mode) =>
      g[mode].filter((k) => BRAND_LABELS.includes(k.label)).map((k) => row(`${k.label}, ${mode}`, k.ratio, k.min, k.pass)),
    )
    .join('');
  const glyphRow = row('glyph on field', glyphRatio, GATES.glyphOnField, glyphRatio >= GATES.glyphOnField);
  const all = ['light', 'dark']
    .map(
      (mode) =>
        `<table class="ck-table"><caption>${mode === 'light' ? 'Light' : 'Dark'} theme, every pair</caption>${head}<tbody>${g[mode]
          .map((k) => row(k.label, k.ratio, k.min, k.pass))
          .join('')}</tbody></table>`,
    )
    .join('');
  return `<ul class="ck-summary">${summary}</ul>
    <table class="ck-table"><caption class="sr-only">Glyph on field</caption>${head}<tbody>${glyphRow}</tbody></table>
    <details class="ck-all"><summary>All ${g.light.length + g.dark.length + 1} pairs</summary>
      <table class="ck-table"><caption>Pairs the brand color moves</caption>${head}<tbody>${glyphRow}${brandRows}</tbody></table>${all}</details>`;
}

function themeVars(brand, palette, mode) {
  const colors = themeColors(brand, palette, mode);
  return Object.entries(colors)
    .map(([k, v]) => (k === 'muted' ? `--muted:${v}` : `--color-${kebab(k).replace(/^base(\d)/, 'base-$1')}:${v}`))
    .join(';');
}

function themeHTML(brand, palette) {
  return ['light', 'dark']
    .map(
      (mode) => `<div class="th" data-theme="wompland-wompland-${mode}" style="${themeVars(brand, palette, mode)}">
        <p class="th-label">${mode === 'light' ? 'Light' : 'Dark'}</p>
        <p class="th-text">New post in ${esc(brand.name)}. <a class="link link-primary" href="#prev-themes" tabindex="-1">Read more</a></p>
        <div class="th-row"><button class="btn btn-primary btn-sm" type="button" tabindex="-1">Publish</button><span class="badge badge-primary">Draft</span><span class="badge badge-outline">Sample</span></div>
      </div>`,
    )
    .join('');
}

let lockupToken = 0;

/** Refresh everything in the inspector from the draft brand. */
export function updateInspector({ brand, palette, brands, live }) {
  const c = brandColors(brand, palette);

  for (const input of document.querySelectorAll('#swatches input')) input.checked = input.value === brand.color;
  for (const el of document.querySelectorAll('[data-used]')) {
    const users = brands.filter((b) => b.color === el.dataset.used && b.slug !== brand.slug).map((b) => b.name);
    el.textContent = users.length ? `Used by ${users.join(', ')}` : '';
  }
  const entry = palette.find((e) => e.id === brand.color);
  for (const t of ['pale', 'deep']) {
    const input = document.querySelector(`#tones input[value="${t}"]`);
    input.checked = brand.glyph === t;
    const tile = document.querySelector(`[data-tone-tile="${t}"]`);
    tile.style.background = entry.field;
    tile.firstElementChild.style.background = entry[t];
    const r = contrast(entry[t], entry.field);
    document.querySelector(`[data-tone-ratio="${t}"]`).textContent = `${ratio(r)} on field${r >= GATES.glyphOnField ? '' : ', below 3:1'}`;
  }
  for (const el of document.querySelectorAll('#color-group input, #tone-group input')) el.disabled = !live;

  const g = gate(brand, palette);
  $('checks').innerHTML = checksHTML(g, contrast(c.glyph, c.field));

  $('prev-sizes').innerHTML = [
    [16, faviconSVG(brand, palette, { size: 16 }), 'favicon art'],
    [32, faviconSVG(brand, palette, { size: 32 }), 'favicon art'],
    [64, tileSVG(brand, palette, { size: 64 }), 'mark'],
  ]
    .map(
      ([px, svg, kind]) =>
        `<figure class="sz"><div class="sz-art"><img src="${dataUri(svg)}" width="${px}" height="${px}" alt="${esc(brand.name)} ${kind} at ${px} pixels"></div><figcaption class="num">${px} px</figcaption></figure>`,
    )
    .join('');

  $('prev-themes').innerHTML = themeHTML(brand, palette);

  const token = ++lockupToken;
  font()
    .then((f) => {
      if (token !== lockupToken) return;
      const opts = { unit: 3.5 };
      const pair = (reverse) =>
        `<img class="lk-h" src="${dataUri(horizontalSVG(brand, palette, f, { ...opts, reverse }))}" alt="${esc(brand.name)} horizontal lockup${reverse ? ', reverse' : ''}">` +
        `<img class="lk-s" src="${dataUri(stackedSVG(brand, palette, f, { ...opts, reverse }))}" alt="${esc(brand.name)} stacked lockup${reverse ? ', reverse' : ''}">`;
      $('prev-lockups').innerHTML = `<div class="lk lk-light">${pair(false)}</div><div class="lk lk-dark">${pair(true)}</div>`;
    })
    .catch((e) => {
      if (token === lockupToken) $('prev-lockups').innerHTML = `<p class="field-error">Lockups could not load the Archivo font: ${esc(e.message)}</p>`;
    });

  return g;
}
