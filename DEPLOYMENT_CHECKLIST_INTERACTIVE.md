# 🚀 Production Deployment Checklist

**Project:** Lush Laundry ERP  
**Target:** Contabo VPS + Netlify  
**Date:** March 4, 2026

---

## ✅ Pre-Deployment (Complete)

- [x] Environment templates created
- [x] Security configurations updated
- [x] CORS properly configured
- [x] Build scripts verified
- [x] TypeScript compilation successful
- [x] Deployment scripts created
- [x] Documentation complete
- [x] .gitignore protecting sensitive files

---

## 🔐 Secrets & Configuration (TODO)

### Generate Secrets
- [ ] Generate JWT_SECRET (32+ chars random)
- [ ] Generate SESSION_SECRET (32+ chars random)
- [ ] Create strong database password (16+ chars)

### Google OAuth Setup
- [ ] Create/configure Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add production redirect URIs:
  - [ ] `https://api.yourdomain.com/api/auth/google/callback`
  - [ ] `https://your-app.netlify.app`
  - [ ] `https://yourdomain.com`
- [ ] Copy Client ID and Client Secret

### DNS Configuration
- [ ] Point `api.yourdomain.com` to Contabo VPS IP (A Record)
- [ ] Point `yourdomain.com` to Netlify (CNAME)
- [ ] Verify DNS propagation (can take up to 24 hours)

---

## 🖥️ Contabo VPS Setup (TODO)

### Server Preparation
- [ ] SSH into Contabo VPS
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Node.js 20+
- [ ] Install PostgreSQL
- [ ] Install Nginx
- [ ] Install Git
- [ ] Install PM2: `npm install -g pm2`

### Database Setup
- [ ] Create production database: `lush_laundry_prod`
- [ ] Create database user: `lush_admin`
- [ ] Set strong password
- [ ] Grant all privileges
- [ ] Test connection

### Backend Deployment
- [ ] Clone repository to `/opt/lush_laundry`
- [ ] Navigate to `backend` folder
- [ ] Create `.env` from `.env.production.example`
- [ ] Update all configuration values in `.env`:
  - [ ] NODE_ENV=production
  - [ ] Database credentials
  - [ ] JWT_SECRET
  - [ ] SESSION_SECRET
  - [ ] FRONTEND_URL
  - [ ] Google OAuth credentials
  - [ ] Admin emails
- [ ] Install dependencies: `npm install --production`
- [ ] Run migrations: `npm run migrate`
- [ ] Build TypeScript: `npm run build`
- [ ] Start with PM2: `pm2 start dist/index.js --name lush-backend`
- [ ] Configure PM2 startup: `pm2 startup` (follow instructions)
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Verify backend running: `pm2 status`

### Nginx & SSL Configuration
- [ ] Create Nginx config: `/etc/nginx/sites-available/lush-api`
- [ ] Configure proxy_pass to `http://localhost:5000`
- [ ] Enable site: `ln -s /etc/nginx/sites-available/lush-api /etc/nginx/sites-enabled/`
- [ ] Test config: `nginx -t`
- [ ] Reload Nginx: `systemctl reload nginx`
- [ ] Install Certbot: `apt install certbot python3-certbot-nginx`
- [ ] Get SSL certificate: `certbot --nginx -d api.yourdomain.com`
- [ ] Test auto-renewal: `certbot renew --dry-run`

### Security Hardening
- [ ] Configure firewall (UFW):
  - [ ] `ufw allow 22/tcp` (SSH)
  - [ ] `ufw allow 80/tcp` (HTTP)
  - [ ] `ufw allow 443/tcp` (HTTPS)
  - [ ] `ufw enable`
- [ ] Disable root SSH login (optional but recommended)
- [ ] Setup fail2ban (optional)

### Backup Configuration
- [ ] Create backup directory: `/opt/lush_laundry/backend/backups`
- [ ] Test manual backup: `npm run db:backup`
- [ ] Setup cron job for daily backups (2 AM):
  ```bash
  crontab -e
  # Add: 0 2 * * * cd /opt/lush_laundry/backend && npm run db:backup
  ```
- [ ] Setup weekly backup to email (optional)

---

## 🌐 Netlify Deployment (TODO)

### Netlify Setup
- [ ] Create Netlify account (if not exists)
- [ ] Connect GitHub repository
- [ ] Verify build settings detected from `netlify.toml`:
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm install && npm run build`
  - [ ] Publish directory: `frontend/dist`

### Environment Variables
- [ ] Add in Netlify dashboard (Site settings → Environment variables):
  - [ ] `VITE_API_URL` = `https://api.yourdomain.com`
  - [ ] `VITE_GOOGLE_CLIENT_ID` = (your Google Client ID)

### Custom Domain
- [ ] Add custom domain in Netlify
- [ ] Verify DNS configuration
- [ ] Wait for SSL certificate (automatic)
- [ ] Test HTTPS access

