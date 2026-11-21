// Letterpress Stationery. Light: cool cotton-white stock, deep inks. Dark: black card stock, pale foils.
const paper = {
  light: {
    base100: 'oklch(0.988 0.003 255)',
    base200: 'oklch(0.965 0.005 255)',
    base300: 'oklch(0.918 0.008 258)',
    baseContent: 'oklch(0.22 0.022 268)',
    muted: 'oklch(0.43 0.022 265)',
    neutral: 'oklch(0.24 0.02 268)',
    neutralContent: 'oklch(0.975 0.004 255)',
    info: 'oklch(0.44 0.085 245)',
    infoContent: 'oklch(0.985 0.004 255)',
    success: 'oklch(0.42 0.085 155)',
    successContent: 'oklch(0.985 0.004 255)',
    warning: 'oklch(0.48 0.095 70)',
    warningContent: 'oklch(0.99 0.004 85)',
    error: 'oklch(0.47 0.16 22)',
    errorContent: 'oklch(0.99 0.004 255)',
  },
  dark: {
    base100: 'oklch(0.165 0.006 270)',
    base200: 'oklch(0.2 0.008 270)',
    base300: 'oklch(0.255 0.01 270)',
    baseContent: 'oklch(0.93 0.008 260)',
    muted: 'oklch(0.73 0.014 262)',
    neutral: 'oklch(0.86 0.01 262)',
    neutralContent: 'oklch(0.18 0.008 270)',
    info: 'oklch(0.8 0.07 240)',
    infoContent: 'oklch(0.18 0.01 260)',
    success: 'oklch(0.8 0.08 155)',
    successContent: 'oklch(0.18 0.01 160)',
    warning: 'oklch(0.84 0.09 80)',
    warningContent: 'oklch(0.2 0.02 75)',
    error: 'oklch(0.78 0.1 22)',
    errorContent: 'oklch(0.18 0.015 20)',
  },
};

// Each Womp gets one ink (light) and one foil (dark). secondary = graphite rule ink; accent = lighter wash of the ink.
const ink = (h, c, foilC) => ({
  light: {
    primary: `oklch(0.33 ${c} ${h})`,
    primaryContent: 'oklch(0.988 0.003 255)',
    secondary: 'oklch(0.42 0.025 262)',
    secondaryContent: 'oklch(0.988 0.003 255)',
    accent: `oklch(0.5 ${c * 0.85} ${h})`,
    accentContent: 'oklch(0.988 0.003 255)',
  },
  dark: {
    primary: `oklch(0.84 ${foilC} ${h})`,
    primaryContent: 'oklch(0.17 0.008 270)',
    secondary: 'oklch(0.72 0.015 262)',
    secondaryContent: 'oklch(0.17 0.008 270)',
    accent: `oklch(0.74 ${foilC * 1.3} ${h})`,
    accentContent: 'oklch(0.17 0.008 270)',
  },
});

export default {
  defaultMode: 'light',
  shape: {
    '--radius-selector': '0.125rem',
    '--radius-field': '0.125rem',
    '--radius-box': '0.1875rem',
    '--size-selector': '0.25rem',
    '--size-field': '0.25rem',
    '--border': '1px',
    '--depth': '0',
    '--noise': '0',
  },
  modes: paper,
  // Muted carries lead paragraphs and captions here, so it is held to the AAA body-text bar.
  checks: {
    light: [
      ['muted (reading) on base-100', 'muted', 'base100', 7],
      ['muted (reading) on base-200', 'muted', 'base200', 7],
    ],
    dark: [
      ['muted (reading) on base-100', 'muted', 'base100', 7],
      ['muted (reading) on base-200', 'muted', 'base200', 7],
    ],
  },
  brands: {
    womp: ink(278, 0.12, 0.06),
    blog: ink(162, 0.075, 0.07),
    wiki: ink(342, 0.11, 0.065),
  },
  extra: {
    light: {
      '--rule': 'oklch(0.22 0.022 268 / 0.28)',
      '--rule-strong': 'oklch(0.22 0.022 268 / 0.55)',
      '--deboss-hi': 'oklch(1 0 0 / 0.95)',
      '--deboss-lo': 'oklch(0.3 0.03 265 / 0.16)',
      '--card': 'oklch(0.995 0.002 255)',
      '--card-edge': 'oklch(0.3 0.03 265 / 0.09)',
      '--table': 'oklch(0.94 0.007 258)',
    },
    dark: {
      '--rule': 'oklch(0.93 0.008 260 / 0.2)',
      '--rule-strong': 'oklch(0.93 0.008 260 / 0.42)',
      '--deboss-hi': 'oklch(1 0 0 / 0.07)',
      '--deboss-lo': 'oklch(0 0 0 / 0.7)',
      '--card': 'oklch(0.185 0.007 270)',
      '--card-edge': 'oklch(0 0 0 / 0.55)',
      '--table': 'oklch(0.12 0.005 270)',
    },
  },
};
