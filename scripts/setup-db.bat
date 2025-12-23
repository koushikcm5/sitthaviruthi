@echo off
echo Setting up database...
echo.
echo Running database-setup.sql...
mysql -u root -p < ..\database\database-setup.sql
echo.
echo Creating admin user...
mysql -u root -p < ..\database\create-admin.sql
echo.
echo Database setup complete!
echo Default admin credentials:
echo Username: admin
echo Password: admin123
echo.
pause
