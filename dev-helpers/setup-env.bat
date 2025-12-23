@echo off
echo ========================================
echo   Security Environment Setup
echo ========================================
echo.
echo This script will help you set up environment variables securely.
echo.

:DB_PASSWORD
set /p DB_PASSWORD="Enter MySQL Database Password: "
if "%DB_PASSWORD%"=="" (
    echo Error: Database password cannot be empty!
    goto DB_PASSWORD
)

:JWT_SECRET
set /p JWT_SECRET="Enter JWT Secret (min 32 chars): "
if "%JWT_SECRET%"=="" (
    echo Error: JWT secret cannot be empty!
    goto JWT_SECRET
)

:MAIL_USERNAME
set /p MAIL_USERNAME="Enter Gmail Email Address: "
if "%MAIL_USERNAME%"=="" (
    echo Error: Email cannot be empty!
    goto MAIL_USERNAME
)

:MAIL_PASSWORD
set /p MAIL_PASSWORD="Enter Gmail App Password: "
if "%MAIL_PASSWORD%"=="" (
    echo Error: Gmail app password cannot be empty!
    goto MAIL_PASSWORD
)

echo.
echo Setting environment variables...
echo.

setx DB_USERNAME "root"
setx DB_PASSWORD "%DB_PASSWORD%"
setx JWT_SECRET "%JWT_SECRET%"
setx MAIL_USERNAME "%MAIL_USERNAME%"
setx MAIL_PASSWORD "%MAIL_PASSWORD%"

echo.
echo ========================================
echo   Environment Variables Set!
echo ========================================
echo.
echo IMPORTANT: Close and reopen your terminal/IDE for changes to take effect.
echo.
echo Next steps:
echo 1. Close this window
echo 2. Close your IDE/terminal
echo 3. Reopen and run: cd backend ^&^& mvn spring-boot:run
echo.
pause
