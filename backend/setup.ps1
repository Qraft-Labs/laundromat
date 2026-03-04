# Lush Laundry Backend Setup Script
# Run this from the backend directory

Write-Host "🚀 Lush Laundry Backend Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion detected`n" -ForegroundColor Green

# Check PostgreSQL
Write-Host "📦 Checking PostgreSQL..." -ForegroundColor Yellow
$psqlVersion = psql --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PostgreSQL not found in PATH. Make sure it's installed." -ForegroundColor Yellow
    Write-Host "   Download from: https://www.postgresql.org/download/`n" -ForegroundColor Yellow
} else {
    Write-Host "✅ $psqlVersion detected`n" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed`n" -ForegroundColor Green

# Check for .env file
if (-Not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created`n" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env file with your database credentials!" -ForegroundColor Yellow
    Write-Host "   - DB_PASSWORD: Your PostgreSQL password" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET: Change to a secure random string`n" -ForegroundColor Yellow
    
    $continue = Read-Host "Have you edited the .env file? (y/n)"
    if ($continue -ne "y") {
        Write-Host "`n📝 Please edit backend/.env file and run this script again" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ .env file exists`n" -ForegroundColor Green
}

# Create database
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
Write-Host "   Creating database 'lush_laundry'..." -ForegroundColor Yellow

# Load .env file
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

# Try to create database
$createDbCommand = "CREATE DATABASE lush_laundry;"
$dbExists = psql -U $env:DB_USER -h $env:DB_HOST -p $env:DB_PORT -lqt 2>$null | Select-String "lush_laundry"

if (-Not $dbExists) {
    $env:PGPASSWORD = $env:DB_PASSWORD
    psql -U $env:DB_USER -h $env:DB_HOST -p $env:DB_PORT -c $createDbCommand 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not create database automatically." -ForegroundColor Yellow
        Write-Host "   Please create it manually:" -ForegroundColor Yellow
        Write-Host "   psql -U postgres -c `"CREATE DATABASE lush_laundry;`"`n" -ForegroundColor Yellow
        $continue = Read-Host "Have you created the database? (y/n)"
        if ($continue -ne "y") {
            exit 0
        }
    }
} else {
    Write-Host "✅ Database already exists`n" -ForegroundColor Green
}

# Run migrations and seed
Write-Host "🔄 Running migrations and seeding data..." -ForegroundColor Yellow
npm run db:reset
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database setup failed. Check your connection settings in .env" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database migrated and seeded`n" -ForegroundColor Green

# Success message
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "📝 Default Admin Login:" -ForegroundColor Yellow
Write-Host "   Email: admin@lushlaundry.com" -ForegroundColor White
Write-Host "   Password: Admin123!`n" -ForegroundColor White

Write-Host "🚀 To start the server:" -ForegroundColor Yellow
Write-Host "   npm run dev`n" -ForegroundColor White

Write-Host "🌐 Server will run on:" -ForegroundColor Yellow
Write-Host "   http://localhost:5000`n" -ForegroundColor White

Write-Host "📚 API Documentation:" -ForegroundColor Yellow
Write-Host "   See README.md for endpoint details`n" -ForegroundColor White
