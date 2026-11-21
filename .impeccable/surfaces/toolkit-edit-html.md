---
version: 1
slug: "toolkit-edit-html"
primary_target: "toolkit/edit.html"
related_targets: []
---

# Brand editor (toolkit/edit.html)

Scope: the WompLand toolkit's brand editor. Mode: Operate. User: the WompLand owner, editing the master brand and creating/customizing sub-brands locally under npm run dev. Established world: Modular (DESIGN.md). User requirements: place cells, quarter rings and filled quarter circles on the module grid; pick the background from the curated equal-weight palette and the glyph as its pale or deep partner; save to brands/*.json, which regenerates SVG/PNG/ICO/DaisyUI theme.

## Direction contract
THESIS: The editor is the module manual's construction plate made live: the tile at large scale on its grid, with tools that place exactly the kit's shapes. It refuses the generic icon-editor (freeform paths, gradients, arbitrary colors).
OWN-WORLD: The Modular world: white or graphite ground, ink, 2px ink rules, square corners, Archivo with tabular numbers, a construction grid behind the canvas, palette swatches as the only color.
STORY: The user picks a brand, places or edits shapes with mouse or keyboard, picks a color and tone, sees the favicon, lockups and theme update live with contrast checks, and saves to regenerate every asset.
FIRST VIEWPORT: The header (lockup, the brand being edited, Save, Revert, brand guide, mode toggle); the brand rail with New Womp on the left; the large tile canvas with the tool, size and rotation controls in the center; the name with Rename and Delete, the palette, the glyph tone and the live previews (favicon sizes, lockups) in the inspector on the right, with the contrast checks below and a blocking gate failure surfaced at the top.
FORM: surface in the established Modular world, specified by the user's requirements. seed: none (pinned) "I'm going to go with modular … using modular as the identity … placing cells and quarter circles … the main colors should be from a collection that all have a similar visual weight"
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
