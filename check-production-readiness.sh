#!/bin/bash
# Pre-Deployment Security Checklist Script
# Run this before deploying to production

set -e

echo "🔒 Running Pre-Deployment Security Checks..."
echo ""

ERRORS=0
WARNINGS=0

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ ERROR: backend/.env file not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ backend/.env file exists"
    
    # Check NODE_ENV
    if grep -q "NODE_ENV=production" backend/.env; then
        echo "✅ NODE_ENV set to production"
    else
        echo "⚠️  WARNING: NODE_ENV is not set to production"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for default secrets
    if grep -q "lush-laundry-super-secret-key" backend/.env; then
        echo "❌ ERROR: Default JWT_SECRET detected - MUST change for production"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ JWT_SECRET appears to be customized"
    fi
    
    if grep -q "lush-laundry-session-secret" backend/.env; then
        echo "❌ ERROR: Default SESSION_SECRET detected - MUST change for production"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ SESSION_SECRET appears to be customized"
    fi
    
    # Check database password
    if grep -q "DB_PASSWORD=551129" backend/.env || grep -q "DB_PASSWORD=your_password_here" backend/.env; then
        echo "❌ ERROR: Weak or default database password detected"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Database password appears to be customized"
    fi
    
    # Check for localhost URLs in production
    if grep -q "NODE_ENV=production" backend/.env; then
        if grep -q "localhost" backend/.env; then
            echo "⚠️  WARNING: localhost detected in production .env - verify this is intentional"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    # Check FRONTEND_URL
    if grep -q "FRONTEND_URL=http://localhost" backend/.env && grep -q "NODE_ENV=production" backend/.env; then
        echo "❌ ERROR: FRONTEND_URL points to localhost in production mode"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ FRONTEND_URL configuration looks correct"
    fi
fi

# Check if frontend .env exists
if [ ! -f "frontend/.env.production" ] && [ ! -f "frontend/.env" ]; then
    echo "⚠️  WARNING: frontend/.env.production or frontend/.env not found"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ Frontend environment file exists"
fi

# Check for .gitignore
if [ ! -f ".gitignore" ]; then
    echo "⚠️  WARNING: .gitignore not found"
    WARNINGS=$((WARNINGS + 1))
else
    if grep -q ".env" .gitignore; then
        echo "✅ .env files are in .gitignore"
    else
        echo "❌ ERROR: .env not in .gitignore - sensitive files may be committed!"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check for sensitive files in git
if git rev-parse --git-dir > /dev/null 2>&1; then
    if git ls-files | grep -q "\.env$"; then
        echo "❌ ERROR: .env file is tracked by git! Remove it immediately:"
        echo "   git rm --cached **/.env"
        echo "   git commit -m 'Remove .env from tracking'"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ No .env files tracked by git"
    fi
fi

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  WARNING: Backend node_modules not found - run 'npm install'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  WARNING: Frontend node_modules not found - run 'npm install'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check TypeScript compilation
cd backend
if npm run build > /dev/null 2>&1; then
    echo "✅ Backend TypeScript compiles successfully"
else
    echo "❌ ERROR: Backend TypeScript compilation failed"
    ERRORS=$((ERRORS + 1))
fi
cd ..

echo ""
echo "=================================="
echo "Security Check Summary"
echo "=================================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ DEPLOYMENT BLOCKED: Fix errors before deploying to production"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  WARNINGS FOUND: Review warnings before deploying"
    exit 0
else
    echo "✅ ALL CHECKS PASSED: Ready for deployment"
    exit 0
fi
