# GitHub Actions CI/CD Setup Guide

## 🚀 Overview

Your Lush Laundry ERP now has automated CI/CD pipelines using GitHub Actions:

- ✅ **Automated Testing** - Runs on every push
- ✅ **Staging Deployment** - Auto-deploy `develop` branch
- ✅ **Production Deployment** - Auto-deploy `main` branch
- ✅ **Zero Downtime** - PM2 reload strategy
- ✅ **Automatic Rollback** - Reverts on failure
- ✅ **Health Checks** - Verifies deployment success

---

## 📋 Prerequisites

Before CI/CD works, you need to configure GitHub Secrets and set up your servers.

### 1. Contabo VPS Setup

**SSH into your Contabo server:**
```bash
ssh root@your-contabo-ip
```

**Install required software:**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

**Create deployment directory:**
```bash
mkdir -p /opt/lush_laundry
mkdir -p /opt/lush_laundry_backups
cd /opt/lush_laundry
```

**Clone repository:**
```bash
git clone https://github.com/Qraft-Labs/laundromat.git .
```

**Set up environment variables:**
```bash
cd backend
cp .env.production.example .env
nano .env  # Edit with your production values
```

---

### 2. Generate SSH Key for GitHub Actions

**On your local machine:**
```powershell
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f github-actions-key

# This creates:
# - github-actions-key (private key - for GitHub Secrets)
# - github-actions-key.pub (public key - for Contabo server)
```

**Add public key to Contabo:**
```bash
# On Contabo server
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys

# Paste the contents of github-actions-key.pub
# Save and set permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Test SSH connection:**
```powershell
# From local machine
ssh -i github-actions-key root@your-contabo-ip
```

---

### 3. Configure GitHub Secrets

**Go to your repository:**
```
https://github.com/Qraft-Labs/laundromat/settings/secrets/actions
```

**Add these secrets:**

#### Production Secrets (Required)
```
PRODUCTION_SERVER_HOST
Value: your-contabo-ip-address (e.g., 192.168.1.100)

PRODUCTION_SERVER_USER
Value: root

PRODUCTION_SSH_PRIVATE_KEY
Value: (paste entire contents of github-actions-key private key)

PRODUCTION_API_URL
Value: https://api.yourdomain.com (your backend URL)

