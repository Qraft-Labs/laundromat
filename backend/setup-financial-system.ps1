# Financial System Setup Script
# Run this script to set up the expenses and financial management system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Financial Management System Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check if PostgreSQL is accessible
Write-Host "[Step 1/3] Checking PostgreSQL..." -ForegroundColor Yellow
$pgPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $pgPath)) {
    $pgPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
}
if (-not (Test-Path $pgPath)) {
    $pgPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
}

if (-not (Test-Path $pgPath)) {
    Write-Host "ERROR: PostgreSQL not found. Please run the migration manually:" -ForegroundColor Red
    Write-Host "1. Open pgAdmin" -ForegroundColor Yellow
    Write-Host "2. Connect to lush_laundry database" -ForegroundColor Yellow
    Write-Host "3. Open Query Tool" -ForegroundColor Yellow
    Write-Host "4. Open file: backend\src\database\migrations\add_expenses_and_financials.sql" -ForegroundColor Yellow
    Write-Host "5. Click Execute" -ForegroundColor Yellow
    Write-Host "`nPress Enter to continue to Step 2..." -ForegroundColor Cyan
    Read-Host
} else {
    Write-Host "Found PostgreSQL at: $pgPath" -ForegroundColor Green
    Write-Host "`nRunning migration..." -ForegroundColor Yellow
    
    $env:PGPASSWORD = "postgres"  # Change this if your password is different
    & $pgPath -U postgres -d lush_laundry -f "src\database\migrations\add_expenses_and_financials.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Migration failed. Please run manually using pgAdmin." -ForegroundColor Red
    }
}

# Step 2: Restart backend
Write-Host "`n[Step 2/3] Restarting backend server..." -ForegroundColor Yellow
Write-Host "Please stop the backend server (Ctrl+C in backend terminal)" -ForegroundColor Cyan
Write-Host "Then run: npm run dev" -ForegroundColor Cyan
Write-Host "`nPress Enter when backend is restarted..." -ForegroundColor Cyan
Read-Host

# Step 3: Test the endpoints
Write-Host "`n[Step 3/3] Testing endpoints..." -ForegroundColor Yellow
Write-Host "Checking if backend is running..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri "http://localhost:5000/api/expenses/categories" -Method GET -Headers @{"Authorization"="Bearer test"} -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "[SUCCESS] Expenses routes are working!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "[SUCCESS] Routes are loaded (401 is expected without valid token)" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Backend might not be running on port 5000" -ForegroundColor Red
        Write-Host "Make sure to run 'npm run dev' in the backend folder" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:8080/login (or your frontend URL)" -ForegroundColor Yellow
Write-Host "2. Login with your admin credentials" -ForegroundColor Yellow
Write-Host "3. Click on 'Expenses' or 'Financial Dashboard' in the sidebar" -ForegroundColor Yellow
Write-Host "`nIf you still get 401 errors, logout and login again to refresh your token.`n" -ForegroundColor Cyan

Write-Host "Press Enter to exit..." -ForegroundColor Cyan
Read-Host
