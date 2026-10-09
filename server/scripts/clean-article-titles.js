import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Article from '../models/Article.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const stripArticleNumbering = (title) => {
  if (!title || typeof title !== 'string') return title;
  return title
    .replace(/^\s*\d+(\.\d+)+[\.\s\-–—:]*\s*/, '')
    .replace(/^\s*\d{1,2}\.\s+/, '')
    .trim();
};

async function cleanTitles() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const articles = await Article.find({});
    console.log(`Found ${articles.length} articles`);

    let updatedCount = 0;
    for (const article of articles) {
      const originalTitle = article.title;
      const clean = stripArticleNumbering(originalTitle);

      if (clean && clean !== originalTitle) {
        article.title = clean;
        await article.save();
        console.log(`Updated: "${originalTitle}" -> "${clean}"`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} articles!`);
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning article titles:', err);
    process.exit(1);
  }
}

cleanTitles();
