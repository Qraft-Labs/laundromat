#!/bin/bash
# Backend Deployment Script for Contabo VPS
# Run this script on your Contabo server to deploy/update backend

set -e  # Exit on any error

echo "🚀 Starting Lush Laundry Backend Deployment..."

# Configuration
REPO_DIR="/opt/lush_laundry"
BACKEND_DIR="$REPO_DIR/backend"
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run with sudo or as root"
    exit 1
fi

# Navigate to repository
cd $REPO_DIR || {
    print_error "Repository directory not found at $REPO_DIR"
    exit 1
}

# Backup current .env
print_step "Backing up .env file..."
cp $BACKEND_DIR/.env $BACKEND_DIR/.env.backup

# Pull latest code
print_step "Pulling latest code from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Navigate to backend
cd $BACKEND_DIR

# Restore .env
print_step "Restoring .env file..."
mv .env.backup .env

# Install dependencies
print_step "Installing dependencies..."
npm install --production

# Run database migrations
print_warning "Running database migrations..."
npm run migrate || print_warning "Migrations may have failed or already applied"

# Build TypeScript
print_step "Building TypeScript..."
npm run build

# Restart PM2 process
print_step "Restarting backend service..."
pm2 restart lush-backend || {
    print_warning "PM2 process not found. Starting new process..."
    pm2 start dist/server.js --name lush-backend
    pm2 save
}

# Show status
print_step "Checking service status..."
pm2 status lush-backend

# Show recent logs
print_step "Recent logs:"
pm2 logs lush-backend --lines 20 --nostream

echo ""
print_step "🎉 Backend deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "  pm2 logs lush-backend           # View logs"
echo "  pm2 restart lush-backend        # Restart service"
echo "  pm2 monit                        # Monitor resources"
echo ""
