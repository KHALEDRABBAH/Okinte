/**
 * Supabase Storage Client
 * 
 * WHY: We use Supabase Storage to store uploaded files (passport, CV,
 * diploma, payment receipts). Files are stored in a PRIVATE bucket —
 * they cannot be accessed without a signed URL.
 * 
 * HOW IT WORKS:
 * 1. User uploads a file from the frontend
 * 2. Our API route receives the file
 * 3. We upload it to Supabase Storage (private bucket)
 * 4. We store the file path in our `documents` database table
 * 5. When someone needs to view the file, we generate a signed URL
 *    that expires after 1 hour — this prevents unauthorized access
 * 
 * BUCKET: "bolila-documents" (configured in Supabase Dashboard)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Using the SERVICE ROLE key (not anon key) because:
// - This runs on the SERVER only (API routes)
// - Service role bypasses Row Level Security
// - Needed to upload/delete files on behalf of users
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { 
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  },
});

export const STORAGE_BUCKET = 'bolila-documents';

/**
 * Upload a file to Supabase Storage
 * @param file - The file buffer or File object
 * @param path - Storage path (e.g., "users/uuid/passport.pdf")
 * @param contentType - MIME type
 * @returns The storage path on success
 */
export async function uploadFile(
  file: Buffer | File | Blob,
  path: string,
  contentType: string
): Promise<{ path: string; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('Storage upload error:', error.message);
    return { path: '', error: error.message };
  }

  return { path: data.path, error: null };
}

/**
 * Generate a signed URL for secure file access
 * URL expires after the specified duration (default: 1 hour)
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600 // seconds (1 hour)
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Signed URL error:', error.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Storage delete error:', error.message);
    return false;
  }

  return true;
}

/**
 * Generate a presigned URL for direct-to-storage uploads from the browser.
 * This prevents Vercel Serverless OOM crashes by avoiding file buffering.
 */
export async function generatePresignedUploadUrl(
  path: string,
  expiresIn: number = 300 // seconds (5 minutes)
): Promise<{ url: string | null; token: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Presigned upload URL error:', error.message);
    return { url: null, token: null, error: error.message };
  }

  return { url: data.signedUrl, token: data.token, error: null };
}
