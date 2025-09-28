@echo off
echo =======================================
echo    EduLink Development Server Startup
echo =======================================

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/3] Checking for existing processes...
REM Kill existing processes on ports 3000 and 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process on port 5000 (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/3] Starting Backend Server...
cd /d "C:\Users\User\OneDrive\Documents\EduLink\Backend"
start "EduLink Backend" cmd /c "echo Backend Server Starting... && node app.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Server...
cd /d "C:\Users\User\OneDrive\Documents\EduLink\frontend"
start "EduLink Frontend" cmd /c "echo Frontend Server Starting... && npm start"

echo.
echo =======================================
echo  🚀 EduLink Servers Starting...
echo  📡 Backend: http://localhost:5000
echo  🌐 Frontend: http://localhost:3000
echo  🔐 Google OAuth: http://localhost:5000/api/auth/google
echo =======================================
echo.
echo Press any key to open the application...
pause >nul

REM Open browser to the application
start http://localhost:3000

echo.
echo Servers are running!
echo Press any key to stop all servers...
pause >nul

REM Stop all EduLink processes
taskkill /f /fi "WINDOWTITLE eq EduLink Backend" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq EduLink Frontend" >nul 2>&1

echo Servers stopped.
pause