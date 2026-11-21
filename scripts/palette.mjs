// The field-color collection: prints every entry with its contrast ratios and exits non-zero on any gate miss.
//   node scripts/palette.mjs           print and check brands/palette.json
//   node scripts/palette.mjs --write   regenerate brands/palette.json from SPEC below, then print and check
//
// Method: every field sits at OKLCH L 0.60 with chroma 0.15 (clamped to the sRGB gamut at its hue),
// so the tiles carry equal visual weight. pale (L 0.95, C 0.035) and deep (L 0.28, C 0.07) keep the hue.
// One blue only: Cornflower at 260deg, the hue between Teal and Iris that clears the 0.1 OKLab gate from both
// WordPress cerulean and Gutenberg blue. Every other blue at this lightness falls inside that gate (WordPress territory).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatHex, clampChroma, converter, parse } from 'culori';
import { validatePalette, entryChecks, WHITE, GRAPHITE } from '../src/brand/palette.js';
import { BASE, fromField, contrastChecks } from '../src/brand/theme.js';

const file = resolve(import.meta.dirname, '../brands/palette.json');
const FIELD = { l: 0.6, c: 0.15 };
const PALE = { l: 0.95, c: 0.035 };
const DEEP = { l: 0.28, c: 0.07 };
const SPEC = [
  ['rose', 'Rose', 0],
  ['vermilion', 'Vermilion', 32],
  ['copper', 'Copper', 58],
  ['ochre', 'Ochre', 84],
  ['olive', 'Olive', 108],
  ['fern', 'Fern', 142],
  ['jade', 'Jade', 162],
  ['teal', 'Teal', 188],
  ['cornflower', 'Cornflower', 260],
  ['iris', 'Iris', 288],
  ['violet', 'Violet', 314],
  ['plum', 'Plum', 338],
];

const hex = (l, c, h) => formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch')).toUpperCase();

if (process.argv.includes('--write')) {
  const palette = SPEC.map(([id, name, h]) => ({ id, name, field: hex(FIELD.l, FIELD.c, h), pale: hex(PALE.l, PALE.c, h), deep: hex(DEEP.l, DEEP.c, h) }));
  writeFileSync(file, '[\n' + palette.map((e) => '  ' + JSON.stringify(e).replace(/([,:])"/g, '$1 "').replace(/^\{/, '{ ').replace(/\}$/, ' }')).join(',\n') + '\n]\n');
  console.log(`wrote ${file}`);
}

const palette = JSON.parse(readFileSync(file, 'utf8'));
const toOklch = converter('oklch');
const f2 = (n) => n.toFixed(2).padStart(5);
console.log(`\n${'id'.padEnd(10)} ${'name'.padEnd(10)} field    L     C     h    | white graph | pale    on-f  | deep    on-f  | themes`);
let themeFailures = 0;
for (const e of palette) {
  const o = toOklch(parse(e.field));
  const r = Object.fromEntries(entryChecks(e).map((c) => [c.label, c.value]));
  // Every entry, with either glyph tone, must yield light and dark themes that pass the contrast gate.
  const bad = ['pale', 'deep'].flatMap((g) => {
    const t = fromField(e.field, e[g]);
    return ['light', 'dark'].flatMap((m) => contrastChecks({ ...BASE.modes[m], ...t[m] }).filter((k) => !k.pass));
  });
  themeFailures += bad.length;
  console.log(
    `${e.id.padEnd(10)} ${e.name.padEnd(10)} ${e.field} ${o.l.toFixed(3)} ${o.c.toFixed(3)} ${o.h.toFixed(0).padStart(4)} | ${f2(r['field vs white'])} ${f2(r['field vs graphite'])} | ${e.pale} ${f2(r['pale on field'])} | ${e.deep} ${f2(r['deep on field'])} | ${bad.length ? `${bad.length} fail` : 'pass'}`,
  );
}
console.log(`\nGates: field vs ${WHITE} and ${GRAPHITE} >= 3, pale and deep on field >= 3, field L 0.56..0.62, glyph hue drift <= 12deg, OKLab distance >= 0.1 from avoided brand colors and >= 0.045 between any two fields.`);
const { ok, errors } = validatePalette(palette);
for (const e of errors) console.error(`✗ ${e}`);
if (!ok || themeFailures) {
  console.error(`\n${errors.length + themeFailures} palette failure(s).`);
  process.exit(1);
}
console.log(`✓ ${palette.length} colors pass every gate`);
