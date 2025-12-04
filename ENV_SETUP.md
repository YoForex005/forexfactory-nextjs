# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2 (File Storage)
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_R2_PUBLIC_URL="https://your-bucket.r2.dev"

# Legacy Server (Optional - for image proxy)
OLD_SERVER_URL="http://localhost:3001"
```

## How to Get Cloudflare R2 Credentials

1. **Sign up for Cloudflare** (if you haven't already)
   - Go to https://dash.cloudflare.com/sign-up
   - Free tier includes 10GB storage

2. **Create an R2 Bucket**
   - Go to R2 in your Cloudflare dashboard
   - Click "Create bucket"
   - Choose a name (e.g., "forexfactory-uploads")
   - Click "Create bucket"

3. **Get API Credentials**
   - Go to R2 → Manage R2 API Tokens
   - Click "Create API token"
   - Give it a name (e.g., "Next.js Upload")
   - Set permissions: "Object Read & Write"
   - Click "Create API Token"
   - Copy the Access Key ID and Secret Access Key

4. **Get Public URL**
   - Go to your bucket settings
   - Click "Settings" → "Public Access"
   - Enable "Allow Access" if you want public URLs
   - Copy the public URL (e.g., `https://pub-xxxxx.r2.dev`)

5. **Get Endpoint URL**
   - Format: `https://<account-id>.r2.cloudflarestorage.com`
   - Find your account ID in the R2 dashboard URL

## Alternative: Use Local Storage (Development Only)

If you don't want to set up R2 for development, you can:

1. Comment out R2 configuration in `src/lib/r2.ts`
2. Modify upload API to save files locally
3. Use relative URLs for file paths

**Note**: Local storage is NOT recommended for production!

## Testing the Upload

1. Set all environment variables
2. Restart your dev server: `npm run dev`
3. Go to `/admin/blog/new`
4. Try uploading a featured image
5. Check if the image appears in your R2 bucket

## Troubleshooting

### "Failed to upload file"
- Check if all R2 environment variables are set correctly
- Verify your API token has correct permissions
- Check if the bucket name is correct

### "Unauthorized"
- Make sure you're logged in as admin
- Check if NEXTAUTH_SECRET is set

### "File size exceeds limit"
- Default limit is 50MB
- Adjust in `src/app/api/upload/route.ts` if needed
