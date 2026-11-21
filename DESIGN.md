---
name: WompLand
description: The WompLand branding toolkit. One Modular identity, module-built glyphs on palette tiles beside an Archivo 600 name, generated for every brand from JSON.
colors:
  # Page neutrals (src/brand/theme.js BASE). Light: white and ink. Dark: graphite and paper.
  ink: "#141414"
  white: "#FFFFFF"
  white-200: "#F3F2EE"
  white-300: "#E4E2DB"
  white-muted: "#57554F"
  graphite: "#1D1E20"
  graphite-200: "#25272A"
  graphite-300: "#303236"
  paper: "#EEECE6"
  graphite-muted: "#A9A69E"
  # Status (light / dark)
  info-light: "#3E4A52"
  info-dark: "#B8C3CA"
  success-light: "#1D6B3A"
  success-dark: "#6CC38A"
  warning-light: "#8F6400"
  warning-dark: "#F2B53A"
  error-light: "#B3261E"
  error-dark: "#FF7B6B"
  # The field palette (brands/palette.json). Field at OKLCH L 0.60; pale and deep glyph partners.
  rose-field: "#C5547C"
  rose-pale: "#FFE7EE"
  rose-deep: "#431827"
  vermilion-field: "#CA5843"
  vermilion-pale: "#FFE9E4"
  vermilion-deep: "#451911"
  copper-field: "#BE6600"
  copper-pale: "#FFEADB"
  copper-deep: "#411F00"
  ochre-field: "#A37900"
  ochre-pale: "#FAEDD5"
  ochre-deep: "#362600"
  olive-field: "#888500"
  olive-pale: "#F0F1D6"
  olive-deep: "#2C2B00"
  fern-field: "#43963C"
  fern-pale: "#E2F5DF"
  fern-deep: "#11310E"
  jade-field: "#009867"
  jade-pale: "#DBF6E7"
  jade-deep: "#00321F"
  teal-field: "#00948C"
  teal-pale: "#D5F7F3"
  teal-deep: "#00302D"
  cornflower-field: "#477ED8"
  cornflower-pale: "#E5EFFF"
  cornflower-deep: "#13284B"
  iris-field: "#7E6ED3"
  iris-pale: "#EDECFF"
  iris-deep: "#282249"
  violet-field: "#A061BE"
  violet-pale: "#F7E8FF"
  violet-deep: "#351D41"
  plum-field: "#B7589F"
  plum-pale: "#FFE6F7"
  plum-deep: "#3E1935"
typography:
  wordmark:
    fontFamily: "Archivo"
    fontWeight: 600
    letterSpacing: "-0.01em"
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title-lg:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0"
spacing:
  unit: "8px"
  gutter-sm: "16px"
  gutter-lg: "24px"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 16px"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 16px"
  tool-radio:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "44px"
    padding: "0 10px"
  tool-radio-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  mode-toggle:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
  tile-wompland:
    backgroundColor: "{colors.ochre-field}"
    textColor: "{colors.ochre-deep}"
    rounded: "{rounded.none}"
    size: "72px"
---

