/**
 * Script to list all admin users
 * Usage: node scripts/list-admins.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    console.log('📋 Fetching admin users from database...\n');

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (admins.length === 0) {
      console.log('⚠️  No admin users found in database!');
      console.log('Run: node scripts/create-admin.js to create one.');
      return;
    }

    console.log(`Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Admin User`);
      console.log(`   ID:       ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Name:     ${admin.name}`);
      console.log(`   Role:     ${admin.role}`);
      console.log(`   Created:  ${admin.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    console.log('💡 Note: Passwords are encrypted and cannot be displayed.');
    console.log('   If you forgot your password, run: node scripts/create-admin.js');
    
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
