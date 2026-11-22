// Home: the brand family and the New Womp form (dev only).
import { newSubBrand, SUB_NAME } from '../brand/index.js';
import { DEV, palette, esc, font, lockup, loadAllBrands, renderMasthead, reapplyMode, onBrandsChanged, gateDevOnly } from './site.js';

const $ = (id) => document.getElementById(id);
const toneLabel = (g) => (g === 'pale' ? 'Pale glyph' : 'Deep glyph');
let brands = [];

const guideURL = (b) => `/toolkit/brand.html?brand=${b.slug}`;

function actions(b) {
  const edit = DEV ? `<a class="btn btn-primary" href="/toolkit/edit.html?brand=${b.slug}">Edit<span class="sr-only"> ${esc(b.name)}</span></a>` : '';
  return `<div class="actions">${edit}<a class="btn btn-outline" href="${guideURL(b)}">Brand guide<span class="sr-only"> for ${esc(b.name)}</span></a></div>`;
}

function meta(b) {
  return `<p class="meta small"><span class="dot" style="background:${b.colors.field}" aria-hidden="true"></span>${esc(b.colors.name)} field<span aria-hidden="true"> · </span><span class="sr-only">, </span>${toneLabel(b.glyph)}</p>`;
}

async function renderBrands() {
  const [all, f] = await Promise.all([loadAllBrands(), font()]);
  brands = all;
  const master = all.find((b) => b.role === 'master');
  const subs = all.filter((b) => b.role !== 'master');

  $('master').innerHTML = master
    ? `<article class="master-card subgrid" aria-labelledby="m-${master.slug}">
        <div class="master-art">${lockup(master, f, { unit: 12, label: `${master.name} logo` })}</div>
        <div class="master-info">
          <h3 id="m-${master.slug}">${esc(master.name)} <span class="role">Master brand</span></h3>
          ${meta(master)}
          ${actions(master)}
        </div>
      </article>`
    : '<p>No master brand found. Run <code>npm run brands</code> and check <code>brands/</code>.</p>';

  $('subs').innerHTML = subs.length
    ? subs
        .map(
          (b) => `<li class="sub subgrid">
            <div class="sub-art">${lockup(b, f, { unit: 6, label: `${b.name} logo` })}</div>
            <div class="sub-info"><h4 id="s-${b.slug}" class="sr-only">${esc(b.name)}</h4>${meta(b)}${actions(b)}</div>
          </li>`,
        )
        .join('')
    : `<li class="empty small muted">No Womps yet.${DEV ? ' Create the first one below.' : ''}</li>`;
  $('master').removeAttribute('aria-busy');
  $('subs').removeAttribute('aria-busy');
  updatePreview();
  reapplyMode();
}

// ---------- New Womp ----------
const form = $('new-womp');
const input = $('job');
const err = $('job-error');

function jobProblem(job) {
  if (!job) return 'Type a job word, for example list.';
  if (!/^[a-z]+$/.test(job)) return 'Use lowercase letters a to z only, with no spaces or digits.';
  const name = `${job}Womp`;
  if (!SUB_NAME.test(name)) return 'Use lowercase letters a to z only.';
  if (brands.some((b) => b.slug === name.toLowerCase())) return `${name} already exists. Pick another job word, or edit ${name} from the list above.`;
  return '';
}

async function updatePreview() {
  if (!DEV) return;
  const job = input.value.trim() || 'list';
  const name = `${/^[a-z]+$/.test(job) ? job : 'list'}Womp`;
  const draft = newSubBrand(name, palette, brands);
  const f = await font();
  $('new-preview').innerHTML = lockup(draft, f, { unit: 6, label: `${name} logo preview with an empty glyph` });
}

if (DEV) {
  // The intro link scrolls to the form and puts the cursor in the job word field.
  $('jump-new').addEventListener('click', (e) => {
    e.preventDefault();
    form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    input.focus({ preventScroll: true });
    history.replaceState(null, '', '#new-womp');
  });
  input.addEventListener('input', () => {
    if (err.textContent) err.textContent = jobProblem(input.value.trim());
    input.setAttribute('aria-invalid', String(Boolean(err.textContent)));
    updatePreview();
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const job = input.value.trim();
    const problem = jobProblem(job);
    err.textContent = problem;
    input.setAttribute('aria-invalid', String(Boolean(problem)));
    if (problem) return input.focus();
    const btn = $('create-btn');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.textContent = 'Creating…';
    try {
      const res = await fetch('/__brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${job}Womp` }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error((body.errors ?? [`The server answered ${res.status}.`]).join(' '));
      location.href = `/toolkit/edit.html?brand=${body.brand.slug}`;
    } catch (x) {
      err.textContent = `Could not create ${job}Womp: ${x.message} Check that npm run dev is running, then try again.`;
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.textContent = 'Create and open in editor';
    }
  });
}

gateDevOnly();
renderMasthead();
renderBrands().catch((e) => {
  $('master').innerHTML = `<p role="alert">Could not load the brands (${esc(e.message)}). Run <code>npm run brands</code>, then reload.</p>`;
});
onBrandsChanged(() => {
  renderMasthead();
  renderBrands();
});
