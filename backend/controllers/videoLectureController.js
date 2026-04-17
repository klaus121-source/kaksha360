import VideoLecture from '../models/recordedLectureModel.js';

// ========== Save S3 Video Metadata ==========
export const saveS3VideoLectureMeta = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const videoLecture = new VideoLecture({
      title: req.body.title,
      description: req.body.description,
      videoUrl: req.file.location,
      key: req.file.key,
      subject: req.body.subject,
      gradeLevel: req.body.gradeLevel,
      isPremium: req.body.isPremium === 'true',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      duration: parseInt(req.body.duration) || 0,
      uploadedBy: req.user._id
    });

    await videoLecture.save();

    res.status(201).json({
      success: true,
      message: 'Video lecture uploaded successfully',
      videoLecture
    });

  } catch (err) {
    console.error('Error saving video lecture:', err);
    res.status(500).json({
      success: false,
      message: 'Error saving video lecture',
      error: err.message
    });
  }
};

// ========== Get All Video Lectures ==========
export const getAllVideoLectures = async (req, res) => {
  try {
    const videoLectures = await VideoLecture.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videoLectures.length,
      videoLectures,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========== Get Single Video Lecture by ID ==========
export const getVideoLectureById = async (req, res) => {
  try {
    const videoLecture = await VideoLecture.findById(req.params.id)
      .populate("uploadedBy", "name email");

    if (!videoLecture) {
      return res.status(404).json({
        success: false,
        message: "Video lecture not found",
      });
    }

    res.status(200).json({
      success: true,
      videoLecture,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========== Delete Video Lecture ==========
export const deleteVideoLecture = async (req, res) => {
  try {
    const deletedLecture = await VideoLecture.findByIdAndDelete(req.params.id);

    if (!deletedLecture) {
      return res.status(404).json({
        success: false,
        message: "Video lecture not found",
      });
    }

    // Add S3 file deletion logic here if needed
    // await deleteFromS3(deletedLecture.key);

    res.status(200).json({
      success: true,
      message: "Video lecture deleted successfully",
      deletedLecture
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};