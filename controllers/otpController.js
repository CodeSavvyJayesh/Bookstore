import OTP from "../models/OTP.js";
import {sendOTPEmail} from "../utils/sendEmail.js";
import crypto from "crypto";

export const generateOTP = async (req, res) => {
  const { email } = req.body;
  console.log("reached generate ,email:",email)
  console.log("email:",process.env.SMTP_USER)
  console.log("pass:", process.env.SMTP_PASS)
  if (!email) return res.status(400).json({ message: "Email is required" });

  await OTP.updateMany({ email, status: "active" }, { $set: { status: "expired" } });

  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const newOTP = new OTP({ email, otp: otpCode, expiresAt, status: "active" });
  console.log("generated otp:",newOTP)
  await newOTP.save();

  try {
    await sendOTPEmail(email, otpCode);
    console.log("email successful")
    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log("error:",error)
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

  const otpRecord = await OTP.findOne({ email, otp, status: "active" });

  if (!otpRecord) return res.status(400).json({ message: "Invalid OTP or OTP expired" });

  if (new Date() > otpRecord.expiresAt) {
    otpRecord.status = "expired";
    await otpRecord.save();
    return res.status(400).json({ message: "OTP expired" });
  }

  otpRecord.status = "expired";
  await otpRecord.save();

  return res.json({ message: "OTP verified successfully" });
};
