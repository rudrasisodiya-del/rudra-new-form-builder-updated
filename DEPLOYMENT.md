# Pabbly Forms - Deployment Guide

Complete guide to deploying your Pabbly Forms application to production.

## Overview

This guide covers deploying:
- **Frontend** → Vercel (recommended) or Netlify
- **Backend** → Railway (recommended) or Render
- **Database** → Railway PostgreSQL or Supabase

## Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free tier available)
- Your Pabbly Forms code pushed to GitHub

## Option 1: Railway (Recommended - Easiest)

Railway provides both database and backend hosting in one place.

### Step 1: Deploy Database

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Railway will create a PostgreSQL database
5. Click on the database → "Connect" → Copy the `DATABASE_URL`

### Step 2: Deploy Backend

1. In Railway, click "New" → "GitHub Repo"
2. Select your `pabbly-upgraded` repository
3. Railway will detect it's a Node.js app
4. Click on the deployment → "Variables"
5. Add environment variables:
   ```
   DATABASE_URL=<paste from step 1>
   JWT_SECRET=<generate a random 64-character string>
   PORT=5000
   NODE_ENV=production
   ```
6. Click "Settings" → "Generate Domain"
7. Copy your backend URL (e.g., `https://your-app.railway.app`)

### Step 3: Run Database Migrations

1. In Railway, go to your backend service
2. Click "Settings" → "Deploy"
3. Add a custom start command:
   ```
   npx prisma generate && npx prisma db push && npm start
   ```
4. Redeploy

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
6. Click "Deploy"
7. Your app will be live at `https://your-app.vercel.app`

## Option 2: Separate Services

### Frontend: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repo
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variable:
   ```
   VITE_API_URL=your-backend-url
   ```
6. Deploy

### Backend: Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** pabbly-forms-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install && npx prisma generate`
   - **Start Command:** `cd server && npm start`
5. Add environment variables:
   ```
   DATABASE_URL=your-database-url
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```
6. Click "Create Web Service"

### Database: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for database to be created
5. Go to "Settings" → "Database"
6. Copy the connection string (URI)
7. Use this as your `DATABASE_URL`

## Option 3: Traditional VPS (Advanced)

### Requirements
- Ubuntu 22.04 server
- Domain name
- SSL certificate

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Setup PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE pabbly_forms;
CREATE USER pabbly_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE pabbly_forms TO pabbly_user;
\q
```

### Step 3: Deploy Backend

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/pabbly-upgraded.git
cd pabbly-upgraded/server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://pabbly_user:strong_password@localhost:5432/pabbly_forms"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=production
EOF

# Run migrations
npx prisma generate
npx prisma db push

# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name pabbly-api
pm2 save
pm2 startup
```

### Step 4: Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/pabbly-forms
```

Add configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/pabbly-upgraded/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pabbly-forms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### Step 6: Deploy Frontend

```bash
cd /var/www/pabbly-upgraded

# Create .env for production
cat > .env << EOF
VITE_API_URL=https://api.yourdomain.com
EOF

# Build
npm run build

# Frontend files are now in /var/www/pabbly-upgraded/dist
```

## Environment Variables Summary

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-url.com
```

### Backend (server/.env)
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=5000
NODE_ENV=production

