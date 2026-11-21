# WompLand branding toolkit

This repo is the source of truth for the WompLand brand family and the local tool that edits it.

- **Applying a brand in another project?** Read `BRANDING.md`. That is the guide for consumers; the rest of this file is about working on the toolkit itself.
- **Product context:** `PRODUCT.md` (who it's for, positioning, tone).
- **Design system:** `DESIGN.md` (Modular identity: module kit, palette rules, lockup spec, the construction grid, don'ts). Long; read the section you need.

## Commands

- `npm run dev`: regenerates brands and themes, then serves the toolkit at http://localhost:5173/ (home, editor at `/toolkit/edit.html?brand=<slug>`, brand guides at `/toolkit/brand.html?brand=<slug>`, system guide at `/toolkit/system.html`).
- `npm run build`: same generation, then a static, read-only `dist/`.
- `npm run brands`: regenerate `public/brands/` from `brands/*.json`.
- `npm run themes`: rebuild `src/themes/wompland.css` and run the contrast gate (fails the build on any miss).
- `npm run palette`: print the palette with its ratios and fail on any gate miss.

## How it fits together

- `brands/<slug>.json` is the only hand-edited brand data: `{ slug, name, role, color, glyph, shapes }`, nothing else. Exactly one `role: "master"` (`wompland`). Sub-brand names are `<job>Womp`, slug lowercase.
- `brands/palette.json` is generated: edit `SPEC` in `scripts/palette.mjs`, then run `node scripts/palette.mjs --write`.
- `src/brand/` is the isomorphic core (schema, palette gates, geometry, text outlining, lockups, theme tokens). The browser pages and the Node generator import the same code; keep it free of Node APIs.
- `scripts/build-brands.mjs` writes `public/brands/<slug>/` (SVG, PNG, ICO, `daisyui-theme.css`, `brand.json`) and `public/brands/index.json`. Generated: never edit by hand.
- `vite/brands-plugin.mjs` is the dev-only save API (`/__brands`) the editor uses; it validates, writes atomically, regenerates and fires the `wompland:brands` HMR event.
- Pages: `index.html`, `toolkit/*.html`, scripts and CSS in `src/toolkit/`. Read pages share `base.css` + `sheet.css`.
- `archive/` holds the retired identity explorations; see `archive/README.md`. Not part of the build.

## Rules when changing things

- Change brands through the editor or the `/__brands` API, not by hand-editing generated files. If you edit `brands/*.json` directly, run `npm run brands && npm run themes` after.
- The contrast gate is the bar: WCAG 2.2 AA, body text 7:1. A change that fails `npm run themes` or `npm run palette` is not done.
- Blue is fine; blue plus a W is not (it reads as WordPress). No Womp gets a W, a letter or a circled mark on a blue tile. The palette's blue is Cornflower (hue 260), because other blues at its lightness fail the WordPress distance gate (`DESIGN.md`, "The One Blue Rule").
- The master mark is an icon, like every Womp, not a letter.
- Read-page layout follows the construction grid (`DESIGN.md`, "The Construction Grid Rule"): content starts and ends on column edges, and nested layouts are subgrids (`.subgrid`, `.half`, `.quarter`) rather than their own column math.
- Leave `brands/` holding only real brands; delete any test brand you create.
- If you change what a brand ships or the rules for using it, update `BRANDING.md` to match.
