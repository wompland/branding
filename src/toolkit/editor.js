// WompLand glyph editor: one brand at a time, edited as a draft and saved through the dev API.
import '../shared/mode.js';
import { SIZE_RANGE, FIELD_SIZE, tileSVG, validateBrand, normalizeBrand } from '../brand/index.js';
import { loadAll, saveBrand, createBrand, deleteBrand, sourceOf } from './editor/api.js';
import { drawCanvas, pointerToField, inField } from './editor/canvas.js';
import { buildInspector, updateInspector } from './editor/inspector.js';
import { TOOL_ICONS, rotIcon } from './editor/icons.js';
import { ask } from './editor/dialog.js';
import {
  makeShape,
  fitProblem,
  sameShape,
  topmostAt,
  topmostAtModule,
  moved,
  resized,
  describe,
  sizeOf,
  clamp,
  cap,
  TYPE_LABEL,
  ROT_LABEL,
} from './editor/shapes.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const JOB = /^[a-z]+$/;

const TOOLS = [
  { id: 'cell', label: 'Cell', key: 'C' },
  { id: 'ring', label: 'Ring', key: 'G' },
  { id: 'pie', label: 'Quarter', key: 'Q' },
  { id: 'select', label: 'Select', key: 'V' },
  { id: 'erase', label: 'Erase', key: 'E' },
];
const KEY_TOOL = Object.fromEntries(TOOLS.map((t) => [t.key.toLowerCase(), t.id]));
const DRAW = new Set(['cell', 'ring', 'pie']);

const S = {
  live: false,
  palette: [],
  brands: [], // saved sources, master first
  saved: null, // the open brand as it is on disk
  draft: null, // the open brand as edited
  past: [],
  future: [],
  tool: 'cell',
  sizes: { ring: 2, pie: 2 },
  rot: 0,
  cursor: { x: 3, y: 3 },
  pointer: null, // { fx, fy } while the pointer is over the field
  focused: false,
  sel: -1,
  showGrid: true,
  busy: false,
  drag: null,
  armed: null, // touch: the module a first tap previewed
  gate: null,
};

// ---------- state helpers ----------

const snap = () => structuredClone({ color: S.draft.color, glyph: S.draft.glyph, shapes: S.draft.shapes });
const restore = (s) => Object.assign(S.draft, structuredClone(s));
const sameSnap = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const canonical = (b) => JSON.stringify(normalizeBrand(b));
const isDirty = () => !!S.draft && canonical(S.draft) !== canonical(S.saved);
const selected = () => (S.sel >= 0 ? S.draft.shapes[S.sel] : null);

/** Apply `fn` to the draft as one undoable step. Returns false when nothing changed. */
function edit(fn, message) {
  if (!S.live) return false;
  const before = snap();
  fn(S.draft);
  if (sameSnap(before, snap())) return false;
  S.past.push(before);
  S.future = [];
  if (message) announce(message);
  render();
  return true;
}

function undo() {
  if (!S.past.length) return;
  S.future.push(snap());
  restore(S.past.pop());
  if (S.sel >= S.draft.shapes.length) S.sel = -1;
  announce('Undone');
  render();
}

function redo() {
  if (!S.future.length) return;
  S.past.push(snap());
  restore(S.future.pop());
  if (S.sel >= S.draft.shapes.length) S.sel = -1;
  announce('Redone');
  render();
}

let liveTimer;
function announce(msg) {
  const el = $('live');
  el.textContent = '';
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => (el.textContent = msg), 30);
}

// ---------- tool state ----------

/** The type the size / rotation controls currently describe. */
function activeType() {
  if (S.tool === 'select') return selected()?.type ?? null;
  return DRAW.has(S.tool) ? S.tool : null;
}
const currentSize = () => (S.tool === 'select' ? (selected() ? sizeOf(selected()) : null) : S.tool === 'cell' ? 1 : S.sizes[S.tool]);
const currentRot = () => (S.tool === 'select' && selected() && selected().type !== 'cell' ? selected().rot : S.rot);

function setTool(id) {
  S.tool = id;
  S.armed = null;
  if (id !== 'select') S.sel = -1;
  announce(`${TOOLS.find((t) => t.id === id).label} tool`);
  render();
}

