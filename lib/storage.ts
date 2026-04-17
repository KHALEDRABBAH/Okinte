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
 * BUCKET: "bolila-documents" (must be created in Supabase Dashboard)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Using the SERVICE ROLE key (not anon key) because:
// - This runs on the SERVER only (API routes)
// - Service role bypasses Row Level Security
// - Needed to upload/delete files on behalf of users
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = 'bolila-documents';

/**
 * Upload a file to Supabase Storage
 * @param file - The file buffer
 * @param path - Storage path (e.g., "users/uuid/passport.pdf")
 * @param contentType - MIME type
 * @returns The storage path on success
 */
export async function uploadFile(
  file: Buffer,
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
