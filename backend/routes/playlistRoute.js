import express from 'express';
import { createPlaylist, getAllPlaylists, getPlaylistById, deletePlaylist } from '../controllers/playlistController.js';
import { protect, adminOrInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create playlist
router.post('/', protect, adminOrInstructor, createPlaylist);
// Get all playlists for user
router.get('/', protect, getAllPlaylists);
// Get playlist by ID
router.get('/:id', protect, getPlaylistById);
// Delete playlist
router.delete('/:id', protect, adminOrInstructor, deletePlaylist);

export default router;
