// Brand guide: /toolkit/brand.html?brand=<slug>. Everything is built at runtime from
// public/brands/<slug>/brand.json and the brand modules, so the guide always matches the saved brand.
import { parse, converter } from 'culori';
import { themeColors, contrastChecks, horizontalLockup, TILE } from '../brand/index.js';
import {
  DEV, palette, esc, font, lockup, tile, inlineSVG, fresh, loadBrand, loadIndex,
  renderMasthead, reapplyMode, onBrandsChanged, verdict, ratio, copyText, MIN_SIZES, CLEAR_U,
} from './site.js';

const main = document.getElementById('guide');
const slug = new URLSearchParams(location.search).get('brand') || 'wompland';
const toOklch = converter('oklch');
const oklch = (hex) => {
  const c = toOklch(parse(hex));
  return `oklch(${(c.l * 100).toFixed(1)}% ${c.c.toFixed(3)} ${(c.h ?? 0).toFixed(1)})`;
};
const file = (url) => url.split('/').pop();

// ---------- Hero ----------
function hero(b, f) {
  const edit = DEV ? `<a class="btn btn-primary" href="/toolkit/edit.html?brand=${b.slug}">Edit ${esc(b.name)}</a>` : `<span class="devnote">Editing runs under <code>npm run dev</code>.</span>`;
  const sections = [
    ['files', 'Logo files'], ['grounds', 'On light and dark'], ['colors', 'Colors'],
    ['themes', 'Theme preview'], ['app', 'In an app'], ['install', 'Install'],
  ];
  return `<section class="opener cols guide-hero" aria-labelledby="page-title">
    <div class="hero-art">${lockup(b, f, { unit: 16, label: `${b.name} logo` })}</div>
    <div class="lede">
      <h1 id="page-title" class="h1">${esc(b.name)} brand guide</h1>
      <p class="small muted">${b.role === 'master' ? 'Master brand' : 'Womp'} · ${esc(b.colors.name)} field · ${b.glyph === 'pale' ? 'Pale' : 'Deep'} glyph · themes <code>${b.themes.light}</code> and <code>${b.themes.dark}</code></p>
      <div class="hero-actions mt-6">${edit}</div>
    </div>
    <nav class="pagenav" aria-label="On this page"><ol>${sections.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol></nav>
  </section>`;
}

// ---------- Logo files ----------
const ASSETS = [
  ['SVG logos', [
    ['mark', 'Mark', '72 × 72, scales to any size'],
    ['horizontal', 'Horizontal', 'For light grounds'],
    ['horizontalReverse', 'Horizontal, reverse', 'For dark grounds', true],
    ['stacked', 'Stacked', 'For light grounds'],
    ['stackedReverse', 'Stacked, reverse', 'For dark grounds', true],
    ['favicon', 'Favicon art', 'SVG on a 16 px grid'],
  ]],
  ['Icons', [
    ['faviconIco', 'favicon.ico', '16 and 32 px inside', false, 32],
    ['png16', 'PNG 16', '16 × 16 px, favicon art', false, 16],
    ['png32', 'PNG 32', '32 × 32 px, favicon art', false, 32],
    ['appleTouch', 'Apple touch icon', '180 × 180 px', false, 90],
    ['png192', 'PNG 192', '192 × 192 px, web app manifest', false, 96],
    ['png512', 'PNG 512', '512 × 512 px, web app manifest', false, 128],
  ]],
  ['Theme and data', [
    ['theme', 'DaisyUI themes', 'Light and dark theme blocks'],
    ['brand', 'Brand data', 'Source, colors, tokens and asset paths'],
  ]],
];

