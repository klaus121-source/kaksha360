import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecordedLecture' }],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);
export default Playlist;
