// Pixel geometry for the Webring Badge Club identity. Every mark is cells on an integer grid.
// A drawing is a Canvas of cells keyed by a paint name; render() maps paint names to fills,
// so the same geometry ships as fixed-color files and as themeable inline SVG.

const rows = (s) => s.trim().split('\n').map((r) => r.trim());

// Bold display alphabet for lockups: cap height 10, x-height 7, descender 3, 2-cell stems.
// Rows 0..12. Row 9 is the baseline row. '#' = ink.
const BOLD = {
  W: `##......##|##......##|##......##|##......##|##..##..##|##..##..##|##..##..##|##.####.##|.###..###.|.##....##.`,
  L: `##.....|##.....|##.....|##.....|##.....|##.....|##.....|##.....|#######|#######`,
  o: `......|......|......|.####.|##..##|##..##|##..##|##..##|##..##|.####.`,
  m: `..........|..........|..........|#########.|##..##..##|##..##..##|##..##..##|##..##..##|##..##..##|##..##..##`,
  p: `......|......|......|#####.|##..##|##..##|##..##|##..##|##..##|#####.|##....|##....|##....`,
  a: `......|......|......|.####.|....##|.#####|##..##|##..##|##..##|.#####`,
  n: `......|......|......|#####.|##..##|##..##|##..##|##..##|##..##|##..##`,
  d: `....##|....##|....##|.#####|##..##|##..##|##..##|##..##|##..##|.#####`,
  b: `##....|##....|##....|#####.|##..##|##..##|##..##|##..##|##..##|#####.`,
  l: `##.|##.|##.|##.|##.|##.|##.|##.|##.|.##`,
  g: `......|......|......|.#####|##..##|##..##|##..##|##..##|##..##|.#####|....##|....##|#####.`,
  i: `##|##|..|##|##|##|##|##|##|##`,
  k: `##....|##....|##....|##..##|##.##.|####..|####..|##.##.|##..##|##..##`,
  w: `..........|..........|..........|##..##..##|##..##..##|##..##..##|##..##..##|##..##..##|##..##..##|.###..###.`,
  s: `......|......|......|.#####|##....|##....|.####.|....##|....##|#####.`,
  t: `....|##..|##..|####|##..|##..|##..|##..|##..|.###`,
  y: `......|......|......|##..##|##..##|##..##|##..##|##..##|##..##|.#####|....##|....##|#####.`,
  u: `......|......|......|##..##|##..##|##..##|##..##|##..##|##..##|.#####`,
  r: `......|......|......|##.###|####..|###...|##....|##....|##....|##....`,
};

// Tiny alphabet for the 88x31 badge name at 1x: x-height 5, ascender 2, descender 2. Rows 0..8.
const TINY = {
  W: `#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.`,
  L: `#...|#...|#...|#...|#...|#...|####`,
  o: `....|....|.##.|#..#|#..#|#..#|.##.`,
  m: `.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#`,
  p: `....|....|###.|#..#|#..#|#..#|###.|#...|#...`,
  a: `....|....|.##.|...#|.###|#..#|.###`,
  n: `....|....|###.|#..#|#..#|#..#|#..#`,
  d: `...#|...#|.###|#..#|#..#|#..#|.###`,
  b: `#...|#...|###.|#..#|#..#|#..#|###.`,
  l: `#|#|#|#|#|#|#`,
  g: `....|....|.###|#..#|#..#|#..#|.###|...#|.##.`,
  i: `#|.|#|#|#|#|#`,
  k: `#...|#...|#..#|#.#.|##..|#.#.|#..#`,
  s: `....|....|.###|#...|.##.|...#|###.`,
  t: `.#.|.#.|###|.#.|.#.|.#.|..#`,
  y: `....|....|#..#|#..#|#..#|#..#|.###|...#|.##.`,
  u: `....|....|#..#|#..#|#..#|#..#|.###`,
  r: `...|...|#.#|##.|#..|#..|#..`,
  w: `.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.`,
  ' ': `...|...|...|...|...|...|...`,
};

// Micro caps for the badge's second line: 5 rows.
const MICRO = {
  A: `.#.|#.#|###|#.#|#.#`, B: `##.|#.#|##.|#.#|##.`, E: `###|#..|##.|#..|###`, G: `.##|#..|#.#|#.#|.##`,
  H: `#.#|#.#|###|#.#|#.#`, I: `#|#|#|#|#`, J: `..#|..#|..#|#.#|.#.`, M: `#...#|##.##|#.#.#|#...#|#...#`,
  N: `#..#|##.#|#.##|#..#|#..#`, O: `.#.|#.#|#.#|#.#|.#.`, P: `##.|#.#|##.|#..|#..`, R: `##.|#.#|##.|#.#|#.#`,
  S: `.##|#..|.#.|..#|##.`, T: `###|.#.|.#.|.#.|.#.`, U: `#.#|#.#|#.#|#.#|###`, Y: `#.#|#.#|.#.|.#.|.#.`,
  ' ': `..|..|..|..|..`,
};

