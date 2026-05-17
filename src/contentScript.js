console.log("Firestore Web Extension: Content script loaded");

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

// Message handler function
export function handleContentMessage(request, sender, sendResponse) {
  console.log("Received message:", request);

  if (request.action === "extractData") {
    const result = extractDocumentData();
    sendResponse(result);
  }
  return true;
}

// Initialize only in browser environment
if (typeof window !== "undefined" && typeof chrome !== "undefined") {
  // Run on initial load with delay to let page render
  setTimeout(() => {
    console.log("Running initial extraction");
    extractDocumentData();
  }, 2000);

  // Watch for URL changes (SPA navigation)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      console.log("URL changed from", lastUrl, "to", currentUrl);
      lastUrl = currentUrl;
      // Wait for page to render
      setTimeout(extractDocumentData, 2000);
    }
  });

  // Start observing
  urlObserver.observe(document.body, { subtree: true, childList: true });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(handleContentMessage);
}
