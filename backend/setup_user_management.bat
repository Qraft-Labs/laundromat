@echo off
echo ========================================
echo   Lush Laundry - User Management Setup
echo ========================================
echo.

echo This script will set up the User Management system by:
echo 1. Creating activity_logs and security_audit_logs tables
echo 2. Adding new fields to users table
echo 3. Creating necessary indexes
echo.

echo Prerequisites:
echo - PostgreSQL database must be running
echo - Database 'lush_laundry' must exist
echo - You need database credentials
echo.

set /p CONTINUE="Continue with setup? (Y/N): "
if /i not "%CONTINUE%"=="Y" (
    echo Setup cancelled.
    exit /b
)

echo.
echo Please provide your database connection details:
echo.

set /p DB_HOST="Database Host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Database Port (default: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set /p DB_NAME="Database Name (default: lush_laundry): "
if "%DB_NAME%"=="" set DB_NAME=lush_laundry

set /p DB_USER="Database User (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

echo.
echo ========================================
echo   Running Migration...
echo ========================================
echo.

:: Set PGPASSWORD environment variable (will be prompted if not set)
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f src\database\migrations\add_audit_logs.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ Migration Successful!
    echo ========================================
    echo.
    echo Tables created:
    echo   - activity_logs
    echo   - security_audit_logs
    echo.
    echo Indexes created:
    echo   - idx_activity_logs_user_id
    echo   - idx_activity_logs_action
    echo   - idx_activity_logs_created_at
    echo   - idx_activity_logs_resource
    echo   - idx_security_logs_user_id
    echo   - idx_security_logs_event_type
    echo   - idx_security_logs_created_at
    echo.
    echo User fields added:
    echo   - last_login
    echo   - approved_by
    echo   - approved_at
    echo   - rejection_reason
    echo.
    echo Next Steps:
    echo 1. Start the backend server: npm run dev
    echo 2. Start the frontend: npm run dev
    echo 3. Login as admin
    echo 4. Go to User Management page
    echo.
    echo ========================================
    echo   Setup Complete! 🎉
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ❌ Migration Failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. PostgreSQL is running
    echo 2. Database exists
    echo 3. User has proper permissions
    echo 4. Connection details are correct
    echo.
    echo Error code: %ERRORLEVEL%
    echo.
)

echo.
pause
