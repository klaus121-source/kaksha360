import express from 'express';
import { createLiveLecture, getAllLiveLectures, getLiveLectureById, deleteLiveLecture } from '../controllers/liveLectureController.js';
import { protect, adminOrInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create live class - POST /api/live-lectures
router.post('/', 
  protect, 
  adminOrInstructor, 
  createLiveLecture
);

// Get all live classes - GET /api/live-lectures
router.get('/', 
  protect, 
  getAllLiveLectures
);

// Get live class by ID - GET /api/live-lectures/:id
router.get('/:id', 
  protect, 
  getLiveLectureById
);

// Delete live class - DELETE /api/live-lectures/:id
router.delete('/:id', 
  protect, 
  adminOrInstructor, 
  deleteLiveLecture
);

export default router;