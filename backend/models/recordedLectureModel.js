import mongoose from 'mongoose';

const { Schema } = mongoose;

const recordedLectureSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    validate: {
      validator: function(v) {
        return /^(https?|s3):\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid video URL!`
    }
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return v === '' || /^(https?|s3):\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid thumbnail URL!`
    }
  },
  duration: {
    type: Number, // in seconds
    min: [1, 'Duration must be at least 1 second']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'],
      message: '{VALUE} is not a valid subject'
    }
  },
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: {
      values: ['Elementary', 'Middle School', 'High School', 'College'],
      message: '{VALUE} is not a valid grade level'
    }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['PDF', 'DOC', 'PPT', 'LINK']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
recordedLectureSchema.index({ title: 'text', description: 'text' });
recordedLectureSchema.index({ subject: 1, gradeLevel: 1 });
recordedLectureSchema.index({ isPremium: 1, isPublished: 1 });

// Virtual property for formatted duration
recordedLectureSchema.virtual('durationFormatted').get(function() {
  const duration = this.duration;
  if (!duration) return '00:00';
  
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
});

// Middleware to update lastUpdated field
recordedLectureSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Query helper for published lectures
recordedLectureSchema.query.published = function() {
  return this.where({ isPublished: true });
};

// Query helper for free lectures
recordedLectureSchema.query.free = function() {
  return this.where({ isPremium: false });
};

// Static method to get lectures by subject
recordedLectureSchema.statics.findBySubject = function(subject) {
  return this.find({ subject }).sort({ uploadDate: -1 });
};

const RecordedLecture = mongoose.models.RecordedLecture || mongoose.model("RecordedLecture", recordedLectureSchema);

export default RecordedLecture;