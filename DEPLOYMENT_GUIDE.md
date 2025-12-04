# 🚀 Deployment Guide - Next.js Forex Factory

Complete guide to deploy your Next.js application to production.

---

## 📋 Pre-Deployment Checklist

### **1. Environment Variables**
Ensure all required environment variables are set:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth (CRITICAL - Generate new secret for production!)
NEXTAUTH_SECRET="generate-a-new-secret-key-for-production"
NEXTAUTH_URL="https://your-domain.com"

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT="https://account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="your-bucket"
CLOUDFLARE_R2_PUBLIC_URL="https://your-bucket.r2.dev"

# Optional
OLD_SERVER_URL="https://old-server.com"
```

### **2. Generate Production Secret**
```bash
# Generate a secure random secret for NEXTAUTH_SECRET
openssl rand -base64 32
```

### **3. Database Setup**
- Ensure MySQL database is accessible from production
- Run Prisma migrations if needed:
  ```bash
  npx prisma migrate deploy
  ```

### **4. Cloudflare R2 Setup**
- Create R2 bucket
- Configure CORS if needed
- Set up public access for uploaded files
- Get API credentials

---

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended - Easiest)**

#### **Why Vercel?**
- Built by Next.js creators
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available

#### **Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd client-next
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all environment variables from `.env.local`
   - Make sure to add them for Production, Preview, and Development

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### **Custom Domain:**
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

### **Option 2: Netlify**

#### **Steps:**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   cd client-next
   netlify init
   ```

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

5. **Set Environment Variables**
   ```bash
   netlify env:set NEXTAUTH_SECRET "your-secret"
   netlify env:set DATABASE_URL "your-database-url"
   # ... add all other variables
   ```

6. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

### **Option 3: Self-Hosted (VPS/Cloud)**

#### **Requirements:**
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt)

#### **Steps:**

1. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd client-next
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Environment Variables**
   ```bash
   # Create .env.local with production values
   nano .env.local
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Install PM2**
   ```bash
   npm install -g pm2
   ```

6. **Start Application**
   ```bash
   pm2 start npm --name "forexfactory" -- start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Set Up SSL**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

### **Option 4: Docker**

#### **Create Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### **Update next.config.ts:**
```typescript
const nextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

#### **Build and Run:**
```bash
docker build -t forexfactory .
docker run -p 3000:3000 --env-file .env.local forexfactory
```

---

## 🔒 Security Checklist

### **Before Going Live:**

- [ ] Change `NEXTAUTH_SECRET` to a new random value
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Restrict database access to production server IP
- [ ] Enable Cloudflare R2 bucket security
- [ ] Set up CORS properly
- [ ] Review all API routes for authentication
- [ ] Enable rate limiting (optional)
- [ ] Set up monitoring and error tracking

---

## 📊 Post-Deployment

### **1. Test Everything**

- [ ] Admin login works
- [ ] Create blog post
- [ ] Upload image
- [ ] Upload signal/EA
- [ ] Search functionality
- [ ] Category filtering
- [ ] Contact form
- [ ] All public pages load

### **2. Set Up Monitoring**

**Vercel Analytics** (if using Vercel):
```bash
npm install @vercel/analytics
```

**Google Analytics:**
- Add GA4 tracking ID to settings page
- Implement tracking in `app/layout.tsx`

**Error Tracking (Sentry):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### **3. Performance Optimization**

- [ ] Enable ISR caching (already configured)
- [ ] Optimize images (use WebP format)
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Monitor Core Web Vitals

### **4. SEO Setup**

- [ ] Submit sitemap to Google Search Console
- [ ] Set up robots.txt
- [ ] Verify meta tags
- [ ] Test structured data
- [ ] Set up Google Analytics

---

## 🔄 Continuous Deployment

### **GitHub Actions (Vercel)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🐛 Troubleshooting

### **Build Errors**

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Prisma Client not generated"**
```bash
npx prisma generate
```

### **Runtime Errors**

**"NEXTAUTH_SECRET not set"**
- Ensure environment variable is set in production
- Restart the application

**"Database connection failed"**
- Check DATABASE_URL is correct
- Verify database is accessible from production server
- Check firewall rules

**"File upload fails"**
- Verify Cloudflare R2 credentials
- Check bucket permissions
- Ensure CORS is configured

### **Performance Issues**

**Slow page loads**
- Enable ISR caching
- Optimize database queries
- Use CDN for static assets
- Enable compression

---

## 📝 Maintenance

### **Regular Tasks**

**Weekly:**
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Review analytics

**Monthly:**
- [ ] Update dependencies
- [ ] Database backup
- [ ] Security audit

**Quarterly:**
- [ ] Review and optimize queries
- [ ] Clean up unused media
- [ ] Update documentation

---

## 🆘 Support

### **Useful Commands**

```bash
# Check build locally
npm run build
npm start

# View logs (PM2)
pm2 logs forexfactory

# Restart application (PM2)
pm2 restart forexfactory

# Database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### **Resources**

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

---

## ✅ Launch Checklist

Final checklist before going live:

- [ ] All environment variables set
- [ ] Database accessible
- [ ] Cloudflare R2 configured
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Admin login tested
- [ ] All features tested
- [ ] Analytics set up
- [ ] Error tracking enabled
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated

---

## 🎉 You're Ready to Launch!

Once all items are checked, your Next.js Forex Factory application is ready for production!

**Good luck with your launch! 🚀**
