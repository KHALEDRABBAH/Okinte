/**
 * Validation Schemas (Zod)
 * 
 * WHY: Zod schemas validate data on BOTH the frontend and backend.
 * If a user bypasses frontend validation (using dev tools or Postman),
 * the backend still rejects invalid data.
 * 
 * HOW: Define the shape once → use `.parse()` to validate.
 * If validation fails, Zod throws a descriptive error.
 */

import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number is required').max(20),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================
// APPLICATION SCHEMAS
// ============================================================

export const applicationSchema = z.object({
  serviceKey: z.enum(['study', 'internship', 'scholarship', 'sabbatical', 'employment'], {
    errorMap: () => ({ message: 'Please select a valid service' }),
  }),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  country: z.string().min(2),
  city: z.string().min(2),
});

// ============================================================
// CONTACT / MESSAGE SCHEMA
// ============================================================

export const messageSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

// ============================================================
// FILE UPLOAD VALIDATION
// ============================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File must be PDF, JPG, or PNG' };
  }
  return { valid: true };
}

// ============================================================
// TYPE EXPORTS (inferred from schemas)
// ============================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
