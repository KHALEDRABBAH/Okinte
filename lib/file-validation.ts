/**
 * File Validation Utilities
 * 
 * WHY: Prevents file upload attacks by verifying file signatures (magic bytes).
 * Even if a user renames a malicious executable to .pdf, the magic bytes will reveal the truth.
 * 
 * HOW: Uses file-type library to detect actual file type from binary content,
 * then derives safe extension from verified MIME type.
 */

import { fileTypeFromBuffer } from 'file-type';

/**
 * Map of allowed MIME types to their safe file extensions
 */
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

/**
 * Whitelist of allowed MIME types for document uploads
 */
export const ALLOWED_MIME_TYPES = Object.keys(MIME_TO_EXT);

/**
 * Verify file buffer against claimed MIME type using magic bytes.
 * Returns the verified MIME type and safe extension, or null if verification fails.
 * 
 * @param buffer - File buffer to verify
 * @param claimedMimeType - Client-claimed MIME type
 * @returns Object with verified mimeType and extension, or null if verification fails
 */
export async function verifyFileMagicBytes(
  buffer: Buffer,
  claimedMimeType: string
): Promise<{ mimeType: string; extension: string } | null> {
  if (!buffer || buffer.length === 0) {
    return null;
  }

  try {
    // Detect actual file type from magic bytes
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected) {
      // Could not detect file type from magic bytes
      console.warn(`Could not detect file type from magic bytes for claimed type: ${claimedMimeType}`);
      return null;
    }

    // Verify detected MIME type is in whitelist
    if (!ALLOWED_MIME_TYPES.includes(detected.mime)) {
      console.warn(`Detected MIME type not in whitelist: ${detected.mime} (claimed: ${claimedMimeType})`);
      return null;
    }

    // Optionally warn if detected type doesn't match claimed type
    // (not a hard fail - some clients may have incorrect MIME types)
    if (detected.mime !== claimedMimeType) {
      console.warn(
        `MIME type mismatch: detected ${detected.mime}, claimed ${claimedMimeType}. ` +
        `Using detected type.`
      );
    }

    // Return verified MIME type and derived extension
    return {
      mimeType: detected.mime,
      extension: MIME_TO_EXT[detected.mime] || detected.ext,
    };
  } catch (error) {
    console.error('Error verifying file magic bytes:', error);
    return null;
  }
}

/**
 * Validate file with both MIME type check and magic byte verification
 * 
 * @param buffer - File buffer
 * @param claimedMimeType - Client-claimed MIME type
 * @returns Verification result with status and details
 */
export async function validateFileWithMagicBytes(
  buffer: Buffer,
  claimedMimeType: string
): Promise<{
  valid: boolean;
  mimeType?: string;
  extension?: string;
  error?: string;
}> {
  // Check claimed MIME type is in whitelist first (fast fail)
  if (!ALLOWED_MIME_TYPES.includes(claimedMimeType)) {
    return {
      valid: false,
      error: `MIME type not allowed: ${claimedMimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Verify magic bytes
  const verified = await verifyFileMagicBytes(buffer, claimedMimeType);

  if (!verified) {
    return {
      valid: false,
      error: 'File contents do not match claimed type. Possible malicious file.',
    };
  }

  return {
    valid: true,
    mimeType: verified.mimeType,
    extension: verified.extension,
  };
}
