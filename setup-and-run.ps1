S# Setup and Run Script
# Jalankan setelah build tools terinstall

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sistem Pakar - Setup & Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Backend Dependencies
Write-Host "[1/5] Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend dependencies installation failed!" -ForegroundColor Red
    Write-Host "Silakan cek error di atas dan coba lagi." -ForegroundColor Yellow
    Set-Location -Path ".."
    pause
    exit
}
Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Setup Database
Write-Host "[2/5] Setting up Database..." -ForegroundColor Yellow
npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database migration failed!" -ForegroundColor Red
    Set-Location -Path ".."
    pause
    exit
}
Write-Host "Database migrated successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Seed Data
Write-Host "[3/5] Seeding Initial Data..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Data seeding failed!" -ForegroundColor Red
    Set-Location -Path ".."
    pause
    exit
}
Write-Host "Data seeded successfully!" -ForegroundColor Green
Write-Host ""

Set-Location -Path ".."

# Step 4: Install Frontend Dependencies
Write-Host "[4/5] Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend dependencies installation failed!" -ForegroundColor Red
    Set-Location -Path ".."
    pause
    exit
}
Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

Set-Location -Path ".."

# Step 5: Display Success Message
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:" -ForegroundColor White
Write-Host "    Email: admin@example.com" -ForegroundColor Cyan
Write-Host "    Password: Admin123!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  User:" -ForegroundColor White
Write-Host "    Email: user@example.com" -ForegroundColor Cyan
Write-Host "    Password: User123!" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Servers..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend akan start di: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend akan start di: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C di kedua terminal untuk stop servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening servers in 3 seconds..." -ForegroundColor White
Start-Sleep -Seconds 3

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak\frontend'; npm run dev"

Write-Host ""
Write-Host "Servers starting in separate windows..." -ForegroundColor Green
Write-Host "Wait 10-15 seconds, then open: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Enjoy! 🚀" -ForegroundColor Green
Write-Host ""
