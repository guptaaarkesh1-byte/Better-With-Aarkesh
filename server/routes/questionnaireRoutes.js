import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Settings from '../models/Settings.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDefaultQuestionnaire() {
  try {
    const configPath = path.join(__dirname, '../data/questionnaireConfig.json');
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const flatQuestions = [];
    (cfg.sections || []).forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        flatQuestions.push({
          ...q,
          sectionId: sec.id,
          sectionTitle: sec.title,
          sectionIntro: sec.intro,
          question: q.prompt
        });
      });
    });

    return {
      title: cfg.copy?.card_title || 'Want to go deeper?',
      subtitle: cfg.copy?.card_description || 'An optional questionnaire to help me prepare for our conversation. There are 45 questions, and every question can be skipped. Allow around 25–35 minutes if you choose to answer them all.',
      badgeLabel: 'Optional • 45 Questions • ~25–35 mins',
      buttonText: cfg.copy?.start_button || 'Start optional questionnaire',
      resumeButtonText: cfg.copy?.resume_button || 'Continue questionnaire',
      reviewButtonText: cfg.copy?.review_button || 'Review answers',
      completedText: 'Questionnaire Completed',
      submitButtonText: 'Save and return to booking',
      sections: cfg.sections || [],
      questions: flatQuestions
    };
  } catch (err) {
    console.error('Failed to load questionnaireConfig.json:', err);
    return { questions: [] };
  }
}

export const DEFAULT_QUESTIONNAIRE = getDefaultQuestionnaire();

// GET /api/questionnaire - Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'questionnaire_settings' });
    const defaultData = getDefaultQuestionnaire();

    if (!doc || !doc.value || !Array.isArray(doc.value.questions) || doc.value.questions.length < 45) {
      await Settings.findOneAndUpdate(
        { key: 'questionnaire_settings' },
        { $set: { value: defaultData } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(defaultData);
    }

    const result = {
      ...defaultData,
      ...doc.value,
      sections: defaultData.sections,
      questions: doc.value.questions && doc.value.questions.length >= 45 ? doc.value.questions : defaultData.questions
    };
    return res.json(result);
  } catch (err) {
    console.error('Error fetching questionnaire:', err);
    res.status(500).json({ message: 'Failed to fetch questionnaire' });
  }
});

// POST /api/questionnaire/reset - Admin reset to official 45 questions
router.post('/reset', async (req, res) => {
  try {
    const defaultData = getDefaultQuestionnaire();
    await Settings.findOneAndUpdate(
      { key: 'questionnaire_settings' },
      { $set: { value: defaultData } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Questionnaire reset to default 45 questions successfully', data: defaultData });
  } catch (err) {
    console.error('Error resetting questionnaire:', err);
    res.status(500).json({ message: 'Failed to reset questionnaire' });
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
