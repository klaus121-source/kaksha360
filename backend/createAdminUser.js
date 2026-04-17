import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './model/userModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL;
  const password = ADMIN_PASSWORD;
  const name = 'Admin';
  const role = 'admin';

  let user = await User.findOne({ email });
  if (user) {
    console.log('Admin user already exists:', user.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: true
  });
  await user.save();
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
