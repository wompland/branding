# WompLand branding

The brand family for [WompLand](https://brand.wompland.com), a set of small publishing apps (blogWomp, wikiWomp and more), and the local toolkit that edits it.

Every brand's mark is an icon built from three module shapes (cells, quarter rings and filled quarter circles) on a colored tile, beside the name in Archivo. The toolkit turns each brand's JSON into SVG logos, PNG and ICO icons, and a DaisyUI light and dark theme that passes WCAG 2.2 AA.

**Live brand guide:** https://brand.wompland.com. For tools and LLMs: [`llms.txt`](https://brand.wompland.com/llms.txt).

## Use a brand in your project

Read [`BRANDING.md`](BRANDING.md). It lists the files each brand ships and shows how to install the favicons, the theme and the logos.

## Work on the toolkit

Requires Node 22 or newer.

```sh
npm install
npm run dev
```

This regenerates every brand, then serves the toolkit at http://localhost:5173/:

- the brand family and the form for creating a new Womp (`/`)
- the editor (`/toolkit/edit.html?brand=<slug>`)
- each brand guide (`/toolkit/brand.html?brand=<slug>`)
- the system guide (`/toolkit/system.html`)

| Command | What it does |
|---|---|
| `npm run dev` | Generate brands and themes, then start the toolkit |
| `npm run build` | Generate, then build the read-only guide into `dist/` |
| `npm run brands` | Regenerate `public/brands/`, the markdown pages and `llms.txt` |
| `npm run themes` | Rebuild the themes and run the contrast gate |
| `npm run palette` | Print the palette with its contrast ratios |

Brand data lives in `brands/<slug>.json`; everything in `public/brands/` is generated from it. See [`CLAUDE.md`](CLAUDE.md) for how the pieces fit together, [`DESIGN.md`](DESIGN.md) for the design system and [`PRODUCT.md`](PRODUCT.md) for product context.

## Deploy

The production build is a static, read-only guide: no editor, no save API and no New Womp form. `dist/` is plain files, so Caddy (or any web server) serves it directly.

On the server, clone the repo once (Node 22 or newer), then run the deploy script, now and after every brand change you push:

```sh
git clone https://github.com/wompland/branding.git /srv/brand.wompland.com
sh /srv/brand.wompland.com/deploy/deploy.sh
```

The script resets the clone to `origin/main`, installs, regenerates the brands and themes, and builds into a temporary folder that replaces `dist/` only when the build succeeds. Set `SITE_URL` if the site is not at https://brand.wompland.com; it is used for the absolute links in the markdown pages.

Point Caddy at `dist/` with the site block in [`deploy/Caddyfile`](deploy/Caddyfile). It serves the markdown pages as `text/markdown`, caches the hashed assets, and allows other sites to fetch the brand files and markdown. To check, look at the `Content-Type` that `curl -sI https://brand.wompland.com/index.md` reports.

## License

The code is under the [MIT License](LICENSE). The WompLand names, logos and brand marks are not: they are trademarks, and you may use them only to refer to the WompLand projects. See [`LICENSE`](LICENSE) for details.
