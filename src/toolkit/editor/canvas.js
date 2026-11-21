// The canvas: the 9 x 9 tile drawn large with the same shapePath/glyphPath the generated files use,
// plus the editing overlays (margin hatch, construction grid, selection, ghost, cursor).
import { TILE, MARGIN, FIELD_SIZE, glyphPath, shapePath, brandColors } from '../../brand/index.js';
import { sizeOf } from './shapes.js';

export const U = 60; // px per module in the canvas viewBox (540 / 9)
const O = [MARGIN * U, MARGIN * U];
const SIDE = TILE * U;

/** Field coordinates (in modules, fractional) of a pointer event over the canvas. */
export function pointerToField(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const v = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { fx: v.x / U - MARGIN, fy: v.y / U - MARGIN };
}

export const inField = (fx, fy) => fx >= 0 && fy >= 0 && fx < FIELD_SIZE && fy < FIELD_SIZE;

const box = (s) => {
  const n = sizeOf(s);
  return `<rect x="${O[0] + s.x * U}" y="${O[1] + s.y * U}" width="${n * U}" height="${n * U}"`;
};

/**
 * view: { brand, palette, showGrid, sel, ghost: { shape, invalid } | null, target: { index, kind } | null, cursor: {x,y} }
 */
export function drawCanvas(svg, view) {
  const { brand, palette, showGrid, sel, ghost, target, cursor } = view;
  const c = brandColors(brand, palette);
  const d = glyphPath(brand.shapes, U, O);
  const inner = FIELD_SIZE * U;
  const parts = [];

  parts.push(`<defs>
    <pattern id="cv-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="${c.field}"/><rect width="3" height="10" fill="${c.glyph}" fill-opacity=".22"/>
    </pattern>
    <clipPath id="cv-glyph"><path d="${d || 'M0 0'}"/></clipPath>
  </defs>`);
  parts.push(`<rect width="${SIDE}" height="${SIDE}" fill="${c.field}"/>`);
  parts.push(`<path class="cv-margin" fill="url(#cv-hatch)" fill-rule="evenodd" d="M0 0H${SIDE}V${SIDE}H0ZM${O[0]} ${O[1]}V${O[1] + inner}H${O[0] + inner}V${O[1]}Z"/>`);

  const gridLines = () => {
    let g = '';
    for (let i = 1; i < FIELD_SIZE; i++) {
      const p = O[0] + i * U;
      g += `M${p} ${O[1]}V${O[1] + inner}M${O[0]} ${p}H${O[0] + inner}`;
    }
    return g;
  };
  if (showGrid) parts.push(`<path d="${gridLines()}" stroke="${c.glyph}" stroke-opacity=".34" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`);
  parts.push(`<rect x="${O[0]}" y="${O[1]}" width="${inner}" height="${inner}" fill="none" stroke="${c.glyph}" stroke-opacity=".55" stroke-width="1" vector-effect="non-scaling-stroke"/>`);

  if (d) parts.push(`<path class="cv-glyph" fill="${c.glyph}" d="${d}"/>`);
  if (d && showGrid) parts.push(`<path clip-path="url(#cv-glyph)" d="${gridLines()}" stroke="${c.field}" stroke-opacity=".45" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`);

  // Hover target for select / erase: a two-tone outline that reads on any field.
  if (target && target.index !== sel) {
    const s = brand.shapes[target.index];
    const pd = shapePath(s, U, O);
    parts.push(
      `<g class="cv-target cv-${target.kind}" fill="none" vector-effect="non-scaling-stroke">` +
        `<path d="${pd}" stroke="#FFFFFF" stroke-width="5"/><path d="${pd}" stroke="#141414" stroke-width="2.5" ${target.kind === 'erase' ? 'stroke-dasharray="8 6"' : ''}/>` +
        `</g>`,
    );
  }

  if (sel >= 0 && brand.shapes[sel]) {
    const s = brand.shapes[sel];
    const pd = shapePath(s, U, O);
    parts.push(
      `<g class="cv-sel" fill="none">` +
        `${box(s)} stroke="#FFFFFF" stroke-width="4"/>${box(s)} stroke="#141414" stroke-width="2" stroke-dasharray="10 6"/>` +
        `<path d="${pd}" stroke="#FFFFFF" stroke-width="6"/><path d="${pd}" stroke="#141414" stroke-width="3"/>` +
        `</g>`,
    );
  }

  if (ghost) {
    const pd = shapePath(ghost.shape, U, O);
    parts.push(
      ghost.invalid
        ? `<g class="cv-ghost cv-invalid" fill="none"><path d="${pd}" stroke="#FFFFFF" stroke-width="5"/><path d="${pd}" stroke="#141414" stroke-width="2.5" stroke-dasharray="6 6"/>` +
            `<path d="M${O[0] + cursor.x * U + 14} ${O[1] + cursor.y * U + 14}l32 32m0-32-32 32" stroke="#FFFFFF" stroke-width="7"/><path d="M${O[0] + cursor.x * U + 14} ${O[1] + cursor.y * U + 14}l32 32m0-32-32 32" stroke="#141414" stroke-width="3.5"/></g>`
        : `<g class="cv-ghost"><path d="${pd}" fill="${c.glyph}" fill-opacity=".5"/><path d="${pd}" fill="none" stroke="${c.glyph}" stroke-width="2"/>` +
            `<g fill="none">${box(ghost.shape)} stroke="#FFFFFF" stroke-width="3" stroke-opacity=".9"/>${box(ghost.shape)} stroke="#141414" stroke-width="1.5" stroke-dasharray="4 4"/></g></g>`,
    );
  }

  parts.push(
    `<g class="cv-cursor" fill="none"><rect x="${O[0] + cursor.x * U + 2}" y="${O[1] + cursor.y * U + 2}" width="${U - 4}" height="${U - 4}" stroke="#FFFFFF" stroke-width="6"/>` +
      `<rect x="${O[0] + cursor.x * U + 2}" y="${O[1] + cursor.y * U + 2}" width="${U - 4}" height="${U - 4}" stroke="#141414" stroke-width="3"/></g>`,
  );

  svg.innerHTML = parts.join('');
}
