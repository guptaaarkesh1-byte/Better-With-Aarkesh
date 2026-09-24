import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

export const DEFAULT_QUESTIONNAIRE = {
  title: "Want to go deeper?",
  subtitle: "A short questionnaire to help us make the most of our time together.",
  badgeLabel: "Optional — ~30 mins",
  buttonText: "TAKE QUESTIONNAIRE",
  completedText: "Questionnaire Completed",
  submitButtonText: "SUBMIT & CONTINUE",
  questions: [
    {
      id: "q1",
      question: "What's the primary area of your life you'd like to work on?",
      required: false,
      options: [
        { id: "q1o1", label: "Career & Purpose" },
        { id: "q1o2", label: "Relationships & Communication" },
        { id: "q1o3", label: "Mental Health & Wellbeing" },
        { id: "q1o4", label: "Confidence & Self-Worth" },
        { id: "q1o5", label: "Life Direction & Clarity" }
      ]
    },
    {
      id: "q2",
      question: "How would you describe where you are right now?",
      required: false,
      options: [
        { id: "q2o1", label: "Stuck and unsure what's next" },
        { id: "q2o2", label: "Making progress but need guidance" },
        { id: "q2o3", label: "In a transition or big change" },
        { id: "q2o4", label: "Feeling overwhelmed or burned out" },
        { id: "q2o5", label: "Ready to level up" }
      ]
    },
    {
      id: "q3",
      question: "What does success look like to you after this session?",
      required: false,
      options: [
        { id: "q3o1", label: "Clarity on a decision or next step" },
        { id: "q3o2", label: "A sense of relief and being heard" },
        { id: "q3o3", label: "A practical action plan" },
        { id: "q3o4", label: "Fresh perspective on my situation" },
        { id: "q3o5", label: "Just to talk it through with someone" }
      ]
    }
  ]
};

// GET /api/questionnaire - Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'questionnaire_settings' });
    if (!doc || !doc.value) {
      return res.json(DEFAULT_QUESTIONNAIRE);
    }
    const result = {
      ...DEFAULT_QUESTIONNAIRE,
      ...doc.value,
      questions: doc.value.questions || DEFAULT_QUESTIONNAIRE.questions
    };
    return res.json(result);
  } catch (err) {
    console.error('Error fetching questionnaire:', err);
    res.status(500).json({ message: 'Failed to fetch questionnaire' });
  }
});

// PUT /api/questionnaire - Admin
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    await Settings.findOneAndUpdate(
      { key: 'questionnaire_settings' },
      { $set: { value: data } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Questionnaire updated successfully', data });
  } catch (err) {
    console.error('Error updating questionnaire:', err);
    res.status(500).json({ message: 'Failed to update questionnaire' });
  }
});

export default router;
