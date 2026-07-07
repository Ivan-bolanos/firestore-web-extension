# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-07

### 🎉 Initial Release

#### Added

- ✨ Zero-configuration Firestore document extraction
- 📋 One-click copy to clipboard functionality
- 🌳 Full support for nested objects and arrays
- 🔄 Live SPA navigation support for Firebase Console
- 🎯 Parse all Firestore data types (string, number, boolean, map, array, null)
- 💾 Temporary storage of extracted data
- 🔄 Manual refresh capability
- 🎨 Clean and intuitive popup UI

#### Technical

- 🧪 92% test coverage with Jest
- 📦 Webpack bundling (production-ready)
- 🔍 ESLint + Prettier for code quality
- 🚀 GitHub Actions CI/CD pipeline (Node.js 20.x and 22.x)
- 📱 Manifest V3 compliance
- 🌐 Support for Chrome, Edge, and Firefox

#### Security & Privacy

- 🔐 All processing happens locally
- 🚫 No external servers or analytics
- ✅ Minimal permissions (storage, activeTab, scripting)
- 🔒 Only accesses Firebase Console pages

### Notes

- First stable release ready for Chrome Web Store
- Fully tested on Node.js 20.x and 22.x
- Bundle size: ~7KB total

## [Unreleased]

### Planned Features

- Export to CSV/Excel
- Batch export multiple documents
- Collection-level export
- Filter and search within documents
- History of extracted documents
- Dark mode
- Keyboard shortcuts

[1.0.0]: https://github.com/Ivan-bolanos/firestore-web-extension/releases/tag/v1.0.0
