@echo off
REM Database Restore Script for Windows

SET BACKUP_DIR=G:\new sittha\ReactNativeAuthApp\backups
SET DB_NAME=yoga_attendance
SET DB_USER=root
SET DB_PASS=Koushik5@
SET MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo Available backups:
echo.
dir "%BACKUP_DIR%\*.sql" /b /o-d
echo.
SET /P BACKUP_FILE="Enter backup filename to restore: "

if not exist "%BACKUP_DIR%\%BACKUP_FILE%" (
    echo Error: Backup file not found!
    pause
    exit /b 1
)

echo.
echo WARNING: This will replace all data in %DB_NAME% database!
SET /P CONFIRM="Are you sure? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo Restore cancelled.
    pause
    exit /b 0
)

echo.
echo Restoring database from %BACKUP_FILE%...
%MYSQL_PATH%\mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%BACKUP_DIR%\%BACKUP_FILE%"

echo.
echo Database restored successfully!
pause
