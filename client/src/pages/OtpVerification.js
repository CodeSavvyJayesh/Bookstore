import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styles/OTPVerification.css"; // Import CSS file

const OTPVerification = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value !== "" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");
    if (!enteredOtp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/v1/otp/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("OTP Verified Successfully");
        navigate("/login");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:8080/api/v1/otp/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      toast.success("OTP Resent Successfully");
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="otpverify-container">
        <div className="otpverify-box">
          <h4 className="otpverify-title">Verify</h4>
          <p className="otpverify-text">Your code was sent to {email}</p>
          <div className="otpverify-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                className="otpverify-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            ))}
          </div>
          <button
            onClick={handleVerifyOTP}
            className="otpverify-button"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <p className="otpverify-resend-text">
            Didn't receive code? 
            <button 
              onClick={handleResendOTP} 
              className="otpverify-resend-button"
              disabled={loading}
            >
              Request again
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;