### Deploy
- [ ] Trigger manual deploy OR
- [ ] Push to main branch (auto-deploy)
- [ ] Monitor build logs
- [ ] Check for errors

---

## 🧪 Post-Deployment Testing (TODO)

### Backend Verification
- [ ] Test health endpoint: `curl https://api.yourdomain.com/api/health`
- [ ] Expected response: `{"status":"healthy"}`
- [ ] Check PM2 logs: `pm2 logs lush-backend --lines 50`
- [ ] No errors in logs
- [ ] Database connection successful

### Frontend Verification
- [ ] Visit `https://yourdomain.com`
- [ ] Page loads without errors
- [ ] No console errors (F12 Developer Tools)
- [ ] Assets load properly (images, CSS, JS)

### Authentication Testing
- [ ] Test email/password login
- [ ] Test Google OAuth login
- [ ] Test logout
- [ ] Verify JWT token works
- [ ] Test session timeout

### Core Features Testing
- [ ] **Customers:**
  - [ ] Create customer
  - [ ] Edit customer
  - [ ] Search customer
  - [ ] View customer history
- [ ] **Orders:**
  - [ ] Create order
  - [ ] Add items to order
  - [ ] Apply discount
  - [ ] Process payment
  - [ ] Update order status
  - [ ] Mark ready for pickup
  - [ ] Mark delivered
- [ ] **Reports:**
  - [ ] Generate income statement
  - [ ] Generate balance sheet
  - [ ] Download PDF report
  - [ ] Download CSV export
- [ ] **Receipts:**
  - [ ] Print receipt
  - [ ] Send WhatsApp receipt (if enabled)
  - [ ] Send SMS notification (if enabled)

### CORS Testing
- [ ] No CORS errors in browser console
- [ ] API calls succeed from frontend
- [ ] File uploads work (profile pictures)
- [ ] Static assets load (uploads folder)

### Mobile Testing (Optional)
- [ ] Test on mobile browser
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Forms submit correctly

---

## 📊 Performance Testing (Optional)

- [ ] Check page load times (should be < 3 seconds)
- [ ] Test with multiple concurrent users
- [ ] Monitor server resources: `htop` or `pm2 monit`
- [ ] Check database connection pool
- [ ] Test backup/restore procedure

---

## 📝 Documentation & Training (TODO)

### User Documentation
- [ ] Create user manual for staff
- [ ] Document common workflows
- [ ] Create troubleshooting guide
- [ ] Record training videos (optional)

### Admin Documentation
- [ ] Document backup/restore procedures
- [ ] Document update/deployment process
- [ ] Create emergency contact list
- [ ] Document monitoring procedures

### Staff Training
- [ ] Train ADMIN users
- [ ] Train MANAGER users
- [ ] Train DESKTOP_AGENT users
- [ ] Conduct practice sessions
- [ ] Answer questions and concerns

---

## 🎯 Go-Live Preparation (TODO)

### Data Migration (if applicable)
- [ ] Export data from old system
- [ ] Clean and validate data
- [ ] Import to production database
- [ ] Verify data integrity
- [ ] Create data backup before import

### Communication
- [ ] Announce go-live date to team
- [ ] Notify customers (if needed)
- [ ] Prepare support channels
- [ ] Schedule launch meeting

### Launch Day
- [ ] Final backup of production database
- [ ] Monitor system closely
- [ ] Be available for support
- [ ] Document any issues
- [ ] Collect user feedback

---

## 📅 Post-Launch (Week 1)

### Daily Monitoring
- [ ] Check PM2 logs daily
- [ ] Monitor server resources
- [ ] Check backup completion
- [ ] Review error logs
- [ ] Collect user feedback

### Performance Tuning
- [ ] Optimize slow queries (if any)
- [ ] Adjust server resources if needed
- [ ] Fine-tune caching
- [ ] Optimize images (if needed)

### User Support
- [ ] Provide on-site support
- [ ] Answer user questions
- [ ] Fix reported bugs
- [ ] Train additional users

---

## 📞 Emergency Contacts

**Technical Support:**
- Developer: [Your Contact]
- Server Admin: [Your Contact]
- Database Admin: [Your Contact]

**Hosting Providers:**
- Contabo Support: support@contabo.com
- Netlify Support: support@netlify.com

**Emergency Procedures:**
- Backup location: `/opt/lush_laundry/backend/backups`
- Restore command: `psql -U lush_admin -d lush_laundry_prod < backup.sql`
- Restart backend: `pm2 restart lush-backend`
- Redeploy frontend: Push to GitHub main branch

---

## ✅ Final Sign-Off

**Project Manager:** _________________ Date: _______

**Technical Lead:** _________________ Date: _______

**Business Owner:** _________________ Date: _______

---

**Notes:**
_Add any additional notes or concerns here_

---

**Status:** IN PROGRESS
**Last Updated:** March 4, 2026
