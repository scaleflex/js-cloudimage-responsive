# Releasing to npm

This document covers cutting a new release of `js-cloudimage-responsive` and publishing it to the [npm registry](https://www.npmjs.com/package/js-cloudimage-responsive).

CDN deployment (the `cdn.scaleflex.it/plugins/js-cloudimage-responsive/` bundles) is **out of scope** for this guide — it is handled separately and uses the webpack `build/` output, not the Babel `dist/` output described here.

## What gets published

Only the **low-preview** flavor ships to npm. The package's `main` field in [package.json](package.json) points at `dist/low-preview/index.js`, so that's what consumers get with `import 'js-cloudimage-responsive'`. The other three flavors (`blur-hash`, `plain`, `wp`) are CDN-only.

The npm tarball excludes everything listed in [.npmignore](.npmignore):

```
src
examples
config
build
.babelrc
.gitignore
.idea
```

In practice that means the published package contains: `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `package.json`.

Note: there is no `prepublishOnly` script. You must run `npm run dist` (or `dist:min`) yourself before `npm publish`, otherwise the tarball will contain whatever `dist/` was last built from — possibly the previous version.

## Pre-flight checklist

- [ ] On `master`, working tree clean (`git status`), pulled latest (`git pull --ff-only`).
- [ ] `node_modules` installed and up to date (`npm install`).
- [ ] Logged in as a maintainer of `js-cloudimage-responsive`: `npm whoami` and check [npm package maintainers](https://www.npmjs.com/package/js-cloudimage-responsive).
- [ ] Decide the new version following [semver](https://semver.org/): patch / minor / major.

## Release steps

### 1. Bump the version

Edit `version` in [package.json](package.json). Manual edit — this repo does not use `npm version`. The convention (see `git log`) is a single commit titled `Chore: Release vX.Y.Z` containing both the version bump and the changelog entry.

### 2. Add a CHANGELOG entry

Append to [CHANGELOG.md](CHANGELOG.md) using the existing format. The most recent entry is the template:

```markdown
## X.Y.Z - YYYY-MM-DD
### Fixed
- Short description of the fix.

### Added
- Short description of the new feature.
```

Section headings (`Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security`) follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Mark breaking changes with a `**BREAKING**:` prefix on the bullet — see the CHANGELOG preamble for the convention.

### 3. Build the npm artifact

Choose one:

```bash
npm run dist        # unminified, readable dist/ tree
npm run dist:min    # minified, .min.js extension
```

Both scripts run `clean-dist` first, then `babel src -d dist --copy-files`. The output lands in `dist/low-preview/` (and the other flavor subtrees, copied as-is).

**Windows / PowerShell caveat.** The `clean-dist` script uses `rm -rf dist`, which is POSIX and fails on stock PowerShell. `dist:min` additionally uses inline env-var syntax (`BABEL_ENV=minify ...`) that PowerShell does not parse. Options:

- Run these commands from **Git Bash** or **WSL**, or
- For `dist`: manually delete the `dist/` folder, then run `npx babel src -d dist --copy-files`.
- For `dist:min`: manually delete `dist/`, then run `$env:BABEL_ENV='minify'; npx babel src -d dist --out-file-extension .min.js`.

### 4. Sanity-check the build

```bash
node -e "console.log(require('./package.json').version)"   # confirm bumped version
ls dist/low-preview/index.js                                # confirm artifact exists
npm pack --dry-run                                          # preview the tarball contents
```

`npm pack --dry-run` shows exactly which files will be included and is the best way to catch an empty / stale `dist/` before publishing.

### 5. Commit and tag

```bash
git add package.json CHANGELOG.md
git commit -m "Chore: Release vX.Y.Z"
git tag vX.Y.Z
git push --follow-tags origin master
```

The commit message format matches the existing history (e.g. `47c11fe Chore: Release v4.9.2`).

### 6. Publish

```bash
npm publish
```

This publishes from the project root. The `.npmignore` rules apply — only `dist/` and root metadata files ship.

## Post-publish verification

```bash
npm view js-cloudimage-responsive version      # should report X.Y.Z
npm view js-cloudimage-responsive dist.tarball # URL to the tarball — sanity check
```

In a scratch directory, install it and confirm it loads:

```bash
npm install js-cloudimage-responsive@X.Y.Z
node -e "console.log(require('js-cloudimage-responsive'))"
```

## Rollback

**Do not `npm unpublish`.** npm only permits unpublish within 72 hours, and even then it breaks any downstream consumer that already pulled the version.

Instead, deprecate the bad version and publish a fix:

```bash
npm deprecate js-cloudimage-responsive@X.Y.Z "Use X.Y.(Z+1) instead — <reason>"
```

Then bump to `X.Y.(Z+1)` and re-run the release flow.

## Troubleshooting

- **`npm publish` returns 403.** Check `npm whoami` and that you're listed as a maintainer of the package.
- **Published bundle has the wrong version number.** The webpack `BannerPlugin` in `config/<flavor>/webpack-build.config.js` reads `package.json` at build time. The fix is to ensure the version bump committed *before* you ran the build — but note this only affects the CDN bundles in `build/`, not the npm `dist/` output.
- **`dist/` is stale or empty after `npm run dist` on Windows.** The `clean-dist` step silently fails on PowerShell. Delete `dist/` manually and re-run the babel command (see "Windows / PowerShell caveat" above).
- **`npm pack --dry-run` shows `src/` or `examples/` files in the tarball.** Check `.npmignore` hasn't been accidentally truncated. Only `dist/` plus root metadata should appear.
