# Design: Inline "Copy JSON" Button in Firebase Console

## Context

Today the extension only exposes extracted Firestore document JSON through its popup (click extension icon → "Refresh" → "Copy JSON"). We want a faster path: an inline "Copy JSON" button injected directly into the Firebase Console's document panel toolbar, next to the existing kebab (⋮) menu — mirroring how a competing extension ("Firestore export in one click") places an inline "Export" button next to Firebase Console's own query-results toolbar.

This is purely additive: the existing popup flow stays untouched.

## Permissions impact

**None.** The content script already runs on `console.firebase.google.com` with host permissions covering it (`manifest.json`), and `navigator.clipboard.writeText()` triggered from a user click needs no extra permission entry — `src/popup.js` already uses this exact API today with no dedicated clipboard permission declared. A future "download as file" variant would need the `downloads` permission, but copy-to-clipboard does not.

## Current code (ground truth from exploration)

- `src/contentScript.js` (188 lines) runs on `console.firebase.google.com` per `manifest.json`'s `content_scripts` entry.
  - `extractDocumentData()` (lines 4-68): validates the URL contains `/firestore/data/` or `/firestore/databases/`, queries `f7e-data-tree` elements, recursively parses them into JSON via `parseDataTree()` (lines 71-149), stores the result with `chrome.storage.local.set({documentUrl, documentData, timestamp})`, and returns `{url, data, error}`.
  - Two extraction triggers exist today: an initial `setTimeout(..., 2000)` on script load (lines 165-168), and a `MutationObserver` on `document.body` that detects Firebase Console's SPA navigation and re-runs extraction after another 2000ms delay (lines 171-183).
  - `handleContentMessage` (lines 152-160) handles `{action: "extractData"}` messages from the popup.
- `src/popup.js`'s `copyToClipboard()` (lines 109-126) is the existing reference pattern: `navigator.clipboard.writeText(...)`, then a "Copied!" text swap on the button that reverts after 2000ms.
- No DOM-injection code (`createElement`/`appendChild`/`insertBefore`) exists anywhere in `src/` today — this is a greenfield addition inside `contentScript.js`.
- Styling convention: `popup/index.html` uses an inline `<style>` tag; no external CSS files exist. The copy button there is green `#34a853` with `#2d8e47` hover.
- Tests live in `__tests__/contentScript.test.js` (360 lines), Jest + jsdom, with manual `document.body.innerHTML` / `chrome.storage.local` / `document.querySelectorAll` / `window.location` mocking. No DOM-injection tests exist yet.
- `webpack.config.js` bundles `contentScript.js` as its own entry with Babel only, no CSS loader — any new styling must be applied imperatively (`style.cssText`), not via a new file or manifest CSS entry.
- The exact DOM selector for Firebase Console's document-panel toolbar (where the kebab menu lives) is **not yet known** — it must be found via live DevTools inspection as the first implementation step, since Firebase Console's DOM is Angular Material-generated and not derivable from static analysis.

## Decisions made during brainstorming

- **Button action**: copy JSON to clipboard directly (not a file download) — keeps this permission-neutral.
- **Popup UI**: stays as-is. The in-page button is additive, not a replacement.
- **Toolbar selector**: unknown today; must be found via live DevTools inspection as part of implementation (see plan Step 0), not guessed.

## Architecture

No new permissions, no new components — this extends the existing `contentScript.js`, which already runs on `console.firebase.google.com` and already knows how to parse the document panel into JSON. Today that logic only fires on a timer/URL-change and stores the result for the popup to read. We add a second responsibility: after each successful extraction, ensure a small "Copy JSON" button exists in the document panel's toolbar (next to the kebab/⋮ menu), and wire its click to copy the freshly-extracted JSON to the clipboard — reusing the same `navigator.clipboard.writeText` + "Copied!" feedback pattern `popup.js` already uses.

See [2026-07-17-inline-copy-button-plan.md](2026-07-17-inline-copy-button-plan.md) for the detailed implementation plan.
