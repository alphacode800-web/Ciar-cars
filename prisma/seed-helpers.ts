import bcrypt from 'bcryptjs';

/** Demo password for seeded users: `demo1234` */
export const DEMO_PASSWORD = 'demo1234';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
