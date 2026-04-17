import mongoose from 'mongoose';

const liveLectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      required: true,
      enum: ['live', 'video', 'material']
    },
    scheduledTime: {
      type: Date,
      required: function() { return this.type === 'live'; }
    },
    link: {  // Changed from videoUrl/materialUrl to generic link
      type: String,
      required: function() { return this.type === 'live'; }
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const LiveLecture = mongoose.models.LiveLecture || mongoose.model('LiveLecture', liveLectureSchema);
export default LiveLecture;