function setSize(n) {
  const s = selected();
  if (S.tool === 'select') {
    if (!s || s.type === 'cell') return;
    edit((d) => (d.shapes[S.sel] = resized(s, n)), `Size ${clamp(n, ...SIZE_RANGE[s.type])}`);
    return;
  }
  if (!DRAW.has(S.tool) || S.tool === 'cell') return;
  const [lo, hi] = SIZE_RANGE[S.tool];
  if (n < lo || n > hi) return announce(`${cap(TYPE_LABEL[S.tool])} sizes run ${lo} to ${hi}`);
  S.sizes[S.tool] = n;
  announce(`Size ${n}`);
  render();
}

function setRot(r) {
  const s = selected();
  if (S.tool === 'select' && s && s.type !== 'cell') {
    edit((d) => (d.shapes[S.sel] = { ...s, rot: r }), `Rotation ${ROT_LABEL[r]}`);
    return;
  }
  S.rot = r;
  announce(`Rotation ${ROT_LABEL[r]}`);
  render();
}

const rotate = (dir) => setRot((currentRot() + dir + 4) % 4);

// ---------- canvas actions ----------

function ghostShape() {
  if (!DRAW.has(S.tool)) return null;
  return makeShape(S.tool, S.cursor.x, S.cursor.y, currentSize(), S.rot);
}

function place() {
  const s = ghostShape();
  const problem = fitProblem(s);
  if (problem) return announce(`Can't place: ${problem}`);
  if (S.draft.shapes.some((t) => sameShape(t, s))) return announce(`That ${TYPE_LABEL[s.type]} is already there`);
  edit((d) => d.shapes.push(s), `Placed ${describe(s)}`);
}

function selectAt(index) {
  S.sel = index;
  announce(index >= 0 ? `Selected ${describe(S.draft.shapes[index])}` : 'Nothing selected');
  render();
}

function eraseAt(index) {
  if (index < 0) return announce('Nothing to erase here');
  const s = S.draft.shapes[index];
  edit((d) => d.shapes.splice(index, 1), `Removed ${describe(s)}`);
}

function removeSelected() {
  const s = selected();
  if (!s) return;
  const i = S.sel;
  S.sel = -1;
  edit((d) => d.shapes.splice(i, 1), `Removed ${describe(s)}`);
}

function moveSelected(dx, dy) {
  const s = selected();
  const m = moved(s, dx, dy);
  if (m.x === s.x && m.y === s.y) return announce(`${cap(TYPE_LABEL[s.type])} is at the edge of the field`);
  S.cursor = { x: m.x, y: m.y };
  edit((d) => (d.shapes[S.sel] = m), `Moved to ${m.x}, ${m.y}`);
}

function activate() {
  if (!S.live) return;
  const { x, y } = S.cursor;
  if (DRAW.has(S.tool)) place();
  else if (S.tool === 'select') selectAt(topmostAtModule(S.draft.shapes, x, y));
  else eraseAt(topmostAtModule(S.draft.shapes, x, y));
}

async function clearGlyph() {
  if (!S.draft.shapes.length) return announce('The glyph is already empty');
  const n = S.draft.shapes.length;
  const { value } = await ask({
    title: 'Clear the glyph?',
    body: `This removes all ${n} shapes from ${S.draft.name}. You can undo it until you leave the page.`,
    actions: [
      { value: 'cancel', label: 'Cancel' },
      { value: 'clear', label: 'Clear glyph', kind: 'danger' },
    ],
  });
  if (value !== 'clear') return;
  S.sel = -1;
  edit((d) => (d.shapes = []), 'Glyph cleared');
}

// ---------- rendering ----------

let frame = 0;
function render() {
  if (!frame) frame = requestAnimationFrame(paint);
}

