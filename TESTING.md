# Testing the Extension

## Setup

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Testing Steps

1. **Navigate to Firebase Console**
   - Open https://console.firebase.google.com
   - Select your project
   - Go to Firestore Database
   - Click on any collection
   - Click on any document to view its details

2. **Open Developer Tools** (to see logs)
   - Press F12 or right-click → Inspect
   - Go to the Console tab
   - You should see: "Firestore Web Extension: Content script loaded"

3. **Check Content Script**
   - In the Console, look for messages like:
     - "Running initial extraction"
     - "Extracting data from: [URL]"
     - "Found X elements with selector: [selector]"
     - "Extracted data: [data]"

4. **Open Extension Popup**
   - Click the extension icon in your toolbar
   - Click "Refresh" button
   - Check if data appears

## Debugging

### Check Console Logs

In the Firebase Console page (F12 → Console):
```javascript
// Check if extension is loaded
console.log('Extension loaded?', !!chrome.runtime.id);

// Manually trigger extraction
chrome.runtime.sendMessage({action: 'extractData'}, response => {
    console.log('Response:', response);
});
```

### Check Storage

In popup console (right-click extension icon → Inspect popup):
```javascript
chrome.storage.local.get(null, (data) => {
    console.log('Storage:', data);
});
```

### Common Issues

1. **"Not on a Firestore document page"**
   - Make sure URL contains `/firestore/data/` or `/firestore/databases/`
   - You need to be viewing a document detail page, not just the collection list

2. **"Could not extract document data"**
   - Firebase Console structure might have changed
   - Open DevTools and check the page structure
   - Look at the console logs to see what selectors were tried

3. **Content script not loading**
   - Reload the Firebase Console page
   - Check `chrome://extensions/` for errors
   - Make sure the extension is enabled

4. **Popup shows "Please refresh"**
   - Reload the extension: `chrome://extensions/` → click reload icon
   - Reload the Firebase Console page
   - Click "Refresh" in the extension popup

## Advanced Debugging

If the automatic extraction doesn't work, you can inspect the Firebase Console DOM:

1. Open DevTools (F12)
2. Click the "Elements" tab
3. Use the element picker (top-left icon)
4. Click on a field name in the document
5. Look at the HTML structure
6. Note the class names and structure
7. Update `contentScript.js` with the correct selectors

Common Firebase Console structures:
- `<tr class="mat-row">` - Material Design table rows
- `<td class="mat-cell">` - Table cells
- `<div class="field-name">` and `<div class="field-value">` - Field pairs
- Angular/Material components with classes like `cdk-row`, `mat-form-field`
