# wikiWomp brand guide

A Womp, part of the [WompLand family](https://brand.wompland.com/index.md). Teal field, pale glyph. Themes `wompland-wikiwomp-light` and `wompland-wikiwomp-dark`.

**Icon.** A link target: square brackets around a page block, the way a wiki link wraps the page it points to.

Visual version: https://brand.wompland.com/toolkit/brand.html?brand=wikiwomp

## Logo files

Every file is generated from the brand data. The names in the SVGs are outlined paths, so logos need no font installed.

| File | Use | URL |
|---|---|---|
| Horizontal lockup | Main logo for light grounds. Site headers. | https://brand.wompland.com/brands/wikiwomp/horizontal.svg |
| Horizontal lockup, reverse | For dark grounds; the name switches to paper, the tile is identical. | https://brand.wompland.com/brands/wikiwomp/horizontal-reverse.svg |
| Stacked lockup | Tile centred over the name, for square-ish spaces on light grounds. | https://brand.wompland.com/brands/wikiwomp/stacked.svg |
| Stacked lockup, reverse | For dark grounds. | https://brand.wompland.com/brands/wikiwomp/stacked-reverse.svg |
| Mark | The icon tile alone, 72 × 72, scales freely. Avatars, app icons in UI. | https://brand.wompland.com/brands/wikiwomp/mark.svg |
| Favicon art (SVG) | Tuned for 16–32 px. | https://brand.wompland.com/brands/wikiwomp/favicon.svg |
| favicon.ico | 16 and 32 px inside, for old browsers. | https://brand.wompland.com/brands/wikiwomp/favicon.ico |
| PNG 16 | 16 × 16, favicon art. | https://brand.wompland.com/brands/wikiwomp/icon-16.png |
| PNG 32 | 32 × 32, favicon art. | https://brand.wompland.com/brands/wikiwomp/icon-32.png |
| Apple touch icon | 180 × 180. | https://brand.wompland.com/brands/wikiwomp/apple-touch-icon.png |
| PNG 192 | 192 × 192, web app manifest. | https://brand.wompland.com/brands/wikiwomp/icon-192.png |
| PNG 512 | 512 × 512, web app manifest. | https://brand.wompland.com/brands/wikiwomp/icon-512.png |
| DaisyUI themes | Light and dark theme blocks. | https://brand.wompland.com/brands/wikiwomp/daisyui-theme.css |
| Brand data | Source, colors, theme tokens and asset paths (JSON). | https://brand.wompland.com/brands/wikiwomp/brand.json |

## On light and dark

- Light ground: `horizontal.svg` / `stacked.svg`. Dark ground: the `-reverse` versions. The tile never changes; only the name switches from ink to paper.
- Keep 2 modules (2/9 of the tile) clear on every side.
- Minimum sizes: horizontal lockup 120 px (30 mm); stacked lockup 72 px (20 mm); tile, full art 24 px (8 mm); tile, favicon art 16 px. Below 24 px, use the favicon art.

## Colors

The tile is the Teal field with its pale partner as the glyph. Fields are surfaces: text on a field is only ever large (22px bold), because the glyph partner is gated at 3:1, which is AA for large text only. Text in the brand color uses the theme primary, which is derived from the field until it reaches 4.5:1 on both page grounds.

| Role | Hex | OKLCH |
|---|---|---|
| Field (tile background) | `#00948C` | oklch(60.1% 0.104 188.1) |
| Pale (glyph) | `#D5F7F3` | oklch(95.1% 0.036 187.9) |
| Deep (partner) | `#00302D` | oklch(27.9% 0.048 188.2) |

Theme primary:

- **Light** (`wompland-wikiwomp-light`): primary `#007973`, primary-content `#FFFFFF`
- **Dark** (`wompland-wikiwomp-dark`): primary `#1E9F97`, primary-content `#141414`

### Contrast gate

All 42 checks pass, light and dark. Body text 7:1, muted text and every color on its content 4.5:1, primary as text 4.5:1, interface colors 3:1.

| Pair | Min | Light | Dark |
|---|---|---|---|
| base-content on base100 | 7 | 18.42:1 Pass | 14.12:1 Pass |
| base-content on base200 | 7 | 16.45:1 Pass | 12.68:1 Pass |
| base-content on base300 | 7 | 14.21:1 Pass | 10.87:1 Pass |
| muted on base100 | 4.5 | 7.45:1 Pass | 6.86:1 Pass |
| muted on base200 | 4.5 | 6.65:1 Pass | 6.16:1 Pass |
| primary-content on primary | 4.5 | 5.27:1 Pass | 5.67:1 Pass |
| secondary-content on secondary | 4.5 | 18.42:1 Pass | 15.59:1 Pass |
| accent-content on accent | 4.5 | 5.26:1 Pass | 10.04:1 Pass |
| neutral-content on neutral | 4.5 | 18.42:1 Pass | 15.59:1 Pass |
| info-content on info | 4.5 | 9.11:1 Pass | 10.26:1 Pass |
| success-content on success | 4.5 | 6.53:1 Pass | 8.61:1 Pass |
| warning-content on warning | 4.5 | 5.26:1 Pass | 10.04:1 Pass |
| error-content on error | 4.5 | 6.54:1 Pass | 7.28:1 Pass |
| primary on base100 | 4.5 | 5.27:1 Pass | 5.13:1 Pass |
| primary on base200 | 4.5 | 4.71:1 Pass | 4.61:1 Pass |
| secondary on base-100 | 3 | 18.42:1 Pass | 14.12:1 Pass |
| accent on base-100 | 3 | 5.26:1 Pass | 9.09:1 Pass |
| info on base-100 | 3 | 9.11:1 Pass | 9.29:1 Pass |
| success on base-100 | 3 | 6.53:1 Pass | 7.79:1 Pass |
| warning on base-100 | 3 | 5.26:1 Pass | 9.09:1 Pass |
| error on base-100 | 3 | 6.54:1 Pass | 6.59:1 Pass |

## Install

Copy the files into the project's static folder, then add the favicons to `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

Save [`daisyui-theme.css`](https://brand.wompland.com/brands/wikiwomp/daisyui-theme.css) next to the main stylesheet and import it after DaisyUI (Tailwind v4 + DaisyUI 5):

```css
@import "tailwindcss";
@plugin "daisyui" { themes: false; }
@import "./daisyui-theme.css";
```

The light theme is the default; the dark theme applies when the visitor prefers dark. Set `data-theme="wompland-wikiwomp-dark"` on `<html>` to force it. Or paste the theme blocks directly:

```css
/* wikiWomp DaisyUI themes, generated from brands/wikiwomp.json. Import this file (or paste all of it) after @plugin "daisyui". */

@plugin "daisyui/theme" {
  name: "wompland-wikiwomp-light";
  default: true;
  prefersdark: false;
  color-scheme: light;
  --color-base-100: #FFFFFF;
  --color-base-200: #F3F2EE;
  --color-base-300: #E4E2DB;
  --color-base-content: #141414;
  --color-primary: #007973;
  --color-primary-content: #FFFFFF;
  --color-secondary: #141414;
  --color-secondary-content: #FFFFFF;
  --color-accent: #8F6400;
  --color-accent-content: #FFFFFF;
  --color-neutral: #141414;
  --color-neutral-content: #FFFFFF;
  --color-info: #3E4A52;
  --color-info-content: #FFFFFF;
  --color-success: #1D6B3A;
  --color-success-content: #FFFFFF;
  --color-warning: #8F6400;
  --color-warning-content: #FFFFFF;
  --color-error: #B3261E;
  --color-error-content: #FFFFFF;
  --muted: #57554F;
  --radius-selector: 0rem;
  --radius-field: 0rem;
  --radius-box: 0rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 2px;
  --depth: 0;
  --noise: 0;
  --field: #00948C;
  --field-glyph: #D5F7F3;
}

@plugin "daisyui/theme" {
  name: "wompland-wikiwomp-dark";
  default: false;
  prefersdark: true;
  color-scheme: dark;
  --color-base-100: #1D1E20;
  --color-base-200: #25272A;
  --color-base-300: #303236;
  --color-base-content: #EEECE6;
  --color-primary: #1E9F97;
  --color-primary-content: #141414;
  --color-secondary: #EEECE6;
  --color-secondary-content: #141414;
  --color-accent: #F2B53A;
  --color-accent-content: #141414;
  --color-neutral: #EEECE6;
  --color-neutral-content: #141414;
  --color-info: #B8C3CA;
  --color-info-content: #141414;
  --color-success: #6CC38A;
  --color-success-content: #141414;
  --color-warning: #F2B53A;
  --color-warning-content: #141414;
  --color-error: #FF7B6B;
  --color-error-content: #141414;
  --muted: #A9A69E;
  --radius-selector: 0rem;
  --radius-field: 0rem;
  --radius-box: 0rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 2px;
  --depth: 0;
  --noise: 0;
  --field: #00948C;
  --field-glyph: #D5F7F3;
}

/* Inactive tabs use the theme's muted color so they pass 4.5:1. */
.tabs > .tab:not(:hover, .tab-active, [aria-selected="true"], [aria-current]:not([aria-current="false"], [aria-current=""]), .tab-disabled, [disabled]) { color: var(--muted); }
```

Full setup, the logo swap for light and dark, and the usage rules: [How to apply a brand](https://brand.wompland.com/usage.md).