function paint() {
  frame = 0;
  if (!S.draft) return;
  const d = S.draft;
  const dirty = isDirty();

  // Header
  $('brand-title').textContent = d.name;
  document.title = `${d.name} · Glyph editor · WompLand toolkit`;
  $('dirty').hidden = !dirty;
  $('guide-link').href = `/toolkit/brand.html?brand=${d.slug}`;
  $('delete').hidden = d.role !== 'sub' || !S.live;
  $('delete').disabled = S.busy;
  $('revert').disabled = !dirty || S.busy || !S.live;

  // Tools
  for (const input of document.querySelectorAll('#tools input')) {
    input.checked = input.value === S.tool;
    input.disabled = !S.live;
  }
  const type = activeType();
  const size = currentSize();
  for (const input of document.querySelectorAll('#sizes input')) {
    const n = Number(input.value);
    const [lo, hi] = type ? SIZE_RANGE[type] : [0, -1];
    input.disabled = !S.live || !type || type === 'cell' || n < lo || n > hi;
    input.checked = size === n;
  }
  const rotOn = S.live && type && type !== 'cell';
  const rot = currentRot();
  document.querySelectorAll('#rots label').forEach((label, r) => {
    const input = label.querySelector('input');
    input.disabled = !rotOn;
    input.checked = rot === r;
    label.querySelector('.ico').innerHTML = rotIcon(type ?? S.tool, r);
  });
  $('size-group').classList.toggle('is-off', !type || type === 'cell');
  $('rot-group').classList.toggle('is-off', !rotOn);
  $('undo').disabled = !S.past.length;
  $('redo').disabled = !S.future.length;
  $('clear').disabled = !S.live || !d.shapes.length;
  $('place').disabled = !S.live || !DRAW.has(S.tool);

  // Canvas
  const over = S.pointer ? true : S.focused;
  const ghost = S.live && over && DRAW.has(S.tool) ? ghostShape() : null;
  const problem = ghost && fitProblem(ghost);
  let target = null;
  if (S.live && over && (S.tool === 'select' || S.tool === 'erase') && !S.drag) {
    const i = S.pointer ? topmostAt(d.shapes, S.pointer.fx, S.pointer.fy) : topmostAtModule(d.shapes, S.cursor.x, S.cursor.y);
    if (i >= 0) target = { index: i, kind: S.tool };
  }
  drawCanvas($('canvas'), { brand: d, palette: S.palette, showGrid: S.showGrid, sel: S.sel, ghost: ghost && { shape: ghost, invalid: !!problem }, target, cursor: S.cursor });
  $('canvas').classList.toggle('is-pointer', !!S.pointer);

  $('ro-pos').textContent = over ? `x ${S.cursor.x}  y ${S.cursor.y}` : 'x –  y –';
  const status = $('ro-status');
  status.classList.toggle('bad', !!problem);
  if (!S.live) status.textContent = 'Read-only';
  else if (problem) status.textContent = problem;
  else if (DRAW.has(S.tool)) status.textContent = cap(describe(ghostShape()).replace(/,? at .*/, ''));
  else if (S.tool === 'select') status.textContent = selected() ? `Selected: ${describe(selected())}` : 'Click a shape, or press Enter on it, to select it';
  else status.textContent = 'Click a shape, or press Enter on it, to remove it';

  // Inspector
  $('brand-name').textContent = d.name;
  $('role-line').textContent = d.role === 'master' ? 'Master brand. The name is always WompLand.' : 'Sub-brand: a job word followed by Womp.';
  $('rename').hidden = d.role !== 'sub' || !S.live;
  S.gate = updateInspector({ brand: d, palette: S.palette, brands: S.brands, live: S.live });

  // Save state
  const v = validateBrand(sourceOf(d), S.palette);
  const blocker = !v.ok
    ? `Save is off: ${v.errors[0]}`
    : S.gate.failures.length
      ? `Save is off: ${S.gate.failures[0].check.label} in the ${S.gate.failures[0].mode} theme is ${S.gate.failures[0].check.ratio}:1 and needs ${S.gate.failures[0].check.min}:1. Pick another color.`
      : '';
  const save = $('save');
  save.disabled = !S.live || !dirty || S.busy || !!blocker;
  save.textContent = S.busy === 'save' ? 'Saving…' : 'Save';
  save.title = blocker;
  const gateNote = $('gate-note');
  gateNote.hidden = !blocker;
  gateNote.textContent = blocker;

  renderRail();
}

function renderRail() {
  const list = $('brand-list');
  const items = S.brands.map((b) => (b.slug === S.draft.slug ? S.draft : b));
  list.innerHTML = items
    .map((b) => {
      const current = b.slug === S.draft.slug;
      const dirty = current && isDirty();
      const svg = tileSVG(b, S.palette, { size: 40 });
      return `<li><a class="brand-item" href="?brand=${b.slug}" data-slug="${b.slug}"${current ? ' aria-current="page"' : ''}>
        <img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="40" height="40" alt="">
        <span class="bi-text"><span class="bi-name">${esc(b.name)}</span><span class="bi-role">${b.role === 'master' ? 'Master' : 'Sub-brand'}${dirty ? ' · unsaved' : ''}</span></span>
      </a></li>`;
    })
    .join('');
}

