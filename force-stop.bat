@echo off
REM Force stop all Node processes and clean ports
REM Author: Giuseppe Bosi

echo === Force stopping all Node processes ===
taskkill /F /IM node.exe >nul 2>&1

echo === Cleaning ports 4000 and 4001 ===
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000" 2^>nul') do (
    echo Killing process on port 4000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4001" 2^>nul') do (
    echo Killing process on port 4001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo === Waiting for processes to terminate ===
timeout /t 3 /nobreak >nul

echo === Verifying ports are free ===
netstat -aon | findstr ":4000" >nul 2>&1
if %errorlevel% equ 0 echo WARNING: Port 4000 still in use
if %errorlevel% neq 0 echo Port 4000 is free

netstat -aon | findstr ":4001" >nul 2>&1
if %errorlevel% equ 0 echo WARNING: Port 4001 still in use  
if %errorlevel% neq 0 echo Port 4001 is free

echo.
echo Force cleanup completed.
echo Now you can run: restart-all.bat
pause
