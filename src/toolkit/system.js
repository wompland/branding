// System guide: every drawing on the page is built at runtime from brand data and the palette.
import { shapePath, glyphPath, tileBody, horizontalLockup, stackedLockup, brandColors, entryChecks, contrast, LOCKUP, TILE, MARGIN, FIELD_SIZE, SIZE_RANGE, GATES, WHITE, GRAPHITE } from '../brand/index.js';
import { palette, esc, font, inlineSVG, lockup, loadAllBrands, renderMasthead, reapplyMode, onBrandsChanged, ratio } from './site.js';

const $ = (id) => document.getElementById(id);

/** Grid lines for a w x h module grid at `u` px, origin [ox, oy]. */
function gridLines(w, h, u, ox = 0, oy = 0) {
  let d = '';
  for (let i = 0; i <= w; i++) d += `M${ox + i * u} ${oy}v${h * u}`;
  for (let j = 0; j <= h; j++) d += `M${ox} ${oy + j * u}h${w * u}`;
  return `<path class="g-line" d="${d}"/>`;
}

/**
 * A construction plate: shapes on a w x h grid, each module drawn separately so the seams show.
 * On a field: { field, glyph } colors; otherwise the modules take the text color.
 */
function construct(shapes, { w, h, u = 24, field, glyph, label, pad = 0 }) {
  const fill = glyph ?? 'currentColor';
  const seam = field ?? 'var(--color-base-100)';
  const ox = pad * u;
  const W = (w + pad * 2) * u;
  const H = (h + pad * 2) * u;
  const body =
    (field ? `<rect width="${W}" height="${H}" fill="${field}"/>` : '') +
    gridLines(w + pad * 2, h + pad * 2, u) +
    shapes.map((s) => `<path class="mod" fill="${fill}" style="stroke:${seam}" d="${shapePath(s, u, [ox, ox])}"/>`).join('');
  return inlineSVG({ width: W, height: H, body }, { label, cls: `construct${field ? ' on-field' : ''}` });
}

const describe = (s) => (s.type === 'cell' ? 'Cell' : `${s.type === 'ring' ? 'Quarter ring' : 'Filled quarter'}, size ${s.size}, rot ${s.rot}`);

// ---------- Module kit ----------
function kit() {
  const item = (shapes, w, h, name, note, label) =>
    `<li class="kit-item quarter"><div class="kit-art">${construct(shapes, { w, h, u: 22, label })}</div><p class="kit-name">${name}</p><p class="small muted">${note}</p></li>`;
  const [rlo, rhi] = SIZE_RANGE.ring;
  const [plo, phi] = SIZE_RANGE.pie;
  $('kit-modules').innerHTML = [
    item([{ type: 'cell', x: 0, y: 0 }], 2, 2, 'Cell', '1 × 1. Dots, caps, bars and stems.', 'A cell: one module square'),
    item([{ type: 'ring', x: 0, y: 0, size: 2, rot: 0 }], 2, 2, 'Quarter ring', `Size ${rlo} to ${rhi}. Outer radius = size, inner = size − 1.`, 'A quarter ring, size 2'),
    item([{ type: 'ring', x: 0, y: 0, size: 3, rot: 0 }], 3, 3, 'Quarter ring, size 3', 'Still one module thick.', 'A quarter ring, size 3'),
    item([{ type: 'pie', x: 0, y: 0, size: 2, rot: 0 }], 2, 2, 'Filled quarter', `Size ${plo} to ${phi}. A solid quarter disc that rounds a corner of a block.`, 'A filled quarter circle, size 2'),
  ].join('');
  $('kit-rot').innerHTML = [0, 1, 2, 3]
    .map((rot) => item([{ type: 'ring', x: 0, y: 0, size: 2, rot }], 2, 2, `rot ${rot}`, ['Centre top-left', 'Centre top-right', 'Centre bottom-right', 'Centre bottom-left'][rot], `Quarter ring turned to rot ${rot}`))
    .join('');
  const col = (x, y0, n) => Array.from({ length: n }, (_, i) => ({ type: 'cell', x, y: y0 + i }));
  $('kit-combos').innerHTML = [
    item(col(0, 0, 4), 1, 4, 'Stem', 'Cells in a column, any height.', 'A stem: four cells in a column'),
    item([{ type: 'ring', x: 0, y: 0, size: 2, rot: 1 }, { type: 'ring', x: 2, y: 0, size: 2, rot: 0 }], 4, 2, 'Half ring', 'Two quarter rings: bowls and arches.', 'A half ring: two quarter rings side by side'),
    item([{ type: 'pie', x: 0, y: 0, size: 2, rot: 1 }, { type: 'pie', x: 2, y: 0, size: 2, rot: 0 }], 4, 2, 'Half disc', 'Two filled quarters.', 'A half disc: two filled quarters side by side'),
    item([...col(0, 0, 3), ...col(1, 0, 3), { type: 'pie', x: 2, y: 0, size: 3, rot: 3 }], 5, 3, 'Rounded block', 'Cells with a filled quarter on one corner.', 'A block of cells with one rounded corner'),
  ].join('');
}

