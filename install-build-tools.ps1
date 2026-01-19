
# Install Windows Build Tools
# Jalankan script ini sebagai Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Windows Build Tools..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ini akan menginstall:" -ForegroundColor Yellow
Write-Host "  - Python" -ForegroundColor White
Write-Host "  - Visual Studio Build Tools" -ForegroundColor White
Write-Host ""
Write-Host "Proses ini memaka

n waktu 5-10 menit..." -ForegroundColor Yellow
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Script ini harus dijalankan sebagai Administrator!" -ForegroundColor Red
    Write-Host "Klik kanan PowerShell > Run as Administrator" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "Installing windows-build-tools..." -ForegroundColor Green
npm install --global windows-build-tools

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Tools Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Open a NEW PowerShell (normal, not admin)" -ForegroundColor White
Write-Host "3. Run: cd 'C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak'" -ForegroundColor White
Write-Host "4. Run: .\setup-and-run.ps1" -ForegroundColor White
Write-Host ""
pause
