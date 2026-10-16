import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

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

const newSettings = {
  title: cfg.copy?.card_title || 'Want to go deeper?',
  subtitle: cfg.copy?.card_description || 'An optional questionnaire to help me prepare for our conversation. There are 45 questions, and every question can be skipped. Allow around 25–35 minutes if you choose to answer them all.',
  badgeLabel: 'Optional • 45 Questions • ~25–35 mins',
  buttonText: cfg.copy?.start_button || 'Start optional questionnaire',
  resumeButtonText: cfg.copy?.resume_button || 'Continue questionnaire',
  reviewButtonText: cfg.copy?.review_button || 'Review answers',
  completedText: 'Questionnaire Completed',
  submitButtonText: 'Save and return to booking',
  sections: cfg.sections,
  questions: flatQuestions
};

async function sync() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/betterwithaarkesh';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Settings.findOneAndUpdate(
      { key: 'questionnaire_settings' },
      { $set: { value: newSettings } },
      { upsert: true, new: true }
    );

    console.log(`Successfully synced questionnaire_settings with ${flatQuestions.length} questions across ${cfg.sections.length} sections!`);
    process.exit(0);
  } catch (err) {
    console.error('Error syncing questionnaire settings:', err);
    process.exit(1);
  }
}

sync();