// ---------- brand loading and switching ----------

function open(slug, { push = true } = {}) {
  const b = S.brands.find((x) => x.slug === slug) ?? S.brands[0];
  S.saved = structuredClone(b);
  S.draft = structuredClone(b);
  S.past = [];
  S.future = [];
  S.sel = -1;
  $('disk-note').hidden = true;
  $('save-errors').hidden = true;
  const url = new URL(location.href);
  url.searchParams.set('brand', b.slug);
  if (push && url.href !== location.href) history.pushState({ slug: b.slug }, '', url);
  else history.replaceState({ slug: b.slug }, '', url);
  render();
}

/** Resolve unsaved changes before leaving the open brand. Returns true to continue. */
async function settle(nextLabel) {
  if (!isDirty()) return true;
  const { value } = await ask({
    title: `Save changes to ${S.draft.name}?`,
    body: `${S.draft.name} has unsaved changes. Save them before ${nextLabel}, or discard them.`,
    actions: [
      { value: 'cancel', label: 'Cancel' },
      { value: 'discard', label: 'Discard changes' },
      { value: 'save', label: 'Save', kind: 'primary' },
    ],
  });
  if (value === 'save') return save();
  return value === 'discard';
}

async function switchTo(slug) {
  if (slug === S.draft.slug) return;
  const b = S.brands.find((x) => x.slug === slug);
  if (!(await settle(`opening ${b?.name ?? slug}`))) return;
  open(slug);
}

async function refreshBrands() {
  const data = await loadAll();
  S.brands = data.brands;
  return data;
}

// ---------- save / revert / create / rename / delete ----------

function showErrors(errors, lead) {
  const box = $('save-errors');
  box.innerHTML = `<p><strong>${esc(lead)}</strong></p><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`;
  box.hidden = false;
}

async function save() {
  if (!S.live || S.busy) return false;
  if (!isDirty()) return true;
  S.busy = 'save';
  render();
  const res = await saveBrand(S.draft);
  S.busy = false;
  if (!res.ok) {
    showErrors(res.errors ?? ['Unknown error'], `${S.draft.name} was not saved.`);
    announce(`Save failed: ${(res.errors ?? [])[0] ?? ''}`);
    render();
    return false;
  }
  $('save-errors').hidden = true;
  const saved = sourceOf(res.brand);
  S.saved = structuredClone(saved);
  // Keep the shape order the user built (z-order for selection); the file holds the canonical order.
  S.brands = S.brands.map((b) => (b.slug === saved.slug ? saved : b));
  bustHeader();
  announce(`Saved ${saved.name}. Files regenerated.`);
  render();
  return true;
}

function revert() {
  if (!isDirty()) return;
  S.sel = -1;
  edit((d) => {
    d.color = S.saved.color;
    d.glyph = S.saved.glyph;
    d.shapes = structuredClone(S.saved.shapes);
  }, `Reverted ${S.draft.name} to the saved version`);
}

function bustHeader() {
  const v = Date.now();
  for (const img of document.querySelectorAll('.home img')) img.src = img.src.replace(/\?.*$/, '') + `?v=${v}`;
}

function jobProblem(job) {
  if (!job) return 'Type a job word, for example list.';
  if (!JOB.test(job)) return 'Use lowercase letters a to z only, with no spaces, digits or capitals.';
  if (S.brands.some((b) => b.slug === `${job}womp`)) return `${job}Womp already exists. Pick another job word.`;
  return null;
}

