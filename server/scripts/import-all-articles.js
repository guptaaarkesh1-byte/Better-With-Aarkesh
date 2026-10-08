import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';

dotenv.config();

const CATEGORY_MAPPING = {
  SELF: {
    categoryId: 'self',
    categoryTitle: 'Self',
    categoryNum: '02 / 06',
    categoryName: 'SELF'
  },
  CHANGE: {
    categoryId: 'change',
    categoryTitle: 'Change',
    categoryNum: '03 / 06',
    categoryName: 'CHANGE'
  },
  DECISIONS: {
    categoryId: 'decisions',
    categoryTitle: 'Decisions',
    categoryNum: '04 / 06',
    categoryName: 'DECISIONS'
  },
  DIFFICULT_PEOPLE: {
    categoryId: 'difficult_people',
    categoryTitle: 'Difficult People',
    categoryNum: '05 / 06',
    categoryName: 'DIFFICULT PEOPLE'
  },
  COMMUNICATION: {
    categoryId: 'communication',
    categoryTitle: 'Communication',
    categoryNum: '06 / 06',
    categoryName: 'COMMUNICATION'
  },
  RELATIONSHIPS: {
    categoryId: 'relationships',
    categoryTitle: 'Relationships',
    categoryNum: '01 / 06',
    categoryName: 'RELATIONSHIPS'
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));

    const rawData = JSON.parse(fs.readFileSync('./data/articles.json', 'utf-8'));
    console.log(`Loaded ${rawData.length} articles from articles.json`);

    // 1. Delete existing imported articles
    const delResult = await Article.deleteMany({});
    console.log(`Cleared previous articles (Deleted ${delResult.deletedCount})`);

    const insertedDocs = [];

    // 2. Insert all 33 articles
    for (const item of rawData) {
      const catConfig = CATEGORY_MAPPING[item.category] || {
        categoryId: item.category.toLowerCase().replace(/_/g, '-'),
        categoryTitle: item.category,
        categoryNum: '01 / 06',
        categoryName: item.category
      };

      const cleanSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const wordCount = item.word_count || 500;
      const readMinutes = Math.ceil(wordCount / 200);

      const doc = await Article.create({
        title: item.title,
        slug: cleanSlug,
        order: item.order || 1,
        category: catConfig.categoryName,
        categoryId: catConfig.categoryId,
        categoryNum: catConfig.categoryNum,
        categoryTitle: catConfig.categoryTitle,
        readTime: `${readMinutes} MIN READ`,
        status: 'Draft',
        bodyHtml: item.body_html,
        blocks: [],
        sections: [],
        paragraphsAfterDropCap: []
      });

      insertedDocs.push(doc);
    }

    console.log(`\nSuccessfully imported ${insertedDocs.length} articles as Draft:`);
    insertedDocs.forEach((d, idx) => {
      console.log(`${idx + 1}. [${d.category}] (#${d.order}) "${d.title}" -> ID: ${d._id}`);
    });

    await mongoose.disconnect();
    console.log('\nBulk import process completed successfully.');
  } catch (error) {
    console.error('Error during bulk import:', error);
    process.exit(1);
  }
};

run();
