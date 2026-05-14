#!/bin/bash

# Firestore Web Extension - Release Preparation Script
# This script helps prepare a new release

set -e

echo "🔥 Firestore Web Extension - Release Preparation"
echo "================================================"
echo ""

# Get version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"
echo ""

# Ask for new version
read -p "Enter new version (e.g., 1.0.0): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo "❌ Version cannot be empty"
    exit 1
fi

echo ""
echo "🔍 Checking prerequisites..."
echo ""

# Run tests
echo "▶ Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Fix them before releasing."
    exit 1
fi
echo "✅ Tests passed"
echo ""

# Run linter
echo "▶ Running linter..."
npm run lint || echo "⚠️  Linting issues detected (continuing anyway)"
echo ""

# Build
echo "▶ Building extension..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Update version in package.json
echo "▶ Updating package.json version to $NEW_VERSION..."
npm version $NEW_VERSION --no-git-tag-version
echo "✅ package.json updated"
echo ""

# Update version in manifest.json
echo "▶ Updating manifest.json version to $NEW_VERSION..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" manifest.json && rm manifest.json.bak
echo "✅ manifest.json updated"
echo ""

# Create release package
echo "▶ Creating release package..."
cd dist
zip -r ../firestore-web-extension-v$NEW_VERSION.zip . > /dev/null
cd ..
echo "✅ Release package created: firestore-web-extension-v$NEW_VERSION.zip"
echo ""

# Summary
echo "================================================"
echo "✅ Release prepared successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update CHANGELOG.md with version $NEW_VERSION changes"
echo "2. Review changes: git diff"
echo "3. Commit: git add . && git commit -m 'Release v$NEW_VERSION'"
echo "4. Tag: git tag -a v$NEW_VERSION -m 'Release version $NEW_VERSION'"
echo "5. Push: git push origin main && git push origin v$NEW_VERSION"
echo "6. Create GitHub release and upload: firestore-web-extension-v$NEW_VERSION.zip"
echo ""
echo "See RELEASE_GUIDE.md for detailed instructions"
echo "================================================"
