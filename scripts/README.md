# 🔧 Admin Management Scripts

Utility scripts to manage admin users for your Next.js application.

---

## 📋 Available Scripts

### **1. List All Admins**
Shows all admin users in the database (without passwords).

```bash
node scripts/list-admins.js
```

**Output**:
```
📋 Fetching admin users from database...

Found 1 admin user(s):

1. Admin User
   ID:       1
   Username: admin
   Email:    admin@forexfactory.cc
   Name:     Admin User
   Role:     admin
   Created:  12/2/2025
```

---

### **2. Create/Reset Admin**
Creates a new admin user or resets password for existing admin.

```bash
node scripts/create-admin.js
```

**Before running**:
1. Open `scripts/create-admin.js`
2. Edit these values (lines 13-18):
   ```javascript
   const adminData = {
     username: 'admin',           // Your username
     password: 'admin123',        // Your password
     email: 'admin@forexfactory.cc',
     name: 'Admin User',
     role: 'admin',
   };
   ```
3. Save and run the script

**Output**:
```
🔐 Creating admin user...
Username: admin
Password: admin123

✅ Admin user created successfully!

Login credentials:
Username: admin
Password: admin123
Email: admin@forexfactory.cc
Role: admin

🚀 You can now login at: http://localhost:3000/admin/login
```

---

## 🚀 Quick Start

### **Step 1: Check Existing Admins**
```bash
node scripts/list-admins.js
```

### **Step 2: If No Admins or Forgot Password**
```bash
# Edit create-admin.js first to set your credentials
node scripts/create-admin.js
```

### **Step 3: Login**
Go to http://localhost:3000/admin/login and use the credentials.

---

## 🔐 Security Notes

1. **Change default password** - Don't use `admin123` in production!
2. **Keep credentials secure** - Don't commit passwords to git
3. **Use strong passwords** - Mix of letters, numbers, symbols
4. **Passwords are hashed** - Stored as bcrypt hash in database

---

## 🛠️ Troubleshooting

### **Error: "Cannot find module '@prisma/client'"**
```bash
npm install
npx prisma generate
```

### **Error: "Cannot find module 'bcryptjs'"**
```bash
npm install bcryptjs
```

### **Error: "Database connection failed"**
Check your `.env.local` file has correct `DATABASE_URL`.

### **Error: "Unique constraint failed"**
Admin with that username/email already exists. The script will update it instead.

---

## 📝 Admin Roles

Available roles in the system:
- `admin` - Full access to everything
- `editor` - Can edit content
- `viewer` - Read-only access

Set the role in `create-admin.js` before running.

---

## 🎯 Common Use Cases

### **Create First Admin**
```bash
# 1. Edit create-admin.js with your details
# 2. Run:
node scripts/create-admin.js
```

### **Reset Forgotten Password**
```bash
# 1. Edit create-admin.js with same username, new password
# 2. Run:
node scripts/create-admin.js
# It will update the existing admin's password
```

### **Check Who Can Login**
```bash
node scripts/list-admins.js
```

---

## ✅ After Creating Admin

1. ✅ Note down your credentials
2. ✅ Go to http://localhost:3000/admin/login
3. ✅ Login with username and password
4. ✅ You should be redirected to `/admin/dashboard`

---

**Happy managing! 🎉**
