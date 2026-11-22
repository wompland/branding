import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import brands from './vite/brands-plugin.mjs';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// The static build is the public, read-only brand guide: no editor page, and no markup
// between <!-- dev-only --> and <!-- /dev-only --> (the New Womp form, editing copy).
const DEV_ONLY_PAGES = new Set(['edit.html']);

const stripDevOnly = {
  name: 'wompland:strip-dev-only',
  apply: 'build',
  transformIndexHtml: (html) => html.replace(/<!-- dev-only -->[\s\S]*?<!-- \/dev-only -->/g, ''),
};

export default defineConfig(({ command }) => {
  const toolkit = resolve(import.meta.dirname, 'toolkit');
  const pages = Object.fromEntries(
    (existsSync(toolkit) ? readdirSync(toolkit) : [])
      .filter((f) => f.endsWith('.html') && !(command === 'build' && DEV_ONLY_PAGES.has(f)))
      .map((f) => [f.replace('.html', ''), resolve(toolkit, f)]),
  );
  return {
    plugins: [tailwindcss(), brands(), stripDevOnly],
    build: { rollupOptions: { input: { index: resolve(import.meta.dirname, 'index.html'), ...pages } } },
  };
});