// ---------- The master icon ----------
function theW(master) {
  const c = brandColors(master, palette);
  const u = 40;
  const W = TILE * u;
  const o = MARGIN * u;
  const body =
    `<rect width="${W}" height="${W}" fill="${c.field}"/>` +
    gridLines(TILE, TILE, u) +
    `<rect x="${o}" y="${o}" width="${FIELD_SIZE * u}" height="${FIELD_SIZE * u}" fill="none" class="guide" style="stroke:${c.glyph}"/>` +
    master.shapes.map((s) => `<path class="mod" fill="${c.glyph}" style="stroke:${c.field}" d="${shapePath(s, u, [o, o])}"/>`).join('');
  $('w-art').innerHTML =
    inlineSVG({ width: W, height: W, body }, { label: `The ${master.name} glyph on its 9 × 9 construction grid`, cls: 'construct w-grid' }) +
    `<figcaption class="small muted mt-3">${esc(master.name)}: ${esc(c.name)} field, ${master.glyph} glyph. The dashed square is the 7 × 7 field inside a one-module margin.</figcaption>`;
  const counts = {};
  for (const s of master.shapes) counts[describe(s)] = (counts[describe(s)] ?? 0) + 1;
  $('w-table').innerHTML = `<caption>The ${esc(master.name)} glyph, ${master.shapes.length} modules</caption>
    <thead><tr><th scope="col">Module</th><th scope="col" class="r">Count</th></tr></thead>
    <tbody>${Object.entries(counts).map(([k, n]) => `<tr><td>${k}</td><td class="r num">${n}</td></tr>`).join('')}</tbody>`;
}

// ---------- Lockup spec ----------
function lockupSpec(master, f) {
  const u = 12;
  const l = horizontalLockup(master, palette, f, { unit: u, wordFill: 'currentColor' });
  const right = l.width + 7 * u;
  const capTop = ((TILE - LOCKUP.capU) / 2) * u;
  const base = capTop + LOCKUP.capU * u;
  const nameX = (TILE + LOCKUP.gapU) * u;
  const H = TILE * u + 3 * u;
  const body =
    gridLines(Math.ceil(right / u), TILE, u) +
    l.body +
    `<path class="guide" d="M0 ${capTop}H${right}M0 ${base}H${right}M${TILE * u} 0V${TILE * u + u}M${nameX} 0V${TILE * u + u}"/>` +
    `<path class="dim" d="M${TILE * u} ${TILE * u + u * 1.4}H${nameX}M${l.width + u} ${capTop}V${base}"/>` +
    `<text class="dim-t" x="${(TILE * u + nameX) / 2}" y="${TILE * u + u * 2.8}" text-anchor="middle">${LOCKUP.gapU}u</text>` +
    `<text class="dim-t" x="${l.width + u * 1.6}" y="${(capTop + base) / 2 + 5}">${LOCKUP.capU}u cap</text>`;
  $('spec-h').innerHTML = `<div class="lockspec">${inlineSVG({ width: right, height: H, body }, { label: `Horizontal lockup spec: name ${LOCKUP.gapU} modules from the tile, cap height ${LOCKUP.capU} modules, caps centred on the tile`, cls: 'construct' })}</div>`;
  $('gap-u').textContent = `${LOCKUP.gapU}u`;
  for (const el of document.querySelectorAll('.cap-u')) el.textContent = `${LOCKUP.capU}u`;
  $('stack-u').textContent = `${LOCKUP.stackGapU}u`;
  $('spec-line').textContent = `Archivo 600 · cap ${LOCKUP.capU}u · gap ${LOCKUP.gapU}u · stacked ${LOCKUP.stackGapU}u · ${LOCKUP.tracking}em`.replace('-0.01', '−0.01');

  const s = stackedLockup(master, palette, f, { unit: u, wordFill: 'currentColor' });
  const sTop = TILE * u;
  const sCap = sTop + LOCKUP.stackGapU * u;
  const sBase = sCap + LOCKUP.capU * u;
  const sw = s.width + 6 * u;
  const sx = 3 * u;
  const sb =
    `<g transform="translate(${sx} 0)">${s.body}</g>` +
    `<path class="guide" d="M0 ${sTop}H${sw}M0 ${sCap}H${sw}M0 ${sBase}H${sw}"/>` +
    `<path class="dim" d="M${u} ${sTop}V${sCap}"/>` +
    `<text class="dim-t" x="${u * 1.5}" y="${(sTop + sCap) / 2 + 5}">${LOCKUP.stackGapU}u</text>`;
  $('spec-s').innerHTML = `<div class="stackspec">${inlineSVG({ width: sw, height: s.height + u, body: sb }, { label: `Stacked lockup spec: ${LOCKUP.stackGapU} modules from the tile to the cap top`, cls: 'construct' })}</div>`;
}

