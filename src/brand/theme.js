// DaisyUI theme tokens for a brand, the WCAG contrast gate, and the CSS theme block. Isomorphic.
//
// Neutrals and status colors are the Modular identity's: white and ink (light), graphite and paper (dark).
// Each brand contributes only its field: fromField() derives a text-safe primary for each mode.
import { parse, converter, formatHex, wcagContrast, clampChroma } from 'culori';
import { brandColors } from './palette.js';

export const INK = '#141414';
export const PAPER = '#FFFFFF';
export const PAPER_WARM = '#EEECE6';
const LIGHT_BG = ['#FFFFFF', '#F3F2EE'];
const DARK_BG = ['#1D1E20', '#25272A'];

/** Shared theme base: shape tokens, per-mode neutrals and status colors, page-level extra vars. */
export const BASE = {
  defaultMode: 'light',
  shape: {
    '--radius-selector': '0rem',
    '--radius-field': '0rem',
    '--radius-box': '0rem',
    '--size-selector': '0.25rem',
    '--size-field': '0.25rem',
    '--border': '2px',
    '--depth': '0',
    '--noise': '0',
  },
  modes: {
    light: {
      base100: '#FFFFFF',
      base200: '#F3F2EE',
      base300: '#E4E2DB',
      baseContent: INK,
      muted: '#57554F',
      neutral: INK,
      neutralContent: '#FFFFFF',
      info: '#3E4A52',
      infoContent: '#FFFFFF',
      success: '#1D6B3A',
      successContent: '#FFFFFF',
      warning: '#8F6400',
      warningContent: '#FFFFFF',
      error: '#B3261E',
      errorContent: '#FFFFFF',
    },
    dark: {
      base100: '#1D1E20',
      base200: '#25272A',
      base300: '#303236',
      baseContent: PAPER_WARM,
      muted: '#A9A69E',
      neutral: PAPER_WARM,
      neutralContent: INK,
      info: '#B8C3CA',
      infoContent: INK,
      success: '#6CC38A',
      successContent: INK,
      warning: '#F2B53A',
      warningContent: INK,
      error: '#FF7B6B',
      errorContent: INK,
    },
  },
  extra: {
    light: { '--grid': 'rgb(20 20 20 / 0.09)', '--grid-strong': 'rgb(20 20 20 / 0.22)', '--rule': INK },
    dark: { '--grid': 'rgb(238 236 230 / 0.08)', '--grid-strong': 'rgb(238 236 230 / 0.2)', '--rule': PAPER_WARM },
  },
};

const toOklch = converter('oklch');

// Keep the field's hue and chroma; step lightness (down on white, up on graphite)
// until the color clears 4.5:1 on both page grounds, with a small margin.
function textSafe(field, grounds, dir) {
  const c = toOklch(parse(field));
  for (let l = c.l; l >= 0 && l <= 1; l += dir * 0.005) {
    const hex = formatHex(clampChroma({ ...c, l }, 'oklch'));
    if (grounds.every((g) => wcagContrast(hex, g) >= 4.6)) return hex.toUpperCase();
  }
  throw new Error(`No text-safe step for ${field}`);
}
const onColor = (bg) => (wcagContrast(bg, INK) >= wcagContrast(bg, PAPER) ? INK : PAPER);

/**
 * A brand is one field color in: this derives its light and dark brand tokens.
 * `glyph` is the brand's glyph color (exposed as --field-glyph for pages that draw the tile with CSS vars).
 */
export function fromField(field, glyph) {
  const pl = textSafe(field, LIGHT_BG, -1);
  const pd = textSafe(field, DARK_BG, +1);
  const fieldVars = { '--field': field, '--field-glyph': glyph };
  return {
    light: { primary: pl, primaryContent: onColor(pl), secondary: INK, secondaryContent: PAPER, accent: '#8F6400', accentContent: PAPER },
    dark: { primary: pd, primaryContent: onColor(pd), secondary: PAPER_WARM, secondaryContent: INK, accent: '#F2B53A', accentContent: INK },
    extra: { light: fieldVars, dark: { ...fieldVars } },
  };
}

/** Brand-level tokens { light, dark, extra } for a brand source object. */
export function brandTheme(brand, palette) {
  const c = brandColors(brand, palette);
  return fromField(c.field, c.glyph);
}

/** Full flat color map for one mode: base neutrals merged with the brand's tokens. */
export function themeColors(brand, palette, mode) {
  return { ...BASE.modes[mode], ...brandTheme(brand, palette)[mode] };
}

/** DaisyUI theme name for a brand and mode. */
export const themeName = (slug, mode) => `wompland-${slug}-${mode}`;

