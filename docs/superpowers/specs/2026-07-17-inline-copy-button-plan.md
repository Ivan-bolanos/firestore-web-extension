# Implementation Plan: Inline "Copy JSON" Button in Firebase Console

## Context

Today the extension only exposes extracted Firestore document JSON through its popup (click extension icon → "Refresh" → "Copy JSON"). The user wants a faster path: an inline "Copy JSON" button injected directly into the Firebase Console's document panel toolbar, next to the existing kebab (⋮) menu — mirroring how a competing extension ("Firestore export in one click") places an inline "Export" button next to Firebase Console's own query-results toolbar.

This is purely additive: the existing popup flow stays untouched. It requires **no manifest.json changes** — the content script already runs on `console.firebase.google.com` with host permissions covering it, and `navigator.clipboard.writeText()` triggered from a user click needs no extra permission entry (confirmed by inspecting `manifest.json` and `src/popup.js`'s existing clipboard usage).

## Current code (ground truth from exploration)

- `src/contentScript.js` (188 lines) already runs on `console.firebase.google.com` per `manifest.json`'s `content_scripts` entry.
  - `extractDocumentData()` (lines 4-68): validates the URL contains `/firestore/data/` or `/firestore/databases/`, queries `f7e-data-tree` elements, recursively parses them into JSON via `parseDataTree()` (lines 71-149), stores the result with `chrome.storage.local.set({documentUrl, documentData, timestamp})`, and returns `{url, data, error}`.
  - Two extraction triggers exist today: an initial `setTimeout(..., 2000)` on script load (lines 165-168), and a `MutationObserver` on `document.body` that detects Firebase Console's SPA navigation and re-runs extraction after another 2000ms delay (lines 171-183).
  - `handleContentMessage` (lines 152-160) handles `{action: "extractData"}` messages from the popup.
- `src/popup.js`'s `copyToClipboard()` (lines 109-126) is the existing reference pattern: `navigator.clipboard.writeText(...)`, then a "Copied!" text swap on the button that reverts after 2000ms.
- No DOM-injection code (`createElement`/`appendChild`/`insertBefore`) exists anywhere in `src/` today — this is a greenfield addition inside `contentScript.js`.
- Styling convention: `popup/index.html` uses an inline `<style>` tag; no external CSS files exist. The copy button there is green `#34a853` with `#2d8e47` hover.
- Tests live in `__tests__/contentScript.test.js` (360 lines), Jest + jsdom, with manual `document.body.innerHTML` / `chrome.storage.local` / `document.querySelectorAll` / `window.location` mocking. No DOM-injection tests exist yet.
- `webpack.config.js` bundles `contentScript.js` as its own entry with Babel only, no CSS loader — any new styling must be applied imperatively (`style.cssText`), not via a new file or manifest CSS entry.
- The exact DOM selector for Firebase Console's document-panel toolbar (where the kebab menu lives) is **not yet known** — it must be found via live DevTools inspection as the first implementation step, since Firebase Console's DOM is Angular Material-generated and not derivable from static analysis.

## Step 0 — Research: find the toolbar injection target (do this first)

1. Open a real Firestore document in Firebase Console (`.../firestore/databases/-default-/data/<path>`).
2. DevTools → Elements → use the element picker on the kebab (⋮) button next to the document panel header.
3. Walk up the DOM to find a stable container to inject into. Prefer matching on `aria-label`/custom element tag names (analogous to `f7e-data-tree`) over Angular's auto-generated `mat-mdc-*`/`cdk-*` classes, since those are least likely to change across Angular Material versions.
4. Verify the candidate selector in the DevTools console (`document.querySelector(...)`) resolves to the intended container and does not also match on unrelated views (e.g. the collection list view).
5. Capture 1-2 fallback selectors in case the primary breaks.
6. Document the final selector as a named constant at the top of `src/contentScript.js` with a comment noting the verification date and that Firebase may change this DOM without notice.

## Step 1 — Constants and module state

At the top of `src/contentScript.js`, add:

```js
// Selector for the Firebase Console document-panel toolbar container that
// holds the kebab (⋮) menu — injection point for the inline "Copy JSON"
// button. Verified against Firebase Console DOM on <date>. Firebase Console
// DOM is Angular Material auto-generated and may change without notice.
const TOOLBAR_SELECTOR = "<selector-from-step-0>";
const COPY_BUTTON_ID = "firestore-ext-copy-json-btn";
let toolbarNotFoundWarned = false; // avoid console spam on views with no toolbar
```

## Step 2 — `injectCopyButton(data)`

Exported function (same export pattern as `parseDataTree`/`extractDocumentData`, for testability):

- Looks up `TOOLBAR_SELECTOR`; if missing, log a one-time warning and return (never throw).
- Idempotency: reuse an existing `#firestore-ext-copy-json-btn` if present. If it exists but is no longer inside the freshly-queried toolbar (Angular tore down/rebuilt the toolbar node during SPA nav), treat it as stale and recreate it inside the current toolbar.
- Style via `button.style.cssText` only — green `#34a853` background, `#2d8e47` hover (matching the popup's copy button), white text, small padding/font to blend into the Console's compact toolbar.
- On every call (even when reusing an existing button), refresh `button.onclick` to close over the latest `data` argument, so the button always copies the most recently extracted document, not a stale one.
- Click handler: `navigator.clipboard.writeText(JSON.stringify(data, null, 2))`, then swap button text to "Copied!" for 2000ms and revert — same UX as `popup.js`. Catch and log clipboard errors without throwing.

## Step 3 — Wire into existing triggers (no new timers/observers)

Call `injectCopyButton(result.data)` only when `result.data` is truthy, at each existing call site:

1. Initial load `setTimeout` (current lines 165-168).
2. The `MutationObserver` SPA-navigation `setTimeout` (current lines 171-183) — change the bare `setTimeout(extractDocumentData, 2000)` to a wrapping arrow function so the result can be captured.
3. `handleContentMessage` (lines 152-160), after `extractDocumentData()` runs there — so clicking "Refresh" in the popup also refreshes the in-page button's data.

`extractDocumentData()` itself stays untouched — keep it single-responsibility and independently testable.

## Step 4 — Styling

Inline `style.cssText` only, no new CSS file, no manifest `content_scripts.css` entry (this extension injects no stylesheets today). Visual anchor: same green as the popup's copy button. Small/unobtrusive sizing so it doesn't look broken next to Google's native Material buttons.

## Step 5 — Tests (`__tests__/contentScript.test.js`)

Add a `describe("injectCopyButton", ...)` block following the file's existing jsdom/manual-mock conventions:

1. Creates the button when the toolbar is present.
2. No duplicate button on repeated calls with the toolbar still present.
3. Recreates the button when the existing one is stale/detached (simulated toolbar DOM replacement).
4. Graceful no-op (no throw, no button) when the toolbar is absent; warns at most once across repeated calls.
5. Click handler calls `navigator.clipboard.writeText` (mock it in `beforeEach`) with `JSON.stringify(data, null, 2)`.
6. "Copied!" text-swap and revert after 2000ms using `jest.useFakeTimers()` (restore real timers in `afterEach`).
7. Data freshness: calling `injectCopyButton` twice with different data and clicking the (single, reused) button copies the latest data, proving the `onclick` closure is refreshed.

## Step 6 — Manifest / build

No changes to `manifest.json` or `webpack.config.js` — confirmed no new permissions or bundling changes are needed.

## Verification

1. `npm run build` completes cleanly; `dist/contentScript.js` regenerates.
2. Load `dist/` unpacked in `chrome://extensions`.
3. Open a real Firestore document — confirm the button appears next to the kebab menu.
4. Navigate to a different document via SPA nav — confirm exactly one button remains (no duplicates, re-injection survives Angular's DOM churn).
5. Click it, and diff the clipboard contents against the popup's existing "Copy JSON" output for the same document — they must match.
6. Visit a view without the toolbar (e.g. collections list) — confirm no console errors and no orphaned button.
7. `npm test` — all existing plus new `injectCopyButton` tests pass, no regressions in `parseDataTree`/`extractDocumentData`/`handleContentMessage` suites.

## Files touched

- `src/contentScript.js` — constants, `injectCopyButton` export, wiring into the two `setTimeout` sites and `handleContentMessage`.
- `__tests__/contentScript.test.js` — new `injectCopyButton` test suite + `navigator.clipboard` mock in `beforeEach`.

No changes needed to: `manifest.json`, `webpack.config.js`, `src/popup.js`, `popup/index.html`, `src/background.js`.

