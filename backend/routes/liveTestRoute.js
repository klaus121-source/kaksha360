import express from 'express';
import { 
  createLiveTest, 
  getAllLiveTests, 
  getLiveTestById, 
  deleteLiveTest, 
  addQuestions, 
  takeExam, 
  submitExam, 
  checkExamAttempted,
  verifyExam,
  getLeaderboard,
  getOverallLeaderboard // Added getOverallLeaderboard import
} from '../controllers/liveTestController.js';
import { protect, adminOrInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ----------------- Instructor/Admin Routes -----------------
// Create a new exam (including its questions)
router.post('/', protect, adminOrInstructor, createLiveTest);

// Add questions to an existing exam (renamed from '/add-questions' to be more specific if needed, or keep as is if it's the only way to add questions initially too)
// For now, keeping /add-questions as is, assuming it might still be used for adding more questions later to an exam created via POST /
router.post('/add-questions', protect, adminOrInstructor, addQuestions);

// ----------------- General Access Routes -----------------
// Get all exams
router.get('/', protect, getAllLiveTests);

// Get all exams (alias for frontend compatibility)
router.get('/exams', protect, getAllLiveTests);

// Get exam by ID
router.get('/:id', protect, getLiveTestById);

// ----------------- Instructor/Admin Routes -----------------
// Delete an exam
router.delete('/:id', protect, adminOrInstructor, deleteLiveTest);

// ----------------- Exam Participation Routes -----------------
// Start exam interface
router.get('/:id/take', takeExam);

// Submit exam answers
router.post('/:id/submit', protect, submitExam);

// Check if exam attempted
router.get('/:id/attempted', protect, checkExamAttempted);

// Add verify route for exam verification
router.get('/exams/:id/verify', protect, verifyExam);

// Add leaderboard route for all exams
router.get('/leaderboard/all', protect, getOverallLeaderboard); // Changed to use getOverallLeaderboard

export default router;