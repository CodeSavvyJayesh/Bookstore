import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email transport configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an OTP email
 * @param {string} email - Recipient's email
 * @param {string} otp - OTP code
 */
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Your Company" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your OTP Code for Secure Access",
    html: `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: #FF5722; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Your OTP Code</h1>
        </div>
        <div style="padding: 20px; background: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; color: #FF5722; background: #FFE0B2; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px auto;">
            ${otp}
          </div>
          <p style="font-size: 16px; color: #333;">This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
        </div>
        <div style="background: #f8f8f8; padding: 15px; text-align: center; font-size: 14px; color: #666;">
          <p>Thank you,</p>
          <p><strong>Virtual Book Shelf!</strong></p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
