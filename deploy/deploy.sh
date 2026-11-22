#!/bin/sh
# Update and rebuild the public brand guide in place; Caddy serves dist/.
# Run from the server's clone (e.g. /srv/brand.wompland.com): sh deploy/deploy.sh
# The new build goes to .dist-next and replaces dist/ only once it succeeds,
# so the live site never serves a half-written build.
set -eu
cd "$(dirname "$0")/.."

git fetch --quiet origin
git reset --hard --quiet origin/main   # a deploy clone: generated files are rebuilt below
npm ci --no-audit --no-fund --loglevel=error

export SITE_URL="${SITE_URL:-https://brand.wompland.com}"
npm run --silent brands
npm run --silent themes
rm -rf .dist-next
npx vite build --outDir .dist-next --emptyOutDir --logLevel warn

rm -rf .dist-old
[ -d dist ] && mv dist .dist-old
mv .dist-next dist
rm -rf .dist-old
echo "Deployed $(git rev-parse --short HEAD) to $(pwd)/dist"
