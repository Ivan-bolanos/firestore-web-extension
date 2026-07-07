# Privacy Policy for Firestore Web Extension

**Last Updated:** July 7, 2026

## Overview

Firestore Web Extension ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how the Extension handles data when you use it.

## Data Collection

**The Extension does NOT collect, transmit, store, or share any personal data or user information.**

### What We Don't Do

- ❌ **No Data Collection** - We do not collect any personal information, browsing history, or usage analytics
- ❌ **No External Servers** - We do not send any data to external servers or third parties
- ❌ **No Tracking** - We do not track your activity, behavior, or usage patterns
- ❌ **No Analytics** - We do not use any analytics services (Google Analytics, Mixpanel, etc.)
- ❌ **No Cookies** - We do not set or use any cookies
- ❌ **No Third-Party Services** - We do not integrate with any third-party services that could collect data

## How the Extension Works

The Extension operates entirely locally in your browser:

1. **Document Reading** - The Extension reads Firestore document data directly from the Firebase Console page DOM (the HTML you already see on your screen)
2. **Local Processing** - All data parsing and JSON formatting happens locally in your browser using JavaScript
3. **Temporary Storage** - Extracted document data is temporarily stored in your browser's local storage (chrome.storage.local) so you can access it when you open the Extension popup
4. **Clipboard Copy** - When you click "Copy JSON," the data is copied to your system clipboard using the browser's Clipboard API

**All of this happens entirely on your device. Nothing leaves your computer.**

## Permissions Explained

The Extension requests the following permissions, and here's why:

### `storage`
- **Purpose:** To temporarily store extracted Firestore document data in your local browser storage
- **Scope:** Data is stored only locally on your device and is never transmitted anywhere

### `activeTab`
- **Purpose:** To access the current Firebase Console tab you're viewing
- **Scope:** Only accesses the active tab when you click the Extension icon

### `scripting`
- **Purpose:** To inject the content script that reads Firestore document data from the Firebase Console page
- **Scope:** Only runs on Firebase Console pages (console.firebase.google.com)

### `host_permissions: console.firebase.google.com`
- **Purpose:** To access Firebase Console pages where Firestore documents are displayed
- **Scope:** The Extension only works on Firebase Console pages and has no access to any other websites

## Data Security

Since the Extension does not collect, transmit, or store any data on external servers:

- ✅ Your Firestore data never leaves your browser
- ✅ No risk of data breaches from our side (we have no servers to breach)
- ✅ No risk of unauthorized access to your data through the Extension

## Firebase Authentication

The Extension uses your existing Firebase Console session:

- The Extension does NOT access, store, or transmit your Firebase credentials
- The Extension does NOT perform any Firebase authentication
- You remain logged in through Google's Firebase Console - the Extension simply reads what's already displayed on your screen

## Changes to Firestore Data

The Extension is **read-only**:

- ❌ It does NOT modify your Firestore documents
- ❌ It does NOT write to your Firestore database
- ❌ It does NOT delete any data
- ✅ It only reads and formats what you already see on the Firebase Console page

## Open Source

The Extension is fully open source:

- **Source Code:** https://github.com/Ivan-bolanos/firestore-web-extension
- **Transparency:** You can inspect the entire codebase to verify our privacy claims
- **Community Review:** The code is publicly available for security researchers and developers to review

## Children's Privacy

The Extension does not knowingly collect any information from anyone, including children under the age of 13.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically.

If we make material changes to how we handle user data (for example, if we start collecting data in the future), we will notify users through:
- An update to this Privacy Policy
- A notification in the Extension's Chrome Web Store listing
- A prominent notice in the Extension itself

## Contact

If you have any questions or concerns about this Privacy Policy or the Extension's privacy practices, please contact us:

- **GitHub Issues:** https://github.com/Ivan-bolanos/firestore-web-extension/issues
- **Email:** [Your contact email]

## Legal Compliance

This Extension complies with:
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Chrome Web Store Developer Program Policies

Since the Extension does not collect any personal data, most data protection regulations do not apply. However, we are committed to user privacy and transparency.

## Your Rights

Even though we don't collect any data, you have the right to:

- **Access:** View the Extension's source code on GitHub
- **Deletion:** Uninstall the Extension at any time to remove all local data stored by it
- **Transparency:** Contact us with any questions about how the Extension works

## Summary

**In short:** Firestore Web Extension does not collect, store, transmit, or share any of your data. Everything happens locally in your browser. Your privacy is fully protected.

---

**Developer:** Ivan Bolaños  
**Project:** https://github.com/Ivan-bolanos/firestore-web-extension  
**License:** MIT
