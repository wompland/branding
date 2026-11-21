// Seed Packet Allotment tokens.
// Every neutral on the page is one of the 11 soil steps below; no other greys exist.
// Packet inks are flat lithographic colors: beet (WompLand), carrot (blogWomp), pea (wikiWomp).

export const soil = [
  'oklch(0.984 0.004 95)', // 0  seed paper
  'oklch(0.953 0.007 85)', // 1
  'oklch(0.905 0.011 75)', // 2
  'oklch(0.830 0.015 68)', // 3
  'oklch(0.715 0.019 62)', // 4
  'oklch(0.600 0.022 58)', // 5
  'oklch(0.500 0.024 56)', // 6
  'oklch(0.410 0.024 54)', // 7
  'oklch(0.320 0.021 52)', // 8
  'oklch(0.250 0.017 50)', // 9
  'oklch(0.195 0.013 48)', // 10 deep soil
];

// The packet ink pool. Every Womp, present or future, takes exactly one of these.
// Each ink is pre-gated: packet text on the field reaches 7:1 in both modes (see `checks` below).
export const packets = {
  light: {
    beet: { ink: 'oklch(0.465 0.190 358)', on: soil[0] },
    carrot: { ink: 'oklch(0.735 0.160 52)', on: soil[10] },
    pea: { ink: 'oklch(0.425 0.120 148)', on: soil[0] },
    borage: { ink: 'oklch(0.445 0.130 285)', on: soil[0] },
    squash: { ink: 'oklch(0.790 0.150 85)', on: soil[10] },
    kale: { ink: 'oklch(0.425 0.090 200)', on: soil[0] },
  },
  dark: {
    beet: { ink: 'oklch(0.750 0.160 358)', on: soil[10] },
    carrot: { ink: 'oklch(0.745 0.160 52)', on: soil[10] },
    pea: { ink: 'oklch(0.715 0.120 148)', on: soil[10] },
    borage: { ink: 'oklch(0.735 0.120 285)', on: soil[10] },
    squash: { ink: 'oklch(0.800 0.140 85)', on: soil[10] },
    kale: { ink: 'oklch(0.715 0.090 200)', on: soil[10] },
  },
};
export const POOL = {
  beet: 'WompLand',
  carrot: 'blogWomp',
  pea: 'wikiWomp',
  borage: 'open (shown as listWomp)',
  squash: 'open',
  kale: 'open',
};

const ink = {
  light: {
    beet: 'oklch(0.470 0.190 358)',
    carrot: 'oklch(0.530 0.150 45)',
    pea: 'oklch(0.470 0.110 148)',
  },
  dark: {
    beet: 'oklch(0.740 0.150 355)',
    carrot: 'oklch(0.770 0.140 55)',
    pea: 'oklch(0.770 0.120 148)',
  },
};

const brand = (primary, secondary, accent, mode) => {
  const on = mode === 'light' ? soil[0] : soil[10];
  return {
    primary: ink[mode][primary],
    primaryContent: on,
    secondary: ink[mode][secondary],
    secondaryContent: on,
    accent: ink[mode][accent],
    accentContent: on,
  };
};

const packetVars = (name, mode) => ({
  '--packet': packets[mode][name].ink,
  '--packet-content': packets[mode][name].on,
});

const rampVars = Object.fromEntries(soil.map((v, i) => [`--soil-${i}`, v]));
const inkVars = (mode) =>
  Object.fromEntries(
    Object.entries(packets[mode]).flatMap(([k, v]) => [
      [`--ink-${k}`, v.ink],
      [`--ink-${k}-content`, v.on],
    ]),
  );

export default {
  defaultMode: 'light',
  shape: {
    '--radius-selector': '0.25rem',
    '--radius-field': '0.25rem',
    '--radius-box': '0.375rem',
    '--size-selector': '0.25rem',
    '--size-field': '0.25rem',
    '--border': '1.5px',
    '--depth': '0',
    '--noise': '0',
  },
  modes: {
    light: {
      base100: soil[0],
      base200: soil[1],
      base300: soil[2],
      baseContent: soil[10],
      muted: soil[7],
      neutral: soil[9],
      neutralContent: soil[0],
      info: 'oklch(0.500 0.090 245)',
      infoContent: soil[0],
      success: 'oklch(0.500 0.110 160)',
      successContent: soil[0],
      warning: 'oklch(0.640 0.130 72)',
      warningContent: soil[10],
      error: 'oklch(0.520 0.190 27)',
      errorContent: soil[0],
    },
    dark: {
      base100: soil[10],
      base200: soil[9],
      base300: soil[8],
      baseContent: soil[0],
      muted: soil[4],
      neutral: soil[2],
      neutralContent: soil[10],
      info: 'oklch(0.760 0.090 245)',
      infoContent: soil[10],
      success: 'oklch(0.770 0.120 160)',
      successContent: soil[10],
      warning: 'oklch(0.820 0.130 80)',
      warningContent: soil[10],
      error: 'oklch(0.720 0.160 27)',
      errorContent: soil[10],
    },
  },
  brands: {
    womp: {
      light: brand('beet', 'pea', 'carrot', 'light'),
      dark: brand('beet', 'pea', 'carrot', 'dark'),
      extra: { light: packetVars('beet', 'light'), dark: packetVars('beet', 'dark') },
    },
    blog: {
      light: brand('carrot', 'beet', 'pea', 'light'),
      dark: brand('carrot', 'beet', 'pea', 'dark'),
      extra: { light: packetVars('carrot', 'light'), dark: packetVars('carrot', 'dark') },
    },
    wiki: {
      light: brand('pea', 'beet', 'carrot', 'light'),
      dark: brand('pea', 'beet', 'carrot', 'dark'),
      extra: { light: packetVars('pea', 'light'), dark: packetVars('pea', 'dark') },
    },
  },
  // Packet prose: every text-on-field pair in the pool must reach AAA.
  checks: Object.fromEntries(
    ['light', 'dark'].map((m) => [
      m,
      Object.entries(packets[m]).map(([k, v]) => [`packet text on ${k} field`, v.on, v.ink, 7]),
    ]),
  ),
  extra: {
    light: { ...rampVars, ...inkVars('light'), '--line': soil[10], '--paper': soil[0], '--rule': soil[3], '--bed': soil[9], '--bed-content': soil[1] },
    dark: { ...rampVars, ...inkVars('dark'), '--line': soil[10], '--paper': soil[0], '--rule': soil[7], '--bed': soil[8], '--bed-content': soil[1] },
  },
};
