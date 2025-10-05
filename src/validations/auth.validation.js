import {z} from 'zod';

export const loginSchema = z.object({
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(6).max(125).trim(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(255).trim() ,
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(6).max(125).trim(),
  role: z.enum(['user', 'admin']).optional().default('user'),
});