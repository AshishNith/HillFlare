import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    secure: false,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
    // In development, just log the OTP
    if (env.NODE_ENV === 'development') {
        console.log(`📧 OTP for ${email}: ${otp}`);
        return;
    }

    await transporter.sendMail({
        from: `"CampusConnect" <${env.SMTP_USER}>`,
        to: email,
        subject: 'Your CampusConnect Verification Code',
        html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8B5CF6;">CampusConnect</h2>
        <p>Your verification code is:</p>
        <div style="background: #1a1a2e; color: #8B5CF6; font-size: 32px; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; font-weight: bold;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
    });
};
