import Exam from '../models/examModel.js';
import Result from '../models/resultModel.js';
import mongoose, { isValidObjectId } from 'mongoose';
import sanitizeHtml from 'sanitize-html';

// Utility function for error handling
const handleError = (res, error, status = 500) => {
  console.error(error);
  return res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
  });
};

// Get all exams
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('createdBy', 'name email')
      .select('-questions.correctAnswer')
      .lean();

    res.status(200).json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get single exam
export const getExamById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid exam ID' });
    }

    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .select('-questions.correctAnswer');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, exam });
  } catch (error) {
    handleError(res, error);
  }
};

// Create exam
// liveTestController.js
export const createExam = async (req, res) => {
  try {
    const { title, subject, description, examType, duration, sections, questions } = req.body;
    let { scheduledDate } = req.body;

    // Validate live exam parameters
    if (examType === 'live') {
      if (!scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date is required for live exams'
        });
      }
      scheduledDate = new Date(scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scheduled date format'
        });
      }
    }

    const newExam = await Exam.create({
      title: sanitizeHtml(title),
      subject: sanitizeHtml(subject),
      description: sanitizeHtml(description),
      duration: Number(duration),
      examType,
      scheduledDate: examType === 'live' ? scheduledDate : undefined,
      sections: sections.map(section => ({
        name: sanitizeHtml(section.name),
        order: section.order
      })),
      questions: questions.map(question => ({
        question: sanitizeHtml(question.question),
        options: question.options.map(opt => sanitizeHtml(opt)),
        correctAnswer: sanitizeHtml(question.correctAnswer),
        imageUrl: question.imageUrl,
        sectionOrder: question.sectionOrder
      })),
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, exam: newExam });
  } catch (error) {
    handleError(res, error);
  }
};

export const createLiveTest = createExam;

// Verify exam
export const verifyExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    // Add verification logic
    res.json({ valid: true });
  } catch (error) {
    handleError(res, error);
  }
};

// Take exam
// exports.takeExam = async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.id)
//       .select('-questions.correctAnswer');

//     res.json({
//       success: true,
//       exam: {
//         ...exam.toObject(),
//         questions: exam.questions.map(q => ({
//           ...q,
//           options: q.options.map(opt => sanitizeHtml(opt))
//         }))
//       }
//     });
//   } catch (error) {
//     handleError(res, error);
//   }
// };

export const takeExam = async (req, res) => {
  try {
    // First get the exam without modifying
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Clone the exam object and conditionally remove correct answers
    const examData = exam.toObject();
    
    if (examData.examType === 'live') {
      examData.questions = examData.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }

    res.json({
      success: true,
      exam: {
        ...examData,
        questions: examData.questions.map(q => ({
          ...q,
          options: q.options.map(opt => sanitizeHtml(opt))
        }))
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};
   
// Submit exam
export const submitExam = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated user
    const examId = req.params.id;
    let { answers: submittedAnswers, durationUsed } = req.body; // Expect durationUsed from frontend

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Standardize submittedAnswers to be an object { index: answerString }
    // Frontend sends { index: answerString } as `numericAnswers`
    // If it's an array from old logic, convert it (though frontend seems to send object)
    let answersMapSource = {};
    if (Array.isArray(submittedAnswers)) { // Handle if old array format is somehow sent
      submittedAnswers.forEach((ans, idx) => { answersMapSource[idx] = ans; });
    } else if (typeof submittedAnswers === 'object' && submittedAnswers !== null) {
      answersMapSource = submittedAnswers;
    }

    let score = 0;
    const analysisDetails = [];
    const actualQuestions = exam.questions.filter(q => q.type !== 'section');

    actualQuestions.forEach((q, questionIndexInExam) => {
      // Find the original index of this question in exam.questions array
      const originalQuestionIndex = exam.questions.findIndex(eq => eq._id.toString() === q._id.toString());
      
      const userAnswer = (answersMapSource[originalQuestionIndex] || '').toString().toUpperCase().trim();
      const correctAnswer = q.correctAnswer?.toUpperCase().trim();
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) score++;
      
      analysisDetails.push({
        questionId: q._id,
        selectedOption: userAnswer || 'UNANSWERED', // Assuming options are A,B,C,D or text
        correctAnswer: correctAnswer || '',
        correct: isCorrect,
        // timeSpent and marks would require more detailed per-question data
        timeSpent: 0, // Placeholder
        marks: isCorrect ? (q.marks || 1) : 0 // Placeholder for marks per question
      });
    });

    const totalQuestions = actualQuestions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Prepare answers for Result schema (Map<String, String>)
    const answersToStore = new Map();
    for (const key in answersMapSource) {
      if (answersMapSource.hasOwnProperty(key)) {
        answersToStore.set(key.toString(), (answersMapSource[key] || '').toString().trim());
      }
    }
    
    // Determine submissionType - default to 'live' or use exam.examType
    let submissionType = 'live'; // Default
    if (exam.examType === 'self-paced' || exam.examType === 'practice') {
        submissionType = 'self';
    }

    // Ensure durationUsed is a number; if not provided by frontend, default to exam duration or 0
    let finalDurationUsed = Number(durationUsed);
    if (isNaN(finalDurationUsed)) {
        finalDurationUsed = exam.duration ? exam.duration * 60 : 0; // Fallback, but ideally frontend sends it
    }

    const newResult = new Result({
      user: userId,
      exam: examId,
      score,
      totalQuestions,
      percentage: parseFloat(percentage.toFixed(1)),
      answers: answersToStore,
      analysis: analysisDetails,
      durationUsed: finalDurationUsed, 
      submissionType, // 'live' or 'self'
      status: 'completed'
    });

    await newResult.save();

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully.',
      resultId: newResult._id,
      score,
      totalQuestions,
      percentage: parseFloat(percentage.toFixed(1)),
      analysis: analysisDetails // Send back the detailed analysis
    });
    
  } catch (error) {
    console.error('Error in submitExam:', error); // Added for detailed logging
    handleError(res, error);
  }
};

