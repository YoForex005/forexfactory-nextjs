# 🚀 Forex Factory - Next.js Application

A modern, SEO-optimized blogging platform for Forex trading signals and Expert Advisors, built with Next.js 14+, Prisma, and Cloudflare R2.

![Migration Status](https://img.shields.io/badge/Migration-85%25%20Complete-success)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.19+-teal)

---

## ✨ Features

### **Public Features**
- 📝 **Blog System** - SEO-optimized blog posts with rich content
- 🔍 **Search** - Fast search across blogs and signals
- 📁 **Categories** - Organized content structure
- 📊 **Signals/EAs** - Trading signals and Expert Advisors library
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🎯 **SEO Optimized** - Dynamic metadata, JSON-LD, Open Graph

### **Admin Panel**
- ✏️ **Rich Text Editor** - TipTap editor with full formatting
- 📤 **File Upload** - Drag & drop with Cloudflare R2 integration
- 🖼️ **Media Library** - Manage all uploaded files
- 📊 **Analytics** - Track views and popular content
- 🏷️ **Category Management** - Full CRUD operations
- ⚙️ **Settings** - Site configuration and integrations
- 🔐 **Authentication** - Secure admin access with NextAuth

---

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Up Environment Variables**
Create `.env.local`:
```env
# PostgreSQL is required by prisma/schema.prisma.
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/forexfactory?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### **3. Generate Prisma Client**
```bash
npx prisma generate
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Access Application**
- **Public Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login

📖 **For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](./QUICK_START.md)** | Get started in 5 minutes |
| **[MIGRATION_SUCCESS.md](./MIGRATION_SUCCESS.md)** | Complete feature list and status |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Deploy to production |
| **[ENV_SETUP.md](./ENV_SETUP.md)** | Environment variables guide |
| **[MIGRATION_AUDIT.md](./MIGRATION_AUDIT.md)** | Full migration audit |
| **[COMPLETE_MIGRATION_PLAN.md](./COMPLETE_MIGRATION_PLAN.md)** | Implementation roadmap |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth v5
- **File Storage**: Cloudflare R2
- **Rich Text**: TipTap
- **Icons**: Lucide React

---

## 📁 Project Structure

```
client-next/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/          # Public pages
│   │   ├── admin/             # Admin panel
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── blog/             # Blog components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # NextAuth config
│   │   ├── prisma.ts         # Prisma client
│   │   ├── r2.ts             # Cloudflare R2
│   │   └── seo.ts            # SEO utilities
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
└── public/                    # Static assets
```

---

## 🎯 Migration Status

### **Overall Progress: ~85% Complete**

| Category | Progress | Status |
|----------|----------|--------|
| Public Pages | 8/10 | 80% ✅ |
| Admin Pages | 10/12 | 83% ✅ |
| Core Features | 10/12 | 83% ✅ |

### **✅ Completed**
- Rich text editor
- File upload system
- Search functionality
- Category management
- Media library
- Analytics dashboard
- Settings page
- SEO optimization

### **⏳ Optional (Post-Launch)**
- User authentication (non-admin)
- Comments system
- Email/Newsletter
- Advanced analytics

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open Prisma Studio
npx prisma migrate   # Run migrations

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 🌐 Deployment

### **Recommended: Vercel**
```bash
vercel
```

### **Other Options**
- Netlify
- Self-hosted (VPS/Cloud)
- Docker

📖 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions**

---

## 🔐 Security

- ✅ NextAuth for authentication
- ✅ bcrypt password hashing
- ✅ Protected admin routes
- ✅ Environment variable validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection

---

## 📊 Performance

- ✅ ISR (Incremental Static Regeneration)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Edge middleware
- ✅ Efficient database queries
- ✅ CDN-ready

---

## 🤝 Contributing

This is a migrated project from React to Next.js. For contribution guidelines, please contact the project maintainer.

---

## 📄 License

Proprietary - All rights reserved

---

## 🆘 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review [QUICK_START.md](./QUICK_START.md)
3. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Rich text editing with [TipTap](https://tiptap.dev/)

---

**Made with ❤️ for Forex Traders**