// ---------- Sub-brand rule ----------
const OBJECT_NOTES = {
  blogwomp: 'A feed: the newest post is the big block with the rounded corner; older posts are bars. The glyph stays deep, never pale: a pale glyph on an orange-red square drifts toward Blogger.',
  wikiwomp: 'A link target: square brackets around a page block, the way a wiki link wraps the page it points to.',
};

function womps(subs, f) {
  $('womps').innerHTML = subs.length
    ? subs
        .map((b) => {
          const c = brandColors(b, palette);
          return `<li class="womp half">
            <div class="womp-art">${construct(b.shapes, { w: FIELD_SIZE, h: FIELD_SIZE, u: 20, field: c.field, glyph: c.glyph, pad: 1, label: `${b.name} glyph on its construction grid` })}</div>
            <div class="womp-lockup">${lockup(b, f, { unit: 5, label: `${b.name} logo` })}</div>
            <p class="small"><b>${esc(b.name)}</b>: ${esc(c.name)} field, ${b.glyph} glyph. ${OBJECT_NOTES[b.slug] ?? ''} <a href="/toolkit/brand.html?brand=${b.slug}">Brand guide</a></p>
          </li>`;
        })
        .join('')
    : '<li class="small muted">No Womps yet. Create one from the Brands page.</li>';
}

// ---------- Palette rules ----------
function paletteRules(master) {
  const fmt = (n) => String(n);
  $('palette-rules').innerHTML = `
    <li><b>Equal weight.</b> Every field sits in one lightness band (OKLCH L ${GATES.lightness[0]} to ${GATES.lightness[1]}), so no Womp shouts over another.</li>
    <li><b>Works on white and graphite.</b> Each field reaches ${fmt(GATES.fieldOnGround)}:1 against white (${WHITE}) and graphite (${GRAPHITE}), so the tile reads as a shape on either page.</li>
    <li><b>Pale and deep partners.</b> Each field has a pale and a deep glyph color of the same hue (within ${GATES.hueDrift}°), both at ${fmt(GATES.glyphOnField)}:1 or more on the field. A brand picks one.</li>
    <li><b>Distinct, and clear of look-alikes.</b> Neighbouring fields stay tellable apart, and every field keeps its distance from WordPress and Shopify colors.</li>`;
  const tiles = (mode) =>
    palette
      .map((e) => {
        const tile = (tone) => inlineSVG({ width: 54, height: 54, body: tileBody({ ...master, color: e.id, glyph: tone }, palette, { unit: 6 }) }, { label: null, cls: 'pal-tile' });
        const ground = mode === 'light' ? WHITE : GRAPHITE;
        return `<li><span class="pal-pair">${tile('pale')}${tile('deep')}</span><span class="small"><b>${esc(e.name)}</b> <span class="num muted">${ratio(contrast(e.field, ground))}</span></span></li>`;
      })
      .join('');
  $('palette-grounds').innerHTML = ['light', 'dark']
    .map(
      (mode) => `<div class="ground pal-ground half" data-brand="wompland" data-mode="${mode}">
        <p class="cap">${mode === 'light' ? 'On white' : 'On graphite'} · pale and deep glyph · field contrast</p>
        <ul class="pal-tiles">${tiles(mode)}</ul>
      </div>`,
    )
    .join('');
  // Every entry must pass its gates; the page says so if one does not.
  const bad = palette.flatMap((e) => entryChecks(e).filter((c) => !c.pass).map((c) => `${e.name}: ${c.label}`));
  if (bad.length) $('palette-rules').insertAdjacentHTML('afterend', `<p role="alert" class="mt-4"><b>Palette gate failures:</b> ${bad.map(esc).join('; ')}. Run <code>npm run palette</code>.</p>`);
}

