# Release Guide

This guide will help you create and publish releases for the Firestore Web Extension.

## Prerequisites

- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated with version changes
- [ ] No open critical bugs

## Release Process

### 1. Update Version

Update version in `package.json` and `manifest.json`:

```bash
# Example for version 1.0.0
# package.json: "version": "1.0.0"
# manifest.json: "version": "1.0.0"
```

### 2. Update CHANGELOG.md

Add release notes:

```markdown
## [1.0.0] - 2026-05-14

### Added

- Feature A
- Feature B

### Fixed

- Bug X
- Bug Y
```

### 3. Commit and Tag

```bash
# Commit changes
git add package.json manifest.json CHANGELOG.md
git commit -m "Release v1.0.0"

# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push commits and tags
git push origin main
git push origin v1.0.0
```

### 4. Create GitHub Release

1. Go to https://github.com/Ivan-bolanos/firestore-web-extension/releases
2. Click "Draft a new release"
3. Choose the tag you just created (v1.0.0)
4. Set release title: `v1.0.0 - Initial Release`
5. Copy release notes from CHANGELOG.md
6. Attach files:
   - `dist.zip` (zipped dist folder)
   - `source.zip` (optional, source code)

### 5. Build Release Package

```bash
# Clean build
rm -rf dist/
npm run build

# Create zip for Chrome Web Store / Firefox Add-ons
cd dist
zip -r ../firestore-web-extension-v1.0.0.zip .
cd ..
```

### 6. Upload Release Assets

Upload `firestore-web-extension-v1.0.0.zip` to the GitHub release.

## Version Numbering (Semantic Versioning)

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

Examples:

- `1.0.0` → First stable release
- `1.1.0` → Added export to CSV feature
- `1.1.1` → Fixed CSV export bug
- `2.0.0` → Changed API, breaking changes

## Publishing to Stores (Future)

### Chrome Web Store

1. Create developer account: https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 registration fee
3. Upload `dist.zip`
4. Fill in store listing details
5. Submit for review (1-3 days)

### Firefox Add-ons

1. Create developer account: https://addons.mozilla.org/developers/
2. Upload `dist.zip` (signed automatically)
3. Fill in listing details
4. Submit for review (1-3 days)

### Edge Add-ons

1. Use Microsoft Partner Center
2. Upload same package as Chrome
3. Review process similar to Chrome

## Post-Release Checklist

- [ ] GitHub release published
- [ ] Release announcement posted (Twitter, Reddit, etc.)
- [ ] README badges updated
- [ ] Documentation updated
- [ ] Users notified (if applicable)
- [ ] Monitor for issues

## Hotfix Process

For critical bugs in production:

1. Create hotfix branch from tag

   ```bash
   git checkout -b hotfix/v1.0.1 v1.0.0
   ```

2. Fix the bug and test

3. Update version to patch (1.0.1)

4. Commit, tag, and release

   ```bash
   git commit -m "Fix critical bug X"
   git tag -a v1.0.1 -m "Hotfix: Fix critical bug X"
   git push origin hotfix/v1.0.1
   git push origin v1.0.1
   ```

5. Merge back to main
   ```bash
   git checkout main
   git merge hotfix/v1.0.1
   git push origin main
   ```

## Rollback

If a release has critical issues:

1. Unpublish from stores (if published)
2. Create new release with previous version
3. Notify users
4. Fix issues in next release

## Questions?

Contact maintainers or open an issue.