const parse = (src) => src.split('|');

// 12x12 member glyphs. '#' = ink, 'o' = paper, '.' = tile color.
export const GLYPHS = {
  womp: rows(`
    ............
    .##......##.
    .##......##.
    .##......##.
    .##......##.
    .##..##..##.
    .##..##..##.
    .##..##..##.
    .##.####.##.
    ..###..###..
    ..##....##..
    ............`),
  blog: rows(`
    ..........##
    .........#oo
    ........#oo#
    #######.#oo#
    #ooooo.#oo#.
    #o###.#oo#..
    #oooo.###...
    #o##.###....
    #ooo.##o....
    #ooooooo#...
    #oooooooo#..
    ##########..`),
  wiki: rows(`
    ............
    ##.##..##.##
    #..#....#..#
    #..#....#..#
    #..#....#..#
    #..#.##.#..#
    #..#.##.#..#
    #..#....#..#
    #..#....#..#
    #..#....#..#
    ##.##..##.##
    ............`),
  list: rows(`
    ............
    ####........
    #oo#.#######
    #oo#........
    ####........
    ............
    ####........
    #o##.#######
    ###o........
    ####........
    ............
    ............`),
  your: rows(`
    o.o.o.o.o.o.
    ............
    o..........o
    .....oo.....
    o....oo.....
    ...oooooo..o
    o..oooooo...
    .....oo.....
    o....oo....o
    ............
    o..........o
    .o.o.o.o.o.o`),
};

export class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = new Map();
  }
  set(x, y, paint) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.cells.set(y * this.w + x, paint);
  }
  rect(x, y, w, h, paint) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, paint);
  }
  // Stamp a bitmap: map from char to paint name; unmapped chars are skipped.
  stamp(bitmap, x, y, map, scale = 1) {
    bitmap.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (map[ch]) this.rect(x + i * scale, y + j * scale, scale, scale, map[ch]);
      }),
    );
  }
  // One <path> per paint with horizontal runs merged.
  render(fills) {
    const byPaint = {};
    for (let y = 0; y < this.h; y++) {
      let x = 0;
      while (x < this.w) {
        const p = this.cells.get(y * this.w + x);
        if (!p) {
          x++;
          continue;
        }
        let run = 1;
        while (x + run < this.w && this.cells.get(y * this.w + x + run) === p) run++;
        (byPaint[p] ??= []).push(`M${x} ${y}h${run}v1h-${run}z`);
        x += run;
      }
    }
    return Object.entries(byPaint)
      .filter(([p]) => fills[p] && fills[p] !== 'none')
      .map(([p, d]) => `<path fill="${fills[p]}" d="${d.join('')}"/>`)
      .join('\n');
  }
}

function textWidth(alpha, str, gap) {
  return [...str].reduce((n, ch, i) => n + parse(alpha[ch])[0].length + (i ? gap : 0), 0);
}

function drawText(cv, alpha, str, x, y, paintFor, gap) {
  let cx = x;
  [...str].forEach((ch, i) => {
    const bm = parse(alpha[ch]);
    cv.stamp(bm, cx, y, { '#': paintFor(i) });
    cx += bm[0].length + gap;
  });
  return cx - gap;
}

// The member tile: 16x16, 1-cell bevel (hi top/left, lo bottom/right), glyph at (2,2).
export function drawTile(cv, member, x = 0, y = 0) {
  cv.rect(x, y, 16, 16, 'fill');
  cv.rect(x, y, 16, 1, 'hi');
  cv.rect(x, y, 1, 16, 'hi');
  cv.rect(x, y + 15, 16, 1, 'lo');
  cv.rect(x + 15, y, 1, 16, 'lo');
  cv.stamp(GLYPHS[member], x + 2, y + 2, { '#': 'ink', o: 'paper' });
}

export const BOLD_GAP = 2;
export const wordWidth = (name) => textWidth(BOLD, name, BOLD_GAP);

export function drawWord(cv, name, x, y, jobPaint = 'word', wompPaint = 'word') {
  const at = name.indexOf('Womp');
  return drawText(cv, BOLD, name, x, y, (i) => (i >= at && i < at + 4 ? wompPaint : jobPaint), BOLD_GAP);
}