// Check if user has already attempted an exam
export const checkExamAttempted = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const examId = req.params.id;
    const attempt = await Result.findOne({ user: userId, exam: examId });
    res.json({ success: true, attempted: !!attempt });
  } catch (error) {
    handleError(res, error);
  }
};

// Get leaderboard for a specific exam (top 10 unique users by score)
export const getLeaderboard = async (req, res) => {
  try {
    const examId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ success: false, message: 'Invalid Exam ID format' });
    }

    const leaderboardData = await Result.aggregate([
      { $match: { exam: new mongoose.Types.ObjectId(examId), status: 'completed' } },
      // Primary sort to define the 'best' attempt before grouping
      { $sort: { score: -1, durationUsed: 1, submissionDate: 1 } }, 
      {
        $group: {
          _id: "$user", // Group by user ID
          // Keep the first document encountered for this user (which is their best attempt due to prior sort)
          doc: { $first: "$$ROOT" } 
        }
      },
      // Promote the 'doc' (the full result document) to be the new root for further processing
      { $replaceRoot: { newRoot: "$doc" } }, 
      {
        $lookup: {
          from: "users", // The actual name of your users collection
          localField: "user", // Field from the Result document
          foreignField: "_id",  // Field from the User document
          as: "userDetails"
        }
      },
      // $unwind to deconstruct the userDetails array. preserveNullAndEmptyArrays ensures users without details aren't lost.
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } }, 
      // Sort again now that we have unique users with their best scores
      { $sort: { score: -1, durationUsed: 1, submissionDate: 1 } }, 
      { $limit: 10 }, // Get the top 10 unique user entries
      {
        $project: { // Shape the output
          _id: 0, // Exclude the default _id from the aggregation result document itself
          id: "$_id", // Use the Result document's _id as 'id'. This is unique and good for React keys.
          userId: "$user", // The user's ID
          name: "$userDetails.name",
          email: "$userDetails.email", // Include email if needed
          score: "$score",
          percentage: "$percentage",
          durationUsed: "$durationUsed",
          // Rank will be added in the next map function
        }
      }
    ]);

    const rankedLeaderboard = leaderboardData.map((entry, idx) => ({
      ...entry,
      name: entry.name || 'Unknown User', // Handle cases where user might have been deleted or name is missing
      rank: idx + 1
    }));

    res.json({ success: true, leaderboard: rankedLeaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    // Assuming handleError is defined elsewhere, or use a direct response:
    // handleError(res, error); 
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard', error: error.message });
  }
};

// Add questions to an existing exam
export const addQuestions = async (req, res) => {
  try {
    const { examId, questions } = req.body;
    if (!examId || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'examId and questions array are required' });
    }
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    // Sanitize and add questions
    questions.forEach(q => {
      exam.questions.push({
        question: sanitizeHtml(q.question),
        options: q.options.map(opt => sanitizeHtml(opt)),
        correctAnswer: sanitizeHtml(q.correctAnswer),
        imageUrl: q.imageUrl,
        sectionOrder: q.sectionOrder
      });
    });
    await exam.save();
    res.status(200).json({ success: true, message: 'Questions added successfully', exam });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete live test
export const deleteLiveTest = async (req, res) => {
  try {
    const deletedTest = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedTest) {
      return res.status(404).json({ success: false, message: 'Live test not found' });
    }
    res.status(200).json({ success: true, message: 'Live test deleted successfully', deletedTest });
  } catch (error) {
    handleError(res, error);
  }
};


// Get overall leaderboard (placeholder)
export const getOverallLeaderboard = async (req, res) => {
  try {
    // For now, return an empty leaderboard.
    // TODO: Implement actual logic for an overall leaderboard
    // This might involve aggregating scores across all exams,
    // finding top distinct users based on some criteria (e.g., average score, total score, best single exam score).
    res.json({ success: true, leaderboard: [] });
  } catch (error) {
    console.error("Error fetching overall leaderboard:", error);
    res.status(500).json({ success: false, message: 'Server error fetching overall leaderboard', error: error.message });
  }
};

export const getAllLiveTests = getAllExams;
export const getLiveTestById = getExamById;