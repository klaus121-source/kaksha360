// Script to update all users missing a 'role' field to have role: 'student'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../backend/model/userModel.js';
import connectDB from '../backend/config/db.js';

(async () => {
  try {
    await connectDB();
    const res = await User.updateMany({ role: { $exists: false } }, { $set: { role: 'student' } });
    console.log('Users updated:', res.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
