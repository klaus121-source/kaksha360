import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam', // Changed from 'LiveTest' to 'Exam' for correct population
    required: [true, 'Exam reference is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions count is required'],
    min: [1, 'Exam must have at least one question']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100%']
  },
  // Added fields
  answers: {
    type: Map,
    of: String,
    required: [true, 'Answers map is required']
  },
  durationUsed: {
    type: Number, // in seconds
    required: [true, 'Duration used is required'],
    min: [0, 'Duration used cannot be negative']
  },
  analysis: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required']
    },
    selectedOption: {
      type: String,
      required: [true, 'Selected option is required']
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required']
    },
    correct: {
      type: Boolean,
      required: [true, 'Correct status is required']
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative']
    },
    marks: {
      type: Number,
      default: 0,
      min: [0, 'Marks cannot be negative']
    }
  }],
  submissionType: {
    type: String,
    required: [true, 'Submission type is required'],
    enum: {
      values: ['live', 'self'],
      message: 'Invalid submission type'
    }
  },
  // Added status field
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'abandoned'],
    default: 'completed'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual population
resultSchema.virtual('detailedExam', {
  ref: 'LiveTest',
  localField: 'exam',
  foreignField: '_id',
  justOne: true
});

const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);
export default Result;