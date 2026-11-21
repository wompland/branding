// Webring Badge Club tokens.
// Night desk by default: ink ground with a faint ordered dither, ultraviolet / hot coral / aqua members,
// signal yellow reserved for focus and the active ring stop. Light mode is paper-white with ink type.

const INK = '#0c0a12';
const PAPER = '#fdfcf8';

// Fixed badge art colors. Logos and 88x31 badges use these in every mode, like a printed sticker.
export const art = {
  ink: '#110e18',
  panel: '#1c1828',
  panelHi: '#3a3350',
  paper: '#fdfcf8',
  signal: '#ffd21f',
  womp: { fill: '#8f5cff', hi: '#c9b0ff', lo: '#4b1fb0', name: '#c2a6ff' },
  blog: { fill: '#ff6f5b', hi: '#ffb3a6', lo: '#b3301f', name: '#ff9a8a' },
  wiki: { fill: '#2fd6cb', hi: '#a6f2ec', lo: '#0f7f78', name: '#5fe6dc' },
  list: { fill: '#9be05a', hi: '#d4f5b3', lo: '#4f8a1c', name: '#b4ec7f' },
  your: { fill: '#3a3350', hi: '#6b6285', lo: '#1c1828', name: '#d6d0e4' },
};

const modes = {
  dark: {
    base100: INK,
    base200: '#15121e',
    base300: '#211c2e',
    baseContent: '#f3effa',
    muted: '#b9b0cb',
    neutral: '#2b2539',
    neutralContent: '#f3effa',
    info: '#6cc4ff',
    infoContent: INK,
    success: '#7be08f',
    successContent: INK,
    warning: '#ffd21f',
    warningContent: INK,
    error: '#ff7a7a',
    errorContent: INK,
  },
  light: {
    base100: PAPER,
    base200: '#f2f0ea',
    base300: '#e4e1d8',
    baseContent: '#110e18',
    muted: '#4f4960',
    neutral: '#1c1828',
    neutralContent: PAPER,
    info: '#0b5d8c',
    infoContent: PAPER,
    success: '#1c6b37',
    successContent: PAPER,
    warning: '#7d5700',
    warningContent: PAPER,
    error: '#b3261e',
    errorContent: PAPER,
  },
};

// secondary = the member's deep/pale partner shade, accent = signal (yellow on night, amber ink on paper).
const brand = ({ light, dark }) => ({
  light: {
    primary: light.primary,
    primaryContent: PAPER,
    secondary: light.secondary,
    secondaryContent: PAPER,
    accent: '#7d5700',
    accentContent: PAPER,
  },
  dark: {
    primary: dark.primary,
    primaryContent: INK,
    secondary: dark.secondary,
    secondaryContent: INK,
    accent: '#ffd21f',
    accentContent: INK,
  },
  extra: {
    light: { '--member': light.member, '--member-ink': light.memberInk },
    dark: { '--member': dark.member, '--member-ink': dark.memberInk },
  },
});

export default {
  defaultMode: 'dark',
  // Dark alerts sit on base-200 with a status-colored frame and icon; body text is base-content (already gated).
  checks: {
    dark: [
      ['info frame/icon on base-200', 'info', 'base200', 3],
      ['success frame/icon on base-200', 'success', 'base200', 3],
      ['warning frame/icon on base-200', 'warning', 'base200', 3],
      ['error frame/icon on base-200', 'error', 'base200', 3],
    ],
  },
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
  modes,
  brands: {
    womp: brand({
      light: { primary: '#5a1fd1', secondary: '#3a1690', member: art.womp.fill, memberInk: art.ink },
      dark: { primary: '#b897ff', secondary: '#d9c8ff', member: art.womp.fill, memberInk: art.ink },
    }),
    blog: brand({
      light: { primary: '#b8321f', secondary: '#7f2114', member: art.blog.fill, memberInk: art.ink },
      dark: { primary: '#ff8a78', secondary: '#ffc2b8', member: art.blog.fill, memberInk: art.ink },
    }),
    wiki: brand({
      light: { primary: '#00686f', secondary: '#004a4f', member: art.wiki.fill, memberInk: art.ink },
      dark: { primary: '#4fe0d4', secondary: '#b0f3ee', member: art.wiki.fill, memberInk: art.ink },
    }),
  },
  extra: {
    dark: {
      '--signal': '#ffd21f',
      '--signal-content': INK,
      '--focus': '#ffd21f',
      '--focus-halo': INK,
      '--dither': '#ffffff',
      '--dither-alpha': '0.07',
      '--bevel-hi': 'rgb(255 255 255 / 0.16)',
      '--bevel-lo': 'rgb(0 0 0 / 0.55)',
      '--rule': '#3a3350',
    },
    light: {
      '--signal': '#ffd21f',
      '--signal-content': '#110e18',
      '--focus': '#110e18',
      '--focus-halo': '#ffd21f',
      '--dither': '#110e18',
      '--dither-alpha': '0.05',
      '--bevel-hi': 'rgb(255 255 255 / 0.9)',
      '--bevel-lo': 'rgb(17 14 24 / 0.28)',
      '--rule': '#110e18',
    },
  },
};
