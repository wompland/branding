# WompLand branding toolkit

This repo is the source of truth for the WompLand brand family and the local tool that edits it.

- **Applying a brand in another project?** Read `BRANDING.md`. That is the guide for consumers; the rest of this file is about working on the toolkit itself.
- **Product context:** `PRODUCT.md` (who it's for, positioning, tone).
- **Design system:** `DESIGN.md` (Modular identity: module kit, palette rules, lockup spec, the construction grid, don'ts). Long; read the section you need.

## Commands

- `npm run dev`: regenerates brands and themes, then serves the toolkit at http://localhost:5173/ (home, editor at `/toolkit/edit.html?brand=<slug>`, brand guides at `/toolkit/brand.html?brand=<slug>`, system guide at `/toolkit/system.html`).
- `npm run build`: same generation, then a static, read-only `dist/`.
- `npm run brands`: regenerate `public/brands/` from `brands/*.json`, then the markdown pages and `llms.txt` (`scripts/build-llms.mjs`; absolute links use `SITE_URL`, default https://brand.wompland.com).
- `npm run themes`: rebuild `src/themes/wompland.css` and run the contrast gate (fails the build on any miss).
- `npm run palette`: print the palette with its ratios and fail on any gate miss.

## Deploying the public brand guide

`npm run build` produces the read-only guide: no editor page (`toolkit/edit.html` is left out of the build), no save API, and no markup between `<!-- dev-only -->` and `<!-- /dev-only -->` (the New Womp form and editing copy; stripped in `vite.config.js`). Wrap any new editing-only markup in those markers.

`Dockerfile` builds it and serves `dist/` with nginx (`deploy/nginx.conf`). `compose.yaml` maps host port `PORT` from `.env` (copy `.env.example`) to the container and passes `SITE_URL` to the build; Caddy proxies to it. Redeploy after brand changes: commit, pull in the stack, rebuild.

## How it fits together

- `brands/<slug>.json` is the only hand-edited brand data: `{ slug, name, role, color, glyph, shapes }`, nothing else. Exactly one `role: "master"` (`wompland`). Sub-brand names are `<job>Womp`, slug lowercase.
- `brands/palette.json` is generated: edit `SPEC` in `scripts/palette.mjs`, then run `node scripts/palette.mjs --write`.
- `src/brand/` is the isomorphic core (schema, palette gates, geometry, text outlining, lockups, theme tokens). The browser pages and the Node generator import the same code; keep it free of Node APIs.
- `scripts/build-brands.mjs` writes `public/brands/<slug>/` (SVG, PNG, ICO, `daisyui-theme.css`, `brand.json`) and `public/brands/index.json`. Generated: never edit by hand.
- `scripts/build-llms.mjs` writes the plain-text site for readers without JavaScript: `public/llms.txt`, `llms-full.txt`, `index.md`, `usage.md`, `toolkit/system.md` and `brands/<slug>/guide.md`, each linked from its HTML page with `<link rel="alternate" type="text/markdown">`. `usage.md` is the part of `BRANDING.md` between the `public:start` / `public:end` markers, so keep that part free of local paths; `vite/usage-page.mjs` renders it into the HTML page `toolkit/usage.html` at serve and build time. `system.md` mirrors `toolkit/system.html`'s copy: change both together.
- `src/brand/notes.js` holds per-brand prose (what each icon depicts, usage notes), shared by the guides and the markdown.
- `vite/brands-plugin.mjs` is the dev-only save API (`/__brands`) the editor uses; it validates, writes atomically, regenerates and fires the `wompland:brands` HMR event.
- Pages: `index.html`, `toolkit/*.html`, scripts and CSS in `src/toolkit/`. Read pages share `base.css` + `sheet.css`, and the footer: `<!-- partial:footer -->` is replaced with `src/partials/footer.html` (`vite/partials.mjs`).
- `archive/` holds the retired identity explorations; see `archive/README.md`. Not part of the build.

## Rules when changing things

- Change brands through the editor or the `/__brands` API, not by hand-editing generated files. If you edit `brands/*.json` directly, run `npm run brands && npm run themes` after.
- The contrast gate is the bar: WCAG 2.2 AA, body text 7:1. A change that fails `npm run themes` or `npm run palette` is not done.
- Blue is fine; blue plus a W is not (it reads as WordPress). No Womp gets a W, a letter or a circled mark on a blue tile. The palette's blue is Cornflower (hue 260), because other blues at its lightness fail the WordPress distance gate (`DESIGN.md`, "The One Blue Rule").
- The master mark is an icon, like every Womp, not a letter.
- Read-page layout follows the construction grid (`DESIGN.md`, "The Construction Grid Rule"): content starts and ends on column edges, and nested layouts are subgrids (`.subgrid`, `.half`, `.quarter`) rather than their own column math.
- Leave `brands/` holding only real brands; delete any test brand you create.
- If you change what a brand ships or the rules for using it, update `BRANDING.md` to match.
