export const dynamic = 'force-dynamic';
// Allow up to 60 seconds for file uploads (Vercel default is ~10-15s)
export const maxDuration = 60;

/**
 * POST /api/documents/upload
 * 
 * Uploads a document for an application with improved consistency guarantees.
 * 
 * CONSISTENCY GUARANTEES:
 * 1. Pre-validation: Verify user ownership before any I/O
 * 2. Atomic DB operation: Document record creation/update is transactional
 * 3. Storage cleanup on DB failure: Uploaded file deleted if DB write fails
 * 4. Upsert pattern: Existing document replaced atomically (no orphans)
 * 
 * FLOW:
 * 1. Authenticate & validate request
 * 2. Upload file to storage
 * 3. DB transaction: upsert document record
 * 4. On DB failure: delete uploaded file (cleanup)
 * 
 * The key insight: Storage is written first (idempotent via upsert),
 * then DB record is created. If DB fails, storage cleanup is attempted.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/storage';
import { rateLimitAsync } from '@/lib/rate-limit';
import { validateFileWithMagicBytes } from '@/lib/file-validation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const VALID_DOC_TYPES = ['PASSPORT', 'CV', 'DIPLOMA', 'PAYMENT_RECEIPT'];

export async function POST(request: NextRequest) {
  // 🚨 CRITICAL CTO OVERRIDE 🚨
  // This route was causing Vercel Serverless OOM crashes due to in-memory ArrayBuffer buffering.
  // It has been forcefully disabled to protect production stability.
  // Frontend MUST migrate to the Presigned URL flow.
  return NextResponse.json(
    { 
      error: 'DEPRECATED: Direct server uploads are disabled for performance and stability reasons.',
      actionRequired: 'Please migrate to the new Presigned URL flow using /api/documents/presigned and /api/documents/confirm.'
    }, 
    { status: 410 } // 410 Gone
  );
}
