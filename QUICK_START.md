# ⚡ Quick Start Guide

Get your Next.js Forex Factory application running in 5 minutes!

---

## 🚀 Fast Setup (Without Cloudflare R2)

If you want to test quickly without setting up Cloudflare R2:

### **1. Install Dependencies**
```bash
cd client-next
npm install
```

### **2. Set Up Minimal Environment Variables**

Create `.env.local`:
```env
# Database (use your existing MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/forexfactory"

# NextAuth (required)
NEXTAUTH_SECRET="your-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"

# R2 (optional for testing - leave empty)
CLOUDFLARE_R2_ENDPOINT=""
CLOUDFLARE_R2_ACCESS_KEY_ID=""
CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
CLOUDFLARE_R2_BUCKET_NAME=""
CLOUDFLARE_R2_PUBLIC_URL=""
```

### **3. Generate Prisma Client**
```bash
npx prisma generate
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Access the Application**
- **Public Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login

---

## 🔑 Admin Login

Use existing admin credentials from your MySQL database:
- Table: `admins`
- Username: (from database)
- Password: (from database - bcrypt hashed)

---

## ✅ What Works Without R2

### **✅ Working Features:**
- ✅ View all public pages
- ✅ Browse blog posts
- ✅ Search functionality
- ✅ Category filtering
- ✅ Admin login
- ✅ Dashboard
- ✅ Blog list view
- ✅ Signal list view
- ✅ Category management
- ✅ Analytics dashboard
- ✅ Settings page

### **❌ Requires R2:**
- ❌ Upload featured images
- ❌ Upload signal files
- ❌ Media library

**Note**: You can still create blog posts - just use external image URLs for featured images!

---

## 🎯 Quick Test Workflow

### **1. Test Public Pages**
```
✓ Visit http://localhost:3000
✓ Click "Blog" - see blog posts
✓ Click "Signals" - see signals
✓ Try search functionality
✓ Visit "About" and "Contact"
```

### **2. Test Admin Panel**
```
✓ Go to http://localhost:3000/admin/login
✓ Login with admin credentials
✓ View dashboard
✓ Go to "Blog Posts"
✓ Click "New Post"
✓ Try the rich text editor
✓ Create a category
✓ View analytics
```

---

## 🔧 Common Issues & Quick Fixes

### **"Prisma Client not found"**
```bash
npx prisma generate
```

### **"Database connection failed"**
- Check your DATABASE_URL
- Make sure MySQL is running
- Verify database exists

### **"Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **"Port 3000 already in use"**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

### **"NextAuth error"**
- Make sure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your local URL

---

## 📦 Full Setup (With Cloudflare R2)

For complete functionality including file uploads:

### **1. Create Cloudflare R2 Bucket**

1. Sign up at https://dash.cloudflare.com
2. Go to R2 → Create bucket
3. Name it (e.g., "forexfactory-uploads")
4. Click "Create bucket"

### **2. Get API Credentials**

1. Go to R2 → Manage R2 API Tokens
2. Click "Create API token"
3. Name: "Next.js Upload"
4. Permissions: "Object Read & Write"
5. Click "Create API Token"
6. **Copy Access Key ID and Secret Access Key**

### **3. Get Endpoint & Public URL**

**Endpoint:**
```
https://<account-id>.r2.cloudflarestorage.com
```
Find account ID in your R2 dashboard URL

**Public URL:**
1. Go to your bucket → Settings
2. Enable "Public Access"
3. Copy the public URL (e.g., `https://pub-xxxxx.r2.dev`)

### **4. Update .env.local**

```env
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="forexfactory-uploads"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### **5. Restart Dev Server**
```bash
npm run dev
```

### **6. Test File Upload**
1. Go to `/admin/blog/new`
2. Try uploading a featured image
3. Check your R2 bucket - file should appear!

---

## 🎨 Customization

### **Change Site Name**
Edit `src/lib/seo.ts`:
```typescript
export const SITE_NAME = "Your Site Name";
```

### **Change Brand Color**
Edit `tailwind.config.ts`:
```typescript
colors: {
  brand: {
    DEFAULT: "#your-color",
    dark: "#your-dark-color",
  }
}
```

### **Update Logo**
Edit `src/components/layout/Navbar.tsx` and `src/components/admin/AdminLayout.tsx`

---

## 📚 Next Steps

Once everything is working:

1. **Read Full Documentation**
   - `MIGRATION_SUCCESS.md` - What's been built
   - `DEPLOYMENT_GUIDE.md` - How to deploy
   - `ENV_SETUP.md` - Environment setup details

2. **Test All Features**
   - Create blog posts
   - Upload signals
   - Manage categories
   - Test search

3. **Customize**
   - Update branding
   - Add your content
   - Configure settings

4. **Deploy**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Choose hosting platform
   - Set up production environment

---

## 🆘 Need Help?

### **Check Documentation**
- `MIGRATION_AUDIT.md` - Complete feature list
- `COMPLETE_MIGRATION_PLAN.md` - Implementation details
- `ENV_SETUP.md` - Environment variables guide

### **Common Commands**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint
```

---

## ✅ Quick Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with DATABASE_URL
- [ ] Prisma client generated
- [ ] Dev server running
- [ ] Can access http://localhost:3000
- [ ] Can login to admin panel
- [ ] Dashboard loads
- [ ] Can create blog post (without image)
- [ ] R2 configured (optional)
- [ ] File upload works (if R2 configured)

---

## 🎉 You're All Set!

Your Next.js Forex Factory application is now running locally!

**Explore the admin panel and test all features.**

When ready to deploy, follow the `DEPLOYMENT_GUIDE.md`! 🚀
