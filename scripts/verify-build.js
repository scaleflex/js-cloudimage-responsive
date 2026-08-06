/* eslint-disable import/no-commonjs, import/no-nodejs-modules, no-console */
/**
 * Verifies the committed build/ CDN bundles match the current package version.
 *
 * build/ is tracked in git and is what the CDN serves, but nothing in the release
 * flow used to rebuild it - v4.9.3 shipped "DPR 3 support" while every bundle was
 * still built from v4.9.2 and inlined the old [1, 1.5, 2] ratio list, so no CDN
 * consumer ever received the feature. This script fails the build when that
 * happens again.
 *
 * Run via `npm run verify-build`, or automatically at the end of `npm run build`.
 */
const fs = require('fs');
const path = require('path');
const { DEVICE_PIXEL_RATIO_LIST } = require('cloudimage-responsive-utils/dist/constants');
const pkg = require('../package.json');


const FLAVORS = ['low-preview', 'blur-hash', 'plain', 'wp'];
const dprLiteral = `[${DEVICE_PIXEL_RATIO_LIST.join(',')}]`;
const errors = [];
const warnings = [];

FLAVORS.forEach((flavor) => {
  const file = path.join(__dirname, '..', 'build', flavor, 'js-cloudimage-responsive.min.js');

  if (!fs.existsSync(file)) {
    errors.push(`${flavor}: bundle missing - run "npm run build"`);

    return;
  }

  const source = fs.readFileSync(file, 'utf8');
  const banner = /js-cloudimage-responsive v(\S+)/.exec(source);

  if (!banner) {
    errors.push(`${flavor}: no version banner found (webpack BannerPlugin output missing?)`);
  } else if (banner[1] !== pkg.version) {
    errors.push(`${flavor}: built from v${banner[1]} but package.json is v${pkg.version} `
      + '- rebuild before committing');
  }

  // Warning, not an error: terser's output shape is not contractual.
  if (source.indexOf(dprLiteral) === -1) {
    warnings.push(`${flavor}: DEVICE_PIXEL_RATIO_LIST ${dprLiteral} not found inline `
      + '- bundle may predate the installed cloudimage-responsive-utils');
  }
});

warnings.forEach((warning) => console.warn(`WARN  ${warning}`));
errors.forEach((error) => console.error(`ERROR ${error}`));

if (errors.length) process.exit(1);

console.log(`build/ verified against v${pkg.version} (device pixel ratio list ${dprLiteral})`);
