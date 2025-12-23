@echo off
echo Building APK for Play Store...
cd ..\frontend
call npm install
cd android
call gradlew assembleRelease
echo APK built: frontend\android\app\build\outputs\apk\release\app-release.apk
pause
