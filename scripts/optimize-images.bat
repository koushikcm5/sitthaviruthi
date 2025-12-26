@echo off
echo Optimizing images for smaller APK size...

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ImageMagick not found. Please install from: https://imagemagick.org/script/download.php
    echo Or use online tools to compress images manually
    pause
    exit /b
)

REM Optimize logo
echo Compressing logo.jpg...
magick assets\img\logo.jpg -quality 85 -resize 512x512 assets\img\logo_optimized.jpg
if exist assets\img\logo_optimized.jpg (
    del assets\img\logo.jpg
    ren assets\img\logo_optimized.jpg logo.jpg
    echo Logo optimized!
)

REM Optimize icon
echo Compressing icon.png...
magick assets\icon.png -quality 85 -resize 1024x1024 assets\icon_optimized.png
if exist assets\icon_optimized.png (
    del assets\icon.png
    ren assets\icon_optimized.png icon.png
    echo Icon optimized!
)

REM Optimize splash
echo Compressing splash.png...
magick assets\splash.png -quality 85 assets\splash_optimized.png
if exist assets\splash_optimized.png (
    del assets\splash.png
    ren assets\splash_optimized.png splash.png
    echo Splash optimized!
)

echo.
echo Image optimization complete!
echo Estimated savings: 5-10 MB
pause
