/**
 * Script to create or reset admin user
 * Usage: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Configuration - CHANGE THESE VALUES
    const adminData = {
      username: 'admin',           // Change to your desired username
      password: 'admin123',        // Change to your desired password
      email: 'admin@forexfactory.cc',
      name: 'Admin User',
      role: 'admin',
    };

    console.log('🔐 Creating admin user...');
    console.log('Username:', adminData.username);
    console.log('Password:', adminData.password);
    console.log('');

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: adminData.username },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Updating password...');
      
      // Update existing admin
      const updatedAdmin = await prisma.admin.update({
        where: { username: adminData.username },
        data: {
          password: hashedPassword,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
        },
      });

      console.log('✅ Admin user updated successfully!');
      console.log('');
      console.log('Login credentials:');
      console.log('Username:', updatedAdmin.username);
      console.log('Password:', adminData.password);
      console.log('Email:', updatedAdmin.email);
      console.log('Role:', updatedAdmin.role);
    } else {
      // Create new admin
      const newAdmin = await prisma.admin.create({
        data: {
          username: adminData.username,
          password: hashedPassword,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('Login credentials:');
      console.log('Username:', newAdmin.username);
      console.log('Password:', adminData.password);
      console.log('Email:', newAdmin.email);
      console.log('Role:', newAdmin.role);
    }

    console.log('');
    console.log('🚀 You can now login at: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
