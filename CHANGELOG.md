# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-14

### Added
- Initial release of Firestore Web Extension
- DOM-based data extraction from Firebase Console
- Support for all Firestore data types (string, number, boolean, null, map, array)
- Nested object and array parsing
- One-click refresh to extract current document
- Copy to clipboard functionality
- Modern, clean UI with refresh and copy buttons
- Zero configuration - uses existing Firebase Console authentication
- Support for Chrome/Chromium, Edge, and Firefox browsers
- Automatic detection of SPA navigation in Firebase Console
- Comprehensive test suite with Jest
- CI/CD pipeline with GitHub Actions
- Full documentation (README, CONTRIBUTING, LICENSE)

### Technical Details
- Manifest V3 compliance
- Webpack-based build system
- No Firebase SDK dependency (7KB total bundle size)
- Content script with f7e-data-tree parser
- Service worker background script
- Modern ES6+ JavaScript

### Features
- 🚀 Zero Configuration
- 🔐 Uses Your Auth
- 📦 Tiny Bundle (7KB)
- 🎯 One-Click Extract
- 📋 Copy to Clipboard
- 🌳 Nested Data Support
- 🔄 Live Updates
- 🎨 Clean UI

## [Unreleased]

### Planned Features
- Export to CSV/Excel
- Batch export multiple documents
- Collection-level export
- Filter and search within documents
- History of extracted documents
- Dark mode
- Keyboard shortcuts
- Firefox Add-ons store release
- Chrome Web Store release
