// Dev-only save API for the brand editor. Brands are JSON files in brands/; every write is validated first,
// written to a temp file and renamed, then the brand's assets and the themes are regenerated.
//
//   GET    /__brands         -> 200 { ok, palette, brands }          every brand source + the palette
//   GET    /__brands/:slug   -> 200 { ok, brand }                    one brand source
//   PUT    /__brands/:slug   -> 200 { ok, brand }                    body: brand source; returns the new public/brands/<slug>/brand.json
//   POST   /__brands         -> 201 { ok, brand }                    body: { name: "listWomp" }; creates a sub-brand
//   DELETE /__brands/:slug   -> 200 { ok, slug }                     sub-brands only
// Errors: { ok: false, errors: string[] } with 400 (invalid), 404 (unknown slug), 405, or 500 (regeneration failed).
// After every successful write the server sends the HMR custom event "wompland:brands" with { action, slug }.
import { execFile } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const MAX_BODY = 256 * 1024;

class HttpError extends Error {
  constructor(status, errors) {
    super(errors.join('; '));
    this.status = status;
    this.errors = errors;
  }
}

function readJson(req) {
  return new Promise((ok, fail) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) fail(new HttpError(400, ['body too large']));
      else chunks.push(c);
    });
    req.on('end', () => {
      try {
        ok(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
      } catch {
        fail(new HttpError(400, ['body must be JSON']));
      }
    });
    req.on('error', fail);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default function brandsPlugin() {
  return {
    name: 'wompland-brands',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      // Loaded at request time from disk (not bundled into the config), so the plugin uses the same modules as the scripts.
      const load = (rel) => import(pathToFileURL(resolve(root, rel)).href);
      const regenerate = async (...brandArgs) => {
        await run(process.execPath, [resolve(root, 'scripts/build-brands.mjs'), ...brandArgs], { cwd: root });
        await run(process.execPath, [resolve(root, 'scripts/build-llms.mjs')], { cwd: root });
        await run(process.execPath, [resolve(root, 'scripts/build-themes.mjs')], { cwd: root });
      };
      const generated = (slug) => JSON.parse(readFileSync(resolve(root, 'public/brands', slug, 'brand.json'), 'utf8'));

      // One write at a time: requests queue behind each other.
      let queue = Promise.resolve();
      const serial = (fn) => {
        const next = queue.then(fn, fn);
        queue = next.catch(() => {});
        return next;
      };

      async function handle(req, slug) {
        const [store, schema, theme] = await Promise.all([load('scripts/lib/brand-store.mjs'), load('src/brand/schema.js'), load('src/brand/theme.js')]);
        const palette = store.loadPalette();
        const brands = store.loadBrands();
        const existing = slug && brands.find((b) => b.slug === slug);
        if (slug && !existing) throw new HttpError(404, [`no brand "${slug}"`]);

        const check = (brand) => {
          const v = schema.validateBrand(brand, palette, { brands });
          if (!v.ok) throw new HttpError(400, v.errors);
          try {
            theme.brandThemeCSS(brand, palette); // the contrast gate, before anything touches disk
          } catch (e) {
            throw new HttpError(400, [e.message]);
          }
          return schema.normalizeBrand(brand);
        };
        // Write, regenerate, and put the old file back if regeneration fails.
        const commit = async (brand, action) => {
          const file = store.brandFile(brand.slug);
          const before = existsSync(file) ? readFileSync(file, 'utf8') : null;
          store.saveBrand(brand);
          try {
            await regenerate(brand.slug);
          } catch (e) {
            if (before === null) store.removeBrand(brand.slug);
            else store.writeFileAtomic(file, before);
            await regenerate().catch(() => {});
            throw new HttpError(500, [`regeneration failed: ${(e.stderr || e.message).trim()}`]);
          }
          server.ws.send({ type: 'custom', event: 'wompland:brands', data: { action, slug: brand.slug } });
          return generated(brand.slug);
        };

        switch (req.method) {
          case 'GET':
            return slug ? [200, { ok: true, brand: existing }] : [200, { ok: true, palette, brands }];
          case 'PUT': {
            if (!slug) throw new HttpError(405, ['PUT needs a slug: /__brands/:slug']);
            const body = await readJson(req);
            if (body && body.slug !== slug) throw new HttpError(400, [`slug: body slug "${body.slug}" does not match the URL; renaming is not supported (POST a new brand, then DELETE the old one)`]);
            return [200, { ok: true, brand: await commit(check(body), 'update') }];
          }
          case 'POST': {
            if (slug) throw new HttpError(405, ['POST goes to /__brands']);
            const body = await readJson(req);
            const name = body?.name;
            if (typeof name !== 'string') throw new HttpError(400, ['name: required, e.g. { "name": "listWomp" }']);
            if (brands.some((b) => b.slug === name.toLowerCase())) throw new HttpError(400, [`name: "${name}" already exists`]);
            return [201, { ok: true, brand: await commit(check(schema.newSubBrand(name, palette, brands)), 'create') }];
          }
          case 'DELETE': {
            if (!slug) throw new HttpError(405, ['DELETE needs a slug: /__brands/:slug']);
            if (existing.role === 'master') throw new HttpError(400, ['role: the master brand cannot be deleted']);
            store.removeBrand(slug);
            try {
              await regenerate();
            } catch (e) {
              throw new HttpError(500, [`regeneration failed: ${(e.stderr || e.message).trim()}`]);
            }
            server.ws.send({ type: 'custom', event: 'wompland:brands', data: { action: 'delete', slug } });
            return [200, { ok: true, slug }];
          }
          default:
            throw new HttpError(405, [`${req.method} is not supported`]);
        }
      }

      server.middlewares.use(async (req, res, next) => {
        const m = /^\/__brands(?:\/([^/?]+))?\/?(?:\?.*)?$/.exec(req.url ?? '');
        if (!m) return next();
        const slug = m[1];
        try {
          const [status, body] = req.method === 'GET' ? await handle(req, slug) : await serial(() => handle(req, slug));
          send(res, status, body);
        } catch (e) {
          if (!(e instanceof HttpError)) server.config.logger.error(e.stack ?? String(e));
          send(res, e.status ?? 500, { ok: false, errors: e.errors ?? [String(e.message ?? e)] });
        }
      });
    },
  };
}
