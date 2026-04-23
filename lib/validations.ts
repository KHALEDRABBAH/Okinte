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
  firstName: z.string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s\-]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s\-]+$/, 'Last name can only contain letters and spaces'),
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format (e.g., name@example.com)'),
  phone: z.string()
    .trim()
    .min(6, 'Phone number must be at least 6 characters')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^\+?[0-9\s\-()]+$/, 'Phone number can only contain digits, spaces, and + - ( )'),
  country: z.string().trim().min(2, 'Country is required'),
  city: z.string().trim().min(2, 'City is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
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
    errorMap: () => ({ message: 'Please select a valid service from the list' }),
  }),
  firstName: z.string().trim().min(2, 'Required').regex(/^[a-zA-Z\u0600-\u06FF\s\-]+$/, 'Invalid format'),
  lastName: z.string().trim().min(2, 'Required').regex(/^[a-zA-Z\u0600-\u06FF\s\-]+$/, 'Invalid format'),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  phone: z.string().trim().min(6, 'Required').regex(/^\+?[0-9\s\-()]+$/, 'Invalid format'),
  country: z.string().trim().min(2, 'Required'),
  city: z.string().trim().min(2, 'Required'),
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
// TESTIMONIAL SCHEMA
// ============================================================

export const testimonialSchema = z.object({
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  content: z.string()
    .trim()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(500, 'Testimonial cannot exceed 500 characters'),
});

// ============================================================
// CHAT MESSAGE SCHEMA
// ============================================================

export const chatMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
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
// PROFILE UPDATE SCHEMA
// ============================================================

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').optional(),
  phone: z.string()
    .trim()
    .min(6, 'Phone number must be at least 6 characters')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^\+?[0-9\s\-()]+$/, 'Phone number can only contain digits, spaces, and + - ( )')
    .optional(),
  country: z.string().trim().min(2, 'Country is required').optional(),
  city: z.string().trim().min(2, 'City is required').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
}).refine(data => data.firstName || data.lastName || data.phone || data.country || data.city || data.avatarUrl !== undefined, {
  message: 'At least one field is required',
});

// ============================================================
// TYPE EXPORTS (inferred from schemas)
// ============================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
