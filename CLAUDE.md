# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Manifest V3 browser extension (Chrome/Firefox) that extracts Firestore document data from the Firebase Console UI by parsing its rendered DOM — no Firebase SDK, no API keys, no config. It reads whatever is already on screen and reconstructs it as JSON.

## Commands

```bash
npm run dev            # webpack --mode development --watch
npm run build           # production build to dist/
npm run build:clean     # rm -rf dist && npm run build
npm test                # run all Jest tests
npm run test:watch      # Jest watch mode
npm run test:coverage   # coverage report (enforced thresholds: 50% branches/functions/lines/statements)
npm run lint            # eslint . --ext .js,.jsx
npm run lint:fix
npm run prettier        # format all files
npm run prettier:check
npm run package         # zip dist/ into extension.zip
npm run release         # ./scripts/prepare-release.sh (interactive version bump + build + zip)
```

Run a single test file: `npx jest __tests__/contentScript.test.js`
Run a single test by name: `npx jest -t "should parse string field"`

CI (`.github/workflows/ci.yml`) runs on Node 20.x/22.x: lint (non-blocking), test, coverage upload, build, plus a separate `prettier:check` job. Prettier formatting failures WILL fail CI even though lint failures won't.

## Architecture

Three independent webpack entry points, each built to `dist/[name].js`, wired together only through `manifest.json` and `chrome.storage.local` / `chrome.runtime` messaging — there is no shared module graph between them at runtime:

- **`src/contentScript.js`** — injected into `console.firebase.google.com` pages. Core logic is `parseDataTree`, a recursive DOM walker over Firebase Console's custom `<f7e-data-tree>` elements (Angular Material-based UI). It reads `.database-key` / `.database-type` / `.database-leaf-value` and `.database-children` to reconstruct nested objects/arrays/typed leaves (string/double/number/boolean/null) into a plain JS object. Runs automatically 2s after load and again 2s after any SPA URL change (via `MutationObserver` on `document.body`, since Firebase Console is an Angular SPA with no full page reloads). Results are written to `chrome.storage.local` and also returned directly in response to an `extractData` message.
- **`src/popup.js`** (`Popup` class) — the toolbar popup. On open, reads the last-extracted data straight from `chrome.storage.local` (no live query). The "Refresh" button instead messages the active tab's content script directly (`chrome.tabs.sendMessage(tab.id, {action: "extractData"})`) to force a fresh extraction, bypassing storage. Also owns clipboard copy.
- **`src/background.js`** — minimal MV3 service worker; currently just a message-handler stub, not central to the data flow.

**Firebase Console's DOM structure is the entire integration surface and is not under this project's control.** If Firebase changes its Angular Material class names or `f7e-data-tree` structure, extraction breaks silently (empty/wrong data, no thrown error) — this is the main source of real-world bugs. When debugging extraction issues, the fix is almost always updating selectors in `parseDataTree`/`extractDocumentData`, guided by inspecting the live DOM (see `TESTING.md` for the manual DOM-inspection workflow and known class names).

All three entry points guard their side-effecting init code with environment checks (`typeof window !== "undefined" && typeof chrome !== "undefined"`, `typeof document !== "undefined"`) specifically so they can be `require`d in Jest under jsdom without a real extension/browser context — tests import and call the exported functions directly rather than mocking the whole environment.

## Testing notes

- `jest.config.js` uses `jsdom` env; `__tests__/setup.js` installs a mock global `chrome` object (storage/runtime/tabs) — extend this mock when a test needs a `chrome.*` API not already stubbed there.
- Tests target the exported pure-ish functions (`extractDocumentData`, `parseDataTree`, `handleContentMessage`, `handleMessage`, `Popup`), not the auto-run init blocks.
- No `dependencies` in `package.json` — this is intentionally dependency-free at runtime (see README's "7KB, no Firebase SDK" claim); don't add runtime deps without a strong reason.

## Other notes

- `next.config.mjs` and the `next/core-web-vitals` ESLint config exist but Next.js is not an actual project dependency — this is leftover scaffolding, not a real Next.js app.
- Design/spec docs for past feature work live under `docs/superpowers/specs/`.
