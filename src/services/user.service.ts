import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { AppError, NotFoundError } from '@/lib/errors';
import type { RegisterInput } from '@/validators/auth.schema';
import type { UpdateProfileInput } from '@/validators/user.schema';

const ADMIN_EMAILS = new Set(['admin@ciar.com', 'super@ciar.com']);

export const userService = {
  async register(input: RegisterInput) {
    if (ADMIN_EMAILS.has(input.email.toLowerCase())) {
      throw new AppError('This email is reserved', 409, 'EMAIL_RESERVED');
    }

    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    return db.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        name: input.name,
        phone: input.phone,
        role: input.role,
        city: input.city,
        country: input.country ?? 'Egypt',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async getById(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        bio: true,
        city: true,
        country: true,
        address: true,
        businessName: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async updateLastLogin(userId: string) {
    return db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return db.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        bio: true,
        city: true,
        country: true,
        address: true,
        businessName: true,
        rating: true,
        totalReviews: true,
        totalListings: true,
        totalSales: true,
        walletBalance: true,
        createdAt: true,
      },
    });
  },
};
