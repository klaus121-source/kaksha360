import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,'name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true,'email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true,'password is required'],
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  otp: String,
  otpExpiry: Date,
  role: {
    type: String,
    enum: ["student", "admin", "instructor"],
    default: "student"
  },
}, { timestamps: true });

// Use the default mongoose connection for model definition
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
