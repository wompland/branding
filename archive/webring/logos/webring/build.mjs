// Webring Badge Club logos. Writes standalone SVG files to public/logos/webring/ and
// refreshes the inline copies in identities/webring.html between <!--px ...--> and <!--/px--> markers,
// so the page and the downloadable files share one geometry.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { art } from '../../src/tokens/webring.mjs';
import { mark, horizontal, stacked, badge, svg, specimen, ditherGlow } from './pixels.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'public/logos/webring');
const page = resolve(root, 'identities/webring.html');

const NAMES = { womp: 'WompLand', blog: 'blogWomp', wiki: 'wikiWomp', list: 'listWomp', your: 'yourWomp' };
const FILE = { womp: 'wompland', blog: 'blogwomp', wiki: 'wikiwomp', list: 'listwomp', your: 'yourwomp' };

const tileFills = (m) => ({ fill: art[m].fill, hi: art[m].hi, lo: art[m].lo, ink: art.ink, paper: art.paper });
const badgeFills = (m) => ({
  ...tileFills(m),
  frame: art.ink,
  panel: art.panel,
  panelHi: art.panelHi,
  panelLo: '#08070c',
  name: art[m].name,
  micro: '#b0a7c6',
});

const KINDS = {
  mark: { draw: (m) => mark(m), title: (m) => `${NAMES[m]} mark`, fills: tileFills },
  favicon: { draw: (m) => mark(m), title: (m) => `${NAMES[m]} favicon`, fills: tileFills },
  horizontal: { draw: (m) => horizontal(m, NAMES[m]), title: (m) => NAMES[m], fills: tileFills, word: true },
  stacked: { draw: (m) => stacked(m, NAMES[m]), title: (m) => NAMES[m], fills: tileFills, word: true },
  badge: { draw: (m) => badge(m, NAMES[m]), title: (m) => `${NAMES[m]} 88 by 31 ring badge`, fills: badgeFills },
};

const write = (name, body) => writeFileSync(resolve(out, name), body + '\n');

for (const m of ['womp', 'blog', 'wiki', 'list', 'your']) {
  const f = FILE[m];
  const file = (kind, suffix = '', word) => {
    const k = KINDS[kind];
    const cv = k.draw(m);
    const fills = { ...k.fills(m), ...(word ? { word } : {}) };
    const scale = kind === 'badge' ? 1 : kind === 'favicon' ? 1 : 4;
    write(`${f}-${kind}${suffix}.svg`, svg(cv, { title: { id: 't', text: k.title(m) }, fills, width: cv.w * scale, height: cv.h * scale }));
  };
  file('mark');
  file('badge');
  file('horizontal', '', art.ink);
  file('horizontal', '-reverse', art.paper);
  if (m === 'womp') {
    file('stacked', '', art.ink);
    file('stacked', '-reverse', art.paper);
  }
  if (m === 'womp' || m === 'blog' || m === 'wiki') {
    const cv = mark(m);
    writeFileSync(
      resolve(out, `favicon-${m}.svg`),
      svg(cv, { title: { id: 't', text: `${NAMES[m]} favicon` }, fills: tileFills(m), width: 16, height: 16 }) + '\n',
    );
  }
}

// Inline copies: <!--px kind member [scale=N] [label=text] [decorative]-->...<!--/px-->
if (existsSync(page)) {
  let n = 0;
  const html = readFileSync(page, 'utf8').replace(/<!--px ([^>]*?)-->[\s\S]*?<!--\/px-->/g, (_, spec) => {
    const [kind, m, ...opts] = spec.trim().split(/\s+/);
    const o = Object.fromEntries(opts.map((x) => (x.includes('=') ? x.split('=') : [x, true])));
    if (kind === 'dither') {
      const [w, h, rx, ry] = m.split('x').map(Number);
      const cv = ditherGlow(w, h, { rx, ry });
      const s = Number(o.scale ?? 6);
      return `<!--px ${spec.trim()}--><svg class="dither-glow" viewBox="0 0 ${w} ${h}" width="${w * s}" height="${h * s}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${cv.render({ glowLo: 'currentColor' })}<g style="color:var(--glow-hi)">${cv.render({ glowHi: 'currentColor' })}</g></svg><!--/px-->`;
    }
    if (kind === 'text') {
      const cv = specimen(m, o.str.replaceAll('_', ' '));
      const s = Number(o.scale ?? 1);
      return `<!--px ${spec.trim()}--><svg viewBox="0 0 ${cv.w} ${cv.h}" width="${cv.w * s}" height="${cv.h * s}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${cv.render({ word: 'currentColor' })}</svg><!--/px-->`;
    }
    const k = KINDS[kind];
    if (!k || !NAMES[m]) throw new Error(`Unknown px marker: ${spec}`);
    const cv = k.draw(m);
    const scale = Number(o.scale ?? 1);
    const id = `px-${kind}-${m}-${++n}`;
    const fills = { ...k.fills(m), word: 'currentColor' };
    const cls = o.class ? ` class="${o.class.replaceAll('+', ' ')}"` : '';
    let body = svg(cv, { title: { id, text: k.title(m) }, fills, width: cv.w * scale, height: cv.h * scale, attrs: cls });
    body = body.replace(' xmlns="http://www.w3.org/2000/svg"', '');
    if (o.decorative) body = body.replace(/ role="img" aria-labelledby="[^"]+"/, ' aria-hidden="true" focusable="false"').replace(/<title[^>]*>.*?<\/title>\n/, '');
    return `<!--px ${spec.trim()}-->${body}<!--/px-->`;
  });
  writeFileSync(page, html);
}
