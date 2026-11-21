# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

npm + Vite build, Tailwind CSS v4, DaisyUI v5. A local toolkit (`npm run dev`) edits brands stored as JSON in `brands/`; saving regenerates SVG logos, PNG/ICO icons and a DaisyUI light + dark theme per brand. The production build (`dist/`) is a static, read-only brand guide.

## Users

Primary: indie writers and hobbyists running personal blogs, digital gardens, and small wikis. Equally important: developers and self-hosters who deploy, configure, and tinker with their own instances. The brand must feel personal and approachable to the first group while earning respect from the second.

## Product Purpose

WompLand is a family of small CMS/publishing apps. Each app ("Womp") does one publishing job: blogWomp for blogs, wikiWomp for wikis, with more to follow (same naming pattern: `<job>Womp`). This repository is the WompLand branding toolkit. The chosen identity is Modular: every brand's mark is a glyph built from module shapes (cells, quarter rings, filled quarter circles) on a palette-colored tile, beside its name in Archivo 600. The toolkit manages the master WompLand brand and creates and customizes sub-brands. Rejected directions (Seed Packet, Webring, Letterpress, the original module-alphabet wordmark) are kept in archive/.

## Positioning

Three claims, roughly equal weight:
- **Composable:** small focused apps that share accounts and content, instead of one all-in-one CMS with plugin sprawl.
- **Open web:** you own your content; IndieWeb, ActivityPub/federation, webmentions, portable data.
- **Self-host simplicity:** easy to run yourself, light on resources.

## Capabilities and Constraints

- The sub-brand system must scale to future Womps without new design work per app (a rule, not a one-off).
- Names are camelCase: WompLand for the master, `<job>Womp` for sub-brands.
- Brand colors come from one curated palette of equal visual weight; each works on light and dark pages, and the glyph is the color's pale or deep partner.
- Tone is restrained and precise; the user rejected gimmicky directions.

## Brand Commitments

- Names: WompLand (master), blogWomp, wikiWomp.
- Must not resemble existing CMS/site-builder branding, especially WordPress, Shopify, Wix, Squarespace (also avoid Ghost, Medium, Notion, Webflow, Substack look-alikes).

## Evidence on Hand

None yet: no logos, copy, customers, testimonials, or metrics. Mockups must use clearly placeholder sample content and must not invent user counts, testimonials, or pricing.

## Product Principles

1. Small pieces, loosely joined: every Womp stands alone and clearly belongs to the family.
2. Your words, your server: ownership and portability over lock-in.
3. Reading comes first: published output is for readers, so legibility beats decoration.
4. Approachable depth: friendly on the surface, honest and configurable underneath.

## Accessibility & Inclusion

WCAG 2.2 AA throughout (4.5:1 text, 3:1 large text and UI components, visible focus), plus AAA 7:1 contrast for body/reading text in both light and dark themes. Minimum body size 16px; no meaning carried by color alone.
