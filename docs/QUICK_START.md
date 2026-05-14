# 🚀 Quick Start Guide

Get the Firestore Web Extension up and running in 5 minutes!

## ⚡ Installation (Users)

### Option 1: From GitHub Release (Recommended)

1. Download the latest release: [Releases](https://github.com/Ivan-bolanos/firestore-web-extension/releases)
2. Unzip `firestore-web-extension-v1.0.0.zip`
3. Open Chrome/Edge and go to `chrome://extensions/`
4. Enable "Developer mode" (top right)
5. Click "Load unpacked" and select the unzipped folder
6. Done! 🎉

### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/Ivan-bolanos/firestore-web-extension.git
cd firestore-web-extension

# Install dependencies
npm install

# Build extension
npm run build

# Load extension
# Open chrome://extensions/ and load the 'dist' folder
```

## 🎯 First Use

1. **Open Firebase Console**
   - Navigate to https://console.firebase.google.com
   - Select your project
   - Go to Firestore Database

2. **Open a Document**
   - Click on any collection
   - Click on any document to view its details

3. **Extract Data**
   - Click the extension icon (🔥) in your browser toolbar
   - Click "Refresh" button
   - See your document data as JSON!

4. **Copy Data**
   - Click "Copy JSON" button
   - Paste into your editor, script, or tool

## 💡 Common Use Cases

### Export for Testing
```javascript
// Copy document data
// Paste into your test file
const testData = {
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
};
```

### Debug Production Data
1. Open production Firestore document
2. Extract with extension
3. Compare with expected values
4. Identify data issues

### Quick Documentation
1. Extract sample document
2. Share JSON structure with team
3. Use in API documentation

### Data Migration
1. Extract documents from old structure
2. Transform data format
3. Import to new structure

## 🐛 Troubleshooting

### Extension icon doesn't appear
- Make sure extension is installed and enabled
- Check `chrome://extensions/` for errors
- Reload the extension

### "No document data found"
- Ensure you're on a document detail page (not collection list)
- Click "Refresh" button manually
- Check browser console for errors (F12)

### Data looks incorrect
- Reload Firebase Console page
- Reload extension
- Check if document structure changed

## 🔧 Configuration

No configuration needed! The extension uses your existing Firebase Console authentication.

## 📚 Learn More

- [Full Documentation](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Report Issues](https://github.com/Ivan-bolanos/firestore-web-extension/issues)

## 🎓 Pro Tips

1. **Keyboard Shortcut**: Set up a custom keyboard shortcut in `chrome://extensions/shortcuts`
2. **Pin Extension**: Right-click the extension icon → "Pin"
3. **Multiple Windows**: Extension works across all tabs and windows
4. **Privacy**: All processing happens locally in your browser

## ❓ Need Help?

- 📖 Check the [FAQ](../README.md#troubleshooting)
- 🐛 [Open an issue](https://github.com/Ivan-bolanos/firestore-web-extension/issues)
- 💬 Join discussions

---

**Happy extracting! 🔥**
