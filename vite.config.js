import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import brands from './vite/brands-plugin.mjs';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Build inputs: the home page plus every toolkit/*.html page.
const toolkit = resolve(import.meta.dirname, 'toolkit');
const pages = Object.fromEntries(
  (existsSync(toolkit) ? readdirSync(toolkit) : [])
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace('.html', ''), resolve(toolkit, f)]),
);

export default defineConfig({
  plugins: [tailwindcss(), brands()],
  build: { rollupOptions: { input: { index: resolve(import.meta.dirname, 'index.html'), ...pages } } },
});
