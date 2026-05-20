# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla-JS browser plugin that swaps `<img ci-src="...">` (and `ci-bg-url` divs) for responsive, Cloudimage-CDN-served URLs sized to the container and the device pixel ratio. It is published as `js-cloudimage-responsive` on npm and as a `<script>`-tag bundle on Scaleflex's CDN. There is no backend code, no test suite, and no TypeScript.

The heavy lifting (URL generation, container-size detection, breakpoint matching, browser support checks) lives in the external [`cloudimage-responsive-utils`](https://www.npmjs.com/package/cloudimage-responsive-utils) dependency — this repo is the DOM-integration layer on top of it. When tracing how a `ci-src` URL becomes a final Cloudimage URL, expect the trail to leave this repo into `node_modules/cloudimage-responsive-utils/dist/utils/`.

## Four build variants ("flavors")

The same plugin ships in four flavors, each its own webpack entry, output bundle, and demo app:

| Variant | Source | What's different |
|---|---|---|
| `low-preview` | [src/low-preview/](src/low-preview/) | Default. Loads a tiny low-quality image first, swaps to the full image with a CSS fade. Wraps `<img>` in a positioned div and ships `ci.styles.css`. |
| `blur-hash` | [src/blur-hash/](src/blur-hash/) | Uses a [BlurHash](https://blurha.sh/) string (from `ci-blur-hash` attr) decoded to a canvas as the placeholder. Bundles its own decoder under `src/blur-hash/blurHash/`. |
| `plain` | [src/plain/](src/plain/) | CSS-free, no placeholder, no wrapper div — just rewrites `src`. Smallest bundle. |
| `wp` | [src/wp/](src/wp/) | WordPress thin wrapper that re-exports the `plain` service and auto-inits from `window.CIResponsiveConfig`. |

The npm `main` field points at `dist/low-preview/index.js` — when imported via `import 'js-cloudimage-responsive'`, you get the low-preview flavor only. The other flavors are only consumed via CDN `<script>` tags from `build/<flavor>/`.

Each `src/<flavor>/` directory follows the same shape: `index.js` (browser entry, attaches `window.CIResponsive`), `ci.config.js` (option defaults + normalization), `ci.service.js` (the `CIResponsive` class with `init`/`process`/`updateImage`/`addImage`), and a `ci.utils.js`/`ci.utis.js` (note: low-preview file is misspelled `ci.utis.js` — keep it that way, it's referenced everywhere). Cross-flavor shared code lives in [src/common/](src/common/).

## Two parallel build pipelines

This is the part that trips people up: there is no single "build." Two separate toolchains produce different artifacts for different consumers.

1. **Webpack** → `build/<flavor>/` — minified UMD-ish bundles + extracted CSS, what the CDN serves. Driven by `config/<flavor>/webpack-build.config.js`. Run with `npm run build` (all four) or `npm run build-<flavor>`.
2. **Babel** → `dist/` — per-file transpiled source preserving the directory tree, what npm consumers import. Run with `npm run dist` (readable) or `npm run dist:min` (minified, `.min.js` extension via `BABEL_ENV=minify`). Only the low-preview tree ends up in `dist/` because of how `npm run dist` is wired (`babel src -d dist --copy-files`), but the published package main points there.

`config/webpack-lazysizes-build.config.js` builds a separate bundle of [src/lazysizes-intersection.js](src/lazysizes-intersection.js) — the optional lazy-load companion library that pairs with `lazyLoading: true` configs.

## Common commands

```bash
# Dev — opens a live demo app from examples/<flavor>/
npm run start-demo-low-preview     # most common
npm run start-demo-blur-hash
npm run start-demo-plain
npm run start-demo-wp

# Production builds (CDN bundles)
npm run build                       # all four flavors
npm run build-low-preview           # single flavor
npm run build-lazysizes             # optional lazysizes companion

# npm package builds
npm run dist                        # unminified, for `dist/` (the npm `main`)
npm run dist:min                    # minified `.min.js` variant

# Demo deployment
npm run build-demo                  # builds all four demo sites under examples/<flavor>/dist/
npm run publish-demo                # ^ then pushes the low-preview one to gh-pages
```

There is **no test command and no lint script** in `package.json`. ESLint is configured ([.eslintrc.json](.eslintrc.json), airbnb-base) but only runs if you invoke `npx eslint` manually. Don't claim tests pass — there are none.

## Windows / PowerShell gotcha

`clean-build`, `clean-dist`, and `clean-demo` scripts use `rm -rf`, which fails on stock PowerShell. Either run them under Git Bash / WSL, or delete `build/` / `dist/` / `examples/*/dist/` manually before re-running the build scripts. The webpack/babel steps themselves work fine on PowerShell.

## Browser targets and polyfills

[.babelrc](.babelrc) targets `last 2 versions` **plus IE 9/10/11**. That's why every entry file pulls in `core-js` polyfills (`array/find`, `math/trunc`, `typed-array/uint8-clamped-array`) and `src/blur-hash/polyfills/prepend.polyfill.js`. Don't remove these without checking IE support is no longer required — the README still advertises IE 11/10/9 compatibility.

When adding new ES2015+ features in `src/`, add the matching core-js import to the relevant `src/<flavor>/index.js` rather than relying on preset-env useBuiltIns (it isn't configured).

## How the DOM integration works (high level)

1. The `<script>` tag runs, `src/<flavor>/index.js` attaches `CIResponsive` to `window`.
2. Page code calls `new window.CIResponsive(config)`, which runs `init()` → `process()`.
3. `process()` calls `getFreshCIElements()` ([src/common/ci.utils.js](src/common/ci.utils.js)) to find all unprocessed `[ci-src]` and `[ci-bg-url]` nodes (marked with the `data-ci-processed` attribute from [src/common/ci.constants.js](src/common/ci.constants.js)).
4. For each node it reads `ci-*` / `data-ci-*` attributes, measures the container, picks a size, calls `generateURL()` from `cloudimage-responsive-utils`, and writes the result to `src` / `srcset` / `background-image`.
5. A debounced `resize` handler re-runs `process(true)` to upgrade images when the viewport grows.
6. Public methods `updateImage(node, newSrc, options)` and `addImage(node)` exist for dynamically-added content; see the README's "Methods" section for the contract.

Lazy loading is **not** included by default — when `lazyLoading: true` is set in config, the host page must also load the separate `lazysizes` bundle (built via `build-lazysizes`). The plugin listens for `lazybeforeunveil` events to do the real swap.

## Config option naming

All four flavors accept slightly different config shapes — always look at the relevant `src/<flavor>/ci.config.js` to see the actual accepted keys and defaults rather than assuming. A few cross-cutting ones to know:

- `baseUrl` (legacy) and `baseURL` (current) are both accepted — `ci.config.js` normalizes via `baseUrl || baseURL`. Don't break that fallback.
- `apiVersion: null` disables the `/v7/` URL prefix; the default `'v7'` adds it.
- `imageSizeAttributes` accepts `'use' | 'take-ratio' | 'ignore'` (controls how `width`/`height` HTML attributes feed into sizing) — see the README "imageSizeAttributes" section for the semantics before changing default behavior.

## Versioning and release

Version lives in [package.json](package.json) and is embedded into the webpack BannerPlugin output. Releases follow semver and are documented in [CHANGELOG.md](CHANGELOG.md) — keep changelog entries in the same format (`## X.Y.Z - YYYY-MM-DD` with `### Added`/`### Fixed`/etc. subheadings).