function themeStrip(b) {
  const keys = [['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['base100', 'Base 100'], ['baseContent', 'Base content']];
  const row = (mode) => {
    const c = themeColors(b, palette, mode);
    return `<div class="strip-row"><span class="strip-label">${mode}</span><span class="strip">${keys.map(([k, n]) => `<span style="background:${c[k]}" title="${n} ${c[k]}"></span>`).join('')}</span></div>`;
  };
  return `<div class="strip-wrap" aria-hidden="true">${row('light')}${row('dark')}</div>`;
}

function dataExcerpt(b) {
  const lines = [`"slug": "${b.slug}",`, `"color": "${b.color}",`, `"glyph": "${b.glyph}",`, `"shapes": [ ${b.shapes.length} shapes ],`, `"colors": { "field": "${b.colors.field}", … }`];
  return `<pre class="excerpt" aria-hidden="true">${lines.map(esc).join('\n')}</pre>`;
}

function files(b) {
  const card = ([key, name, note, reverse, px]) => {
    const url = b.assets[key];
    if (!url) return '';
    const isImg = /\.(svg|png|ico)$/.test(url);
    const art = isImg
      ? `<img src="${fresh(url)}" alt="" ${px ? `width="${px}" height="${px}" class="px"` : 'class="vec"'} decoding="async">`
      : key === 'theme' ? themeStrip(b) : dataExcerpt(b);
    // Files are fixed artwork: ink names need a light ground, reverse names a dark one, in either page mode.
    const ground = ` data-brand="wompland" data-mode="${reverse ? 'dark' : 'light'}"`;
    return `<li class="spec asset half">
      <div class="spec-art ground"${ground}>${art}</div>
      <div class="spec-cap"><span><b>${name}</b><span class="block muted">${note}</span></span><a href="${url}" download="${b.slug}-${file(url)}" class="dl">Download<span class="sr-only"> ${name}</span> <code>${file(url)}</code></a></div>
    </li>`;
  };
  return plate('files', 'Logo files', [
    'Every file is generated from the brand data each time it is saved.',
    'Use the reverse lockups on dark grounds: the tile stays the same, only the name switches to paper.',
  ], ASSETS.map(([group, items]) => `<h3>${group}</h3><ul class="assets subgrid mt-4">${items.map(card).join('')}</ul>`).join('<div class="mt-10"></div>'));
}

// ---------- Grounds, clear space, minimum sizes ----------
function clearSpace(b, f) {
  const u = 10;
  const l = horizontalLockup(b, palette, f, { unit: u, wordFill: 'currentColor' });
  const pad = CLEAR_U * u;
  const W = l.width + pad * 2;
  const H = l.height + pad * 2;
  const body =
    `<rect class="zone" x="0" y="0" width="${W}" height="${H}"/>` +
    `<rect x="${pad}" y="${pad}" width="${l.width}" height="${l.height}" fill="var(--color-base-100)"/>` +
    `<g transform="translate(${pad} ${pad})">${l.body}</g>` +
    `<path class="dim" d="M0 ${H / 2}h${pad}M${W - pad} ${H / 2}h${pad}M${pad / 2 + pad * 2} 0v${pad}M${pad / 2 + pad * 2} ${H - pad}v${pad}"/>` +
    `<text class="dim-t" x="${pad / 2}" y="${H / 2 - 6}" text-anchor="middle">2u</text>` +
    `<text class="dim-t" x="${W - pad / 2}" y="${H / 2 - 6}" text-anchor="middle">2u</text>`;
  return inlineSVG({ width: W, height: H, body }, { label: `Clear space: ${CLEAR_U} modules on every side of the ${b.name} lockup`, cls: 'construct clear' });
}

function grounds(b, f) {
  const panel = (mode, kind) =>
    `<div class="ground half" data-brand="wompland" data-mode="${mode}">
      <p class="cap">${mode === 'light' ? 'Light ground' : 'Dark ground, reverse'}</p>
      <div class="ground-art ${kind}">${lockup(b, f, { kind, unit: 8, label: `${b.name} ${kind} logo on a ${mode} ground` })}</div>
    </div>`;
  const min = MIN_SIZES.map((m) => {
    const demo =
      m.name.startsWith('Horizontal') ? `<span class="true-size" style="width:${m.px}px">${lockup(b, f, { unit: 8, label: null })}</span>`
      : m.name.startsWith('Stacked') ? `<span class="true-size" style="width:${m.px}px">${lockup(b, f, { kind: 'stacked', unit: 8, label: null })}</span>`
      : m.name.includes('favicon') ? `<img src="${fresh(b.assets.favicon)}" alt="" width="16" height="16">`
      : `<span class="true-size" style="width:${m.px}px">${tile(b, { unit: 8, label: null })}</span>`;
    return `<tr><th scope="row">${m.name}</th><td class="r num" data-label="Screen">${m.px} px</td><td class="r num" data-label="Print">${m.print}</td><td class="demo" data-label="At minimum">${demo}</td></tr>`;
  }).join('');
  return plate('grounds', 'On light and dark', [
    'The tile never changes between grounds. Only the name switches from ink to paper.',
    'Keep two modules (two ninths of the tile) clear on every side, and never go below the minimum sizes.',
  ], `
    <div class="grounds subgrid">${panel('light', 'horizontal')}${panel('dark', 'horizontal')}</div>
    <div class="grounds subgrid mt-6">${panel('light', 'stacked')}${panel('dark', 'stacked')}</div>
    <div class="clear-grid subgrid mt-10">
      <figure class="spec">
        <div class="spec-art">${clearSpace(b, f)}</div>
        <figcaption class="spec-cap"><b>Clear space</b><span class="num">${CLEAR_U} modules each side · u = 1/${TILE} of the tile</span></figcaption>
      </figure>
      <div class="spec minsizes" tabindex="0" role="region" aria-label="Minimum sizes table">
        <table>
          <caption>Minimum sizes, shown at true size</caption>
          <thead><tr><th scope="col">Use</th><th scope="col" class="r">Screen</th><th scope="col" class="r">Print</th><th scope="col">At minimum</th></tr></thead>
          <tbody>${min}</tbody>
        </table>
        <p class="small muted min-note">Below 24 px, use the favicon art: a 1 px margin instead of one module, snapped to whole pixels.</p>
      </div>
    </div>`);
}

// ---------- Colors ----------
/** Brand-specific choices that the system rules alone do not decide. */
const BRAND_NOTES = {
  blogwomp: 'Keep the glyph deep. Vermilion passes with either partner, but a pale, paper-like glyph on an orange-red square drifts toward Blogger\'s icon.',
};

function colors(b) {
  const c = b.colors;
  const sw = (label, hex, note) => `<li class="swatch ${label === 'Field' ? 'half' : 'quarter'}">
    <span class="chip" style="background:${hex}"></span>
    <p><b>${label}</b>${note ? ` <span class="muted">${note}</span>` : ''}</p>
    <p class="hex small">${hex}</p><p class="hex small muted">${oklch(hex)}</p>
  </li>`;
  const prim = ['light', 'dark'].map((mode) => {
    const t = b.tokens[mode];
    return `<div class="prim half" data-brand="${b.slug}" data-mode="${mode}">
      <p class="cap">${mode === 'light' ? 'Light' : 'Dark'} · <code>${b.themes[mode]}</code></p>
      <div class="prim-sample"><span class="prim-btn" style="background:${t.primary};color:${t.primaryContent}">Publish</span><span class="prim-link">A link in running text</span></div>
      <dl class="small">
        <div><dt>Primary</dt><dd><span class="dot" style="background:${t.primary}"></span><span class="hex">${t.primary}</span> <span class="muted hex">${oklch(t.primary)}</span></dd></div>
        <div><dt>Primary content</dt><dd><span class="dot" style="background:${t.primaryContent}"></span><span class="hex">${t.primaryContent}</span> <span class="muted hex">${oklch(t.primaryContent)}</span></dd></div>
      </dl>
    </div>`;
  }).join('');
  const [L, D] = ['light', 'dark'].map((mode) => contrastChecks(themeColors(b, palette, mode)));
  const failed = [...L, ...D].filter((k) => !k.pass).length;
  const cell = (k, mode) => `<td class="g-colors"><span class="mode-tag">${mode}</span><span class="pair" role="img" aria-label="${k.fg} on ${k.bg}"><span class="dot" style="background:${k.fg}"></span><span class="dot" style="background:${k.bg}"></span></span></td><td class="r num">${ratio(k.ratio)}</td><td>${verdict(k.pass)}</td>`;
  const gate = `<div class="spec gate" tabindex="0" role="region" aria-label="Contrast gate table">
    <table>
      <caption>${failed ? `${failed} of ${L.length + D.length} checks fail` : `All ${L.length + D.length} checks pass, light and dark`}</caption>
      <thead>
        <tr><th scope="col" rowspan="2">Pair</th><th scope="col" rowspan="2" class="r">Min</th><th scope="colgroup" colspan="3" class="grp">Light</th><th scope="colgroup" colspan="3" class="grp">Dark</th></tr>
        <tr><th scope="col"><span class="sr-only">Light colors</span></th><th scope="col" class="r">Ratio</th><th scope="col">Result</th><th scope="col"><span class="sr-only">Dark colors</span></th><th scope="col" class="r">Ratio</th><th scope="col">Result</th></tr>
      </thead>
      <tbody>${L.map((k, i) => `<tr><th scope="row">${k.label}</th><td class="r num g-min">${k.min}</td>${cell(k, 'Light')}${cell(D[i], 'Dark')}</tr>`).join('')}</tbody>
    </table>
  </div>`;
  const note = BRAND_NOTES[b.slug];
  return plate('colors', 'Colors', [
    `The tile is the ${esc(c.name)} field with its ${b.glyph} partner as the glyph. Fields are surfaces: they never set text.`,
    'Text in the brand color uses the theme primary, which is derived from the field until it reaches 4.5:1 on both page grounds.',
  ], `${note ? `<p class="brand-note"><b>${esc(b.name)} note.</b> ${note}</p>` : ''}
    <h3>Tile colors</h3>
    <ul class="swatches subgrid mt-4">${sw('Field', c.field, 'tile background')}${sw('Pale', c.pale, b.glyph === 'pale' ? 'glyph' : 'partner')}${sw('Deep', c.deep, b.glyph === 'deep' ? 'glyph' : 'partner')}</ul>
    <h3 class="mt-10">Theme primary</h3>
    <div class="prims subgrid mt-4">${prim}</div>
    <h3 class="mt-10">Contrast gate</h3>
    <p class="small muted mt-2 measure">The same checks that stop a save: body text 7:1, muted text and every color on its content 4.5:1, primary as text 4.5:1, interface colors 3:1.</p>
    <div class="mt-4">${gate}</div>`);
}

// ---------- Theme preview ----------
function sampler(b, mode) {
  const id = (s) => `${mode}-${s}`;
  return `<div class="sampler" data-brand="${b.slug}" data-mode="${mode}">
    <p class="cap">${mode === 'light' ? 'Light' : 'Dark'} · <code>${b.themes[mode]}</code></p>
    <div class="row">
      <button class="btn btn-primary" type="button">Publish</button>
      <button class="btn btn-secondary" type="button">Save draft</button>
      <button class="btn btn-ghost" type="button">Cancel</button>
      <button class="btn btn-outline btn-primary" type="button">Export</button>
      <button class="btn btn-primary" type="button" disabled>Disabled</button>
    </div>
    <div><label class="field-label" for="${id('title')}">Title</label><input class="input w-full" id="${id('title')}" type="text" placeholder="Something worth reading"></div>
    <div><label class="field-label" for="${id('vis')}">Visibility</label><select class="select w-full" id="${id('vis')}"><option>Public</option><option>Unlisted</option><option>Followers only</option></select></div>
    <div class="row" style="gap:20px">
      <label class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-primary" checked> Send webmentions</label>
      <label class="flex items-center gap-2"><input type="checkbox" class="toggle toggle-primary" checked> Federate</label>
    </div>
    <div class="row"><span class="badge badge-primary">Published</span><span class="badge badge-neutral">Draft</span><span class="badge badge-outline">3 tags</span></div>
    <div class="grid gap-2">
      <div role="status" class="alert alert-info"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9v6M10 5v2" stroke="currentColor" stroke-width="2"/></svg><span>Your feed rebuilds after each publish.</span></div>
      <div role="status" class="alert alert-success"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Published. Webmentions sent to 2 sites.</span></div>
      <div role="status" class="alert alert-warning"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2L18 17H2Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 8v4M10 14v2" stroke="currentColor" stroke-width="2"/></svg><span>Draft not saved for 10 minutes.</span></div>
      <div role="status" class="alert alert-error"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Upload failed: the file is over 20 MB. Resize it and try again.</span></div>
    </div>
    <div role="tablist" class="tabs tabs-border" aria-label="Sample tabs, ${mode}">
      <button role="tab" type="button" class="tab tab-active" aria-selected="true">Posts</button>
      <button role="tab" type="button" class="tab" aria-selected="false" tabindex="-1">Notes</button>
      <button role="tab" type="button" class="tab" aria-selected="false" tabindex="-1">Drafts</button>
    </div>
    <p class="prose">Links in running text use the primary color, like <a href="#themes">this link to the theme preview</a>, with a 2px underline.</p>
  </div>`;
}

function themes(b) {
  return plate('themes', 'Theme preview', [
    `DaisyUI components in <code>${b.themes.light}</code> and <code>${b.themes.dark}</code>: square corners, 2px borders, no shadows.`,
  ], `<div class="samplers subgrid">${sampler(b, 'light')}${sampler(b, 'dark')}</div>`);
}

// ---------- In an app ----------
const ICON_RSS = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 3a14 14 0 0 1 14 14M3 9a8 8 0 0 1 8 8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="3" height="3" fill="currentColor"/></svg>';

function appbar(b, f, links) {
  return `<div class="fieldbar"></div>
    <div class="appbar">
      <a href="#app" aria-label="${esc(b.name)} home (sample)">${lockup(b, f, { unit: 4, label: null })}</a>
      <nav aria-label="${esc(b.name)} sample navigation"><ul>${links.map((l, i) => `<li><a href="#app"${i === 0 ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul></nav>
    </div>`;
}

function blogScreen(b, f) {
  return `${appbar(b, f, ['Posts', 'Notes', 'Archive', 'About'])}
    <div class="post">
      <article>
        <h3 class="title">Webmentions, explained to myself a year ago</h3>
        <p class="byline"><span>By Sam Example</span><time datetime="2026-11-14" class="num">14 Nov 2026</time><span>6 minute read</span></p>
        <div class="body">
          <p>A year ago I thought comments needed a database, a spam filter and a plugin I would never update. It turns out the web already has a way for one site to tell another "I wrote about you", and it fits in a single line of HTML.</p>
          <figure class="pull"><blockquote>Replies live on the replier's site. You keep a copy; they keep the original.</blockquote></figure>
          <p>Advertising an endpoint is the whole setup on the receiving side. ${esc(b.name)} adds this to every page for you:</p>
          <pre class="code"><code>&lt;link rel="webmention" href="https://example.net/webmention"&gt;</code></pre>
          <p>Because every mention points at a real page you can visit, spam is easier to spot. See the <a href="#app">longer guide on sending mentions</a> if you want to try it.</p>
        </div>
        <div class="tags" aria-label="Tags"><a class="badge badge-outline" href="#app">indieweb</a><a class="badge badge-outline" href="#app">webmentions</a></div>
      </article>
      <aside class="follow" aria-label="Follow this blog (sample)">
        <p class="h3 font-bold">Follow this blog</p>
        <a class="btn btn-primary w-full" href="#app">${ICON_RSS}RSS feed</a>
        <label class="field-label" for="fedi">Follow from the fediverse</label>
        <input id="fedi" class="input w-full" type="text" placeholder="@you@your.server" autocomplete="off">
        <button class="btn btn-outline btn-primary" type="button">Follow</button>
      </aside>
    </div>`;
}

function wikiScreen(b, f) {
  return `${appbar(b, f, ['Pages', 'Recent changes', 'Search'])}
    <div class="wiki">
      <nav class="tree" aria-label="Page tree (sample)">
        <p class="cap muted">Home server</p>
        <ul class="mt-2">
          <li><a href="#app">Start here</a></li>
          <li><a href="#app">Hardware</a><ul><li><a href="#app">The closet box</a></li><li><a href="#app">Power and UPS</a></li></ul></li>
          <li><a href="#app">Services</a><ul><li><a href="#app" aria-current="page">Backups</a></li><li><a href="#app">DNS</a></li></ul></li>
          <li><a href="#app">Incidents</a></li>
        </ul>
      </nav>
      <div class="wbody">
        <p class="crumbs small muted">Home server / Services / Backups</p>
        <h3 class="h1 wtitle">Backups</h3>
        <div class="wiki-article">
          <div class="doc">
            <p>Everything on the closet box is backed up twice: once to a USB disk every night, once to a friend's server every week. If you are here because something broke, go to <a class="wlink" href="#app">Restoring</a>.</p>
            <h4>What gets copied</h4>
            <ul><li>The <a class="wlink" href="#app">blogWomp data folder</a>, posts and uploads.</li><li>This wiki's database, exported as plain Markdown first.</li></ul>
            <h4>Restoring</h4>
            <p>Stop the app first, then copy the folder back. The <a class="wlink new" href="#app">restore drill</a> page does not exist yet; dashed links mark pages someone still needs to write.</p>
          </div>
          <aside class="infobox" aria-label="Backup facts (sample)">
            <p class="ihead">At a glance</p>
            <dl class="num"><dt>Nightly</dt><dd>03:10, USB disk</dd><dt>Weekly</dt><dd>Sun 04:00, offsite</dd><dt>Kept</dt><dd>14 nightly, 8 weekly</dd></dl>
          </aside>
        </div>
      </div>
    </div>`;
}

function genericScreen(b, f) {
  const job = b.role === 'master' ? 'app' : b.name.replace(/Womp$/, '') || 'item';
  const rows = [['Getting started', 'Published', '18 Nov 2026'], ['Notes from the weekend', 'Draft', '16 Nov 2026'], ['A small change log', 'Published', '9 Nov 2026']];
  return `${appbar(b, f, ['Dashboard', `${job[0].toUpperCase()}${job.slice(1)}s`, 'Settings'])}
    <div class="shell">
      <div class="shell-head">
        <h3 class="h2">Recent ${esc(job)}s</h3>
        <button class="btn btn-primary" type="button">New ${esc(job)}</button>
      </div>
      <div class="shell-band"><p>Welcome to ${esc(b.name)}. This is placeholder content showing the theme on a real screen.</p></div>
      <table class="data mt-6">
        <caption class="sr-only">Recent ${esc(job)}s (sample)</caption>
        <thead><tr><th scope="col">Title</th><th scope="col">Status</th><th scope="col" class="r">Updated</th></tr></thead>
        <tbody>${rows.map(([t, s, d]) => `<tr><td><a href="#app">${t}</a></td><td><span class="badge ${s === 'Draft' ? 'badge-neutral' : 'badge-primary'}">${s}</span></td><td class="r num">${d}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function app(b, f) {
  const screen = b.slug === 'blogwomp' ? blogScreen : b.slug === 'wikiwomp' ? wikiScreen : genericScreen;
  const what = b.slug === 'blogwomp' ? 'A post page.' : b.slug === 'wikiwomp' ? 'An article with its page tree.' : 'A generic app shell.';
  return plate('app', 'In an app', [
    `${what} The field appears once, as a band; everything you read stays ink on the ground. Follows the page's light or dark mode.`,
    '<span class="sample-note">Sample content</span>',
  ], `<div class="screen" data-brand="${b.slug}">${screen(b, f)}</div>`);
}

// ---------- Install ----------
function snippet(id, title, note, code) {
  return `<div class="snippet">
    <div class="snippet-head"><h3 id="${id}-t">${title}</h3><button class="btn btn-sm btn-outline" type="button" data-copy="${id}" aria-describedby="${id}-t">Copy</button><span class="copy-status small" role="status" id="${id}-s"></span></div>
    <p class="small muted">${note}</p>
    <pre class="code" tabindex="0" aria-labelledby="${id}-t"><code id="${id}">${esc(code)}</code></pre>
  </div>`;
}

function install(b, themeCSS) {
  const links = `<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
  const imp = `@import "tailwindcss";
@plugin "daisyui" { themes: false; }
@import "./daisyui-theme.css";`;
  return plate('install', 'Install', [
    'Copy the files into your app, then paste these snippets.',
    `The light theme is the default; the dark theme applies when the visitor prefers dark. Set <code>data-theme="${b.themes.dark}"</code> to force it.`,
  ], `
    ${snippet('snip-links', 'Favicon tags', `Copy <code>favicon.ico</code>, <code>favicon.svg</code> and <code>apple-touch-icon.png</code> to your site root, then add these to the <code>&lt;head&gt;</code>.`, links)}
    ${snippet('snip-import', 'DaisyUI theme, as a file', 'Save <code>daisyui-theme.css</code> next to your main stylesheet and import it after DaisyUI.', imp)}
    ${snippet('snip-blocks', 'DaisyUI theme, pasted', 'Or paste both theme blocks after <code>@plugin "daisyui"</code>.', themeCSS ?? 'Could not load daisyui-theme.css. Download it from Logo files above.')}`);
}

// ---------- Shared plate ----------
function plate(id, title, paras, body) {
  return `<section class="plate cols" id="${id}" aria-labelledby="${id}-title">
    <div class="plate-head"><h2 id="${id}-title">${title}</h2>${paras.map((p) => `<p>${p}</p>`).join('')}</div>
    <div class="plate-body">${body}</div>
  </section>`;
}

async function notFound() {
  const index = await loadIndex().catch(() => []);
  document.title = 'Brand not found · WompLand';
  main.innerHTML = `<section class="opener cols" aria-labelledby="page-title">
    <div class="lede">
      <h1 id="page-title" class="h1">No brand called “${esc(slug)}”</h1>
      <p>There is no saved brand with that name. Check the address, or pick a brand from the list.</p>
      ${index.length ? `<ul class="nf-list mt-6">${index.map((b) => `<li><a href="/toolkit/brand.html?brand=${b.slug}">${esc(b.name)} brand guide</a></li>`).join('')}</ul>` : ''}
      <p class="mt-6"><a class="btn btn-primary" href="/">Back to all brands</a></p>
    </div>
  </section>`;
  main.removeAttribute('aria-busy');
}

async function render() {
  const [b, f] = await Promise.all([loadBrand(slug), font()]);
  if (!b) return notFound();
  const themeCSS = await fetch(fresh(b.assets.theme)).then((r) => (r.ok ? r.text() : null)).catch(() => null);
  document.title = `${b.name} brand guide · WompLand`;
  document.getElementById('favicon').href = fresh(b.assets.favicon);
  document.getElementById('foot-src').textContent = `public/brands/${b.slug}/brand.json`;
  const y = scrollY;
  main.innerHTML = hero(b, f) + files(b) + grounds(b, f) + colors(b) + themes(b) + app(b, f) + install(b, themeCSS);
  main.removeAttribute('aria-busy');
  scrollTo(0, y);
  reapplyMode();
}

main.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const id = btn.dataset.copy;
  copyText(document.getElementById(id).textContent, document.getElementById(`${id}-s`));
});

// Sample tabs: click or arrow keys move the selection (roving tabindex).
function selectTab(tab, focus) {
  const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.classList.toggle('tab-active', on);
    t.tabIndex = on ? 0 : -1;
  }
  if (focus) tab.focus();
}
main.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab) selectTab(tab);
});
main.addEventListener('keydown', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (!tab || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  const i = (tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  selectTab(tabs[i], true);
});

renderMasthead();
render().catch((e) => {
  main.innerHTML = `<section class="opener cols"><div class="lede"><h1 class="h1">The guide could not load</h1><p role="alert">${esc(e.message)}. Run <code>npm run brands</code>, then reload.</p><p class="mt-6"><a href="/">Back to all brands</a></p></div></section>`;
  main.removeAttribute('aria-busy');
});
onBrandsChanged(({ slug: changed } = {}) => {
  renderMasthead();
  if (!changed || changed === slug) render();
});
