# Contributing to Firestore Web Extension

First off, thank you for considering contributing to Firestore Web Extension! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots** if possible
- **Browser version** and operating system
- **Extension version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Provide specific examples** to demonstrate how it would work
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/firestore-web-extension.git
cd firestore-web-extension

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over Promise chains

### Testing

- Write tests for all new features
- Maintain at least 70% code coverage
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

```javascript
// Good test example
test("should parse string field correctly", () => {
  // Arrange
  const input = createMockElement("name", "John", "string");

  // Act
  const result = parseDataTree(input);

  // Assert
  expect(result).toEqual({ name: "John" });
});
```

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:

```
Add CSV export functionality

- Implement CSV generation from JSON
- Add download button to UI
- Write tests for CSV converter

Fixes #123
```

## Project Structure

```
firestore-web-extension/
├── src/
│   ├── background.js       # Service worker for background tasks
│   ├── contentScript.js    # Main extraction logic
│   └── popup.js           # Popup UI interactions
├── popup/
│   └── index.html         # Popup HTML structure
├── __tests__/
│   ├── contentScript.test.js
│   ├── popup.test.js
│   └── setup.js           # Test configuration
├── dist/                  # Build output (git-ignored)
├── manifest.json          # Extension manifest
└── webpack.config.js      # Build configuration
```

## Testing Your Changes

### Manual Testing

1. Build the extension: `npm run build`
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder
3. Test your changes:
   - Navigate to Firebase Console
   - Open a Firestore document
   - Click the extension icon
   - Verify your changes work as expected

### Automated Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Adding New Features

When adding new features:

1. **Discuss first**: Open an issue to discuss your idea before implementing
2. **Write tests**: Add tests that cover your new feature
3. **Update docs**: Update README.md and any relevant documentation
4. **Keep it simple**: Follow the KISS principle
5. **Performance**: Ensure your changes don't significantly impact performance

## Debugging Tips

### Content Script Debugging

1. Open Firebase Console
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for logs prefixed with "Firestore Web Extension:"

### Popup Debugging

1. Right-click the extension icon
2. Click "Inspect popup"
3. Use DevTools to debug popup code

### Background Script Debugging

1. Go to `chrome://extensions/`
2. Find "Firestore Web Extension"
3. Click "service worker" link under "Inspect views"

## Questions?

Don't hesitate to ask questions! Create an issue with the "question" label, and we'll be happy to help.

## Recognition

Contributors will be added to the README.md file. Thank you for your contributions!
