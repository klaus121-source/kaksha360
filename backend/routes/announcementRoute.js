import express from 'express';
import { createAnnouncement, getAdminAnnouncements, deleteAnnouncement, getAnnouncements } from '../controllers/announcementController.js';
import { protect, adminOrInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for student announcements
router.get('/public', getAnnouncements);

router.get('/', protect, adminOrInstructor, getAdminAnnouncements);
router.post('/admin', protect, adminOrInstructor, createAnnouncement);
router.delete('/admin/:id', protect, adminOrInstructor, deleteAnnouncement);

export default router;