// Horizontal lockup: tile + wordmark. Cap top aligns 3 cells below the tile top so the cap band centers on the tile.
export function horizontal(member, name) {
  const w = 16 + 6 + wordWidth(name);
  const cv = new Canvas(w, 16);
  drawTile(cv, member);
  drawWord(cv, name, 22, 3);
  return cv;
}

// Stacked lockup: tile drawn at 2x over the wordmark.
export function stacked(member, name) {
  const ww = wordWidth(name);
  const w = Math.max(ww, 32);
  const cv = new Canvas(w, 32 + 6 + 13);
  const t = new Canvas(16, 16);
  drawTile(t, member);
  const tx = Math.floor((w - 32) / 2);
  for (const [k, p] of t.cells) cv.rect(tx + (k % 16) * 2, Math.floor(k / 16) * 2, 2, 2, p);
  drawWord(cv, name, Math.floor((w - ww) / 2), 38);
  return cv;
}

export function mark(member) {
  const cv = new Canvas(16, 16);
  drawTile(cv, member);
  return cv;
}

// The 88x31 member badge.
// Frame: 1-cell ink border, 1-cell bevel inside it, panel fill, 16x16 tile at (6,7), name + micro line centered on the right.
export const BADGE_LINE = { womp: 'RING HOST', blog: 'RING MEMBER', wiki: 'RING MEMBER', list: 'RING MEMBER', your: 'JOIN THE RING' };

export function badge(member, name) {
  const cv = new Canvas(88, 31);
  cv.rect(0, 0, 88, 31, 'frame');
  cv.rect(1, 1, 86, 29, 'panel');
  cv.rect(1, 1, 86, 1, 'panelHi');
  cv.rect(1, 1, 1, 29, 'panelHi');
  cv.rect(1, 29, 86, 1, 'panelLo');
  cv.rect(86, 1, 1, 29, 'panelLo');
  drawTile(cv, member, 6, 7);
  const area = { x: 26, w: 84 - 26 };
  const nw = textWidth(TINY, name, 1);
  const at = name.indexOf('Womp');
  drawText(cv, TINY, name, area.x + Math.floor((area.w - nw) / 2), 7, (i) => (i >= at && i < at + 4 ? 'paper' : 'name'), 1);
  const line = BADGE_LINE[member];
  const lw = textWidth(MICRO, line, 1);
  drawText(cv, MICRO, line, area.x + Math.floor((area.w - lw) / 2), 19, () => 'micro', 1);
  return cv;
}

export function svg(cv, { title, fills, width, height, attrs = '' }) {
  const w = width ?? cv.w;
  const h = height ?? cv.h;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cv.w} ${cv.h}" width="${w}" height="${h}" shape-rendering="crispEdges" role="img" aria-labelledby="${title.id}"${attrs}>\n<title id="${title.id}">${title.text}</title>\n${cv.render(fills)}\n</svg>`;
}

// A line of either alphabet, for the type specimen.
export function specimen(which, str) {
  const alpha = which === 'bold' ? BOLD : which === 'tiny' ? TINY : MICRO;
  const gap = which === 'bold' ? BOLD_GAP : 1;
  const h = which === 'bold' ? 13 : which === 'tiny' ? 9 : 5;
  const cv = new Canvas(textWidth(alpha, str, gap), h);
  drawText(cv, alpha, str, 0, 0, () => 'word', gap);
  return cv;
}

// Ordered dither glow: an 8x8 Bayer matrix thresholded against an elliptical falloff.
const BAYER8 = (() => {
  const m = [[0]];
  let b = m;
  for (let n = 1; n < 8; n *= 2) {
    const next = [];
    for (let y = 0; y < n * 2; y++) {
      next.push([]);
      for (let x = 0; x < n * 2; x++) {
        const q = (y < n ? 0 : 2) + (x < n ? 0 : 1);
        next[y].push(4 * b[y % n][x % n] + [0, 2, 3, 1][q]);
      }
    }
    b = next;
  }
  return b;
})();

export function ditherGlow(w, h, { rx, ry, peak = 0.9 }) {
  const cv = new Canvas(w, h);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const r = Math.hypot((x - cx) / rx, (y - cy) / ry);
      const d = Math.max(0, 1 - r) ** 1.4 * peak;
      const t = (BAYER8[y % 8][x % 8] + 0.5) / 64;
      if (t < d) cv.set(x, y, t < d - 0.45 ? 'glowHi' : 'glowLo');
    }
  return cv;
}
