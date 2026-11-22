# The WompLand brand system

WompLand is a family of small, self-hosted publishing apps. The master brand is WompLand; each app is a "Womp" named `<job>Womp` (blogWomp, wikiWomp, …). Every brand is an icon built from three modules (a square cell, a quarter ring and a filled quarter circle) on a 7 × 7 field inside a 9 × 9 tile, on one color from a shared palette, beside its name in Archivo 600.

## The module kit

One module is one ninth of the tile. Every curve is exactly one module thick, so rings and stems carry the same stroke. Coordinates are on the 7 × 7 field, origin top-left.

- **Cell**: 1 × 1. Dots, caps, bars and stems.
- **Quarter ring**: size 2 to 4. A quarter band, outer radius = size, inner radius = size − 1; always one module thick.
- **Filled quarter**: size 1 to 4. A solid quarter disc that rounds a corner of a block.

`rot` names the corner of the shape's box that holds the circle's centre, clockwise from top-left: 0 top-left, 1 top-right, 2 bottom-right, 3 bottom-left.

Stems, half rings, half discs and rounded blocks are not modules of their own: they are cells and quarters placed side by side, and shapes union into one glyph.

## The icon's construction

Like every Womp, WompLand is marked by an icon, not a letter: a picture built from the module kit on the 7 × 7 field inside a one-module margin, with every stroke one module thick. WompLand: Rose field, pale glyph. Nothing is drawn freehand.

| Module | Count |
|---|---|
| Cell | 14 |
| Quarter ring, size 2, rot 2 | 1 |
| Quarter ring, size 2, rot 3 | 1 |
| Quarter ring, size 2, rot 1 | 1 |
| Quarter ring, size 2, rot 0 | 1 |

## The lockup spec

A lockup is the tile plus the name in Archivo 600, measured in modules of the tile (u = 1/9 of the tile).

- **Horizontal**: the name starts 3u from the tile; its caps are 5u tall and centred on the tile.
- **Stacked**: the tile is centred over the name, 2u from the tile to the cap top.
- Tracking -0.01em. Names are camelCase as written (`<job>` + Womp), and outlined in every logo file, so no file depends on the font.
- The tile never changes between grounds; only the name switches from ink (light grounds) to paper (dark grounds, the `-reverse` files).
- **Clear space**: 2u on every side.
- **Minimum sizes**:

| Use | Screen | Print |
|---|---|---|
| Horizontal lockup | 120 px | 30 mm |
| Stacked lockup | 72 px | 20 mm |
| Tile, full art | 24 px | 8 mm |
| Tile, favicon art | 16 px | — |

Below 24 px, use the favicon art: a 1 px margin instead of one module, snapped to whole pixels.

## One rule for every Womp

A Womp's glyph is the core object of its job, built from the module kit inside the 7 × 7 field, set on one palette color with that color's pale or deep partner, and followed by its name in Archivo 600. No new design work per app: pick the object the app is about, draw it, choose a color. The theme follows from the color.

