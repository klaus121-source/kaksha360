import mongoose from 'mongoose';
import Announcement from './model/announcementModel.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestAnnouncement() {
  await mongoose.connect(MONGODB_URI);
  const announcement = new Announcement({
    text: '🚀 Welcome to Examverse! This is a test announcement for all students.',
    expires: new Date('2025-06-15T23:59:59.999Z'),
    createdBy: (await mongoose.connection.db.collection('users').findOne({ role: { $in: ['admin', 'instructor'] } }))?._id
  });
  await announcement.save();
  console.log('Test announcement created:', announcement);
  await mongoose.disconnect();
}

createTestAnnouncement().catch(e => { console.error(e); process.exit(1); });
