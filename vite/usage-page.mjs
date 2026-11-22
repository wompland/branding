// Renders public/usage.md (the public part of BRANDING.md, written by scripts/build-llms.mjs)
// into toolkit/usage.html at serve and build time, so the page is plain HTML with no runtime
// fetch and always says what the markdown says. The page links the markdown as its alternate.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Marked } from 'marked';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const marked = new Marked({
  renderer: {
    code: ({ text }) => `<pre class="code" tabindex="0"><code>${esc(text)}</code></pre>\n`,
  },
});

/** usage.md as page parts: the intro paragraph and one plate per section. */
export function usageParts(md) {
  const lines = md.replace(/^# .*\n+/, '');
  const [intro, ...rest] = lines.split(/\n\n/);
  const body = rest.join('\n\n');
  // Everything before the first "## " heading is the setup; each "## " starts its own section.
  const [setup, ...named] = body.split(/^## /m);
  const sections = [['Set up', setup], ...named.map((s) => {
    const nl = s.indexOf('\n');
    return [s.slice(0, nl).trim(), s.slice(nl + 1)];
  })];
  return {
    intro: marked.parseInline(intro.trim()),
    sections: sections.map(([title, src]) => ({ id: slugify(title), title, html: marked.parse(src.trim()) })),
  };
}

export function renderUsage(root) {
  const { intro, sections } = usageParts(readFileSync(resolve(root, 'public/usage.md'), 'utf8'));
  return {
    intro: `<p>${intro}</p>`,
    nav: sections.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join(''),
    body: sections
      .map((s) => `<section class="plate cols" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="plate-head"><h2 id="${s.id}-title">${esc(s.title)}</h2></div>
      <div class="plate-body usage-body">${s.html}</div>
    </section>`)
      .join('\n'),
  };
}

export default function usagePage() {
  let root = process.cwd();
  return {
    name: 'wompland:usage-page',
    configResolved(config) { root = config.root; },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('/toolkit/usage.html')) return html;
        const u = renderUsage(root);
        return html
          .replace('<!-- usage:intro -->', u.intro)
          .replace('<!-- usage:nav -->', u.nav)
          .replace('<!-- usage:body -->', u.body);
      },
    },
  };
}
