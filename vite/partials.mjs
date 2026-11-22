// Shared page parts: <!-- partial:name --> in a page is replaced with src/partials/name.html,
// at serve and build time, so every page carries the same footer.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default function partials() {
  let root = process.cwd();
  return {
    name: 'wompland:partials',
    configResolved(config) { root = config.root; },
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/^[ \t]*<!-- partial:([a-z-]+) -->\n?/gm, (_, name) => readFileSync(resolve(root, 'src/partials', `${name}.html`), 'utf8')),
    },
  };
}
