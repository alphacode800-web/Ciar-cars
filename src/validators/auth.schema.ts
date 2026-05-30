import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128),
  phone: z.string().max(20).optional(),
  role: z.enum(['user', 'seller']).default('user'),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export const walletTopUpSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(1_000_000),
  method: z.enum(['card', 'bank_transfer', 'paypal']).default('card'),
  description: z.string().max(200).optional(),
});

export const savedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  filters: z.record(z.unknown()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type WalletTopUpInput = z.infer<typeof walletTopUpSchema>;
export type SavedSearchInput = z.infer<typeof savedSearchSchema>;