async function create(e) {
  e.preventDefault();
  const input = $('job');
  const job = input.value.trim();
  const problem = jobProblem(job);
  const err = $('job-error');
  if (problem) {
    err.textContent = problem;
    err.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  if (!(await settle(`creating ${job}Womp`))) return;
  S.busy = 'create';
  $('create').disabled = true;
  const res = await createBrand(`${job}Womp`);
  S.busy = false;
  $('create').disabled = false;
  if (!res.ok) {
    err.textContent = res.errors.join(' ');
    err.hidden = false;
    return;
  }
  input.value = '';
  updateJobPreview();
  await refreshBrands();
  open(res.brand.slug);
  announce(`Created ${res.brand.name}`);
}

function updateJobPreview() {
  const job = $('job').value.trim();
  $('job-preview').textContent = `${job || 'list'}Womp`;
  $('job-error').hidden = true;
  $('job').removeAttribute('aria-invalid');
}

async function rename() {
  const old = S.draft;
  const dirty = isDirty();
  const { value, text } = await ask({
    title: `Rename ${old.name}`,
    body: [
      `The new name gets a new file and new generated assets, and ${old.name}'s files are removed. Links to /brands/${old.slug}/ will stop working.`,
      ...(dirty ? ['Your unsaved changes are saved under the new name.'] : []),
    ],
    input: { initial: old.slug.replace(/womp$/, ''), validate: (j) => (j === old.slug.replace(/womp$/, '') ? 'That is the current name. Type a different job word.' : jobProblem(j)) },
    actions: [
      { value: 'cancel', label: 'Cancel' },
      { value: 'rename', label: 'Rename', kind: 'primary' },
    ],
  });
  if (value !== 'rename') return;
  const name = `${text}Womp`;
  S.busy = 'rename';
  render();
  const fail = (errors, lead) => {
    S.busy = false;
    showErrors(errors, lead);
    render();
  };
  const made = await createBrand(name);
  if (!made.ok) return fail(made.errors, `Could not create ${name}.`);
  const next = { ...sourceOf(S.draft), slug: made.brand.slug, name: made.brand.name };
  const put = await saveBrand(next);
  if (!put.ok) {
    await deleteBrand(made.brand.slug);
    return fail(put.errors, `Could not copy ${old.name} into ${name}. Nothing changed.`);
  }
  const gone = await deleteBrand(old.slug);
  S.busy = false;
  await refreshBrands();
  open(made.brand.slug, { push: false });
  if (!gone.ok) showErrors(gone.errors, `${name} was created, but ${old.name} could not be removed. Delete it from the rail.`);
  announce(`Renamed ${old.name} to ${name}`);
}

async function remove() {
  const b = S.draft;
  const { value } = await ask({
    title: `Delete ${b.name}?`,
    body: `This deletes brands/${b.slug}.json and everything in public/brands/${b.slug}/. It can't be undone from the editor.`,
    actions: [
      { value: 'cancel', label: 'Cancel' },
      { value: 'delete', label: `Delete ${b.name}`, kind: 'danger' },
    ],
  });
  if (value !== 'delete') return;
  S.busy = 'delete';
  render();
  const res = await deleteBrand(b.slug);
  S.busy = false;
  if (!res.ok) {
    showErrors(res.errors, `${b.name} was not deleted.`);
    return render();
  }
  await refreshBrands();
  S.saved = S.draft; // nothing left to protect
  open('wompland');
  announce(`Deleted ${b.name}`);
}

// ---------- external changes (HMR) ----------

async function onExternal({ action, slug }) {
  if (S.busy) return; // our own write; save() / create() / rename() refresh themselves
  const before = S.brands.find((b) => b.slug === S.draft.slug);
  await refreshBrands();
  const now = S.brands.find((b) => b.slug === S.draft.slug);
  const note = $('disk-note');
  if (!now) {
    if (!isDirty()) {
      open('wompland', { push: false });
      note.textContent = `${before?.name ?? slug} was deleted elsewhere, so the editor opened WompLand.`;
    } else note.textContent = `${S.draft.name} was deleted elsewhere. Your unsaved changes are still here; save to restore it.`;
    note.hidden = false;
    return render();
  }
  if (slug === S.draft.slug && canonical(now) !== canonical(S.saved)) {
    if (!isDirty()) {
      open(slug, { push: false });
      announce(`${now.name} changed on disk and was reloaded`);
    } else {
      S.saved = structuredClone(now);
      note.innerHTML = `${esc(now.name)} changed on disk while you were editing. Saving will overwrite that version. <button class="b b-sm" type="button" id="load-disk">Load the disk version</button>`;
      note.hidden = false;
      $('load-disk').onclick = () => open(slug, { push: false });
    }
  }
  render();
  void action;
}

// ---------- building the controls ----------

function buildControls() {
  $('tools').innerHTML = TOOLS.map(
    (t) => `<label class="seg-btn tool" title="${t.label} (${t.key})">
      <input type="radio" name="tool" value="${t.id}" aria-label="${t.label}" aria-keyshortcuts="${t.key}">
      <span class="ico">${TOOL_ICONS[t.id]}</span><span class="seg-text">${t.label}</span><kbd>${t.key}</kbd>
    </label>`,
  ).join('');
  $('sizes').innerHTML = [1, 2, 3, 4]
    .map((n) => `<label class="seg-btn size"><input type="radio" name="size" value="${n}" aria-keyshortcuts="${n}"><span class="num">${n}</span></label>`)
    .join('');
  $('rots').innerHTML = ROT_LABEL.map(
    (l, r) => `<label class="seg-btn rot" title="${cap(l)}"><input type="radio" name="rot" value="${r}" aria-label="${cap(l)}"><span class="ico"></span></label>`,
  ).join('');

  $('tools').addEventListener('change', (e) => setTool(e.target.value));
  $('sizes').addEventListener('change', (e) => setSize(Number(e.target.value)));
  $('rots').addEventListener('change', (e) => setRot(Number(e.target.value)));
  $('undo').onclick = undo;
  $('redo').onclick = redo;
  $('clear').onclick = clearGlyph;
  $('show-grid').onchange = (e) => {
    S.showGrid = e.target.checked;
    render();
  };
  $('save').onclick = () => save();
  $('revert').onclick = () => {
    if ($('more-menu').matches(':popover-open')) $('more-menu').hidePopover();
    revert();
  };
  $('delete').onclick = remove;
  $('rename').onclick = rename;
  $('new-womp').addEventListener('submit', create);
  $('job').addEventListener('input', updateJobPreview);

  $('brand-list').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-slug]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    switchTo(a.dataset.slug);
  });
  addEventListener('popstate', async () => {
    const slug = new URL(location.href).searchParams.get('brand') || 'wompland';
    if (slug === S.draft.slug) return;
    if (await settle(`leaving`)) open(slug, { push: false });
    else history.pushState({ slug: S.draft.slug }, '', `?brand=${S.draft.slug}`);
  });
  addEventListener('beforeunload', (e) => {
    if (isDirty()) e.preventDefault();
  });

  buildInspector(S.palette, {
    onColor: (id) => edit((d) => (d.color = id), `Color ${S.palette.find((p) => p.id === id).name}`),
    onTone: (t) => edit((d) => (d.glyph = t), `Glyph tone ${t}`),
  });

  wireCanvas();
  wireKeys();
}