VITE_GOOGLE_CLIENT_ID
Value: your_new_google_client_id.apps.googleusercontent.com
```

#### Netlify Secrets (Required for Frontend)
```
NETLIFY_AUTH_TOKEN
Value: (Get from https://app.netlify.com/user/applications#personal-access-tokens)

NETLIFY_SITE_ID
Value: (Get from Netlify site settings)
```

#### Staging Secrets (Optional)
```
STAGING_SERVER_HOST
Value: your-staging-server-ip

STAGING_SERVER_USER
Value: root

STAGING_SSH_PRIVATE_KEY
Value: (staging SSH key)
```

---

### 4. Set Up GitHub Environments

**Create environments for deployment protection:**

**Go to:**
```
https://github.com/Qraft-Labs/laundromat/settings/environments
```

**Create two environments:**

#### Production Environment
- Name: `production`
- Protection rules:
  - ☑ Required reviewers: Add team members
  - ☑ Wait timer: 5 minutes (optional)
- Deployment branches: `main` only

#### Staging Environment
- Name: `staging`
- Protection rules: None (auto-deploy)
- Deployment branches: `develop` only

---

## 🔄 Workflow Explanations

### 1. **test.yml** - Automated Testing
**Triggers:** Every push, every PR

**What it does:**
- Sets up temporary PostgreSQL database
- Installs dependencies
- Compiles TypeScript (backend + frontend)
- Runs tests (if configured)
- Runs linting (if configured)

**Usage:**
```bash
# Runs automatically on push
git push origin main

# Or manually trigger from GitHub UI
```

---

### 2. **deploy-production.yml** - Production Deployment
**Triggers:** Push to `main` branch, manual trigger

**What it does:**
1. Runs all tests
2. Deploys backend to Contabo:
   - Creates backup
   - Pulls latest code
   - Builds backend
   - Runs migrations
   - Restarts PM2 (zero downtime)
   - Health check
3. Deploys frontend to Netlify
4. Rollback if anything fails

**Usage:**
```bash
# Automatic deployment
git push origin main

# Manual deployment (GitHub UI)
Actions → Deploy to Production → Run workflow
```

**Manual Deployment from GitHub:**
1. Go to: https://github.com/Qraft-Labs/laundromat/actions
2. Click "Deploy to Production"
3. Click "Run workflow"
4. Select branch: `main`
5. Skip tests: (choose if emergency hotfix)
6. Click "Run workflow"

---

### 3. **deploy-staging.yml** - Staging Deployment
**Triggers:** Push to `develop` branch, manual trigger

**What it does:**
- Same as production but deploys to staging server
- Good for testing before production

**Usage:**
```bash
# Create develop branch
git checkout -b develop
git push origin develop

# Push changes to staging
git push origin develop
```

---

## 🎯 Deployment Workflows

### Daily Development Workflow

```bash
# 1. Make changes locally
git checkout -b feature/new-feature

# 2. Commit changes
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Tests run automatically (test.yml)
# ✅ If tests pass, continue
# ❌ If tests fail, fix and push again

# 5. Create Pull Request to main
# Go to GitHub → Pull Request → Create

# 6. After approval, merge to main
# ⚡ Production deployment runs automatically!

# 7. Monitor deployment
# Go to GitHub Actions tab to watch progress
```

---

### Emergency Hotfix Workflow

```bash
# 1. Fix critical bug
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Make fix
git add .
git commit -m "Hotfix: Fix critical bug"

# 3. Push and merge quickly
git push origin hotfix/critical-bug
# Merge to main immediately

# 4. Manual deployment with test skip
# Go to GitHub Actions → Deploy to Production
# Select "Skip tests: true"
# Click "Run workflow"

# 5. Monitor rollback if needed
# Workflow automatically rolls back on failure
```

---

## 🔍 Monitoring Deployments

### View Deployment Status

**GitHub Actions Tab:**
```
https://github.com/Qraft-Labs/laundromat/actions
```

**See:**
- ✅ Successful deployments (green checkmark)
- ❌ Failed deployments (red X)
- ⏳ In-progress deployments (yellow circle)

### Check Logs

**Click on any workflow run:**
1. See all steps
2. Expand step to see detailed logs
3. Download logs if needed

### Check Production Health

**SSH into server:**
```bash
ssh root@your-contabo-ip

# Check PM2 status
pm2 list

# View logs
pm2 logs lush-laundry-backend

# Monitor resources
pm2 monit
```

---

## 🛠️ Troubleshooting

### Deployment Failed - SSH Connection Error

**Problem:** `Permission denied (publickey)`

**Solution:**
```bash
# 1. Verify public key on server
ssh root@your-contabo-ip
cat ~/.ssh/authorized_keys  # Should contain github-actions-key.pub

# 2. Verify private key in GitHub Secrets
# Go to repo settings → Secrets → PRODUCTION_SSH_PRIVATE_KEY
# Should match github-actions-key (private key)

# 3. Test connection
ssh -i github-actions-key root@your-contabo-ip
```

---

### Deployment Failed - Build Error

**Problem:** TypeScript compilation failed

**Solution:**
```bash
# Test locally first
cd backend
npm run build

# Fix errors
# Push again
```

---

### Deployment Failed - Database Migration Error

**Problem:** Migration failed during deployment

**Solution:**
```bash
# SSH into server
ssh root@your-contabo-ip

# Manually run migrations
cd /opt/lush_laundry/backend
npm run migrate

# Check database
psql -U your_user -d lush_laundry
# Verify schema changes

# Restart PM2
pm2 restart lush-laundry-backend
```

---

### Rollback to Previous Version

**Automatic Rollback:**
- Happens automatically if health check fails
- Restores from `/opt/lush_laundry_backups/`

**Manual Rollback:**
```bash
# SSH into server
ssh root@your-contabo-ip

# List backups
ls -lt /opt/lush_laundry_backups/

# Choose backup to restore
BACKUP_DATE="20260304_143022"  # Example
cd /opt/lush_laundry/backend
rm -rf dist
cp -r /opt/lush_laundry_backups/$BACKUP_DATE/dist .

# Restart service
pm2 restart lush-laundry-backend

# Verify
pm2 logs lush-laundry-backend
```

**Rollback Git commits:**
```bash
# On local machine
git log --oneline  # Find commit to revert to

# Revert to specific commit
git revert <commit-hash>
git push origin main

# Deployment runs automatically with old code
```

---

## 📊 Cost Breakdown

### GitHub Actions Minutes Usage

**Per Deployment:**
- Test workflow: ~5 minutes
- Deploy backend: ~3 minutes
- Deploy frontend: ~2 minutes
- **Total per deployment:** ~10 minutes

**Monthly Usage Estimate:**
- Daily deployments: 10 min × 30 days = 300 minutes
- **Free tier:** 2,000 minutes/month
- **Cost:** $0 (well within free tier)

**Even with 3 deployments/day:** 900 minutes/month = $0

---

## 🎓 Best Practices

### 1. Always Test Locally First
```bash
cd backend
npm run build  # Should succeed
npm test       # Should pass

cd ../frontend
npm run build  # Should succeed
```

### 2. Use Staging for Testing
```bash
# Deploy to staging first
git push origin develop

# Test on staging server
# Then merge to main for production
```

### 3. Write Good Commit Messages
```bash
# ❌ Bad
git commit -m "fix"

# ✅ Good
git commit -m "Fix: Resolve payment calculation precision error"
```

### 4. Monitor After Deployment
```bash
# Watch deployment in GitHub Actions
# Check PM2 logs on server
ssh root@your-contabo-ip "pm2 logs lush-laundry-backend --lines 50"
```

### 5. Keep Secrets Updated
- Rotate credentials regularly
- Update GitHub Secrets when credentials change
- Never commit secrets to repository

---

## 🚀 Quick Start Checklist

- [ ] Contabo server set up with Node.js, PM2, PostgreSQL
- [ ] Repository cloned to `/opt/lush_laundry`
- [ ] SSH key generated and added to server
- [ ] All GitHub Secrets configured
- [ ] GitHub Environments created (production, staging)
- [ ] First manual deployment successful
- [ ] PM2 running and monitored
- [ ] Health check endpoint working
- [ ] Netlify connected (frontend)
- [ ] Team members added as reviewers

---

## 📞 Support

### If Deployment Fails
1. Check GitHub Actions logs
2. SSH into server and check PM2 logs
3. Review recent commits for breaking changes
4. Rollback if needed
5. Fix issue and redeploy

### Common Issues
- **SSH Permission Denied**: Check SSH keys
- **Build Failed**: Fix TypeScript errors locally first
- **Health Check Failed**: Check backend is running on correct port
- **PM2 Not Restarting**: Check PM2 configuration

---

## 🎉 You're All Set!

Your CI/CD pipeline is ready. Every push to `main` will now:
1. ✅ Run tests automatically
2. ✅ Build backend and frontend
3. ✅ Deploy to Contabo (backend)
4. ✅ Deploy to Netlify (frontend)
5. ✅ Verify with health checks
6. ✅ Rollback if any issues

**Next Steps:**
1. Configure all GitHub Secrets
2. Set up SSH key on Contabo
3. Make a test commit to trigger deployment
4. Monitor first deployment in Actions tab

---

**Created:** March 4, 2026  
**Version:** 1.0  
**Repository:** https://github.com/Qraft-Labs/laundromat
