#!/bin/bash

# Lush Laundry Backend Setup Script
# Run this from the backend directory

echo "🚀 Lush Laundry Backend Setup"
echo "================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION detected"
echo ""

# Check PostgreSQL
echo "📦 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found in PATH. Make sure it's installed."
    echo "   Download from: https://www.postgresql.org/download/"
    echo ""
else
    PSQL_VERSION=$(psql --version)
    echo "✅ $PSQL_VERSION detected"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your database credentials!"
    echo "   - DB_PASSWORD: Your PostgreSQL password"
    echo "   - JWT_SECRET: Change to a secure random string"
    echo ""
    read -p "Have you edited the .env file? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "📝 Please edit backend/.env file and run this script again"
        exit 0
    fi
else
    echo "✅ .env file exists"
    echo ""
fi

# Load .env file
export $(grep -v '^#' .env | xargs)

# Create database
echo "🗄️  Setting up database..."
echo "   Creating database 'lush_laundry'..."

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -lqt 2>/dev/null | cut -d \| -f 1 | grep -w lush_laundry | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE lush_laundry;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database created"
        echo ""
    else
        echo "⚠️  Could not create database automatically."
        echo "   Please create it manually:"
        echo '   psql -U postgres -c "CREATE DATABASE lush_laundry;"'
        echo ""
        read -p "Have you created the database? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
else
    echo "✅ Database already exists"
    echo ""
fi

# Run migrations and seed
echo "🔄 Running migrations and seeding data..."
npm run db:reset
if [ $? -ne 0 ]; then
    echo "❌ Database setup failed. Check your connection settings in .env"
    exit 1
fi
echo "✅ Database migrated and seeded"
echo ""

# Success message
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""

echo "📝 Default Admin Login:"
echo "   Email: admin@lushlaundry.com"
echo "   Password: Admin123!"
echo ""

echo "🚀 To start the server:"
echo "   npm run dev"
echo ""

echo "🌐 Server will run on:"
echo "   http://localhost:5000"
echo ""

echo "📚 API Documentation:"
echo "   See README.md for endpoint details"
echo ""
