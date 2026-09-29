#!/bin/bash

# Firestore Web Extension - Release Preparation Script
# Bumps the version, builds, commits, tags, pushes, and publishes a
# GitHub release using the matching CHANGELOG.md section as release notes.
#
# Usage: ./scripts/prepare-release.sh [version]
#   version   e.g. 1.1.0 (no leading "v"). If omitted, you'll be prompted.

set -e

echo "🔥 Firestore Web Extension - Release Preparation"
echo "================================================"
echo ""

if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is required but not installed. See https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Not logged in to GitHub CLI. Run: gh auth login"
    exit 1
fi

# Refuse to release from a dirty working tree: the version bump commit must
# contain only the version bump, not whatever else happens to be staged.
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working tree is not clean. Commit or stash your changes first."
    git status --short
    exit 1
fi

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"
echo ""

NEW_VERSION="$1"
if [ -z "$NEW_VERSION" ]; then
    read -p "Enter new version (e.g., 1.0.0): " NEW_VERSION
fi

if [ -z "$NEW_VERSION" ]; then
    echo "❌ Version cannot be empty"
    exit 1
fi

if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Version must be in MAJOR.MINOR.PATCH form (e.g., 1.1.0), got: $NEW_VERSION"
    exit 1
fi

if git rev-parse "v$NEW_VERSION" &> /dev/null; then
    echo "❌ Tag v$NEW_VERSION already exists"
    exit 1
fi

# Extract this version's section from CHANGELOG.md: everything between its
# "## [x.y.z]" heading and the next "## [" heading (or end of file).
RELEASE_NOTES=$(awk -v ver="$NEW_VERSION" '
  /^## \[/ {
    if (found) exit
    if ($0 ~ ("^## \\[" ver "\\]")) { found=1; next }
    next
  }
  found { print }
' CHANGELOG.md)

if [ -z "$(echo "$RELEASE_NOTES" | tr -d '[:space:]')" ]; then
    echo "❌ No CHANGELOG.md section found for [$NEW_VERSION]."
    echo "   Add a \"## [$NEW_VERSION] - YYYY-MM-DD\" section before releasing."
    exit 1
fi

echo ""
echo "🔍 Checking prerequisites..."
echo ""

echo "▶ Running tests..."
npm test
echo "✅ Tests passed"
echo ""

echo "▶ Running linter..."
npm run lint || echo "⚠️  Linting issues detected (continuing anyway)"
echo ""

echo "▶ Building extension..."
npm run build
echo "✅ Build successful"
echo ""

echo "▶ Updating package.json version to $NEW_VERSION..."
npm version "$NEW_VERSION" --no-git-tag-version
echo "✅ package.json updated"
echo ""

echo "▶ Updating manifest.json version to $NEW_VERSION..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" manifest.json && rm manifest.json.bak
echo "✅ manifest.json updated"
echo ""

echo "▶ Creating release package..."
ZIP_NAME="firestore-web-extension-v$NEW_VERSION.zip"
(cd dist && zip -r "../$ZIP_NAME" . > /dev/null)
echo "✅ Release package created: $ZIP_NAME"
echo ""

echo "================================================"
echo "📋 Release notes (from CHANGELOG.md):"
echo "================================================"
echo "$RELEASE_NOTES"
echo "================================================"
echo ""

read -p "Commit, tag, push to origin/main, and publish this GitHub release? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Aborted. package.json/manifest.json were updated but not committed."
    echo "   Run 'git checkout package.json package-lock.json manifest.json' to undo."
    exit 1
fi

echo "▶ Committing version bump..."
git add package.json package-lock.json manifest.json
git commit -m "Release v$NEW_VERSION"

echo "▶ Tagging v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

echo "▶ Pushing commit and tag..."
git push origin HEAD
git push origin "v$NEW_VERSION"

echo "▶ Publishing GitHub release..."
gh release create "v$NEW_VERSION" \
    --title "v$NEW_VERSION" \
    --notes "$RELEASE_NOTES" \
    "$ZIP_NAME"

echo ""
echo "================================================"
echo "✅ Release v$NEW_VERSION published!"
echo "================================================"
