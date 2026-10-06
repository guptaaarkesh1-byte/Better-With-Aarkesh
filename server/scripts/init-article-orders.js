import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Article from '../models/Article.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const manifestPath = path.join(__dirname, '../../content-import/pkg/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    for (const item of manifest) {
      await Article.findOneAndUpdate(
        { slug: item.slug },
        { order: item.order || 1 }
      );
      console.log(`Set order ${item.order} for "${item.title}" (${item.slug})`);
    }

    console.log('Successfully set initial orders from manifest.json');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error initializing orders:', err);
    process.exit(1);
  }
}

run();
