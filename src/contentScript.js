console.log("Firestore Web Extension: Content script loaded");

// Selector for the Firebase Console document-panel toolbar's kebab (⋮) menu
// button — anchor for the inline "Copy JSON" button. Verified against a live
// Firestore document on 2026-09-29. Firebase Console DOM is Angular Material
// auto-generated and may change without notice; the aria-label is Firebase's
// own semantic attribute, not an Angular-generated class, so it's the most
// stable anchor available.
//
// No structural fallback (e.g. `.panel-header .right-container`) is used:
// Firebase's "Panel view" renders several `.panel-header` panels at once
// (root, collection, document), each with its own `.right-container`, but
// only the document panel has this kebab button. A structural fallback
// would resolve ambiguously to the wrong panel whenever the document
// panel's kebab is briefly absent (e.g. mid-navigation, while Angular
// rebuilds that panel) but the other panels are still present.
const TOOLBAR_BUTTON_SELECTOR = 'button[aria-label="actions for document"]';
export const COPY_BUTTON_ID = "firestore-ext-copy-json-btn";
let toolbarNotFoundWarned = false; // avoid console spam on views with no toolbar

// Extract Firestore document data from Firebase Console DOM
export function extractDocumentData() {
  try {
    const documentUrl = window.location.href;
    console.log("Extracting data from:", documentUrl);

    // Check if we're on a document page
    if (
      !documentUrl.includes("/firestore/data/") &&
      !documentUrl.includes("/firestore/databases/")
    ) {
      console.log("Not on a Firestore document page");
      return {
        url: documentUrl,
        data: null,
        error: "Not on a Firestore document page",
      };
    }

    // Look for f7e-data-tree elements (Firebase Console's custom elements)
    const dataTrees = document.querySelectorAll("f7e-data-tree");
    console.log("Found f7e-data-tree elements:", dataTrees.length);

    if (dataTrees.length === 0) {
      return {
        url: documentUrl,
        data: null,
        error:
          "No document fields found. Make sure you are viewing a document.",
      };
    }

    // Parse the document structure
    const documentData = {};

    for (const tree of dataTrees) {
      // Skip if it's a nested child (we'll handle those recursively)
      if (
        tree.closest(".database-children") &&
        tree.parentElement.closest("f7e-data-tree")
      ) {
        continue;
      }

      parseDataTree(tree, documentData);
    }

    console.log("✓ Extracted data:", documentData);

    // Store data
    chrome.storage.local.set({
      documentUrl: documentUrl,
      documentData: documentData,
      timestamp: Date.now(),
    });

    return {
      url: documentUrl,
      data: documentData,
      error: null,
    };
  } catch (error) {
    console.error("Error extracting document data:", error);
    return { url: window.location.href, data: null, error: error.message };
  }
}

