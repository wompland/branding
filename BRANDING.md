# Using WompLand branding in a project

This folder is the source of truth for the WompLand brand family: the master brand **WompLand** and its apps, the Womps (`blogWomp`, `wikiWomp`, …). Read this file when you are working in *another* project and need to apply one of these brands. Don't copy the brand into your project by hand-redrawing, re-coloring or re-typesetting anything; take the generated files from here.

Folder: `~/code/wompland/branding` (this file's directory). Paths below are relative to it.

## 1. Find the brand

| What | Where |
|---|---|
| Every brand, one list | `public/brands/index.json` |
| One brand's resolved data (colors, theme names, tokens, asset paths) | `public/brands/<slug>/brand.json` |
| The editable source (shapes, palette color, glyph tone) | `brands/<slug>.json` |
| The color collection | `brands/palette.json` |

`<slug>` is the brand name in lowercase: `wompland`, `blogwomp`, `wikiwomp`. A project uses the brand of the app it is (blogWomp's codebase uses `blogwomp`); use `wompland` only for the family itself (the umbrella site, shared docs).

**If `public/brands/` is missing or stale**, run `npm install` (once) and `npm run brands` in this folder. It regenerates every file from `brands/*.json`. Never edit files under `public/brands/` directly.

**If the brand you need doesn't exist yet**, stop and tell the user: new Womps are designed in this toolkit's editor (`npm run dev`, then http://localhost:5173/, "New Womp"). Do not invent a logo, color or theme for it in the other project.

## 2. Files each brand ships (`public/brands/<slug>/`)

| File | Use |
|---|---|
| `horizontal.svg` | Main logo: icon tile + name, for light grounds. Site headers. |
| `horizontal-reverse.svg` | Same, for dark grounds (the name switches to paper; the tile is identical). |
| `stacked.svg` / `stacked-reverse.svg` | Tile centred over the name, for square-ish spaces (splash, about page, social cards). |
| `mark.svg` | The icon tile alone, 72 × 72 viewBox, scales freely. Avatars, app icons in UI. |
| `favicon.svg` | Favicon art, tuned for 16–32 px. |
| `favicon.ico` | 16 + 32 px ICO for old browsers. |
| `icon-16.png`, `icon-32.png` | Raster favicons. |
| `apple-touch-icon.png` | 180 × 180. |
| `icon-192.png`, `icon-512.png` | Web app manifest icons. |
| `daisyui-theme.css` | The brand's light and dark DaisyUI 5 themes. |
| `brand.json` | Everything above as data, plus hex colors and theme tokens. |

The names in the SVGs are outlined paths, so logos need no font installed.

## 3. Apply it

Copy the files you need into the project's static folder (e.g. `public/`). Re-copy after the brand changes here; or, in a monorepo-ish setup, have the project's build copy from `~/code/wompland/branding/public/brands/<slug>/`.

<!-- public:start (from here to public:end, this file is published as /usage.md by scripts/build-llms.mjs; keep it free of local paths) -->
**Favicons** in `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

**Web app manifest** (`site.webmanifest`, linked with `<link rel="manifest" href="/site.webmanifest">`). `theme_color` is the brand's `colors.field` from `brand.json` (a surface, so it is allowed there):

```json
{
  "name": "blogWomp",
  "short_name": "blogWomp",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#CA5843",
  "background_color": "#FFFFFF",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
  ]
}
```

**Setup** (Vite + Tailwind v4 + DaisyUI 5; the same versions this toolkit uses):

```sh
npm i -D vite tailwindcss @tailwindcss/vite daisyui
npm i @fontsource/archivo
npm i @fontsource/jetbrains-mono   # only if the page shows code
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [tailwindcss()] });
```

**Theme and type.** Copy `daisyui-theme.css` next to the main stylesheet, then:

```css
@import "tailwindcss";
@plugin "daisyui" { themes: false; }
@import "./daisyui-theme.css";
@import "@fontsource/archivo/400.css";
@import "@fontsource/archivo/600.css";
@import "@fontsource/archivo/700.css";
@import "@fontsource/archivo/800.css";
@import "@fontsource/jetbrains-mono/400.css"; /* only if the page shows code */

