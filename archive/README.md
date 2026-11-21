# Archived identities

Seed Packet Allotment and Webring Badge Club were dropped (judged too gimmicky) on 2026-11-21.
Letterpress Stationery was archived on 2026-11-21 when the Modular identity was chosen and this repo became the WompLand branding toolkit (`brands/*.json`, `src/brand/`, `scripts/build-brands.mjs`).

Their files are kept here for reference only. They are outside the build: `scripts/build-themes.mjs`, `scripts/build-logos.mjs` and `vite.config.js` no longer see them, and their relative imports will not resolve from here.
To restore one, move each file back to the same relative path at the project root (`surfaces/` goes back to `.impeccable/surfaces/`).

The Modular identity sheet (`identities/modular.html`, `src/modular.css`, `logos/modular/build.mjs` and its outputs, the `src/tokens/modular.mjs` theme shim, `scripts/build-logos.mjs` and `scripts/lib/text-path.mjs`) was retired on 2026-11-21. Its brand-system content now lives in the toolkit's system guide (`toolkit/system.html`), which draws every logo at runtime from `brands/*.json`. Only its Impeccable surface note is kept, in `modular-sheet/identities-modular-html.md`. The code itself was deleted, not archived.
