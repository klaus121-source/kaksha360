import LiveLecture from '../models/liveLectureModel.js';

// Middleware to check if user is admin/instructor (add your own logic)
const requireInstructor = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'instructor') {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
};

// ================= Add new lecture/material =================
export const createLiveLecture = async (req, res) => {
  try {
    const { title, description, type, link, scheduledTime } = req.body;
    if (!title || !type) {
      return res.status(400).json({ success: false, message: "Title and type are required" });
    }
    const newLecture = new LiveLecture({
      title,
      description,
      type,
      link,
      scheduledTime,
      uploadedBy: req.user.id,
    });
    await newLecture.save();
    res.status(201).json({
      success: true,
      message: `${type} uploaded successfully`,
      lecture: newLecture,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= Get all lectures/materials =================
export const getAllLiveLectures = async (req, res) => {
  try {
    const lectures = await LiveLecture.find().populate("uploadedBy", "name email role");
    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= Get lecture/material by ID =================
export const getLiveLectureById = async (req, res) => {
  try {
    const lecture = await LiveLecture.findById(req.params.id).populate("uploadedBy", "name email role");
    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }
    res.status(200).json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= Delete lecture/material by ID =================
export const deleteLiveLecture = async (req, res) => {
  try {
    const deletedLecture = await LiveLecture.findByIdAndDelete(req.params.id);
    if (!deletedLecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }
    res.status(200).json({ success: true, message: "Lecture deleted successfully", deletedLecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
