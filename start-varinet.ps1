$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"
$BackendPython = Join-Path $BackendPath ".venv\Scripts\python.exe"
$FrontendPackage = Join-Path $FrontendPath "package.json"

if (-not (Test-Path $BackendPython)) {
    Write-Host "Backend virtual environment was not found." -ForegroundColor Red
    Write-Host "Expected: $BackendPython"
    Write-Host "Create backend/.venv and install requirements first."
    exit 1
}

if (-not (Test-Path $FrontendPackage)) {
    Write-Host "Frontend package.json was not found." -ForegroundColor Red
    Write-Host "Expected: $FrontendPackage"
    exit 1
}

Write-Host "Starting VARI-Net backend..." -ForegroundColor Cyan

Start-Process powershell `
    -WorkingDirectory $BackendPath `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "& '.\.venv\Scripts\python.exe' -m uvicorn main:app --reload"
    )

Write-Host "Starting VARI-Net frontend..." -ForegroundColor Cyan

Start-Process powershell `
    -WorkingDirectory $FrontendPath `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "npm run dev"
    )

Write-Host "VARI-Net startup commands were launched." -ForegroundColor Green
Write-Host "Backend docs: http://127.0.0.1:8000/docs"
Write-Host "Frontend:     http://127.0.0.1:5173"

