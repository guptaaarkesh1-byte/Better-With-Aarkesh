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

const validSlugs = new Set(manifest.map(m => m.slug));

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const allArticles = await Article.find({});
    console.log(`Total articles currently in DB: ${allArticles.length}`);

    const toKeep = [];
    const toDelete = [];

    for (const art of allArticles) {
      if (validSlugs.has(art.slug)) {
        toKeep.push(art);
      } else {
        toDelete.push(art);
      }
    }

    console.log(`Articles to KEEP (${toKeep.length}):`);
    toKeep.forEach(a => console.log(`  - [${a.categoryId}] ${a.title} (${a.slug})`));

    console.log(`\nArticles to DELETE (${toDelete.length}):`);
    toDelete.forEach(a => console.log(`  - [${a.categoryId || 'no-cat'}] ${a.title} (${a.slug}) [ID: ${a._id}]`));

    if (toDelete.length > 0) {
      const deleteIds = toDelete.map(a => a._id);
      const res = await Article.deleteMany({ _id: { $in: deleteIds } });
      console.log(`\nSuccessfully deleted ${res.deletedCount} old articles.`);
    } else {
      console.log('\nNo extra articles to delete.');
    }

    const finalCount = await Article.countDocuments({});
    console.log(`Final article count in DB: ${finalCount}`);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

run();
