import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: { 
    type: String, 
    required: [true, 'Question text is required'] 
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: opts => opts.length >= 2 && opts.length <= 5,
      message: 'Questions must have between 2-5 options'
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return this.options.includes(v);
      },
      message: 'Correct answer must be one of the options'
    }
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  marks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    default: 1
  }
}, { timestamps: true });

const SectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  description: String,
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveTest',
    required: true
  },
  order: {
    type: Number,
    min: [1, 'Order must be at least 1'],
    required: true
  }
}, { timestamps: true });

const LiveTestSchema = new mongoose.Schema({
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
  examType: { 
    type: String, 
    enum: {
      values: ['live', 'self'],
      message: 'Invalid exam type'
    },
    default: 'self'
  },
  duration: { 
    type: Number, 
    required: [true, 'Duration is required'],
    min: [10, 'Minimum duration is 10 minutes']
  },
  scheduledDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return this.examType === 'live' ? v !== undefined : true;
      },
      message: 'Scheduled date is required for live exams'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Virtual population
LiveTestSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'exam'
});

SectionSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'section'
});

// Indexes for better query performance
LiveTestSchema.index({ createdBy: 1, status: 1 });
SectionSchema.index({ exam: 1, order: 1 });
QuestionSchema.index({ section: 1 });

const LiveTest = mongoose.models.LiveTest || mongoose.model('LiveTest', LiveTestSchema);
const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema);
const Question = mongoose.models.LiveTestQuestion || mongoose.model('LiveTestQuestion', QuestionSchema);

export default LiveTest;
export { Section, Question };

