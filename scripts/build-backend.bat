@echo off
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo Building backend JAR...
cd ..\backend
call mvn clean package -DskipTests
echo.
echo JAR built: backend\target\attendance-1.0.0.jar
echo.
pause
