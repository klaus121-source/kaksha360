import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import liveLectureRoutes from './routes/liveLectureRoute.js';
import videoLectureRoutes from './routes/videoLectureRoute.js';
import liveTestRoutes from './routes/liveTestRoute.js';
import materialRoutes from './routes/materialRoutes.js';
import announcementRoutes from './routes/announcementRoute.js';
import questionRoutes from './routes/questionRoutes.js';
import authRoutes from './routes/Auth.routes.js';

dotenv.config()

// Connect to the database
connectDB();

// Load environment variables
dotenv.config();


// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

console.log('EMAIL_USER:', process.env.EMAIL_USER)
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Not loaded')

// Add a root route
app.get('/', (req, res) => {
    res.send('Welcome to the Email Verification API!');
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/live-lectures', liveLectureRoutes);
app.use('/api/recorded-lectures', videoLectureRoutes);
app.use('/api/live-tests', liveTestRoutes);
app.use('/api/study-materials', materialRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/questions', questionRoutes);
app.use('/auth', authRoutes); 
app.use('/api/auth', authRoutes); 


// Error handler
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  // ... other error handling
  res.status(500).json({ success: false, message: err.message });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: "Node server running on successfully!" });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`App is running on Port ${PORT}`)
})
