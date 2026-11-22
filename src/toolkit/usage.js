// How to apply a brand: the content is rendered into the HTML at build time (vite/usage-page.mjs);
// this only draws the masthead lockup.
import { renderMasthead, onBrandsChanged } from './site.js';

renderMasthead();
onBrandsChanged(renderMasthead);
