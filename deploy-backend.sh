#!/bin/bash
# Backend Deployment Script for Contabo VPS
# Run this script on your Contabo server to deploy/update backend

set -euo pipefail

echo "🚀 Starting Lush Laundry Backend Deployment..."

# Configuration
REPO_DIR="${REPO_DIR:-/opt/lush_laundry}"
BACKEND_DIR="$REPO_DIR/backend"
BRANCH="${BRANCH:-main}"
PM2_APP_NAME="${PM2_APP_NAME:-lush-backend}"

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

# Navigate to repository
cd "$REPO_DIR" || {
    print_error "Repository directory not found at $REPO_DIR"
    exit 1
}

# Ensure backend .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_error "Missing $BACKEND_DIR/.env. Create it from backend/.env.production.example first."
    exit 1
fi

# Pull latest code
print_step "Pulling latest code from $BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

# Navigate to backend
cd "$BACKEND_DIR"

# Install dependencies
print_step "Installing dependencies (including build tools)..."
npm ci

# Build TypeScript
print_step "Building TypeScript..."
npm run build

# Run database migrations from compiled output
if [ -f "dist/database/migrate.js" ]; then
    print_warning "Running database migrations..."
    node dist/database/migrate.js
else
    print_warning "Compiled migration file not found, falling back to npm run migrate..."
    npm run migrate
fi

# Restart PM2 process
print_step "Restarting backend service..."
pm2 restart "$PM2_APP_NAME" || {
    print_warning "PM2 process not found. Starting new process..."
    pm2 start npm --name "$PM2_APP_NAME" -- start
    pm2 save
}

# Show status
print_step "Checking service status..."
pm2 status "$PM2_APP_NAME"

# Show recent logs
print_step "Recent logs:"
pm2 logs "$PM2_APP_NAME" --lines 20 --nostream

echo ""
print_step "🎉 Backend deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "  pm2 logs $PM2_APP_NAME           # View logs"
echo "  pm2 restart $PM2_APP_NAME        # Restart service"
echo "  pm2 monit                        # Monitor resources"
echo ""
