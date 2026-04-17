import Question from '../models/questionModel.js';

// Add a new question
export const addQuestion = async (req, res) => {
  try {
    // Accept both form-data and JSON
    let question, options;
    if (req.is('multipart/form-data')) {
      question = req.body.question;
      options = JSON.parse(req.body.options);
    } else {
      question = req.body.question;
      options = req.body.options;
    }
    let image = null;
    if (req.file) {
      image = req.file.path;
    } else if (req.body.image) {
      image = req.body.image;
    }
    const newQuestion = new Question({ question, options, image });
    await newQuestion.save();
    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
