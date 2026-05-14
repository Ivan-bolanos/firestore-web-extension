# Firestore Web Extension - Usage Guide

## Installation

1. Build the extension:

   ```bash
   npm install
   npm run build
   ```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## How It Works

This extension extracts Firestore document data directly from the Firebase Console DOM - **no Firebase configuration needed**! Since you're already authenticated in Firebase Console, the extension simply reads the data that's already displayed on your screen.

## Usage

1. Navigate to Firebase Console: `https://console.firebase.google.com`
2. Go to Firestore Database
3. Open any document
4. Click the extension icon in your browser toolbar
5. Click "Refresh" to extract the current document data
6. Click "Copy JSON" to copy the data to your clipboard

## Troubleshooting

### "No document data found"

- Make sure you're on a Firestore document detail page
- Try clicking the "Refresh" button
- Check if the document has fields displayed in Firebase Console

### Extension shows "Loading document..."

- Click the "Refresh" button to manually extract data
- Make sure you're on the correct page in Firebase Console

### Content script error

- Reload the Firebase Console page
- Reload the extension in `chrome://extensions/`

## Development

- `npm run dev` - Watch mode for development
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run prettier` - Format code

## No Firebase Config Required!

Unlike the previous version, this extension doesn't require any Firebase configuration file because:

- It reads data directly from the DOM (what you see in Firebase Console)
- You're already authenticated in Firebase Console
- No direct API calls are made to Firebase

This makes it much simpler and more secure!
