// Light/dark switching for identity pages.
// <html data-identity="wompland" data-default-mode="light"> on every toolkit page.
// Any element with data-brand="<brand slug>" gets data-theme="wompland-<slug>-<mode>"; <html> gets the body brand's theme too.
// data-mode="light|dark" on an element pins it (used for side-by-side swatches).
// ?mode=light|dark in the URL forces a mode (review captures).
// Buttons with [data-mode-toggle] flip the page mode; aria-pressed reflects dark.
const KEY = 'wompland-mode';
// ?still in the URL renders every animation at its final frame (review captures).
if (new URLSearchParams(location.search).has('still')) {
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}';
  document.head.append(st);
}
const html = document.documentElement;
const identity = html.dataset.identity;

function preferred() {
  const forced = new URLSearchParams(location.search).get('mode');
  if (forced === 'light' || forced === 'dark') return forced;
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return html.dataset.defaultMode || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

export function apply(mode) {
  html.dataset.pageMode = mode;
  // The root carries the page theme too, so the canvas past the page end (overscroll, short pages) matches the mode.
  const rootBrand = document.body?.dataset.brand || html.dataset.brand || identity;
  html.dataset.theme = `${identity}-${rootBrand}-${mode}`;
  for (const el of document.querySelectorAll('[data-brand]')) {
    const m = el.dataset.mode || mode;
    el.dataset.theme = `${identity}-${el.dataset.brand}-${m}`;
  }
  for (const btn of document.querySelectorAll('[data-mode-toggle]')) {
    btn.setAttribute('aria-pressed', String(mode === 'dark'));
  }
}

apply(preferred());

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-mode-toggle]');
  if (!btn) return;
  const next = html.dataset.pageMode === 'dark' ? 'light' : 'dark';
  localStorage.setItem(KEY, next);
  apply(next);
});
