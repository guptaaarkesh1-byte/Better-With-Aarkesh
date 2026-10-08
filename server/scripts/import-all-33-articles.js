import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_MAP = {
  'SELF': { categoryId: 'self', categoryTitle: 'Self', categoryNum: '02 / 06' },
  'CHANGE': { categoryId: 'change', categoryTitle: 'Change', categoryNum: '03 / 06' },
  'DECISIONS': { categoryId: 'decisions', categoryTitle: 'Decisions', categoryNum: '04 / 06' },
  'COMMUNICATION': { categoryId: 'communication', categoryTitle: 'Communication', categoryNum: '06 / 06' },
  'DIFFICULT_PEOPLE': { categoryId: 'difficult_people', categoryTitle: 'Difficult People', categoryNum: '05 / 06' },
  'RELATIONSHIPS': { categoryId: 'relationships', categoryTitle: 'Relationships', categoryNum: '01 / 06' }
};

export async function importAllArticles(articlesData) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Delete all existing articles as requested
    const deleteResult = await Article.deleteMany({});
    console.log(`🗑️ Cleared existing articles: ${deleteResult.deletedCount} removed`);

    let createdCount = 0;
    let skippedCount = 0;
    const categoryCounts = {};

    for (const item of articlesData) {
      const catInfo = CATEGORY_MAP[item.category] || {
        categoryId: item.category.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        categoryTitle: item.category,
        categoryNum: '01 / 06'
      };

      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const readMinutes = Math.ceil((item.word_count || 400) / 200);
      const readTime = `${readMinutes} min read`;

      const articleDoc = {
        title: item.title,
        slug: slug,
        category: item.category,
        categoryId: catInfo.categoryId,
        categoryTitle: catInfo.categoryTitle,
        categoryNum: catInfo.categoryNum,
        headingId: catInfo.categoryId,
        headingTitle: catInfo.categoryTitle,
        order: item.order,
        status: 'Draft',
        bodyHtml: item.body_html,
        readTime: readTime
      };

      // Idempotency check: skip if title and category already exist
      const exists = await Article.findOne({ title: articleDoc.title, category: articleDoc.category });
      if (exists) {
        skippedCount++;
        console.log(`⚠️ Skipped existing: [${item.category}] ${item.title}`);
      } else {
        await Article.create(articleDoc);
        createdCount++;
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        console.log(`✅ [${createdCount}] Created: [${item.category}] ${item.title} (Order: ${item.order})`);
      }
    }

    console.log('\n📊 IMPORT SUMMARY REPORT:');
    console.log(`Total Created: ${createdCount}`);
    console.log(`Total Skipped: ${skippedCount}`);
    console.log('Breakdown by Category:', categoryCounts);

    await mongoose.disconnect();
    return { createdCount, skippedCount, categoryCounts };
  } catch (err) {
    console.error('❌ Error during import:', err);
    process.exit(1);
  }
}