- **blogWomp**: Vermilion field, pale glyph. A feed: the newest post is the big block with the rounded corner; older posts are bars. [Guide](https://brand.wompland.com/brands/blogwomp/guide.md)
- **riverWomp**: Cornflower field, pale glyph. A river of news: headlines flow down the page, newest first, in batches by source. Each dot starts a new source; the bars beside and below it are its headlines. [Guide](https://brand.wompland.com/brands/riverwomp/guide.md)
- **wikiWomp**: Teal field, pale glyph. A link target: square brackets around a page block, the way a wiki link wraps the page it points to. [Guide](https://brand.wompland.com/brands/wikiwomp/guide.md)

## The palette rules

1. **Equal weight.** Every field sits in one lightness band (OKLCH L 0.56 to 0.62), so no Womp shouts over another.
2. **Works on white and graphite.** Each field reaches 3:1 against white (`#FFFFFF`) and graphite (`#1D1E20`), so the tile reads as a shape on either page.
3. **Pale and deep partners.** Each field has a pale and a deep glyph color of the same hue (within 12°), both at 3:1 or more on the field. A brand picks one.
4. **Distinct, and clear of look-alikes.** Neighbouring fields stay tellable apart, and every field keeps its distance from WordPress and Shopify colors. Blue is fine, but never blue plus a W.

### The colors

Take a brand's colors from its theme, not from this table: the theme primary is derived from the field so it reaches 4.5:1 as text.

| Color | Field | Pale | Deep | Field on white | Field on graphite | Pale on field | Deep on field | Used by |
|---|---|---|---|---|---|---|---|---|
| Rose | `#C5547C` | `#FFE7EE` | `#431827` | 4.26:1 | 3.92:1 | 3.63:1 | 3.53:1 | WompLand |
| Vermilion | `#CA5843` | `#FFE9E4` | `#451911` | 4.21:1 | 3.96:1 | 3.61:1 | 3.56:1 | blogWomp |
| Copper | `#BE6600` | `#FFEADB` | `#411F00` | 4.13:1 | 4.04:1 | 3.55:1 | 3.58:1 | Unused |
| Ochre | `#A37900` | `#FAEDD5` | `#362600` | 3.97:1 | 4.20:1 | 3.43:1 | 3.69:1 | Unused |
| Olive | `#888500` | `#F0F1D6` | `#2C2B00` | 3.89:1 | 4.29:1 | 3.38:1 | 3.72:1 | Unused |
| Fern | `#43963C` | `#E2F5DF` | `#11310E` | 3.71:1 | 4.50:1 | 3.24:1 | 3.86:1 | Unused |
| Jade | `#009867` | `#DBF6E7` | `#00321F` | 3.69:1 | 4.52:1 | 3.23:1 | 3.85:1 | Unused |
| Teal | `#00948C` | `#D5F7F3` | `#00302D` | 3.74:1 | 4.46:1 | 3.28:1 | 3.84:1 | wikiWomp |
| Cornflower | `#477ED8` | `#E5EFFF` | `#13284B` | 4.00:1 | 4.17:1 | 3.46:1 | 3.66:1 | riverWomp |
| Iris | `#7E6ED3` | `#EDECFF` | `#282249` | 4.15:1 | 4.02:1 | 3.57:1 | 3.57:1 | Unused |
| Violet | `#A061BE` | `#F7E8FF` | `#351D41` | 4.24:1 | 3.93:1 | 3.63:1 | 3.53:1 | Unused |
| Plum | `#B7589F` | `#FFE6F7` | `#3E1935` | 4.28:1 | 3.90:1 | 3.65:1 | 3.52:1 | Unused |

## Don'ts

- Don't put a circle or ring around the icon.
- Don't stretch the tile. It is always square.
- Don't rotate or flip it. The icon has one upright, and turned it stops reading as itself.
- Don't set the name in another face, or build it from modules.
- Don't use a color outside the palette, even a familiar one.
- Don't put a W, or any letter or circled mark, on a blue tile. Blue plus a W reads as WordPress.

## The type scale

Archivo for everything people read: one family, seven sizes, tabular figures wherever numbers line up. JetBrains Mono is for code only.

| Role | Size | Leading | Weight |
|---|---|---|---|
| Wordmark | cap 5u | — | 600 |
| Display | 64 px | 0.98 | 800 |
| Heading 1 | 40 px | 1.10 | 700 |
| Heading 2 | 28 px | 1.10 | 700 |
| Heading 3 | 22 px | 1.10 | 700 |
| Body | 18 px | 1.60 | 400 |
| Small | 15 px | 1.50 | 400 |
| Label | 13 px | 1.30 | 600 |
| Code | 14 px | 1.60 | 400 |

Reading text is 18 pixels on a 68-character measure. Headings stay tight (−2%), labels open up (+4%) and run in capitals, and nothing is set below 13 pixels.
