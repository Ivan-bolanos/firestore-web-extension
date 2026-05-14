# 🔥 Firestore Web Extension

> A lightweight Chrome/Firefox extension to extract and export Firestore document data directly from Firebase Console - no configuration required!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/Ivan-bolanos/firestore-web-extension)](https://github.com/Ivan-bolanos/firestore-web-extension/releases)
[![CI](https://github.com/Ivan-bolanos/firestore-web-extension/workflows/CI/badge.svg)](https://github.com/Ivan-bolanos/firestore-web-extension/actions)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-7KB-brightgreen)](https://github.com/Ivan-bolanos/firestore-web-extension)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub stars](https://img.shields.io/github/stars/Ivan-bolanos/firestore-web-extension?style=social)](https://github.com/Ivan-bolanos/firestore-web-extension/stargazers)

## ✨ Features

- **🚀 Zero Configuration** - No Firebase config or API keys needed
- **🔐 Uses Your Auth** - Leverages your existing Firebase Console session
- **📦 Tiny Bundle** - Only 7KB total (no Firebase SDK dependency!)
- **🎯 One-Click Extract** - Grab document data with a single click
- **📋 Copy to Clipboard** - Instantly copy JSON to clipboard
- **🌳 Nested Data Support** - Handles complex nested objects and arrays
- **🔄 Live Updates** - Works with Firebase Console's SPA navigation
- **🎨 Clean UI** - Modern, intuitive interface

## 📦 Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ivan-bolanos/firestore-web-extension.git
   cd firestore-web-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

5. **Load in Firefox**
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `dist` folder

## 🚀 Usage

1. **Navigate to Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project
   - Open Firestore Database
   - Click on any document to view its details

2. **Open the Extension**
   - Click the extension icon in your browser toolbar
   - Click the "Refresh" button to extract current document data

3. **Copy the Data**
   - Click "Copy JSON" to copy to clipboard
   - Paste anywhere you need the data!

## 🏗️ How It Works

Unlike traditional Firestore tools that require API configuration, this extension:

1. **Reads the DOM** - Parses Firebase Console's rendered HTML structure
2. **Extracts Data** - Identifies field names, values, and types from the page
3. **Builds JSON** - Reconstructs the document as proper JSON
4. **No API Calls** - Uses what's already displayed on your screen

This approach means:
- ✅ No Firebase configuration needed
- ✅ Works with any Firebase project you have access to
- ✅ No separate authentication required
- ✅ Extremely lightweight (no SDK bloat)

## 🛠️ Development

### Available Scripts

```bash
# Development mode with watch
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run prettier

# Check formatting
npm run prettier:check
```

### Project Structure

```
firestore-web-extension/
├── src/
│   ├── background.js      # Background service worker
│   ├── contentScript.js   # DOM parser & data extraction
│   └── popup.js          # Extension popup logic
├── popup/
│   └── index.html        # Popup UI
├── __tests__/            # Jest tests
│   ├── contentScript.test.js
│   ├── popup.test.js
│   └── setup.js
├── dist/                 # Built extension (generated)
├── manifest.json         # Extension manifest
├── webpack.config.js     # Webpack configuration
└── package.json
```

## 🧪 Testing

This project uses Jest for testing with JSDOM environment.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

Current coverage:
- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run tests** (`npm test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Contribution Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation as needed
- Keep commits atomic and well-described

## 🐛 Troubleshooting

### Extension shows "No document data found"

- **Make sure you're on a document detail page**, not just the collection list
- **Click the "Refresh" button** to manually trigger extraction
- **Check the browser console** for any errors

### Data not updating

- **Reload the Firebase Console page** (F5)
- **Reload the extension** in `chrome://extensions/`
- **Clear extension storage**: Right-click extension icon → Inspect popup → Application tab → Clear storage

### Content script not loading

- **Check manifest.json** matches the built files in `dist/`
- **Verify Firebase Console URL** includes `/firestore/data/` or `/firestore/databases/`
- **Look for errors** in the extension console

## 📝 Technical Details

### Browser Compatibility

- ✅ Chrome/Chromium 120+
- ✅ Edge 120+
- ✅ Firefox 120+ (with WebExtension API)

### Permissions Required

- `storage` - Save extracted data temporarily
- `activeTab` - Access current tab content
- `scripting` - Inject content script
- `host_permissions` - Access Firebase Console pages

### Data Privacy

- ✅ All processing happens **locally** in your browser
- ✅ **No data is sent** to external servers
- ✅ **No analytics or tracking**
- ✅ Extension only accesses Firebase Console pages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Ivan Bolaños**

- GitHub: [@Ivan-bolanos](https://github.com/Ivan-bolanos)
- Email: [Your Email] (optional)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

## 📚 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)

## 🔮 Future Enhancements

- [ ] Export to CSV/Excel
- [ ] Batch export multiple documents
- [ ] Collection-level export
- [ ] Filter and search within documents
- [ ] History of extracted documents
- [ ] Dark mode
- [ ] Keyboard shortcuts

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Report a bug](https://github.com/Ivan-bolanos/firestore-web-extension/issues)
- 💡 [Request a feature](https://github.com/Ivan-bolanos/firestore-web-extension/issues)
- 📖 [Read the docs](https://github.com/Ivan-bolanos/firestore-web-extension)

---

Made with ❤️
