# Play Store Release Guide

## Prerequisites
1. Android Studio installed
2. Java JDK 17+
3. Gradle configured

## Generate Signing Key
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias yoga-app -keyalg RSA -keysize 2048 -validity 10000
```

## Build Release APK
1. Place `release.keystore` in `frontend/android/`
2. Update credentials in `frontend/android/build.gradle`
3. Run: `scripts\build-apk.bat`
4. APK location: `frontend/android/app/build/outputs/apk/release/app-release.apk`

## Play Store Submission
1. Create app in Google Play Console
2. Upload APK/AAB
3. Complete store listing
4. Submit for review

## App Details
- Package: com.sitthaviruthi.yoga
- Version: 1.0.0
- Min SDK: 23 (Android 6.0)
- Target SDK: 34 (Android 14)
