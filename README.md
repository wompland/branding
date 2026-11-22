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

The production build is a static, read-only guide: no editor, no save API and no New Womp form.

```sh
cp .env.example .env   # set PORT (and SITE_URL if not brand.wompland.com)
docker compose up -d --build
```

The container serves the site with nginx on `PORT`. Put a reverse proxy such as Caddy in front of it. After changing a brand, commit, pull and rebuild.

### Without Docker

`dist/` is a plain static site, so any web server can serve it. Build it on the server (Node 22 or newer):

```sh
npm ci
SITE_URL=https://brand.wompland.com npm run build
```

Then point Caddy at the folder:

```caddy
brand.wompland.com {
	root * /path/to/branding/dist
	encode zstd gzip
	file_server

	# Serve the markdown pages as text, not downloads
	@md path *.md
	header @md Content-Type "text/markdown; charset=utf-8"

	# Optional: the same caching and CORS as the Docker image
	header /assets/* Cache-Control "public, max-age=31536000, immutable"
	@shared path /brands/* *.md
	header @shared Access-Control-Allow-Origin *
}
```

After changing a brand, pull and run the build again. The build clears `dist/` first, so pages may briefly miss files while it runs.

To check the result, look at the `Content-Type` that `curl -sI https://brand.wompland.com/index.md` reports.

## License

The code is under the [MIT License](LICENSE). The WompLand names, logos and brand marks are not: they are trademarks, and you may use them only to refer to the WompLand projects. See [`LICENSE`](LICENSE) for details.
