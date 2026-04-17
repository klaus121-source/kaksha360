import express from 'express';
import { getAllUsers, registerController, loginController, getProfileLoggedinUser, registerWithOTP, verifyOTP, registerWithEmailVerification, verifyEmail } from '../controllers/userController.js';

const router = express.Router();

//get all users
router.get('/all-users', getAllUsers);

//create a user
router.post('/register', registerController);

//Login
router.post('/login', loginController);

//get loggedin user
router.get('/profile', getProfileLoggedinUser);

// Register with OTP
router.post('/register-otp', registerWithOTP);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Register with Email Verification (OTP)
router.post('/register-email-verification', registerWithEmailVerification);
router.post('/verify-email', verifyEmail);

export default router;