// ---------- Don'ts ----------
const X = '<g class="x-badge"><rect width="22" height="22"/><path d="M6 6l10 10M16 6L6 16"/></g>';

function donts(master) {
  const c = brandColors(master, palette);
  const u = 9;
  const T = TILE * u;
  const frame = (inner, label, w = 220, h = 140) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" class="dont-art">${inner}<g transform="translate(${w - 26} 4)">${X}</g></svg>`;
  const at = (x, y, inner) => `<g transform="translate(${x} ${y})">${inner}</g>`;
  const masterTile = tileBody(master, palette, { unit: u });
  const items = [];

  items.push([frame(`<circle cx="110" cy="70" r="62" fill="none" stroke="currentColor" stroke-width="6"/>${at(110 - T / 2, 70 - T / 2, masterTile)}`, 'Misuse: the icon enclosed in a ring'), 'Put a circle or ring around the icon.']);
  items.push([frame(`<g transform="translate(30 29) scale(1.8 1)">${masterTile}</g>`, 'Misuse: the tile stretched wide'), 'Stretch the tile. It is always square.']);
  items.push([frame(`<g transform="rotate(180 110 70)">${at(110 - T / 2, 70 - T / 2, masterTile)}</g>`, 'Misuse: the mark turned upside down'), 'Rotate or flip it. The icon has one upright, and turned it stops reading as itself.']);
  const small = 5;
  items.push([frame(`${at(12, 47.5, tileBody(master, palette, { unit: small }))}<text x="${12 + TILE * small + 3 * small}" y="${47.5 + 7 * small}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="25" fill="currentColor">${esc(master.name)}</text>`, 'Misuse: the name set in a serif face'), 'Set the name in another face, or build it from modules.']);
  items.push([frame(at(110 - T / 2, 70 - T / 2, `<rect width="${T}" height="${T}" fill="#FFD100"/><path fill="#141414" d="${glyphPath(master.shapes, u, [u, u])}"/>`), 'Misuse: the tile on a signal yellow that is not in the palette'), 'Use a color outside the palette, even a familiar one.']);

  $('dont-list').innerHTML = items.map(([art, text]) => `<li class="quarter"><div class="spec dont">${art}</div><p class="small mt-2"><b>Don't</b> ${text.charAt(0).toLowerCase()}${text.slice(1)}</p></li>`).join('');
}

// ---------- Hero ----------
function hero(master) {
  const c = brandColors(master, palette);
  $('hero-mark').innerHTML = construct(master.shapes, { w: FIELD_SIZE, h: FIELD_SIZE, u: 40, field: c.field, glyph: c.glyph, pad: MARGIN, label: `The ${master.name} mark on its construction grid` });
}

async function render() {
  const [brands, f] = await Promise.all([loadAllBrands(), font()]);
  const master = brands.find((b) => b.role === 'master');
  if (!master) throw new Error('No master brand found');
  const subs = brands.filter((b) => b.role !== 'master');
  hero(master);
  kit();
  theW(master);
  lockupSpec(master, f);
  womps(subs, f);
  paletteRules(master);
  donts(master);
  reapplyMode();
}

renderMasthead();
render().catch((e) => {
  document.querySelector('main').insertAdjacentHTML('afterbegin', `<p role="alert" class="devnote">The drawings could not load (${esc(e.message)}). Run <code>npm run brands</code>, then reload.</p>`);
});
onBrandsChanged(() => {
  renderMasthead();
  render();
});
