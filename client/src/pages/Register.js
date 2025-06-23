import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 8) {
      toast.error("Password should have at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password should have at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      toast.error("Password should have at least one lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password should have at least one number");
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Password should have at least one special character");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      // Register API call
      const res = await axios.post('/api/v1/auth/register', {
        name,
        email,
        password,
        phone: mobileNo
      });

      if (res.status === 201) {
        toast.success(res.data.message);

        // Generate OTP API call
        await axios.post('/api/v1/otp/generate-otp', { email });

        // Navigate to OTP verification page
        navigate(`/user/verify/${email}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    document.body.classList.add('Signupbody');
    return () => {
      document.body.classList.remove('Signupbody');
    };
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container">
        <div className="register-container">
          <h2 className="text-center mb-4">Register</h2>

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <input 
                type="text" 
                name="name" 
                className="form-control" 
                id="name" 
                placeholder=" " 
                onChange={(e) => setName(e.target.value)}
                required
                value={name}
              />
              <label className='labe' htmlFor="name">Name</label>
            </div>

            <div className="form-group">
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                id="email" 
                placeholder=" " 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className='labe' htmlFor="email">Email</label>
            </div>

            <div className="form-group">
              <input 
                type="tel" 
                name="mobileNo" 
                className="form-control" 
                id="mobileNo" 
                placeholder=" " 
                value={mobileNo} 
                onChange={(e) => setMobileNo(e.target.value)}
                required
              />
              <label className='labe' htmlFor="mobileNo">Phone No.</label>
            </div>

            <div className="form-group">
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                id="password" 
                placeholder=" " 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className='labe' htmlFor="password">Password</label>
            </div>

            <div className="form-group">
              <input 
                type="password" 
                name="confirmPassword" 
                className="form-control" 
                id="confirmPassword" 
                placeholder=" " 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label className='labe' htmlFor="confirmPassword">Confirm Password</label>
            </div>

            <button type="submit" className="btn-register btn btn-block">Register</button>
            <p className="options text-center mt-2 mb-0">
              Already have an account? <a href="/login" style={{ color: '#ff5722' }}>Login here</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
