// Pure shape helpers for the editor: construction, fit, hit-testing, equality and spoken labels.
import { FIELD_SIZE, SIZE_RANGE, arcOf } from '../../brand/index.js';

export const TOOL_SHAPES = { cell: 'cell', ring: 'ring', pie: 'pie' };
export const TYPE_LABEL = { cell: 'cell', ring: 'ring', pie: 'quarter' };
export const ROT_LABEL = ['centre top left', 'centre top right', 'centre bottom right', 'centre bottom left'];

export const sizeOf = (s) => (s.type === 'cell' ? 1 : s.size);

/** A shape of `type` with its box's top-left at (x, y). */
export function makeShape(type, x, y, size, rot) {
  return type === 'cell' ? { type, x, y } : { type, x, y, size, rot };
}

/** Why a shape cannot sit on the field, or null when it fits. */
export function fitProblem(s) {
  const n = sizeOf(s);
  const what = `${cap(TYPE_LABEL[s.type])}${s.type === 'cell' ? '' : ` size ${n}`}`;
  const right = s.x + n > FIELD_SIZE;
  const bottom = s.y + n > FIELD_SIZE;
  if (right && bottom) return `${what} runs past the right and bottom edges. Move up and left, or pick a smaller size.`;
  if (right) return `${what} runs past the right edge. Move left, or pick a smaller size.`;
  if (bottom) return `${what} runs past the bottom edge. Move up, or pick a smaller size.`;
  return null;
}

export const sameShape = (a, b) =>
  a.type === b.type && a.x === b.x && a.y === b.y && sizeOf(a) === sizeOf(b) && (a.rot ?? 0) === (b.rot ?? 0);

/** Does the shape cover the point (px, py), in field modules? */
export function covers(s, px, py) {
  const n = sizeOf(s);
  if (px < s.x || py < s.y || px > s.x + n || py > s.y + n) return false;
  if (s.type === 'cell') return true;
  const { cx, cy, R, r } = arcOf(s);
  const d = Math.hypot(px - cx, py - cy);
  return d <= R && d >= r;
}

/** Index of the topmost shape at (px, py), or -1. Later shapes draw on top. */
export function topmostAt(shapes, px, py) {
  for (let i = shapes.length - 1; i >= 0; i--) if (covers(shapes[i], px, py)) return i;
  return -1;
}

/** Index of the topmost shape at a module: its centre first, then anywhere inside it. */
export function topmostAtModule(shapes, x, y) {
  const hit = topmostAt(shapes, x + 0.5, y + 0.5);
  if (hit >= 0) return hit;
  for (const [dx, dy] of [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8]]) {
    const i = topmostAt(shapes, x + dx, y + dy);
    if (i >= 0) return i;
  }
  return -1;
}

/** Move a shape by (dx, dy), clamped so it stays on the field. */
export function moved(s, dx, dy) {
  const max = FIELD_SIZE - sizeOf(s);
  return { ...s, x: clamp(s.x + dx, 0, max), y: clamp(s.y + dy, 0, max) };
}

/** Resize a ring or pie, pulling it back onto the field if it would leave. */
export function resized(s, size) {
  if (s.type === 'cell') return s;
  const [lo, hi] = SIZE_RANGE[s.type];
  const n = clamp(size, lo, hi);
  return moved({ ...s, size: n }, 0, 0);
}

export function describe(s) {
  const base = TYPE_LABEL[s.type];
  const at = `at ${s.x}, ${s.y}`;
  return s.type === 'cell' ? `${base} ${at}` : `${base}, size ${s.size}, ${ROT_LABEL[s.rot]}, ${at}`;
}

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const cap = (s) => s[0].toUpperCase() + s.slice(1);
