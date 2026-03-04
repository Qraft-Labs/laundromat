@echo off
echo.
echo ========================================
echo   LUSH LAUNDRY - Starting Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "Lush Laundry - Backend API" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server (Port 8080)...
start "Lush Laundry - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   SERVERS STARTED!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend UI:  http://localhost:8080
echo.
echo Press any key to exit this window...
echo (Backend and Frontend will keep running)
echo.
pause > nul
