# APK Size Optimization Guide

Current APK Size: **77 MB**
Target: **< 30 MB**

## Immediate Actions (Can reduce to ~25-35 MB)

### 1. Enable App Bundle (AAB) instead of APK
```json
// eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"  // Instead of apk
      }
    }
  }
}
```
**Savings: 30-40%** - Google Play automatically optimizes for each device

### 2. Enable ProGuard/R8 (Code Shrinking)
```json
// app.json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true
    }
  }
}
```
**Savings: 20-30%**

### 3. Optimize Images
```bash
# Compress all images in assets/
npm install -g imagemin-cli
imagemin assets/**/*.{jpg,png} --out-dir=assets/ --plugin=pngquant --plugin=mozjpeg
```
**Current logo.jpg: Compress to WebP format**
**Savings: 5-10 MB**

### 4. Remove Unused Dependencies
Check and remove:
```bash
npm uninstall expo-screen-capture  # If not critical
# Review package.json for unused packages
```

### 5. Split APKs by Architecture
```json
// app.json
{
  "expo": {
    "android": {
      "enableDangerousExperimentalLeanBuilds": true
    }
  }
}
```
**Savings: 40-50%** - Separate APKs for arm64-v8a, armeabi-v7a, x86

## Medium Priority (Additional 5-10 MB)

### 6. Use Hermes Engine
```json
// app.json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```
**Savings: 3-5 MB** + Better performance

### 7. Remove Development Code
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
    },
  },
};
```

### 8. Optimize Video Player
Replace heavy video libraries with lightweight alternatives:
```bash
npm uninstall react-native-video
npm install react-native-video-lite
```

### 9. Use CDN for Static Assets
Move images/videos to CDN instead of bundling:
- Logo → Load from server
- Splash screen → Minimal local asset

## Advanced (Requires Code Changes)

### 10. Dynamic Imports
```javascript
// Load heavy components only when needed
const AdminDashboard = lazy(() => import('./screens/admin/AdminDashboard'));
```

### 11. Remove Unused Fonts
```json
// app.json - Only include fonts you use
{
  "expo": {
    "android": {
      "allowBackup": false
    }
  }
}
```

### 12. Analyze Bundle Size
```bash
npx react-native-bundle-visualizer
```

## Quick Implementation Steps

1. **Immediate (5 minutes):**
```bash
cd frontend
# Enable ProGuard
# Add to app.json:
"android": {
  "enableProguardInReleaseBuilds": true,
  "enableShrinkResourcesInReleaseBuilds": true
}
```

2. **Image Optimization (10 minutes):**
```bash
# Compress logo
convert assets/img/logo.jpg -quality 85 -resize 512x512 assets/img/logo.jpg
```

3. **Build AAB instead of APK (2 minutes):**
```bash
eas build --platform android --profile production
# Select "app-bundle" when prompted
```

## Expected Results

| Optimization | Size Reduction | Effort |
|-------------|----------------|--------|
| App Bundle (AAB) | -25 MB | Low |
| ProGuard/R8 | -15 MB | Low |
| Image Compression | -8 MB | Low |
| Split APKs | -20 MB | Medium |
| Remove Unused Deps | -5 MB | Medium |
| **Total Possible** | **-73 MB** | |
| **Final Size** | **~15-25 MB** | |

## Recommended Priority Order

1. ✅ Enable App Bundle (AAB) - **Biggest impact**
2. ✅ Enable ProGuard/R8
3. ✅ Compress images
4. ✅ Split APKs by architecture
5. ⚠️ Remove unused dependencies
6. ⚠️ Use Hermes engine

## Notes

- **App Bundle (AAB)** is required for Google Play Store anyway
- Users will download **only their architecture** (arm64 OR arm32, not both)
- Final download size will be **20-30 MB** for most users
- Initial 77 MB includes all architectures + debug symbols
