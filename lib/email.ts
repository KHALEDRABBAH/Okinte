import { Resend } from 'resend';

/**
 * Escape HTML special characters to prevent XSS in email templates.
 * All user-supplied content MUST be passed through this before HTML interpolation.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: RESEND_API_KEY environment variable is not set. Email service cannot operate in production without it.');
    }
    console.warn('⚠️  RESEND_API_KEY not set — emails will fail silently in development.');
  }
  return new Resend(apiKey || 'missing_key');
}

const resend = getResendClient();
const FROM_EMAIL = 'Okinte Support <support@okinte.com>';

export async function sendRegistrationEmail(to: string, name: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Okinte!',
      html: `
        <div style="font-family: sans-serif; color: #1a1a1a;">
          <h2>Welcome to Okinte, ${escapeHtml(name)}!</h2>
          <p>Your account has been successfully created. You can now browse our services and submit applications for study, internship, or employment opportunities abroad.</p>
          <p>Log in to your dashboard to get started.</p>
          <br>
          <p>Best regards,<br>The Okinte Team</p>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function sendApplicationReceiptEmail(to: string, name: string, referenceCode: string, serviceKey: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Application Received - ${escapeHtml(referenceCode)}`,
      html: `
        <div style="font-family: sans-serif; color: #1a1a1a;">
          <h2>Application Received</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>Your application for <strong>${escapeHtml(serviceKey.toUpperCase())}</strong> has been submitted successfully and your payment was securely processed.</p>
          <p><strong>Your Reference Code:</strong> ${escapeHtml(referenceCode)}</p>
          <p>Our team will review your submitted documents and reach out to you shortly. You can track your status in your Okinte Dashboard.</p>
          <br>
          <p>Best regards,<br>The Okinte Team</p>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function sendStatusUpdateEmail(to: string, name: string, referenceCode: string, status: string, notes?: string | null) {
  try {
    const isApproved = status === 'APPROVED';
    const isReturned = status === 'RETURNED';
    const subjectTitle = isApproved ? 'Application Approved!' : isReturned ? 'Action Required: Application Returned' : 'Application Update';
    const color = isApproved ? '#10b981' : isReturned ? '#f97316' : '#f59e0b';
    
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Status Update [${escapeHtml(referenceCode)}]: ${subjectTitle}`,
      html: `
        <div style="font-family: sans-serif; color: #1a1a1a;">
          <h2 style="color: ${color};">${subjectTitle}</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>We have an update regarding your application <strong>${escapeHtml(referenceCode)}</strong>.</p>
          <p>The current status is now: <strong>${escapeHtml(status.replace('_', ' '))}</strong></p>
          ${notes ? `<div style="background-color: #f3f4f6; padding: 12px; border-left: 4px solid ${color};"><strong>Admin Notes:</strong> ${escapeHtml(notes)}</div>` : ''}
          <p>Please log in to your Okinte Dashboard for more details.</p>
          <br>
          <p>Best regards,<br>The Okinte Team</p>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, locale: string = 'en') {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://okinte-website.vercel.app';
  const resetUrl = `${appUrl}/${locale}/reset-password?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset Your Okinte Password',
      html: `
        <div style="font-family: sans-serif; color: #1a1a1a;">
          <h2>Password Reset Request</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>We received a request to reset your Okinte account password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br>The Okinte Team</p>
        </div>
      `,
    });
    
    if (data.error) {
      console.error('[Email] Password reset send failed:', data.error.message);
      console.log('🔗 Password reset link (dev fallback):', resetUrl);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('[Email] Password reset exception:', (error as Error).message);
    console.log('🔗 Password reset link (dev fallback):', resetUrl);
    return { data: null, error };
  }
}

export async function sendChatNotificationEmail(to: string, name: string, messagePreview: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://okinte-website.vercel.app';
  const dashboardUrl = `${appUrl}/en/dashboard`;

  try {
    const safeName = escapeHtml(name);
    const safePreview = escapeHtml(messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview);

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'New Message from Okinte Support',
      html: `
        <div style="font-family: sans-serif; color: #1a1a1a;">
          <h2>You have a new message</h2>
          <p>Hi ${safeName},</p>
          <p>The Okinte Support team has sent you a message:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #2563EB; margin: 16px 0;">
            <p style="margin: 0; color: #374151;">${safePreview}</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${dashboardUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View in Dashboard</a>
          </div>
          <p style="color: #666; font-size: 14px;">You can reply to this message from your Okinte Dashboard.</p>
          <br>
          <p>Best regards,<br>The Okinte Team</p>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error) {
    console.error('[Email] Chat notification failed:', (error as Error).message);
    return { data: null, error };
  }
}
