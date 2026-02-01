import { db } from '../server/db';
import bcrypt from 'bcryptjs';
import { users } from '../shared/models/auth';
import { eq } from 'drizzle-orm';

async function setPassword() {
  console.log('🔐 Setting password for Veil...');

  try {
    const passwordHash = await bcrypt.hash('Purple!snake22', 10);

    const result = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, 'cocoraec@gmail.com'))
      .returning();

    if (result.length > 0) {
      console.log('✅ Password set successfully for cocoraec@gmail.com');
      console.log('🔑 You can now log in with: Purple!snake22');
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error setting password:', error);
  }
}

setPassword().catch(console.error);