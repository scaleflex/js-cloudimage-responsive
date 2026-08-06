# Releasing to npm

This document covers cutting a new release of `js-cloudimage-responsive` and publishing it to the [npm registry](https://www.npmjs.com/package/js-cloudimage-responsive).

Pushing the bundles to the CDN (`cdn.scaleflex.it/plugins/js-cloudimage-responsive/`) is handled separately and is out of scope here. **Regenerating them is not** — the CDN serves the git-tracked webpack `build/` output, so it must be rebuilt as part of every release. See [step 3](#3-rebuild-the-committed-cdn-bundles). Skipping it is how v4.9.3 shipped "DPR 3 support" that no CDN consumer ever received.

## What gets published

Only the **low-preview** flavor ships to npm. The package's `main` field in [package.json](package.json) points at `dist/low-preview/index.js`, so that's what consumers get with `import 'js-cloudimage-responsive'`. The other three flavors (`blur-hash`, `plain`, `wp`) are CDN-only.

The npm tarball excludes everything listed in [.npmignore](.npmignore):

```
src
examples
config
build
scripts
.babelrc
.gitignore
.idea
.claude
CLAUDE.md
```

In practice that means the published package contains: `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `package.json`.

Note: there is no `prepublishOnly` script. You must run `npm run dist` (or `dist:min`) yourself before `npm publish`, otherwise the tarball will contain whatever `dist/` was last built from — possibly the previous version.

## Pre-flight checklist

- [ ] On `master`, working tree clean (`git status`), pulled latest (`git pull --ff-only`).
- [ ] `node_modules` installed and up to date (`npm install`).
- [ ] Logged in as a maintainer of `js-cloudimage-responsive`: `npm whoami` and check [npm package maintainers](https://www.npmjs.com/package/js-cloudimage-responsive).
- [ ] Decide the new version following [semver](https://semver.org/): patch / minor / major.
- [ ] If `cloudimage-responsive-utils` was bumped, diff `node_modules/cloudimage-responsive-utils/dist/constants.js`. A change to `DEVICE_PIXEL_RATIO_LIST` changes the default `devicePixelRatioList` for every consumer — update the `devicePixelRatioList` section in all three READMEs and note it in the CHANGELOG.

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

### 3. Rebuild the committed CDN bundles

`build/` is committed to git and is the source for the CDN. It must be regenerated **after** the version bump (the webpack `BannerPlugin` stamps `package.json`'s version into each bundle) and **before** the release commit.

```bash
npm run build          # run from Git Bash / WSL — clean-build uses rm -rf
npm run verify-build   # fails if any bundle's banner version != package.json
```

`npm run build` ends with `verify-build` automatically. **Never commit a release where it fails** — that is exactly the v4.9.3 failure mode: the bundles were left at v4.9.2, so the `<script>`-tag and CDN consumers silently missed the release entirely while npm consumers got it.

Nine files under `build/` change on a full rebuild (four `.min.js`, four `.map`, and `build/low-preview/js-cloudimage-responsive.min.css`). Commit all of them together with the version bump.

### 4. Build the npm artifact

Choose one:

```bash
npm run dist        # unminified, readable dist/ tree
npm run dist:min    # minified, .min.js extension
```

Both scripts run `clean-dist` first, then `babel src -d dist --copy-files`. The output lands in `dist/low-preview/` (and the other flavor subtrees, copied as-is).

**Windows / PowerShell caveat.** The `clean-dist` script uses `rm -rf dist`, which is POSIX and fails on stock PowerShell / cmd unless git's POSIX tools are on your `PATH`. If `npm run dist` / `dist:min` leaves you with a stale `dist/`, delete the folder manually before re-running, or run the script from **Git Bash** or **WSL**.

(The `BABEL_ENV=minify` part of `dist:min` is handled by `cross-env` and works on every shell.)

### 5. Sanity-check the build

```bash
node -e "console.log(require('./package.json').version)"    # confirm bumped version
ls dist/low-preview/index.js                                 # confirm artifact exists
node -e "require('./dist/low-preview/ci.service.js')"        # confirm the tree transpiled
npm pack --dry-run                                           # preview the tarball contents
```

`npm pack --dry-run` shows exactly which files will be included and is the best way to catch an empty / stale `dist/` before publishing.

**Don't try to `require('./dist/low-preview/index.js')` from plain Node** — it will fail with `SyntaxError: Unexpected token '{'`. That entry does `import './ci.styles.css'`, which only a bundler can resolve; it is a browser entry, not a Node module. That failure is expected and says nothing about the release. Require `ci.service.js` instead, as above.

### 6. Commit and tag

```bash
git add package.json CHANGELOG.md build
git commit -m "Chore: Release vX.Y.Z"
git tag vX.Y.Z
git push --follow-tags origin master
```

The commit message format matches the existing history (e.g. `47c11fe Chore: Release v4.9.2`).

### 7. Publish

```bash
npm publish
```

This publishes from the project root. The `.npmignore` rules apply — only `dist/` and root metadata files ship.

## Post-publish verification

```bash
npm view js-cloudimage-responsive version      # should report X.Y.Z
npm view js-cloudimage-responsive dist.tarball # URL to the tarball — sanity check
```

In a scratch directory, install it and confirm the published tree is intact:

```bash
npm install js-cloudimage-responsive@X.Y.Z
node -e "console.log(require('js-cloudimage-responsive/package.json').version)"
node -e "require('js-cloudimage-responsive/dist/low-preview/ci.service.js')"
```

As above, don't `require('js-cloudimage-responsive')` itself here — the `main` entry imports a CSS file and only loads under a bundler.

## Rollback

**Do not `npm unpublish`.** npm only permits unpublish within 72 hours, and even then it breaks any downstream consumer that already pulled the version.

Instead, deprecate the bad version and publish a fix:

```bash
npm deprecate js-cloudimage-responsive@X.Y.Z "Use X.Y.(Z+1) instead — <reason>"
```

Then bump to `X.Y.(Z+1)` and re-run the release flow.

## Troubleshooting

- **`npm publish` returns 403.** Check `npm whoami` and that you're listed as a maintainer of the package.
- **CDN consumers don't see a fix that works fine on npm.** `build/` wasn't rebuilt, so the CDN is serving bundles from an older version. Run `npm run verify-build` to confirm, then redo [step 3](#3-rebuild-the-committed-cdn-bundles). Note that `dist/` re-`require`s its dependencies at runtime while `build/` inlines them, so a dependency-only fix reaches npm consumers automatically but *never* reaches CDN consumers without a rebuild.
- **Published bundle has the wrong version number.** The webpack `BannerPlugin` in `config/<flavor>/webpack-build.config.js` reads `package.json` at build time, so the version must be bumped *before* you run the build. This affects only the CDN bundles in `build/`, not the npm `dist/` output. `npm run verify-build` catches it.
- **`dist/` is stale or empty after `npm run dist` on Windows.** The `clean-dist` step silently fails on PowerShell. Delete `dist/` manually and re-run the babel command (see "Windows / PowerShell caveat" above).
- **`npm pack --dry-run` shows `src/` or `examples/` files in the tarball.** Check `.npmignore` hasn't been accidentally truncated. Only `dist/` plus root metadata should appear.
