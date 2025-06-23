import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ["active", "expired"], default: "active" }, // New field
});

export default mongoose.model("OTP", otpSchema);
