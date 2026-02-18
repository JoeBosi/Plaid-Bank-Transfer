@echo off
REM Restart both backend and frontend (Plaid-Bank-Transfer)
REM Author: Giuseppe Bosi
REM Usage: Double-click or run from cmd.exe

setlocal enabledelayedexpansion

REM Default ports
set BACKEND_PORT=4001
set FRONTEND_PORT=4000

REM Read backend .env if exists
if exist "%~dp0backend\.env" (
    echo Reading backend .env file...
    for /f "tokens=2 delims==" %%a in ('findstr "APP_PORT" "%~dp0backend\.env" 2^>nul') do (
        set BACKEND_PORT=%%a
        echo Backend port set to !BACKEND_PORT!
    )
)

REM Read frontend .env if exists  
if exist "%~dp0frontend\.env" (
    echo Reading frontend .env file...
    for /f "tokens=2 delims==" %%a in ('findstr "PORT" "%~dp0frontend\.env" 2^>nul') do (
        set FRONTEND_PORT=%%a
        echo Frontend port set to !FRONTEND_PORT!
    )
)

echo === Stopping backend (port !BACKEND_PORT!) and frontend (port !FRONTEND_PORT!) ===

REM Kill processes on backend port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":!BACKEND_PORT!" 2^>nul') do (
    echo Stopping process on port !BACKEND_PORT! (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Additional check for Node processes on backend port
for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe" 2^>nul') do (
    for /f %%b in ('netstat -aon ^| findstr ":!BACKEND_PORT!" ^| findstr "%%a"') do (
        echo Force stopping Node process %%a on port !BACKEND_PORT!
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Kill processes on frontend port  
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":!FRONTEND_PORT!" 2^>nul') do (
    echo Stopping process on port !FRONTEND_PORT! (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo === Starting backend ===
cd /d "%~dp0backend"
if exist "package.json" (
    if not exist "node_modules" (
        echo Installing backend dependencies...
        call npm install
    )
)
start "Backend Server" cmd /k "node server.js"
echo Backend started on http://localhost:!BACKEND_PORT!

timeout /t 3 /nobreak >nul

echo === Starting frontend ===
cd /d "%~dp0frontend"
if exist "package.json" (
    if not exist "node_modules" (
        echo Installing frontend dependencies...
        call npm install
    )
)
start "Frontend Server" cmd /k "npm start"
echo Frontend started on http://localhost:!FRONTEND_PORT!

echo.
echo Done. Backend: http://localhost:!BACKEND_PORT! ^| Frontend: http://localhost:!FRONTEND_PORT!
echo Both servers are running in separate windows.
echo.
echo To stop servers, run: stop-servers.bat
pause
