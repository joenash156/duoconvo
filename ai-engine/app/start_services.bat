@echo off
REM Starts both AI retrieval (port 8001) and local Twi/Ga/Ewe STT (port 8002)
REM services in separate windows - both need to stay running at the same
REM time as the Express backend. Run this by double-clicking it, or from
REM any shell (PowerShell, cmd) with: .\start_services.bat
REM
REM Close either window (or press Ctrl+C inside it) to stop that service.

setlocal

set "SCRIPT_DIR=%~dp0"
set "VENV_PYTHON=%SCRIPT_DIR%..\..\.venv\Scripts\python.exe"

if not exist "%VENV_PYTHON%" (
    echo Could not find venv Python at "%VENV_PYTHON%"
    echo Make sure the project's .venv exists at the project root.
    pause
    exit /b 1
)

echo Starting AI retrieval service on port 8001...
start "DuoConvo AI Service (port 8001)" cmd /k "cd /d "%SCRIPT_DIR%" && "%VENV_PYTHON%" -m uvicorn ai_server:app --host 0.0.0.0 --port 8001"

echo Starting local STT service (Twi/Ga/Ewe) on port 8002...
start "DuoConvo STT Service (port 8002)" cmd /k "cd /d "%SCRIPT_DIR%" && "%VENV_PYTHON%" -m uvicorn stt_server:app --host 0.0.0.0 --port 8002"

echo.
echo Both services are starting in separate windows.
echo Wait for each to print "Application startup complete" before testing the app.
echo.

endlocal
