@echo off
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo Starting Spring Boot Backend...
cd ..\backend
echo.
echo Checking if port 9000 is available...
netstat -ano | findstr :9000
if %errorlevel% == 0 (
    echo Port 9000 is already in use!
    echo.
    pause
    exit /b 1
)

echo Port 9000 is available. Starting backend...
echo.
call mvn spring-boot:run