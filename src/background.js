// background.js

// Message handler function
export function handleMessage(request, sender, sendResponse) {
  if (request.action === "getDocument") {
    sendResponse({ status: "success", message: "Document request received." });
  }

  // Return true to use sendResponse asynchronously
  return true;
}

// Setup listener (only in non-test environment)
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessage.addListener(handleMessage);
}