@theme {
  --font-sans: "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  /* The WompLand type scale as Tailwind utilities: text-label, text-small, text-body, text-h3, text-h2, text-h1, text-display. */
  --text-label: 0.8125rem;   --text-label--line-height: 1.3;
  --text-small: 0.9375rem;   --text-small--line-height: 1.5;
  --text-body: 1.125rem;     --text-body--line-height: 1.6;
  --text-h3: 1.375rem;       --text-h3--line-height: 1.1;
  --text-h2: 1.75rem;        --text-h2--line-height: 1.1;
  --text-h1: 2.5rem;         --text-h1--line-height: 1.1;
  --text-display: 4rem;      --text-display--line-height: 0.98;
}
```

Leave the root font size alone (16px), so DaisyUI components keep their normal size; set reading text with `text-body` on `<body>` or the content column.

Theme names are `wompland-<slug>-light` and `wompland-<slug>-dark`. The light theme is the default; the dark theme is marked `prefersdark`, so DaisyUI applies it when the visitor's OS prefers dark. `data-theme="wompland-<slug>-light|dark"` on `<html>` overrides both. Without Tailwind/DaisyUI, read the hex values from `brand.json` → `tokens` and the CSS file, and map them to the project's own variables.

What the theme gives you: base colors (white / graphite grounds, near-black ink), `primary` (the brand color made safe for text and buttons), secondary/accent/status colors, square corners (radius 0), 2px borders, no shadows, plus three custom properties:

- `--muted`: secondary text (captions, metadata, "last edited"). In Tailwind: `text-[var(--muted)]`. It passes 4.5:1 on `base-100` and `base-200`.
- `--field`, `--field-glyph`: the brand's tile colors, for decorative bands only (`bg-[var(--field)] text-[var(--field-glyph)]` on a band with large, bold text). Never small text.

Every theme passes WCAG 2.2 AA, with body text at 7:1 or more, and `primary` / `primary-content` and every other color / `-content` pair pass 4.5:1. Keep that: use `base-content` on `base-*` for text, `primary` for links and primary buttons, and each color's `-content` partner for text on it.

**Type.** Archivo for all interface and reading text; JetBrains Mono only for code. Headings weight 700 with tight tracking (`tracking-tight`); display weight 800. Labels are `text-label`, weight 600, uppercase, `tracking-wider`. Nothing below 13px.

**House style for common parts:**

- Links: `primary`, underlined (`link link-primary`).
- Neutral outline buttons: `btn btn-outline border-base-content` (DaisyUI's default outline border fades out in the dark theme).
- Code blocks: `bg-base-200`, a 2px `base-content` border, `font-mono text-small`, no rounded corners.
- Panels and cards: square, 2px `base-content` border or a `base-200` fill; no shadows. Rules between sections are 2–3px `base-content`.
- Current item in a nav or page tree: bold plus `aria-current="page"`, never color alone.

**A dark band on a light page** (footer, feature strip): put `data-theme="wompland-<slug>-dark"` on that element; themes nest. Use `bg-base-100` or `bg-base-200` inside it and the `-reverse` logo.

**Logo in the header:** `<img src="/horizontal.svg" alt="blogWomp" class="h-8 w-auto">`. Size it with a class: Tailwind's base styles set `img { height: auto }`, which overrides a `height="32"` attribute. The `alt` is the brand name. On a dark ground use `horizontal-reverse.svg`. When the page has both themes, show the file that matches the theme:

- Theme follows the OS only: `<picture><source srcset="/horizontal-reverse.svg" media="(prefers-color-scheme: dark)"><img src="/horizontal.svg" alt="blogWomp" class="h-8 w-auto"></picture>`.
- The site has its own light/dark switch (`data-theme`), which `<picture>` cannot see. Render both images, both with the real `alt` (the hidden one is `display: none`, so screen readers skip it), and let CSS pick. This also works inside a nested dark band:

  ```html
  <img class="logo-light h-8 w-auto" src="/horizontal.svg" alt="blogWomp">
  <img class="logo-dark h-8 w-auto" src="/horizontal-reverse.svg" alt="blogWomp">
  ```

  ```css
  .logo-dark { display: none; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme$="-light"]) .logo-light { display: none; }
    :root:not([data-theme$="-light"]) .logo-dark { display: inline; }
  }
  [data-theme$="-dark"] .logo-light { display: none; }
  [data-theme$="-dark"] .logo-dark { display: inline; }
  ```

**A light/dark switch** that overrides the OS and is remembered. In `<head>`, before the stylesheet, so there is no flash of the wrong theme:

```html
<script>
  try { var m = localStorage.getItem('theme'); if (m === 'light' || m === 'dark') document.documentElement.dataset.theme = 'wompland-blogwomp-' + m; } catch (e) {}
