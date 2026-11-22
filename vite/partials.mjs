// Shared page parts: <!-- partial:name --> in a page is replaced with src/partials/name.html,
// at serve and build time, so every read page carries the same masthead and footer.
// `current="/path"` marks that nav link: aria-current="page" on its own page, "true" on a page
// inside that section (a brand guide is under Brands).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PARTIAL = /^[ \t]*<!-- partial:([a-z-]+)(?: current="([^"]+)")? -->\n?/gm;

export default function partials() {
  let root = process.cwd();
  return {
    name: 'wompland:partials',
    configResolved(config) { root = config.root; },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const self = ctx.path.replace(/\/index\.html$/, '/');
        return html.replace(PARTIAL, (_, name, current) => {
          const part = readFileSync(resolve(root, 'src/partials', `${name}.html`), 'utf8');
          if (!current) return part;
          const link = `<li><a href="${current}">`;
          if (!part.includes(link)) throw new Error(`partial:${name}: no nav link for current="${current}"`);
          return part.replace(link, `<li><a href="${current}" aria-current="${current === self ? 'page' : 'true'}">`);
        });
      },
    },
  };
}
