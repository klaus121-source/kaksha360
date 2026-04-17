const Playlist = require('../model/playlistModel');
const RecordedLecture = require('../model/recordedLectureModel');

// Create a new playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, subject, isPublic } = req.body;
    if (!name || !subject) {
      return res.status(400).json({ success: false, message: 'Name and subject are required' });
    }
    const playlist = new Playlist({
      name,
      description,
      subject,
      isPublic,
      createdBy: req.user._id
    });
    await playlist.save();
    res.status(201).json({ success: true, playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all playlists for the current user
exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user._id }).populate('videos');
    res.status(200).json({ success: true, playlists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.status(200).json({ success: true, message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a video to a playlist
exports.addVideoToPlaylist = async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    if (!playlist.videos.includes(videoId)) {
      playlist.videos.push(videoId);
      await playlist.save();
    }

    res.status(200).json({ success: true, message: 'Video added to playlist', playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove a video from a playlist
exports.removeVideoFromPlaylist = async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);
    await playlist.save();

    res.status(200).json({ success: true, message: 'Video removed from playlist', playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
