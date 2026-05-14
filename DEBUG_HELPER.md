# Debug Helper

If the extension isn't extracting data correctly, use this JavaScript code in the Firebase Console to understand the page structure.

## Run in Console

Open Firebase Console, press F12, go to Console tab, and run:

```javascript
// Helper function to inspect Firebase Console DOM
function debugFirestoreDOM() {
  console.log("=== FIRESTORE DOCUMENT PAGE DEBUG ===");
  console.log("URL:", window.location.href);
  console.log("\n--- Looking for field elements ---");

  // Check various selectors
  const selectors = [
    'tr[class*="field"]',
    "tr.mat-row",
    'div[class*="field-row"]',
    '[data-testid*="field"]',
    ".cdk-row",
    "td.mat-cell",
    'input[type="text"]',
    "textarea",
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`\nFound ${elements.length} elements for: ${selector}`);
      console.log("First element:", elements[0]);
      console.log("HTML:", elements[0].outerHTML.substring(0, 200));
    }
  });

  // Look for any input fields (document editor mode)
  console.log("\n--- Input fields ---");
  const inputs = document.querySelectorAll("input, textarea");
  console.log(`Found ${inputs.length} input/textarea elements`);

  // Sample first few
  Array.from(inputs)
    .slice(0, 5)
    .forEach((input, i) => {
      console.log(`Input ${i}:`, {
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        value: input.value?.substring(0, 50),
        labels: Array.from(
          document.querySelectorAll(`label[for="${input.id}"]`),
        ).map((l) => l.textContent),
      });
    });

  // Try to find the document data structure
  console.log("\n--- Trying to find document structure ---");
  const documentBody = document.querySelector(
    '[class*="document"], [class*="editor"], main, [role="main"]',
  );
  if (documentBody) {
    console.log("Document container found:", documentBody.className);
    console.log("Children count:", documentBody.children.length);
  }

  // Look for any JSON data
  console.log("\n--- Looking for JSON ---");
  const codeElements = document.querySelectorAll("pre, code");
  codeElements.forEach((el, i) => {
    const text = el.textContent.trim();
    if (text.length > 10 && text.length < 1000) {
      console.log(`Code element ${i}:`, text.substring(0, 100));
    }
  });

  console.log("\n=== END DEBUG ===");
}

// Run it
debugFirestoreDOM();
```

## What to Look For

After running the script, look for:

1. **Which selector found elements?**
   - Note the selector that returned elements (e.g., "tr.mat-row")
   - Check if the HTML structure makes sense for field data

2. **Input fields**
   - If you're in edit mode, there might be input fields
   - Check if field names are in labels or placeholders

3. **Document container**
   - The main container holding all document fields

4. **JSON data**
   - Sometimes Firebase Console includes JSON in a `<pre>` tag

## Share Results

If you need help, share:

1. The console output from the debug script
2. A screenshot of the document page
3. The URL pattern (e.g., `/firestore/data/~2Fusers~2F123`)

## Quick Fix Template

Once you identify the correct selectors, you can update the content script. For example:

If fields are in `tr.my-custom-class` with `td` containing name and value:

```javascript
// In contentScript.js, update the possibleSelectors array:
const possibleSelectors = [
  "tr.my-custom-class", // <-- Add your selector here
  'tr[class*="field"]',
  // ... rest of selectors
];
```
