import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';

import userRoutes from '../routes/userRoute.js';
import liveLectureRoutes from '../routes/liveLectureRoute.js';
import videoLectureRoutes from '../routes/videoLectureRoute.js';
import liveTestRoutes from '../routes/liveTestRoute.js';
import materialRoutes from '../routes/materialRoutes.js';
import announcementRoutes from '../routes/announcementRoute.js';
import questionRoutes from '../routes/questionRoutes.js';
import authRoutes from '../routes/Auth.routes.js';

dotenv.config();

const app = express();

// ✅ Connect DB (safe for serverless)
let isConnected = false;
const connectDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Middleware
app.use(cors({
  origin: [
    'https://kaksha360.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Root route
app.get('/', async (req, res) => {
  await connectDatabase();
  res.status(200).json({ message: "API running successfully 🚀" });
});

// Routes
app.use('/api/users', async (req, res, next) => {
  await connectDatabase();
  next();
}, userRoutes);

app.use('/api/live-lectures', async (req, res, next) => {
  await connectDatabase();
  next();
}, liveLectureRoutes);

app.use('/api/recorded-lectures', async (req, res, next) => {
  await connectDatabase();
  next();
}, videoLectureRoutes);

app.use('/api/live-tests', async (req, res, next) => {
  await connectDatabase();
  next();
}, liveTestRoutes);

app.use('/api/study-materials', async (req, res, next) => {
  await connectDatabase();
  next();
}, materialRoutes);

app.use('/api/announcements', async (req, res, next) => {
  await connectDatabase();
  next();
}, announcementRoutes);

app.use('/api/questions', async (req, res, next) => {
  await connectDatabase();
  next();
}, questionRoutes);

app.use('/auth', async (req, res, next) => {
  await connectDatabase();
  next();
}, authRoutes);

app.use('/api/auth', async (req, res, next) => {
  await connectDatabase();
  next();
}, authRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ✅ IMPORTANT: export app (NO app.listen)
export default app;
