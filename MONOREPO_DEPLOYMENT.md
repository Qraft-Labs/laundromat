# 🚀 Monorepo Deployment Guide
## Deploy Backend (Contabo) + Frontend (Netlify) from Single Repository

---

## 📋 Overview

This repository contains both **backend** and **frontend** in a monorepo structure:
```
lush_laundry/
├── backend/       → Node.js/Express API (Contabo VPS)
├── frontend/      → React app (Netlify)
└── [shared docs]
```

**Deployment Strategy:** Single repo, separate deployments

---

## 🖥️ Part 1: Backend Deployment (Contabo VPS)

### Initial Setup (First Time Only)

```bash
# 1. SSH into Contabo VPS
ssh root@your-contabo-ip

# 2. Install prerequisites
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql nginx git

# 3. Setup PostgreSQL
sudo -u postgres psql
```

```sql
CREATE DATABASE lush_laundry_prod;
CREATE USER lush_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lush_laundry_prod TO lush_admin;
\q
```

```bash
# 4. Clone repository
cd /opt
git clone https://github.com/yourusername/lush_laundry.git
cd lush_laundry/backend

# 5. Configure environment
cp .env.example .env
nano .env
```

**Backend .env (Critical values):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://lush_admin:your_password@localhost:5432/lush_laundry_prod
JWT_SECRET=<run: openssl rand -base64 32>
FRONTEND_URL=https://your-app.netlify.app
PORT=5000
```

```bash
# 6. Install & build
npm install --production
npm run migrate  # Create database tables
npm run build    # Compile TypeScript

# 7. Start with PM2
npm install -g pm2
pm2 start dist/server.js --name lush-backend
pm2 startup  # Follow instructions
pm2 save
```

### Configure Nginx + SSL

```bash
# Create Nginx config
nano /etc/nginx/sites-available/lush-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/lush-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL certificate
apt install certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

### Updating Backend (Future Deployments)

```bash
# Copy deploy script to server
scp deploy-backend.sh root@your-contabo-ip:/opt/lush_laundry/

# SSH into server and run
ssh root@your-contabo-ip
cd /opt/lush_laundry
chmod +x deploy-backend.sh
./deploy-backend.sh
```

**Or manually:**
```bash
cd /opt/lush_laundry
git pull origin main
cd backend
npm install --production
npm run build
pm2 restart lush-backend
```

---

## 🌐 Part 2: Frontend Deployment (Netlify)

### Option A: Netlify Dashboard (Quick)

```bash
# On your local machine
cd frontend
npm install
npm run build

# Netlify dashboard: Drag 'dist' folder
# Done!
```

### Option B: Git Integration (Recommended)

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub → Select your repo
   - Netlify auto-detects `netlify.toml` config ✅

3. **Verify build settings:**
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`

4. **Add environment variables** (Netlify dashboard → Site settings → Environment variables):
```
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

5. **Deploy:**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - Get URL: `https://your-app.netlify.app`

### Custom Domain on Netlify

1. Netlify dashboard → Domain settings → Add custom domain
2. Add domain: `yourdomain.com`
3. Update DNS records at your registrar:
```
yourdomain.com     → CNAME → your-app.netlify.app
www.yourdomain.com → CNAME → your-app.netlify.app
```
4. Netlify auto-configures SSL ✅

---

## 🔄 Workflow After Setup

### Making Changes

```bash
# 1. Make changes locally
git add .
git commit -m "Update feature X"
git push origin main

# 2. Backend updates (if backend changed)
ssh root@your-contabo-ip
cd /opt/lush_laundry
./deploy-backend.sh

# 3. Frontend updates (if frontend changed)
# Netlify auto-deploys on git push! ✅
# Check: Netlify dashboard → Deploys
```

### Frontend-Only Updates
```bash
# Push to GitHub
git push origin main

# Netlify auto-builds and deploys
# No Contabo action needed!
```

### Backend-Only Updates
```bash
# Push to GitHub
git push origin main

# Run deployment script on Contabo
ssh root@your-contabo-ip "cd /opt/lush_laundry && ./deploy-backend.sh"
```

---

## 🔐 Google OAuth Configuration

Add **ALL** these redirect URIs in Google Cloud Console:

```
https://api.yourdomain.com/auth/google/callback
https://your-app.netlify.app
https://yourdomain.com
```

---

## 📊 DNS Configuration

Point these records to your servers:

```
api.yourdomain.com     → A Record → Contabo IP (e.g., 123.45.67.89)
yourdomain.com         → CNAME   → your-app.netlify.app
www.yourdomain.com     → CNAME   → your-app.netlify.app
```

---

## ✅ Verification Checklist

After deployment, verify:

```bash
# Backend health
curl https://api.yourdomain.com/health
# Expected: {"status":"healthy"}

# Frontend loads
curl https://yourdomain.com
# Expected: HTML content

# Backend logs
ssh root@your-contabo-ip "pm2 logs lush-backend --lines 50"

# Frontend deploy status
# Check Netlify dashboard → Deploys
```

**Test in browser:**
- [ ] Frontend loads at `https://yourdomain.com`
- [ ] Login works
- [ ] Can create order
- [ ] Reports load
- [ ] No CORS errors in console

---

## 🛠️ Troubleshooting

### CORS Errors
Make sure backend allows Netlify domains:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'https://your-app.netlify.app',
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true
}));
```

### Backend Won't Start
```bash
pm2 logs lush-backend  # Check errors
pm2 restart lush-backend
systemctl status postgresql  # Check database
```

### Frontend Shows Blank Page
- Check browser console for errors
- Verify `VITE_API_URL` in Netlify environment variables
- Check Netlify deploy logs

---

## 📞 Quick Commands Reference

**Contabo VPS:**
```bash
pm2 status lush-backend      # Check status
pm2 logs lush-backend         # View logs
pm2 restart lush-backend      # Restart
pm2 monit                     # Monitor resources
./deploy-backend.sh           # Quick deploy
```

**Netlify:**
- Dashboard → Deploys → Trigger deploy
- Or just `git push origin main` (auto-deploys)

---

## 💰 Cost Summary

- **Contabo VPS:** €4-8/month (VPS S or M sufficient)
- **Netlify:** FREE (100GB bandwidth included)
- **Domain:** €10-15/year
- **Total:** ~€60-110/year

---

## 🎯 Summary

1. **One repository** on GitHub
2. **Backend** → Clone to Contabo VPS, deploy with script
3. **Frontend** → Connect to Netlify, auto-deploys from GitHub
4. **Updates** → Push to GitHub
   - Frontend: Auto-deploys via Netlify
   - Backend: Run deployment script on Contabo

**Simple, cost-effective, professional deployment! 🚀**

---

**Created:** March 2026  
**Questions?** Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps
