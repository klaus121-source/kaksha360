import mongoose from 'mongoose';
import Announcement from '../models/announcementModel.js';

// Get active announcements for students
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      expires: { $gt: new Date() }
    })
    .sort('-createdAt')
    .populate('creator', 'name');

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all announcements for admin
export const getAdminAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort('-createdAt')
      .populate('creator', 'name email');

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Error fetching admin announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create announcement (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    const expires = req.body.expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement text is required'
      });
    }

    const newAnnouncement = new Announcement({
      text: text.trim(),
      expires,
      createdBy: req.user._id
    });

    const savedAnnouncement = await newAnnouncement.save();
    await savedAnnouncement.populate('creator', 'name');

    res.status(201).json({
      success: true,
      announcement: savedAnnouncement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    // Validate ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID format'
      });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion'
    });
  }
};