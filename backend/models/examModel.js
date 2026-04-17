import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Question options are required'],
    validate: {
      validator: opts => opts.length === 4 && opts.every(opt => opt.trim()),
      message: 'There must be 4 non-empty options'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    validate: {
      validator: function(val) {
        return this.options.includes(val);
      },
      message: 'Correct answer must be one of the options'
    }
  },
  imageUrl: {
    type: String,
    default: null
  },
  sectionOrder: {
    type: Number,
    required: [true, 'Section order reference is required']
  }
});

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  order: {
    type: Number,
    required: [true, 'Section order is required'],
    min: 0
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  examType: {
    type: String,
    enum: {
      values: ['live', 'self'],
      message: 'Invalid exam type'
    },
    default: 'self'
  },
scheduledDate: {
  type: Date,
  required: function() {
    return this.examType === 'live';
  },
  validate: {
    validator: function(v) {
      if (this.examType === 'live') {
        return v instanceof Date && !isNaN(v);
      }
      return true;
    },
    message: 'Valid date is required for live exams'
  }
},
  sections: {
    type: [sectionSchema],
    validate: {
      validator: sections => sections.length > 0,
      message: 'At least one section is required'
    }
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: questions => questions.length > 0,
      message: 'At least one question is required'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Indexes for better query performance
examSchema.index({ createdBy: 1 });
examSchema.index({ examType: 1, scheduledDate: 1 });

// Virtual population for analytics
examSchema.virtual('results', {
  ref: 'ExamResult',
  localField: '_id',
  foreignField: 'exam'
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam;