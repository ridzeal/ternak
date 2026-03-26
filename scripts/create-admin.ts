import { db } from '../src/db';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth';

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@farm.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Farm Admin';

  const adminUser = {
    id: `user_admin_${Date.now()}`,
    email,
    passwordHash: hashPassword(password),
    name,
    role: 'admin' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.insert(users).values(adminUser);
    console.log('✅ Admin user created:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('⚠️  Change password after first login!');
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

createAdmin();
