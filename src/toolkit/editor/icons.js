// Drawn tool icons, one 2px stroke on a 24px box, plus filled orientation icons built from the real shape geometry.
import { shapePath } from '../../brand/index.js';

const stroke = (d) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter"/></svg>`;

export const TOOL_ICONS = {
  cell: stroke('M5 5h14v14H5Z'),
  ring: stroke('M20 4A16 16 0 0 1 4 20V12A8 8 0 0 0 12 4Z'),
  pie: stroke('M20 4A16 16 0 0 1 4 20V4Z'),
  select: stroke('M6 3v16l4.5-4.5 3 6.5 2.6-1.2-3-6.3H19Z'),
  erase: stroke('M9 20 3.5 14.5 13 5l7.5 7.5L13 20ZM8.2 9.8l7.5 7.5M13 20h8'),
};

/** The shape at rotation `rot`, filled, inside its faint 2 x 2 box. */
export function rotIcon(type, rot) {
  const t = type === 'cell' ? 'pie' : type;
  const d = shapePath({ type: t, x: 0, y: 0, size: 2, rot }, 9, [3, 3]);
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1"/><path d="${d}" fill="currentColor"/></svg>`;
}