# Optional
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
```

## Post-Deployment Steps

### 1. Update CORS Settings

In `server/src/index.ts`, update CORS to allow your frontend domain:

```typescript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'https://yourdomain.com'],
  credentials: true
}));
```

### 2. Create Default Plans

Run this SQL in your production database:

```sql
INSERT INTO "Plan" (id, name, "formLimit", "submissionLimit", "storageLimit", price, features) VALUES
('free-plan-id', 'Free', 5, 100, 10485760, 0, '["Basic fields", "Email notifications", "CSV export"]'),
('pro-plan-id', 'Pro', 999999, 10000, 104857600, 29, '["Unlimited forms", "Webhooks", "API access", "Integrations"]'),
('business-plan-id', 'Business', 999999, 100000, 1073741824, 99, '["Everything in Pro", "Custom domain", "SSO", "Priority support"]');
```

### 3. Set Up Monitoring

**Railway/Render:**
- Built-in monitoring dashboard
- Check logs for errors

**PM2 on VPS:**
```bash
pm2 logs pabbly-api
pm2 monit
```

### 4. Configure Backups

**Railway:**
- Automatic daily backups included
- Can restore from dashboard

**Supabase:**
- Daily backups on paid plans
- Point-in-time recovery available

**VPS:**
```bash
# Add to crontab
0 2 * * * pg_dump pabbly_forms > /backups/pabbly_$(date +\%Y\%m\%d).sql
```

## Domain Configuration

### Custom Domain on Vercel

1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records as shown

### Custom Domain on Railway

1. Click on your service
2. Go to "Settings"
3. Add custom domain
4. Update DNS records

## SSL Certificate

- **Vercel/Netlify:** Automatic SSL (Let's Encrypt)
- **Railway/Render:** Automatic SSL
- **VPS:** Use Certbot (shown above)

## Testing Production Deployment

1. **Health Check:**
   ```bash
   curl https://your-api.com/health
   ```

2. **Sign Up:**
   - Visit your frontend URL
   - Create a test account
   - Verify email workflow

3. **Create Form:**
   - Log in
   - Create a test form
   - Publish it
   - Submit a response

4. **Check Database:**
   - Verify data is being saved
   - Check for any errors

## Scaling Considerations

### Database
- **Free tier:** Good for 10,000 users
- **Upgrade when:** Response times > 500ms
- **Options:**
  - Railway: Scale up instance
  - Supabase: Upgrade to Pro
  - Self-hosted: Add read replicas

### Backend
- **Free tier:** Good for 1,000 daily active users
- **Upgrade when:** CPU > 80%
- **Options:**
  - Railway: Increase resources
  - Render: Upgrade plan
  - VPS: Load balancer + multiple instances

### Frontend
- **Vercel/Netlify:** Auto-scales, no action needed
- **CDN:** Already included

## Monitoring & Logs

### View Logs

**Railway:**
```
Dashboard → Your Service → Logs
```

**Render:**
```
Dashboard → Service → Logs
```

**VPS:**
```bash
pm2 logs pabbly-api
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
npm install @sentry/node @sentry/tracing
```

Configure in `server/src/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

## Cost Estimates

### Free Tier (Good for MVP)
- **Railway:** $5/month free credits
- **Vercel:** Unlimited for personal projects
- **Total:** ~$0-5/month

### Starter ($100-500 users)
- **Railway:** $20/month
- **Vercel:** Free
- **Total:** ~$20/month

### Growth ($1000-5000 users)
- **Railway:** $50/month
- **Vercel:** Free or $20/month
- **Total:** ~$50-70/month

### Business ($10,000+ users)
- **Railway:** $200/month
- **Vercel:** $20/month
- **Database:** Dedicated instance $100/month
- **Total:** ~$320/month

## Rollback Plan

If deployment fails:

1. **Railway:** Click "Deployments" → Select previous deployment → "Redeploy"
2. **Vercel:** Click "Deployments" → Select previous → "Promote to Production"
3. **VPS:**
   ```bash
   git checkout previous-commit
   pm2 restart pabbly-api
   ```

## Security Checklist

- [ ] JWT_SECRET is strong (64+ characters)
- [ ] Database has strong password
- [ ] CORS is configured correctly
- [ ] SSL certificate is active
- [ ] Environment variables are secure
- [ ] API rate limiting is enabled
- [ ] Sensitive routes are protected
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection enabled
- [ ] CSRF tokens for forms

## Support

If you encounter issues:

1. Check logs first
2. Verify environment variables
3. Test database connection
4. Check CORS settings
5. Review error messages

---

## Quick Deploy Commands

**Railway CLI:**
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel
```

Your application is now live and ready for users!
