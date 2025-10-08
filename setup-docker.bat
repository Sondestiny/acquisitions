@echo off
REM Acquisitions Docker Setup - Batch Wrapper
REM This batch file provides an easy way to run the PowerShell setup script

setlocal enabledelayedexpansion

REM Check if PowerShell is available
powershell -Command "exit 0" >nul 2>&1
if errorlevel 1 (
    echo Error: PowerShell is not available or not working properly.
    echo Please ensure PowerShell is installed and accessible.
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

REM Check execution policy and run the PowerShell script
echo Starting Acquisitions Docker Setup...
echo.

REM Try to run the PowerShell script with arguments
powershell -ExecutionPolicy Bypass -File "setup-docker.ps1" %*

REM Check if the PowerShell script ran successfully
if errorlevel 1 (
    echo.
    echo Error: The setup script encountered an error.
    echo If you see execution policy errors, try running as Administrator:
    echo   Right-click on Command Prompt and select "Run as administrator"
    echo.
    echo Alternatively, run the PowerShell script directly:
    echo   powershell -ExecutionPolicy Bypass -File setup-docker.ps1
    echo.
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
if "%1"=="setup" (
    echo.
    echo Your application should now be running.
    echo Press any key to continue...
    pause >nul
)

endlocal