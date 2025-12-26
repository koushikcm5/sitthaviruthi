@echo off
REM Database Backup Script for Windows
REM Run this daily using Task Scheduler

SET BACKUP_DIR=G:\new sittha\ReactNativeAuthApp\backups
SET DB_NAME=yoga_attendance
SET DB_USER=root
SET DB_PASS=Koushik5@
SET MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin"

REM Create backup directory if not exists
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Generate filename with date
SET FILENAME=%DB_NAME%_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
SET FILENAME=%FILENAME: =0%

REM Create backup
echo Creating backup: %FILENAME%
%MYSQL_PATH%\mysqldump -u %DB_USER% -p%DB_PASS% %DB_NAME% > "%BACKUP_DIR%\%FILENAME%"

REM Delete backups older than 30 days
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" 2>nul

echo Backup completed: %BACKUP_DIR%\%FILENAME%
echo.
echo Total backups in folder:
dir "%BACKUP_DIR%\*.sql" /b | find /c ".sql"