// Recursively parse a f7e-data-tree element
export function parseDataTree(treeElement, targetObject) {
  // Get the key name
  const keyElement = treeElement.querySelector(".database-key");
  if (!keyElement) return;

  const key = keyElement.textContent.trim();

  // Get the type
  const typeElement = treeElement.querySelector(".database-type");
  const type = typeElement
    ? typeElement.textContent.trim().replace(/[()]/g, "")
    : "";

  // Get the value (for leaf nodes)
  const valueElement = treeElement.querySelector(".database-leaf-value");

  // Check if it has children (nested structure)
  const childrenContainer = treeElement.querySelector(
    ":scope > .database-node > .database-children",
  );

  if (childrenContainer && childrenContainer.children.length > 0) {
    // It's a nested structure (object or array)
    const childTrees = childrenContainer.querySelectorAll(
      ":scope > f7e-data-tree",
    );

    if (type === "array") {
      // Handle as array
      targetObject[key] = [];
      for (const childTree of childTrees) {
        const childObj = {};
        parseDataTree(childTree, childObj);
        // Get the first (and only) key from childObj
        const childKey = Object.keys(childObj)[0];
        targetObject[key].push(childObj[childKey]);
      }
    } else {
      // Handle as object/map
      targetObject[key] = {};
      for (const childTree of childTrees) {
        parseDataTree(childTree, targetObject[key]);
      }
    }
  } else if (valueElement) {
    // It's a leaf node with a value
    let value = valueElement.textContent.trim();

    // Parse value based on type
    switch (type) {
      case "string":
        // Remove surrounding quotes if present
        value = value.replace(/^["']|["']$/g, "");
        targetObject[key] = value;
        break;
      case "double":
      case "number":
        targetObject[key] = Number(value);
        break;
      case "boolean":
        targetObject[key] = value === "true";
        break;
      case "null":
        targetObject[key] = null;
        break;
      default:
        targetObject[key] = value;
    }
  } else {
    // No value and no children (empty field or just type indicator)
    if (type === "null") {
      targetObject[key] = null;
    } else if (type === "array") {
      targetObject[key] = [];
    } else {
      targetObject[key] = {};
    }
  }
}

// Find the document panel's toolbar container (next to its kebab menu) that
// holds the inline "Copy JSON" button. Only the document panel's kebab is a
// valid anchor — see the comment on TOOLBAR_BUTTON_SELECTOR for why there is
// no structural fallback.
function findToolbarContainer() {
  const kebabButton = document.querySelector(TOOLBAR_BUTTON_SELECTOR);
  return kebabButton ? kebabButton.closest(".right-container") : null;
}

// Find (if still attached to the current toolbar) or create the shared
// button element used for both the loading state and the "Copy JSON" state,
// so switching between them never produces a duplicate. Also removes any
// copy of the button left behind in a different panel — Firebase's "Panel
// view" keeps root/collection panels mounted while only the document
// panel's content is torn down and rebuilt during navigation, which can
// otherwise orphan a button there from an earlier render.
function findOrCreateButton(toolbar) {
  document.querySelectorAll(`#${COPY_BUTTON_ID}`).forEach((existing) => {
    if (!toolbar.contains(existing)) existing.remove();
  });

  let button = document.getElementById(COPY_BUTTON_ID);
  if (!button || !toolbar.contains(button)) {
    button = document.createElement("button");
    button.id = COPY_BUTTON_ID;
    button.type = "button";
    button.style.cssText =
      "background:#34a853;color:#fff;border:none;border-radius:4px;" +
      "padding:4px 10px;margin-right:8px;font-size:12px;cursor:pointer;";
    button.addEventListener("mouseenter", () => {
      if (!button.disabled) button.style.background = "#2d8e47";
    });
    button.addEventListener("mouseleave", () => {
      if (!button.disabled) button.style.background = "#34a853";
    });
    toolbar.insertBefore(button, toolbar.firstChild);
  }
  return button;
}

// Show a disabled loading placeholder in the toolbar while extraction is
// pending (extraction runs on a delay to let Firebase Console finish
// rendering), so the button appears immediately instead of popping in only
// once data is ready. Never throws: a missing toolbar is a silent no-op,
// same as injectCopyButton.
export function injectLoadingButton() {
  const toolbar = findToolbarContainer();
  if (!toolbar) return;

  const button = findOrCreateButton(toolbar);
  button.disabled = true;
  button.style.cursor = "default";
  button.style.opacity = "0.7";
  button.textContent = "";
  button.onclick = null;

  const spinner = document.createElement("span");
  spinner.style.cssText =
    "display:inline-block;width:10px;height:10px;border-radius:50%;" +
    "border:2px solid rgba(255,255,255,0.5);border-top-color:#fff;" +
    "animation:firestore-ext-spin 0.6s linear infinite;";
  button.appendChild(spinner);

  if (!document.getElementById("firestore-ext-spin-keyframes")) {
    const style = document.createElement("style");
    style.id = "firestore-ext-spin-keyframes";
    style.textContent =
      "@keyframes firestore-ext-spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(style);
  }
}

// Inject (or refresh) the inline "Copy JSON" button into the Firebase
// Console document-panel toolbar, next to the kebab menu. Never throws:
// Firebase Console's DOM is outside this project's control, so a missing
// toolbar is a normal, silent no-op rather than an error.
export function injectCopyButton(data) {
  const toolbar = findToolbarContainer();

  if (!toolbar) {
    if (!toolbarNotFoundWarned) {
      console.warn(
        "Firestore Web Extension: toolbar not found, skipping inline Copy JSON button",
      );
      toolbarNotFoundWarned = true;
    }
    return;
  }

  const button = findOrCreateButton(toolbar);
  button.disabled = false;
  button.style.cursor = "pointer";
  button.style.opacity = "1";
  button.textContent = "Copy JSON";

  // Refresh the handler on every call so the button always copies the most
  // recently extracted document, not a stale one from an earlier render.
  button.onclick = () => {
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
      });
  };
}

// Message handler function
export function handleContentMessage(request, sender, sendResponse) {
  console.log("Received message:", request);

  if (request.action === "extractData") {
    const result = extractDocumentData();
    if (result.data) injectCopyButton(result.data);
    sendResponse(result);
  }
  return true;
}

// Initialize only in browser environment
if (typeof window !== "undefined" && typeof chrome !== "undefined") {
  // Run on initial load with delay to let page render
  injectLoadingButton();
  setTimeout(() => {
    console.log("Running initial extraction");
    const result = extractDocumentData();
    if (result.data) injectCopyButton(result.data);
  }, 2000);

  // Watch for URL changes (SPA navigation)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      console.log("URL changed from", lastUrl, "to", currentUrl);
      lastUrl = currentUrl;
      // Wait for page to render
      injectLoadingButton();
      setTimeout(() => {
        const result = extractDocumentData();
        if (result.data) injectCopyButton(result.data);
      }, 2000);
    }
  });

  // Start observing
  urlObserver.observe(document.body, { subtree: true, childList: true });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(handleContentMessage);
}
