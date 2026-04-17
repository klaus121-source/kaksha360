import express from 'express';
import { saveS3VideoLectureMeta, getAllVideoLectures, getVideoLectureById, deleteVideoLecture } from '../controllers/videoLectureController.js';
import { protect, adminOrInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ========== Upload video to S3 and save metadata ==========
// Upload video with metadata
router.post(
  '/upload',
  protect,
  adminOrInstructor,
  saveS3VideoLectureMeta
);

// ========== Get all video lectures ==========
router.get('/', protect, getAllVideoLectures);

// ========== Get single video lecture by ID ==========
router.get('/:id', protect, getVideoLectureById);

// ========== Delete video lecture ==========
router.delete('/:id', protect, adminOrInstructor, deleteVideoLecture);

export default router;