<!-- This file records the WompLand branding toolkit. Brands are user-editable data in brands/*.json; their assignments are described here, not frozen as tokens. -->

# Design System: WompLand

## Overview

**Creative North Star: "The construction manual"**

WompLand has one identity, Modular, and this repo is the toolkit that produces it. Every brand is a glyph built from three module shapes on a 7 by 7 field, set inside a 9 by 9 tile filled with one palette color, beside its name in Archivo 600. The master is WompLand; every sub-brand is `<job>Womp`. Brands live as JSON in `brands/`; a build turns each one into logo files, icons and a DaisyUI light and dark theme, and the toolkit pages (home, editor, brand guide, system guide) draw every logo at runtime from that same data.

The toolkit UI speaks the same language as the marks: ink on white or paper on graphite, 2px ink rules, square corners, no shadows, Archivo on a strict seven-step scale, and a faint construction grid behind the page. It reads like a well-made specification sheet: everything measured, nothing decorative. Earlier candidate identities (Seed Packet, Webring, Letterpress) and the retired module-alphabet sheet are kept in `archive/`, outside the build.

**Key Characteristics:**
- Brand data, not hand-drawn art: `brands/<slug>.json` validated by `src/brand/schema.js`, colors from the gated `brands/palette.json`.
- One isomorphic brand core (`src/brand/`: palette, schema, geometry, text, lockup, theme) shared by the Node generator, the dev save API and the browser.
- Every brand gets the same lockups, icons and themes with no per-app design work.
- WCAG 2.2 AA throughout, AAA 7:1 for body text in both modes, 16px minimum body size, pass/fail never shown by color alone.
- Flat, square, ruled: 2px borders, 3px section rules, radius 0, DaisyUI depth and noise 0.

### Brand data

**The Schema Rule.** A brand file is `{ slug, name, role, color, glyph, shapes }` and nothing else. `role` is `master` (exactly one, named `WompLand`) or `sub` (name matches lowercase letters + `Womp`); `slug` is the lowercase name; `color` is a palette id; `glyph` is `pale` or `deep`. Shapes sit on the 7 by 7 field (x, y 0 to 6, origin top-left, y down):
- `cell` at (x, y): a 1 by 1 square.
- `ring` at (x, y), size 2 to 4, rot: a quarter band one module thick in a size by size box.
- `pie` at (x, y), size 1 to 4, rot: a filled quarter disc in a size by size box.

`rot` names the box corner holding the circle's centre, clockwise from top-left: 0 top-left, 1 top-right, 2 bottom-right, 3 bottom-left (equivalently, the rot-0 shape turned rot quarter turns clockwise). No shape may leave the field. Shapes union into one fill; order does not matter, and saved files are normalised (deduplicated, sorted by type, y, x). Stems and half circles are not modules of their own; they are cells and quarters placed side by side.

New sub-brands start with the first palette color no brand uses yet, a pale glyph and an empty field.

### Geometry and lockups

The tile is 9 modules square with a 1-module margin around the glyph field. Standalone files use 8px modules (the mark is 72px). Favicon art is redrawn on a 16px grid with a 1px margin and 2px modules, so every edge lands on a whole pixel. Cells are merged into the fewest rectangles and every curve winds clockwise, so shapes union under the default fill rule.

**The Lockup Rule.** A lockup is the tile plus the name in Archivo 600, camelCase as written, tracked -0.01em, outlined to paths so no file depends on the font. In modules (u = 1/9 of the tile): the name's cap height is 5u. Horizontal: the name starts 3u right of the tile with its caps centred on the tile (cap top 2u, baseline 7u). Stacked: the tile is centred over the name with 2u from the tile bottom to the cap top. The tile never changes between grounds; only the name switches from ink (#141414) to paper (#EEECE6) in the reverse files.

Clear space is 2u on every side. Minimum sizes: horizontal lockup 120px wide (30mm), stacked lockup 72px (20mm), tile full art 24px (8mm), tile favicon art 16px; below 24px use the favicon art.

### Generated assets

`npm run brands` (`scripts/build-brands.mjs`) validates the palette and the whole collection, then writes `public/brands/<slug>/`: `mark.svg`, `favicon.svg`, `horizontal.svg`, `horizontal-reverse.svg`, `stacked.svg`, `stacked-reverse.svg`, `icon-16.png` and `icon-32.png` (from the favicon art), `apple-touch-icon.png` (180), `icon-192.png` and `icon-512.png` (from the mark), `favicon.ico` (16 + 32), `daisyui-theme.css` and a resolved `brand.json`. It also writes `public/brands/index.json` and copies the Archivo 600 woff to `public/fonts/` for in-browser outlining, and prunes folders of deleted brands.

In development, `vite/brands-plugin.mjs` serves a save API: `GET /__brands`, `GET|PUT|DELETE /__brands/:slug` (delete for sub-brands only) and `POST /__brands` with `{ name }`. Every write is validated, written atomically, then the brand's assets and the themes are regenerated, and the server sends the HMR event `wompland:brands`. The production build is a static, read-only brand guide.

### Themes

**The fromField Rule.** A brand contributes only its field color. `fromField()` keeps the field's hue and chroma and steps OKLCH lightness by 0.005 (down on white, up on graphite) until the color clears 4.6:1 on both page grounds of that mode; that becomes the brand's primary, with ink or white as its content color, whichever contrasts more. Secondary is ink (light) or paper (dark); accent is amber (#8F6400 light, #F2B53A dark). Neutrals and status colors are shared by every brand.

`npm run themes` writes `src/themes/wompland.css` (and a report JSON) with two themes per brand named `wompland-<slug>-<mode>`; the master's light theme is DaisyUI's default and its dark theme is `prefersdark`. Each theme also carries `--field` / `--field-glyph` for its brand, every brand's tile colors as `--f-<slug>` / `--f-glyph-<slug>`, and the page vars `--grid`, `--grid-strong` and `--rule`.

**The Contrast Gate Rule.** No theme ships unless `contrastChecks()` passes: base-content on base-100/200/300 at 7:1; muted on base-100/200 at 4.5:1; every role's content color on that role at 4.5:1; primary on base-100/200 at 4.5:1; secondary, accent and status colors on base-100 at 3:1. `brandThemeCSS()` throws on any miss, and `npm run palette` also proves every palette entry yields passing themes with either glyph tone. All six current themes pass.

### Mode

`src/shared/mode.js` is the only mode switch. Pages set `<html data-identity="wompland" data-default-mode="light">` and `<body data-brand="wompland">`; any element with `data-brand="<slug>"` receives `data-theme="wompland-<slug>-<mode>"`, and `data-mode` pins a panel (side-by-side light and dark grounds). Mode resolves from `?mode=`, then `localStorage['wompland-mode']`, then the page default, then `prefers-color-scheme`. `?still` stops every animation and transition for review captures.

## Colors

Ink and white, or paper and graphite, with color arriving only through brand tiles.

### Primary
Brand primaries are derived, not chosen: each is `fromField()` applied to the brand's palette field. With the current data they are #8B6700 / #B38821 (WompLand), #B94834 / #E16C56 (blogWomp) and #007973 / #1E9F97 (wikiWomp), light / dark. They change when a brand's color changes.

### Neutral
- **Ink** (`ink`): text, 2px rules and borders, the ink button, checked tool radios on light pages; the light-mode neutral role.
- **White** (`white`, `white-200`, `white-300`): light page ground, raised panels and hovers, disabled borders. Muted text is `white-muted`.
- **Graphite** (`graphite`, `graphite-200`, `graphite-300`): dark page ground and its steps. Text is **paper** (`paper`), muted `graphite-muted`.
- **Grid** (`--grid` ink or paper at 8 to 9%, `--grid-strong` at 20 to 22%): construction-grid lines and table hairlines.

### The field palette

Twelve fields, each with a pale and a deep glyph partner (`<id>-field`, `<id>-pale`, `<id>-deep`): rose, vermilion, copper, ochre, olive, fern, jade, teal, cornflower, iris, violet, plum. `scripts/palette.mjs --write` generates them: field at OKLCH L 0.60, C 0.15 (clamped to sRGB at its hue); pale at L 0.95, C 0.035; deep at L 0.28, C 0.07, all on the field's hue.

**The Palette Gate Rule.** `src/brand/palette.js` gates every entry: field at 3:1 or more against white and against graphite; pale and deep each at 3:1 or more on the field (WCAG 1.4.11); field lightness in OKLCH 0.56 to 0.62; pale and deep within 12 degrees of the field's hue; OKLab distance 0.1 or more from WordPress cerulean (#21759B), Gutenberg blue (#3858E9) and Shopify lime (#95BF47); and 0.045 or more between any two fields. `npm run palette` fails on any miss.

**The One Blue Rule.** The palette has exactly one blue, Cornflower (hue 260, `#477ED8`). At the shared L 0.60, blue hues from about 200 to 275 degrees sit 0.071 to 0.103 OKLab from WordPress cerulean or Gutenberg blue; 260 is the hue between Teal (188) and Iris (288) that clears the 0.1 gate from both (0.103), and it sits 0.074 from Iris and 0.153 from Teal. The sky and cerulean blues around 220 to 245 degrees fail the gate and stay out. Blue itself is fine; what reads as WordPress is blue together with a W. So no Womp pairs a blue field with a W-shaped glyph, a letter, or a mark in a circle, and every icon stays a picture of its own object (the master icon included). Other blues at this lightness fail the distance gate, so Cornflower is the palette's blue.

### Current brands (user-editable data)
- **WompLand** (master): ochre field, deep glyph.
- **blogWomp**: vermilion field, deep glyph. Keep it deep: a pale glyph on an orange-red square drifts toward Blogger.
- **wikiWomp**: teal field, pale glyph.

These are assignments in `brands/*.json`, editable in the toolkit, not fixed tokens.

## Typography

**Font:** Archivo 400, 500, 600, 700, 800 (with ui-sans-serif, system-ui)
**Mono:** JetBrains Mono, code only

**Character:** one plain grotesque for everything, including the outlined names in the logos; precision comes from the scale, not from a second face.

### Hierarchy
- **Wordmark** (`wordmark`): Archivo 600, camelCase, -0.01em; sized by the lockup (cap height 5u) and outlined in files.
- **Display** (`display`): one per page, the opener line ("Three modules. One mark. Every Womp." on the system guide).
- **Headline** (`headline`, 40px), **Title large** (`title-lg`, 28px, plate heads) and **Title** (`title`, 22px, sub-heads, the editor's brand name and dialog heads).
- **Body** (`body`): 18px / 1.6 on a 68ch measure. The editor sets its whole surface at 15px (`small`).
- **Small** (`small`): captions, metadata, table cells, navigation, buttons.
- **Label** (`label`, uppercase, +0.04em): spec labels, table heads, the mode toggle, editor section labels. Identifiers inside labels keep their real case.
- **Code** (`code`): 14px code blocks and snippets.

**The Seven Steps Rule.** Type lives on 13 / 15 / 18 / 22 / 28 / 40 / 64px. Headings stay tight (-2%), labels open up (+4%) and run in capitals, nothing is set below 13px, and tabular lining figures are used wherever numbers line up.

## Layout

**The Construction Grid Rule.** On the read pages the layout is the construction grid: an 8px unit; 4 columns with 16px gutters, 8 columns from 760px, 12 columns with 24px gutters from 1100px; sheet max 1440px. Both edges of every column are drawn faintly in `--grid` behind content, and everything starts and ends on those edges: no inset padding on grid children, and nested layouts are CSS subgrids of the page grid rather than their own column math. Sections are plates: a 3px top rule, 56px top and 80px bottom padding, the head in columns 1 to 4 and the body in 5 to 12 from 1100px, so the body is always 8 columns (4 on phones). Inside the body, pairs take 4 columns each (`.half`) and small multiples take 2 (`.quarter`); bordered boxes sit on column edges, and only their own contents are padded. Spacing is multiples of the unit.

The masthead carries the WompLand horizontal lockup (32px tall), a purpose line from 1100px, the page nav, and the mode toggle, over a 3px rule. Page openers pair a display line with an in-page nav above a 2px rule.

The editor is an operate surface: a header bar, then a three-column workspace (brand rail 240px, stage, inspector 384px; 216 / 336px under 1240px), each column scrolling on its own above 900px so the canvas never leaves view. The stage sits on a 40px square grid. Under 900px it becomes one column ordered brands, stage, inspector, New Womp, with the brand list scrolling sideways.

## Elevation & Depth

Flat. There are no shadows on any surface or control. Structure comes from rules: 3px for the masthead, plates and footer, 2px for borders, panels and dividers, 1px `--grid-strong` hairlines inside tables. The only overlay is the editor dialog, a 2px-bordered panel over an ink scrim at 55%.

## Shapes

Square everywhere: every DaisyUI radius token is 0 and borders are 2px. Shapes in the marks are the module kit: a cell, a quarter ring one module thick, a filled quarter disc; every curve is exactly one module thick, so rings and stems carry the same stroke.

## Components

### Buttons
- **DaisyUI buttons** (read pages): weight 600, +0.01em, 2px border, no shadow; ghost hover fills base-200; non-primary outline buttons take an ink border.
- **Editor buttons** (`button-outline`, `button-ink`): 40px tall (32px small), 2px ink border, 15px weight 600. Outline hovers to base-200 and presses to base-300; ink is solid base-content that lightens 18% on hover and 30% on press (150ms ease-out). Danger buttons are error-bordered or solid error. Disabled buttons drop to a dashed base-300 border with muted text.

### Tool radios (signature)
Segmented radio groups for shape, size and rotation (`tool-radio`): 44px tall, 2px ink borders that overlap by 2px, a 24px shape icon and a key hint; the checked option inverts to ink with white text. Disabled options go muted on a base-300 border.

### Inputs
2px ink border on base-100, 16px, placeholders in muted; focus is a 3px outline (primary on read pages, ink in the editor). The New Womp field is a joined input plus a fixed "Womp" suffix cell on base-200; invalid input turns the border error and prints an "Error:" message.

### Swatches
Palette choices are tiles of the field color with pale and deep chips; the checked one gets an inset 2px ink outline, a check badge and a bold name, and swatches used by another brand say so. Glyph tone is a pair of cards with a square radio mark. Read pages show palette entries as a 72px field with both chips plus hex values and contrast ratios.

### Spec plates and gate tables
A spec plate is a 2px-ruled box with art above and a caption row below (name left, downloads or figures right). Tables use uppercase label heads in muted, 1px hairlines and tabular numbers. Contrast-gate tables show each pair, ratio, minimum and a verdict; pass and fail always carry a word and a mark, with fail in error color. On narrow screens gate and minimum-size tables reflow into labelled rows.

### Navigation and mode toggle
Masthead links are 15px weight 600, underlined only on hover or when current. The mode toggle (`mode-toggle`) is a 2px ink box with a 16px icon, an uppercase label and an inverted On/Off state chip; on hover the whole box inverts. Under 760px the word drops and the icon and state remain.

### Grounds and app screens
Grounds are paired light and dark panels pinned with `data-mode`, inside one 2px frame. Sample app screens sit in a 3px frame: a 12px field bar, an app bar with the brand lockup, then the post or wiki. The brand field appears as bands, a pull quote and the infobox head, with `--field-glyph` text; reading stays ink on the ground. Wiki links keep visible `[[ ]]` brackets in primary with a 2px underline (dashed for pages not yet written).

### Motion
Motion is state feedback only: 150ms ease-out color changes on editor buttons and tool radios. Every page removes transitions and animations under reduced motion.

## Do's and Don'ts

### Do:
- **Do** change a brand by editing its glyph and color in the toolkit (or `brands/<slug>.json`) and saving; the generator rewrites the logos, icons and themes.
- **Do** build every glyph from cells, quarter rings and filled quarters inside the 7 by 7 field, one module thick.
- **Do** pick a palette color no other Womp uses, and the pale or deep glyph that reads better and stays clear of other brands' icons.
- **Do** set every name in Archivo 600 camelCase on the lockup spec, and keep 2 modules of clear space.
- **Do** edit the palette only in `scripts/palette.mjs` and let `npm run palette` fail the build on any gate miss.
- **Do** show pass and fail with a word and a mark, never color alone.

### Don't:
- **Don't** put a circle or ring around the icon.
- **Don't** stretch the tile. It is always square.
- **Don't** rotate or flip it. The icon has one upright, and turned it stops reading as itself.
- **Don't** set the name in another face, or build it from modules.
- **Don't** use a color outside the palette, even a familiar one.
- **Don't** put a W, or any letter or circled mark, on a blue tile. Blue plus a W reads as WordPress.
- **Don't** give blogWomp a pale glyph.
- **Don't** hand-edit `src/themes/*`, `public/brands/*` or `public/fonts/*`; they are generated.
- **Don't** add shadows or rounded corners to the toolkit UI.
- **Don't** resemble WordPress, Shopify, Wix, Squarespace, Ghost, Medium, Notion, Webflow or Substack.
