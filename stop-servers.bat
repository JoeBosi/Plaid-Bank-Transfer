@echo off
REM Stop backend and frontend servers (Plaid-Bank-Transfer)
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

set found_backend=0
set found_frontend=0

REM Kill processes on backend port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":!BACKEND_PORT!" 2^>nul') do (
    echo Stopping backend process on port !BACKEND_PORT! (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
    set found_backend=1
)

REM Kill processes on frontend port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":!FRONTEND_PORT!" 2^>nul') do (
    echo Stopping frontend process on port !FRONTEND_PORT! (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
    set found_frontend=1
)

if !found_backend!==0 echo No backend process found on port !BACKEND_PORT!
if !found_frontend!==0 echo No frontend process found on port !FRONTEND_PORT!

echo.
echo Done.
echo To restart servers, run: restart-all.bat
pause