const coarse = matchMedia('(pointer: coarse)');

function wireCanvas() {
  const svg = $('canvas');
  $('place').onclick = () => {
    S.armed = null;
    place();
  };
  const toModule = (fx, fy) => ({ x: clamp(Math.floor(fx), 0, FIELD_SIZE - 1), y: clamp(Math.floor(fy), 0, FIELD_SIZE - 1) });

  svg.addEventListener('pointermove', (e) => {
    const { fx, fy } = pointerToField(svg, e);
    if (S.drag) {
      const m = toModule(fx, fy);
      const nx = moved(S.drag.orig, m.x - S.drag.start.x, m.y - S.drag.start.y);
      S.draft.shapes[S.drag.index] = nx;
      S.cursor = { x: nx.x, y: nx.y };
      S.pointer = { fx, fy };
      return render();
    }
    if (!inField(fx, fy)) {
      if (S.pointer) {
        S.pointer = null;
        render();
      }
      return;
    }
    const m = toModule(fx, fy);
    S.pointer = { fx, fy };
    if (m.x !== S.cursor.x || m.y !== S.cursor.y || S.tool === 'select' || S.tool === 'erase') {
      S.cursor = m;
      render();
    }
  });
  svg.addEventListener('pointerleave', (e) => {
    if (S.drag || e.pointerType === 'touch') return;
    S.pointer = null;
    render();
  });
  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !S.live) return;
    const { fx, fy } = pointerToField(svg, e);
    if (!inField(fx, fy)) return;
    e.preventDefault();
    svg.focus({ preventScroll: true });
    const m = toModule(fx, fy);
    if (DRAW.has(S.tool) && (e.pointerType === 'touch' || coarse.matches)) {
      // Touch: the first tap shows the ghost; a second tap on the same module (or Place) commits.
      const armed = S.armed && S.armed.x === m.x && S.armed.y === m.y;
      S.cursor = m;
      S.pointer = { fx, fy };
      if (armed) {
        S.armed = null;
        return place();
      }
      S.armed = m;
      const g = ghostShape();
      announce(`${cap(describe(g))}. ${fitProblem(g) ?? 'Tap again or press Place to place it.'}`);
      return render();
    }
    S.cursor = m;
    if (DRAW.has(S.tool)) return place();
    const i = topmostAt(S.draft.shapes, fx, fy);
    if (S.tool === 'erase') return eraseAt(i);
    selectAt(i);
    if (i >= 0) {
      S.drag = { index: i, orig: S.draft.shapes[i], start: S.cursor, before: snap() };
      svg.setPointerCapture(e.pointerId);
    }
  });
  const endDrag = () => {
    if (!S.drag) return;
    const { before } = S.drag;
    S.drag = null;
    if (!sameSnap(before, snap())) {
      S.past.push(before);
      S.future = [];
      const s = selected();
      announce(`Moved to ${s.x}, ${s.y}`);
    }
    render();
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('focus', () => {
    S.focused = true;
    render();
  });
  svg.addEventListener('blur', () => {
    S.focused = false;
    render();
  });

  svg.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (arrows[e.key]) {
      e.preventDefault();
      const [dx, dy] = arrows[e.key];
      S.pointer = null;
      if (S.tool === 'select' && selected() && S.live) return moveSelected(dx, dy);
      const x = clamp(S.cursor.x + dx, 0, FIELD_SIZE - 1);
      const y = clamp(S.cursor.y + dy, 0, FIELD_SIZE - 1);
      S.cursor = { x, y };
      const here = topmostAtModule(S.draft.shapes, x, y);
      announce(`${x}, ${y}${here >= 0 ? `, ${TYPE_LABEL[S.draft.shapes[here].type]}` : ''}`);
      return render();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      return activate();
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && S.live) {
      e.preventDefault();
      return removeSelected();
    }
  });
}

