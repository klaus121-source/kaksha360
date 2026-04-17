import express from 'express';
import { addQuestion, getQuestions } from '../controllers/questionController.js';
import { protect, adminOrInstructor, requireAdmin } from '../middlewares/authMiddleware.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Add a question (admin only)
router.post('/', requireAdmin, upload.single('image'), addQuestion);

// Get all questions
router.get('/', getQuestions);

export default router;