</script>
```

The button (`<button type="button" id="mode" aria-pressed="false">Dark mode</button>`):

```js
const root = document.documentElement;
const btn = document.getElementById('mode');
const dark = () => root.dataset.theme ? root.dataset.theme.endsWith('-dark') : matchMedia('(prefers-color-scheme: dark)').matches;
const sync = () => { btn.setAttribute('aria-pressed', String(dark())); btn.textContent = dark() ? 'Light mode' : 'Dark mode'; };
btn.addEventListener('click', () => {
  const m = dark() ? 'light' : 'dark';
  root.dataset.theme = `wompland-blogwomp-${m}`;
  try { localStorage.setItem('theme', m); } catch (e) {}
  sync();
});
sync();
```

**The name in running text** is written exactly as the brand's `name`: camelCase `blogWomp`, `WompLand`. Never `Blogwomp`, `BlogWomp`, `blog womp`.

## 4. Rules

These come from the brand system (`DESIGN.md`); they are the ones most often broken.

- **Use the files as they are.** Don't redraw, recolor, stretch, rotate, flip, outline or add effects (shadows, gradients, rounded corners) to the tile or the logo. Don't put the icon inside a circle or ring.
- **Never rebuild the name.** Don't set "blogWomp" in a font next to `mark.svg` to fake a lockup; use `horizontal.svg` or `stacked.svg`.
- **Ground decides the file.** Light ground: `horizontal.svg` / `stacked.svg`. Dark ground: the `-reverse` versions. The tile itself never changes.
- **Clear space:** keep 2 modules empty on every side of a lockup. A module is 1/9 of the tile's height: for a 32px-tall horizontal logo, that is about 7px. Padding counts as clear space; other elements (nav links, text, borders) must not come closer.
- **Minimum sizes:** horizontal lockup 120px wide (30 mm in print); stacked 72px wide (20 mm); tile 24px (8 mm). Below 24px, use `favicon.svg` / the PNG favicons, not `mark.svg`.
- **The field color is a surface, never text.** `colors.field` (e.g. blogWomp's `#CA5843`) is for the tile and decorative bands only; it does not pass contrast as text. Text and links in the brand color use the theme's `primary`.
- **No colors from outside the family.** Brand color comes only from `brand.json` / the theme. One brand per app: don't mix another Womp's color into it.
- **Never blue plus a W.** A blue brand (Cornflower) is fine, but a W, letter or circled mark on blue reads as WordPress. Don't add blue accents from outside the theme.

## 5. Check your work

- Favicon shows at 16px in a browser tab and the tile reads as the same icon as the logo.
- Header logo is the right file for the ground, not stretched, with clear space.
- Both themes load: toggle `data-theme` between `wompland-<slug>-light` and `-dark`.
- No hard-coded brand hex values in text styles; text uses theme tokens.

<!-- public:end -->

If something here disagrees with the generated files, the files win, and this guide needs a fix: tell the user.
