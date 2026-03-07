import { Resend } from 'resend';
import { env } from '../config/env';

let resend: Resend | null = null;

function getClient(): Resend | null {
  if (resend) return resend;
  if (!env.resendApiKey) return null;
  resend = new Resend(env.resendApiKey);
  return resend;
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const client = getClient();

  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — OTP not sent');
    return false;
  }

  try {
    const { error } = await client.emails.send({
      from: env.emailFrom,
      to,
      subject: 'Your HillFlare Login Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">HillFlare</h1>
          </div>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">This code expires in 5 minutes.</p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('[email] Resend error:', error.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('[email] Failed to send OTP:', error.message);
    return false;
  }
}