const typing = (el) => el && (el.matches?.('input[type="text"], textarea, [contenteditable]') || el.closest?.('dialog[open]'));

function wireKeys() {
  document.addEventListener('keydown', (e) => {
    if ($('dlg').open) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        save();
        return;
      }
      if (typing(e.target)) return;
      if (k === 'z') {
        e.preventDefault();
        return e.shiftKey ? redo() : undo();
      }
      if (k === 'y') {
        e.preventDefault();
        return redo();
      }
      return;
    }
    if (e.altKey || typing(e.target)) return;
    if (e.key === 'Escape' && S.sel >= 0) {
      S.sel = -1;
      announce('Deselected');
      return render();
    }
    // Single-key shortcuts (WCAG 2.1.4) only while focus is on the canvas or its tool controls.
    if (!S.live || !e.target.closest?.('#canvas, .tools')) return;
    const k = e.key.toLowerCase();
    if (KEY_TOOL[k] && !e.shiftKey) {
      e.preventDefault();
      return setTool(KEY_TOOL[k]);
    }
    if (k === 'r') {
      e.preventDefault();
      if (!activeType() || activeType() === 'cell') return announce('Cells have no rotation');
      return rotate(e.shiftKey ? -1 : 1);
    }
    if (/^[1-4]$/.test(e.key)) {
      e.preventDefault();
      return setSize(Number(e.key));
    }
  });
}

// ---------- boot ----------

async function boot() {
  const data = await loadAll();
  S.live = data.live;
  S.palette = data.palette;
  S.brands = data.brands;
  document.body.classList.toggle('is-readonly', !S.live);
  $('readonly-note').hidden = S.live;
  for (const el of document.querySelectorAll('#new-womp input, #new-womp button')) el.disabled = !S.live;
  buildControls();
  const slug = new URL(location.href).searchParams.get('brand') || 'wompland';
  open(S.brands.some((b) => b.slug === slug) ? slug : 'wompland', { push: false });
  if (import.meta.hot) import.meta.hot.on('wompland:brands', onExternal);
}

boot().catch((e) => {
  $('brand-title').textContent = 'Could not load brands';
  showErrors([e.message], 'The editor could not load the brand files.');
});