const ROLES = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'];
export const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/**
 * The contrast gate (PRODUCT.md: WCAG 2.2 AA + AAA body text) for one flat color map.
 *   base-content on base-100/200/300 ............ >= 7    (AAA body text)
 *   muted on base-100/200 ......................... >= 4.5 (secondary text, placeholders)
 *   <role>-content on <role> ...................... >= 4.5 (button / badge / alert text)
 *   primary on base-100/200 ....................... >= 4.5 (links, outline buttons, text-primary)
 *   secondary, accent, status colors on base-100 .. >= 3   (non-text UI parts: borders, icons, toggles)
 *   extra: [[label, fg, bg, min]] ................. identity-specific pairs; fg/bg are token keys or literal colors
 * Returns [{ label, fg, bg, ratio, min, pass }].
 */
export function contrastChecks(c, extra = []) {
  const checks = [];
  const cc = (v) => c[v] ?? v;
  const check = (label, fg, bg, min) => {
    const a = parse(cc(fg));
    const b = parse(cc(bg));
    if (!a || !b) throw new Error(`Unparseable color: ${!a ? cc(fg) : cc(bg)}`);
    const r = wcagContrast(a, b);
    checks.push({ label, fg: cc(fg), bg: cc(bg), ratio: Math.round(r * 100) / 100, min, pass: r >= min });
  };
  for (const bg of ['base100', 'base200', 'base300']) check(`base-content on ${kebab(bg)}`, 'baseContent', bg, 7);
  for (const bg of ['base100', 'base200']) check(`muted on ${kebab(bg)}`, 'muted', bg, 4.5);
  for (const role of ROLES) check(`${role}-content on ${role}`, `${role}Content`, role, 4.5);
  for (const bg of ['base100', 'base200']) check(`primary on ${kebab(bg)}`, 'primary', bg, 4.5);
  for (const role of ['secondary', 'accent', 'info', 'success', 'warning', 'error']) check(`${role} on base-100`, role, 'base100', 3);
  for (const [label, fg, bg, min] of extra) check(label, fg, bg, min);
  return checks;
}

/** One `@plugin "daisyui/theme"` block. `vars` is extra custom properties ({ '--x': value }). */
export function themeBlock({ name, mode, colors, shape = BASE.shape, vars = {}, isDefault = false, prefersDark = false }) {
  const lines = [
    ...['base100', 'base200', 'base300', 'baseContent', ...ROLES.flatMap((r) => [r, `${r}Content`])].map(
      (k) => `  --color-${kebab(k).replace(/^base(\d)/, 'base-$1')}: ${colors[k]};`,
    ),
    `  --muted: ${colors.muted};`,
    ...Object.entries(shape).map(([k, v]) => `  ${k}: ${v};`),
    ...Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`),
  ];
  return `@plugin "daisyui/theme" {\n  name: "${name}";\n  default: ${isDefault};\n  prefersdark: ${prefersDark};\n  color-scheme: ${mode};\n${lines.join('\n')}\n}`;
}

/**
 * Component fixes the theme variables cannot reach. DaisyUI draws inactive tabs at 50% of
 * base-content (about 3.5:1); --muted is gated at 4.5:1 on base-100 and base-200.
 * Unlayered, so it wins over DaisyUI's layered rules; hover keeps DaisyUI's full base-content.
 */
export const COMPONENT_CSS = `.tabs > .tab:not(:hover, .tab-active, [aria-selected="true"], [aria-current]:not([aria-current="false"], [aria-current=""]), .tab-disabled, [disabled]) { color: var(--muted); }`;

/**
 * A brand's two theme blocks, ready to paste into an app's CSS (after `@plugin "daisyui"`).
 * Light is the default theme, dark is prefersdark. Throws if either mode fails the contrast gate.
 */
export function brandThemeCSS(brand, palette) {
  const t = brandTheme(brand, palette);
  return ['light', 'dark']
    .map((mode) => {
      const colors = { ...BASE.modes[mode], ...t[mode] };
      const bad = contrastChecks(colors).filter((k) => !k.pass);
      if (bad.length) throw new Error(`${themeName(brand.slug, mode)} fails: ${bad.map((k) => `${k.label} ${k.ratio}`).join(', ')}`);
      return themeBlock({ name: themeName(brand.slug, mode), mode, colors, vars: t.extra[mode], isDefault: mode === 'light', prefersDark: mode === 'dark' });
    })
    .concat(`/* Inactive tabs use the theme's muted color so they pass 4.5:1. */\n${COMPONENT_CSS}`)
    .join('\n\n');
}
