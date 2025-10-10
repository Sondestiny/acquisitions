import { z } from 'zod';

// Schema for creating a new user
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must not exceed 255 characters').trim(),
  email: z.string().email('Invalid email format').max(255, 'Email must not exceed 255 characters').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(125, 'Password must not exceed 125 characters').trim(),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

// Schema for updating a user (all fields optional)
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must not exceed 255 characters').trim().optional(),
  email: z.string().email('Invalid email format').max(255, 'Email must not exceed 255 characters').toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(125, 'Password must not exceed 125 characters').trim().optional(),
  role: z.enum(['user', 'admin']).optional(),
}).refine((data) => {
  // At least one field must be provided for update
  return Object.keys(data).length > 0;
}, {
  message: 'At least one field must be provided for update',
});

// Schema for user ID parameter validation
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be a positive integer').transform((val) => parseInt(val, 10)),
});