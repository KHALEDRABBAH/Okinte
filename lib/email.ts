import { Resend } from 'resend';
import { alertCriticalError } from '@/lib/alert';

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

export async function sendVerificationEmail(to: string, name: string, token: string, locale: string = 'en') {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  const verifyUrl = `${appUrl}/${locale}/verify-email?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify Your Email — Okinte',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: #1e293b; font-size: 22px; margin-top: 0; margin-bottom: 16px;">Verify Your Email Address</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${escapeHtml(name)},<br><br>
              Thanks for creating an account on Okinte! Please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" style="background-color: #2563EB; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Verify Email Address</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              This link is valid for 24 hours. If you didn't create an account on Okinte, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error: any) {
    await alertCriticalError('Email', 'Failed to send Email', { email: to, error: error?.message || 'Unknown' });
    return { data: null, error };
  }
}

export async function sendRegistrationEmail(to: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  const loginUrl = `${appUrl}/login`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Okinte!',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: #1e293b; font-size: 22px; margin-top: 0; margin-bottom: 16px;">Welcome to Okinte, ${escapeHtml(name)}!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your email has been verified and your account is now active. You can browse our services and submit applications for study, internship, or employment opportunities abroad.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Log in to your Dashboard</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              If you have any questions or need assistance, our support team is always here to help.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error: any) {
    await alertCriticalError('Email', 'Failed to send Email', { email: to, error: error?.message || 'Unknown' });
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
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; margin-bottom: 16px;">Application Received</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${escapeHtml(name)},<br><br>
              Your application for <strong>${escapeHtml(serviceKey.toUpperCase())}</strong> has been submitted successfully and your payment was securely processed.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #475569; font-size: 14px; margin: 0;"><strong>Your Reference Code:</strong></p>
              <p style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 4px 0 0 0; letter-spacing: 1px;">${escapeHtml(referenceCode)}</p>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Our team will review your submitted documents and reach out to you shortly. You can track your status in your Okinte Dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error: any) {
    await alertCriticalError('Email', 'Failed to send Email', { email: to, error: error?.message || 'Unknown' });
    return { data: null, error };
  }
}

export async function sendPaymentFailedEmail(to: string, name: string, referenceCode: string, serviceKey: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment Failed - ${escapeHtml(referenceCode)}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: #dc2626; font-size: 20px; margin-top: 0; margin-bottom: 16px;">Payment Unsuccessful</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${escapeHtml(name)},<br><br>
              Unfortunately, the payment for your application <strong>${escapeHtml(serviceKey.toUpperCase())}</strong> (Reference: ${escapeHtml(referenceCode)}) was not successful or the session expired.
            </p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your application has not been submitted yet. Please log in to your dashboard to try completing the payment again. If you continue to experience issues, please contact your bank or try a different payment method.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com'}/en/dashboard" style="background-color: #0f172a; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Return to Dashboard</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error: any) {
    await alertCriticalError('Email', 'Failed to send Payment Failed Email', { email: to, error: error?.message || 'Unknown' });
    return { data: null, error };
  }
}

export async function sendStatusUpdateEmail(to: string, name: string, referenceCode: string, status: string, notes?: string | null) {
  try {
    const isApproved = status === 'APPROVED';
    const isReturned = status === 'RETURNED';
    const subjectTitle = isApproved ? 'Application Approved!' : isReturned ? 'Action Required: Application Returned' : 'Application Update';
    const color = isApproved ? '#10b981' : isReturned ? '#f97316' : '#f59e0b';
    const bgColor = isApproved ? '#d1fae5' : isReturned ? '#ffedd5' : '#fef3c7';
    
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Status Update [${escapeHtml(referenceCode)}]: ${subjectTitle}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: ${color}; font-size: 20px; margin-top: 0; margin-bottom: 16px;">${subjectTitle}</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${escapeHtml(name)},<br><br>
              We have an update regarding your application <strong>${escapeHtml(referenceCode)}</strong>.
            </p>
            
            <div style="background-color: ${bgColor}; border-left: 4px solid ${color}; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #0f172a; font-size: 16px; margin: 0;"><strong>Current Status:</strong> ${escapeHtml(status.replace('_', ' '))}</p>
              ${notes ? `<p style="color: #475569; font-size: 14px; margin: 12px 0 0 0;"><strong>Admin Notes:</strong><br>${escapeHtml(notes)}</p>` : ''}
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Please log in to your Okinte Dashboard for more details.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error: any) {
    await alertCriticalError('Email', 'Failed to send Email', { email: to, error: error?.message || 'Unknown' });
    return { data: null, error };
  }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, locale: string = 'en') {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  const resetUrl = `${appUrl}/${locale}/reset-password?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset Your Okinte Password',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${escapeHtml(name)},<br><br>
              We received a request to reset your Okinte account password. Click the button below to securely create a new password for your account.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email—your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  const dashboardUrl = `${appUrl}/en/dashboard`;

  try {
    const safeName = escapeHtml(name);
    const safePreview = escapeHtml(messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview);

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'New Message from Okinte Support',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: left;">
            <div style="text-align: left; margin-bottom: 30px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">OKINTE</h1>
            </div>
            
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; margin-bottom: 16px;">You have a new message</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${safeName},<br><br>
              The Okinte Support team has sent you a message:
            </p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2563EB; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #334155; font-size: 15px; margin: 0; font-style: italic;">"${safePreview}"</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${dashboardUrl}" style="background-color: #2563EB; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">View in Dashboard</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              You can reply to this message directly from your Okinte Dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The Okinte Team</strong>
            </p>
          </div>
        </div>
      `,
    });
    return { data, error: null };
  } catch (error) {
    console.error('[Email] Chat notification failed:', (error as Error).message);
    return { data: null, error };
  }
}
