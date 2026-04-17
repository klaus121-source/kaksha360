import { sendVerificationEmail, sendWelcomeEmail } from "../middlewares/Email.js"; // Corrected
import { generateTokenAndSetCookies } from "../middlewares/GenerateToken.js";
import bcryptjs from 'bcryptjs';
// import mongoose from 'mongoose'; // Not needed for createConnection anymore
import dotenv from 'dotenv';
import User from '../models/userModel.js';
dotenv.config();

const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists and is verified' });
      } else {
        // If user exists but is not verified, re-send OTP and update token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        existingUser.verificationToken = verificationToken;
        existingUser.verificationTokenExpiresAt = verificationTokenExpiresAt;
        existingUser.name = name; // Update name if changed
        // Optionally update password if you allow it at this stage, otherwise, they need to verify first
        
        await existingUser.save();
        await sendVerificationEmail(existingUser.email, verificationToken);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Existing unverified user. New OTP sent to your email. Please verify.' 
        });
      }
    }
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt,
      isVerified: false,
      // role will default to 'student' as per userModel
    });
    
    await newUser.save();
    await sendVerificationEmail(newUser.email, verificationToken);
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
};

const VerifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body; // Expecting email and otp from frontend

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required." });
        }

        const user = await User.findOne({
            email: email,
            verificationToken: otp,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            // Check if user exists but OTP is wrong or expired
            const existingUser = await User.findOne({ email: email });
            if (existingUser && existingUser.verificationToken !== otp) {
                 return res.status(400).json({ success: false, message: "Invalid OTP." });
            }
            if (existingUser && existingUser.verificationTokenExpiresAt <= Date.now()) {
                return res.status(400).json({ success: false, message: "OTP has expired. Please register again to get a new OTP." });
            }
            return res.status(400).json({ success: false, message: "Invalid OTP or user not found." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        generateTokenAndSetCookies(res, user._id); // Set cookie and send response

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. Welcome!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during email verification' });
    }
};

// ESM-compliant named exports for all expected controller functions
const login = async (req, res) => {
  // TODO: Implement login logic
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      // Optionally, resend OTP or prompt for verification
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      user.verificationToken = verificationToken;
      user.verificationTokenExpiresAt = verificationTokenExpiresAt;
      await user.save();
      await sendVerificationEmail(user.email, verificationToken);
      return res.status(403).json({ success: false, message: 'Account not verified. A new OTP has been sent to your email.' });
    }

    generateTokenAndSetCookies(res, user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

const refreshToken = async (req, res) => {
  // This is a basic refresh token example. In a real app, you'd use a refresh token stored securely.
  // For simplicity, we'll re-issue a token if the current one is valid (e.g., from cookie).
  // This requires middleware to extract and verify the existing token from cookies.
  // For now, this is a placeholder.
  return res.status(501).json({ success: false, message: 'Refresh token not implemented robustly' });
};

const logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0), // Set cookie to expire immediately
      sameSite: 'strict',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during logout' });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ success: true, message: 'New OTP sent to your email. Please verify.' });

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const ForgotPassword = async (req, res) => {
  // TODO: Implement ForgotPassword logic (send reset link/code)
  return res.status(501).json({ success: false, message: 'ForgotPassword Not implemented' });
};

const ResetPassword = async (req, res) => {
  // TODO: Implement ResetPassword logic (verify code, update password)
  return res.status(501).json({ success: false, message: 'ResetPassword Not implemented' });
};

export {
  Register,
  VerifyEmail,
  login,
  refreshToken,
  logout,
  resendVerificationEmail,
  ForgotPassword,
  ResetPassword
};