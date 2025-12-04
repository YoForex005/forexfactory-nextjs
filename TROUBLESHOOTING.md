# 🔧 Troubleshooting Guide

Common issues and their solutions for the Next.js Forex Factory application.

---

## 🔐 Authentication Issues

### **Error: "useSession must be wrapped in a SessionProvider"**

**Solution**: ✅ FIXED - Added SessionProvider wrapper

The root layout now includes the `Providers` component that wraps the app with NextAuth's SessionProvider.

**Files Updated**:
- `src/components/Providers.tsx` - Created SessionProvider wrapper
- `src/app/layout.tsx` - Wrapped children with Providers

### **Error: "NEXTAUTH_SECRET not set"**

**Solution**:
```bash
# Add to .env.local
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### **Login fails with "Invalid credentials"**

**Checklist**:
1. Verify admin exists in database (`admins` table)
2. Check password is bcrypt hashed
3. Ensure DATABASE_URL is correct
4. Check username matches exactly (case-sensitive)

---

## 💾 Database Issues

### **Error: "Prisma Client not found"**

**Solution**:
```bash
npx prisma generate
```

### **Error: "Database connection failed"**

**Checklist**:
1. MySQL server is running
2. DATABASE_URL is correct
3. Database exists
4. User has proper permissions
5. Firewall allows connection

**Test connection**:
```bash
npx prisma db pull
```

### **Error: "Table doesn't exist"**

**Solution**:
```bash
# Run migrations
npx prisma migrate deploy

# Or push schema
npx prisma db push
```

---

## 📤 File Upload Issues

### **Error: "Failed to upload file"**

**Checklist**:
1. All Cloudflare R2 environment variables are set
2. R2 bucket exists
3. API credentials are correct
4. Bucket has proper permissions

**Environment Variables Required**:
```env
CLOUDFLARE_R2_ENDPOINT="https://account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret"
CLOUDFLARE_R2_BUCKET_NAME="your-bucket"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### **Uploads work but images don't display**

**Solution**:
1. Check CLOUDFLARE_R2_PUBLIC_URL is correct
2. Verify bucket has public access enabled
3. Check CORS settings on R2 bucket

---

## 🚀 Build & Deployment Issues

### **Error: "Module not found"**

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **Error: "Type errors during build"**

**Solution**:
```bash
# Check types
npm run type-check

# Generate Prisma types
npx prisma generate
```

### **Error: "Port 3000 already in use"**

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

---

## 🎨 UI/Display Issues

### **Styles not loading**

**Solution**:
```bash
# Rebuild Tailwind
npm run dev

# Or clear Next.js cache
rm -rf .next
npm run dev
```

### **Images not loading**

**Checklist**:
1. Check image URLs are correct
2. Verify R2 public URL is set
3. Check browser console for CORS errors
4. Ensure images exist in R2 bucket

---

## 🔍 Search Issues

### **Search returns no results**

**Checklist**:
1. Database has published content
2. Search query is at least 2 characters
3. Check browser console for API errors
4. Verify `/api/search` route is working

**Test search API**:
```bash
curl http://localhost:3000/api/search?q=test
```

---

## 📊 Admin Panel Issues

### **Dashboard shows 0 for all stats**

**Possible Causes**:
1. No content in database yet
2. API routes not fetching correctly
3. Database connection issue

**Solution**:
1. Add some blog posts and signals
2. Check browser console for errors
3. Verify API routes return data

### **Rich text editor not loading**

**Solution**:
```bash
# Reinstall TipTap
npm install @tiptap/react @tiptap/starter-kit
```

### **Can't access admin pages**

**Checklist**:
1. Logged in as admin
2. Session is valid
3. Middleware is protecting routes
4. Check browser cookies

---

## 🐛 Development Issues

### **Hot reload not working**

**Solution**:
```bash
# Restart dev server
npm run dev

# Or clear cache
rm -rf .next
npm run dev
```

### **Changes not reflecting**

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server
4. Check file is saved

---

## 📝 Common Error Messages

### **"Error: Invalid `prisma.xxx.findMany()` invocation"**

**Cause**: Prisma schema doesn't match database

**Solution**:
```bash
npx prisma db pull
npx prisma generate
```

### **"Error: Cannot find module '@/...'"**

**Cause**: TypeScript path alias not resolved

**Solution**:
1. Check `tsconfig.json` has correct paths
2. Restart TypeScript server in IDE
3. Restart dev server

### **"Error: Hydration failed"**

**Cause**: Server/client HTML mismatch

**Solution**:
1. Check for `useEffect` usage
2. Ensure client components use "use client"
3. Clear browser cache
4. Restart dev server

---

## 🔧 Quick Fixes

### **Reset Everything**
```bash
# Stop server
# Delete cache and dependencies
rm -rf .next node_modules package-lock.json

# Reinstall
npm install

# Regenerate Prisma
npx prisma generate

# Start fresh
npm run dev
```

### **Check Environment Variables**
```bash
# Print all env vars (be careful with secrets!)
node -e "console.log(process.env)" | grep NEXT
```

### **Test Database Connection**
```bash
npx prisma studio
```

### **Check API Routes**
```bash
# Test auth
curl http://localhost:3000/api/auth/session

# Test search
curl http://localhost:3000/api/search?q=test

# Test categories
curl http://localhost:3000/api/categories
```

---

## 🆘 Still Having Issues?

### **Debug Checklist**:
1. ✅ Check browser console for errors
2. ✅ Check terminal for server errors
3. ✅ Verify all environment variables are set
4. ✅ Ensure database is accessible
5. ✅ Check file permissions
6. ✅ Try in incognito/private mode
7. ✅ Clear all caches
8. ✅ Restart everything

### **Get More Info**:
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check Next.js build info
npm run build

# Analyze bundle
npm run build -- --analyze
```

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma migrate dev   # Create migration

# Debugging
npm run lint             # Check for code issues
npm run type-check       # Check TypeScript types
npx next info            # Show Next.js info

# Cleanup
rm -rf .next             # Clear Next.js cache
rm -rf node_modules      # Remove dependencies
npx kill-port 3000       # Kill process on port 3000
```

---

## 🎯 Prevention Tips

1. **Always commit `.env.local.example`** (without secrets)
2. **Run `npx prisma generate`** after schema changes
3. **Restart dev server** after environment variable changes
4. **Clear cache** if seeing stale data
5. **Check browser console** for client-side errors
6. **Check terminal** for server-side errors

---

**Most issues can be solved by restarting the dev server and clearing caches!** 🔄
