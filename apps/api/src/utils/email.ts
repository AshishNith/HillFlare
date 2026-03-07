import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.warn('[email] SMTP not configured — OTP not sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    return false;
  }

  try {
    await transport.sendMail({
      from: env.smtpFrom,
      to,
      subject: 'Your HillFlare Login Code',
      text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
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
    return true;
  } catch (error: any) {
    console.error('[email] Failed to send OTP:', error.message);
    return false;
  }
}
