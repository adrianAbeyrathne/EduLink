@echo off
echo =======================================
echo    EduLink System Health Check
echo =======================================

echo [1/4] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ❌ Node.js not found
    goto :error
) else (
    echo ✅ Node.js is available
)

echo.
echo [2/4] Checking Backend Server (Port 5000)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/google/status' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '✅ Backend server is responding' } catch { Write-Host '❌ Backend server is not responding' }"

echo.
echo [3/4] Checking Frontend Server (Port 3000)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '✅ Frontend server is responding' } catch { Write-Host '❌ Frontend server is not responding' }"

echo.
echo [4/4] Checking Google OAuth Configuration...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/google/status' -UseBasicParsing -TimeoutSec 5; $json = $response.Content | ConvertFrom-Json; if ($json.googleStrategy -eq 'Registered') { Write-Host '✅ Google OAuth is configured' } else { Write-Host '❌ Google OAuth configuration issue' } } catch { Write-Host '❌ Unable to check Google OAuth status' }"

echo.
echo =======================================
echo   System Status Check Complete
echo =======================================
goto :end

:error
echo.
echo ❌ System check failed. Please install Node.js and try again.

:end
pause