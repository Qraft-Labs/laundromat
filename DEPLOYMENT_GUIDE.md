# 🚀 Deployment Guide - Lush Laundry ERP

    ## Quick Deployment Steps

    ### 1. Production Database Setup

    ```sql
    -- Create production database
    CREATE DATABASE lush_laundry_production;

    -- Run all migration scripts from backend/src/database/migrations/
    -- (Execute in order, starting with create_tables.sql)

    -- Verify installation
    \dt  -- List all tables (should see 10 tables)
    ```

    ### 2. Backend Deployment

    #### Option A: Traditional Server (Node.js)

    ```bash
    # On your production server
    cd backend

    # Install dependencies
    npm ci

    # Set environment variables (create .env file)
    cp .env.example .env
    nano .env  # Edit with production values

    # Build TypeScript
    npm run build
    node dist/database/migrate.js

    # Start with PM2 (process manager)
    npm install -g pm2
    pm2 start npm --name lush-laundry-api -- start
    pm2 save
    pm2 startup  # Follow instructions to enable on boot
    ```

    #### Option B: Docker

    ```dockerfile
    # backend/Dockerfile
    FROM node:20-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    EXPOSE 5000
    CMD ["node", "dist/index.js"]
    ```

    ```bash
    # Build and run
    docker build -t lush-laundry-backend .
    docker run -d -p 5000:5000 --env-file .env lush-laundry-backend
    ```

    ### 3. Frontend Deployment

    ```bash
    cd frontend

    # Create production .env
    echo "VITE_API_URL=https://api.yourdomaincom" > .env.production

    # Build for production
    npm run build
    # Creates 'dist' folder with optimized files

    # Deploy dist folder to:
    # - Netlify
    # - Vercel
    # - Nginx/Apache
    # - Any static hosting service
    ```

    #### Nginx Configuration

    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;
        
        root /var/www/lush-laundry/dist;
        index index.html;
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy
        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    ### 4. SSL Certificate (Let's Encrypt)

    ```bash
    # Install certbot
    sudo apt install certbot python3-certbot-nginx

    # Get certificate
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

    # Auto-renewal test
    sudo certbot renew --dry-run
    ```

    ### 5. Environment Variables Checklist

    #### Backend .env
    ```env
    # ✅ Required
    DB_HOST=your-db-host
    DB_PORT=5432
    DB_NAME=lush_laundry_production
    DB_USER=your-db-user
    DB_PASSWORD=strong-password-here

    JWT_SECRET=generate-with-openssl-rand-base64-32
    JWT_EXPIRATION=15m

    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

    FRONTEND_URL=https://yourdomain.com

    PORT=5000
    NODE_ENV=production

    AUTHORIZED_ADMIN_EMAILS=admin@yourdomain.com,admin2@yourdomain.com
    ```

    #### Frontend .env.production
    ```env
    VITE_API_URL=https://api.yourdomain.com
    VITE_GOOGLE_CLIENT_ID=your-google-client-id
    ```

    ### 6. Google OAuth Setup

    1. Go to [Google Cloud Console](https://console.cloud.google.com)
    2. Create new project or select existing
    3. Enable Google+ API
    4. Create OAuth 2.0 credentials
    5. Add authorized redirect URIs:
    ```
    https://yourdomain.com/auth/google/callback
    https://api.yourdomain.com/auth/google/callback
    ```
    6. Copy Client ID and Client Secret to .env files

    ### 7. Database Backup Setup

    ```bash
    # Create backup script
    cat > /opt/backup-lush-laundry.sh << 'EOF'
    #!/bin/bash
    BACKUP_DIR="/backups/lush-laundry"
    DATE=$(date +%Y%m%d_%H%M%S)
    mkdir -p $BACKUP_DIR

    pg_dump -h localhost -U your-db-user lush_laundry_production > \
    $BACKUP_DIR/lush_laundry_$DATE.sql

    # Keep last 30 days
    find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

    echo "Backup completed: lush_laundry_$DATE.sql"
    EOF

    chmod +x /opt/backup-lush-laundry.sh

    # Add to crontab (daily at 2 AM)
    crontab -e
    # Add: 0 2 * * * /opt/backup-lush-laundry.sh
    ```

    ### 8. Health Check Script

    ```bash
    # Create health check
    cat > /opt/health-check-lush-laundry.sh << 'EOF'
    #!/bin/bash
    API_URL="https://api.yourdomain.com"
    FRONTEND_URL="https://yourdomain.com"

    # Check API
    if curl -f -s "$API_URL/health" > /dev/null; then
        echo "✅ API is healthy"
    else
        echo "❌ API is down"
        # Send alert here
    fi

    # Check Frontend
    if curl -f -s "$FRONTEND_URL" > /dev/null; then
        echo "✅ Frontend is healthy"
    else
        echo "❌ Frontend is down"
        # Send alert here
    fi

    # Check Database
    psql -h localhost -U your-db-user -d lush_laundry_production \
    -c "SELECT 1" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Database is healthy"
    else
        echo "❌ Database is down"
        # Send alert here
    fi
    EOF

    chmod +x /opt/health-check-lush-laundry.sh

    # Run every 5 minutes
    crontab -e
    # Add: */5 * * * * /opt/health-check-lush-laundry.sh
    ```

    ### 9. Post-Deployment Verification

    ```bash
    # Test backend health
    curl https://api.yourdomain.com/health

    # Test frontend
    curl https://yourdomain.com

    # Test database connection
    psql -h localhost -U your-db-user -d lush_laundry_production -c "SELECT COUNT(*) FROM users"

    # Test Google OAuth
    # Visit: https://yourdomain.com and click "Sign in with Google"

    # Create test order
    # Login as admin → New Order → Add items → Submit

    # Verify payment tracking
    # Dashboard should show correct totals
    ```

    ### 10. Monitoring Setup

    #### PM2 Monitoring (Backend)

    ```bash
    # View logs
    pm2 logs lush-laundry-api

    # Monitor resources
    pm2 monit

    # View process info
    pm2 info lush-laundry-api

    # Restart if needed
    pm2 restart lush-laundry-api
    ```

    #### Database Monitoring

    ```sql
    -- Check active connections
    SELECT count(*) FROM pg_stat_activity;

    -- Check database size
    SELECT pg_size_pretty(pg_database_size('lush_laundry_production'));

    -- Check slowest queries
    SELECT query, mean_exec_time 
    FROM pg_stat_statements 
    ORDER BY mean_exec_time DESC 
    LIMIT 10;
    ```

    ### 11. Security Hardening

    ```bash
    # Firewall setup (UFW on Ubuntu)
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 22/tcp    # SSH
    sudo ufw enable

    # PostgreSQL security
    # Edit: /etc/postgresql/*/main/pg_hba.conf
    # Change "trust" to "md5" for local connections

    # Restart PostgreSQL
    sudo systemctl restart postgresql

    # Disable root SSH login
    sudo nano /etc/ssh/sshd_config
    # Set: PermitRootLogin no
    sudo systemctl restart sshd
    ```

    ### 12. Common Issues & Solutions

    #### Issue: Backend can't connect to database
    ```bash
    # Check PostgreSQL is running
    sudo systemctl status postgresql

    # Check connection from backend
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME

    # Check firewall rules
    sudo ufw status
    ```

    #### Issue: Google OAuth not working
    ```
    1. Verify redirect URI in Google Console matches exactly
    2. Check GOOGLE_CLIENT_ID in both frontend and backend .env
    3. Ensure FRONTEND_URL is correct in backend .env
    4. Clear browser cache and cookies
    ```

    #### Issue: CORS errors
    ```typescript
    // backend/src/server.ts - Verify CORS config
    app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
    }));
    ```

    #### Issue: Frontend can't reach API
    ```bash
    # Check API is running
    curl http://localhost:5000/health

    # Check frontend .env has correct API URL
    cat frontend/.env.production

    # Check nginx proxy configuration
    sudo nginx -t
    sudo systemctl reload nginx
    ```

    ### 13. Performance Optimization

    #### Database
    ```sql
    -- Create missing indexes
    CREATE INDEX idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX idx_orders_created_at ON orders(created_at);
    CREATE INDEX idx_order_items_order_id ON order_items(order_id);

    -- Update statistics
    ANALYZE;

    -- Vacuum database
    VACUUM ANALYZE;
    ```

    #### Backend
    ```typescript
    // Enable compression (backend/src/server.ts)
    import compression from 'compression';
    app.use(compression());

    // Enable caching headers
    app.use((req, res, next) => {
    if (req.url.startsWith('/static')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    next();
    });
    ```

    #### Frontend
    ```bash
    # Already optimized by Vite build
    # Produces minified, tree-shaken bundles
    npm run build
    ```

    ### 14. Rollback Plan

    ```bash
    # Database rollback
    psql -h localhost -U your-db-user -d lush_laundry_production < \
    /backups/lush-laundry/lush_laundry_YYYYMMDD_HHMMSS.sql

    # Backend rollback
    pm2 stop lush-laundry-api
    cd /opt/lush-laundry-backend
    git checkout previous-stable-tag
    npm install
    npm run build
    pm2 restart lush-laundry-api

    # Frontend rollback
    cd /opt/lush-laundry-frontend
    git checkout previous-stable-tag
    npm install
    npm run build
    sudo cp -r dist/* /var/www/lush-laundry/
    ```

    ---

    ## Quick Commands Reference

    ```bash
    # Backend
    pm2 restart lush-laundry-api    # Restart API
    pm2 logs lush-laundry-api        # View logs
    pm2 monit                        # Monitor resources

    # Frontend
    npm run build                    # Build for production
    npm run preview                  # Preview production build

    # Database
    psql -U user -d lush_laundry_production  # Connect to DB
    pg_dump lush_laundry_production > backup.sql  # Backup
    psql lush_laundry_production < backup.sql     # Restore

    # Nginx
    sudo nginx -t                    # Test configuration
    sudo systemctl reload nginx      # Reload config
    sudo systemctl restart nginx     # Restart server

    # SSL
    sudo certbot renew              # Renew certificates
    sudo certbot certificates        # List certificates

    # System
    sudo systemctl restart postgresql  # Restart database
    sudo ufw status                   # Check firewall
    htop                              # Monitor resources
    ```

    ---

    ## Support Contacts

    - **System Administrator:** [Your Contact]
    - **Database Administrator:** [Your Contact]
    - **Technical Support:** [Your Contact]

    ---

    **Last Updated:** January 2026  
    **Version:** 1.0
