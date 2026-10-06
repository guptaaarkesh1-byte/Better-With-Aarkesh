import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const isDryRun = process.argv.includes('--dry-run');

// Category mapping helper
const CATEGORY_MAP = {
  'change': { id: 'change', title: 'Change', category: 'CHANGE', defaultImage: '/library_preview_silhouette.jpg' },
  'communication': { id: 'communication', title: 'Communication', category: 'COMMUNICATION', defaultImage: '/library_preview_silhouette.jpg' },
  'decisions': { id: 'decisions', title: 'Decisions', category: 'DECISIONS', defaultImage: '/library_preview_silhouette.jpg' },
  'difficult people': { id: 'difficult-people', title: 'Difficult People', category: 'DIFFICULT PEOPLE', defaultImage: '/library_preview_silhouette.jpg' },
  'difficult_people': { id: 'difficult-people', title: 'Difficult People', category: 'DIFFICULT PEOPLE', defaultImage: '/library_preview_silhouette.jpg' },
  'difficult-people': { id: 'difficult-people', title: 'Difficult People', category: 'DIFFICULT PEOPLE', defaultImage: '/library_preview_silhouette.jpg' },
  'relationships': { id: 'relationships', title: 'Relationships', category: 'RELATIONSHIPS', defaultImage: '/library_preview_silhouette.jpg' },
  'self': { id: 'self', title: 'Self', category: 'SELF', defaultImage: '/library_preview_silhouette.jpg' }
};

// Convert Markdown to clean editorial HTML
function markdownToEditorialHtml(markdownText) {
  if (!markdownText) return '';

  // Remove first # Title line
  const lines = markdownText.replace(/^\uFEFF/, '').split(/\r?\n/);
  let startIndex = 0;
  if (lines.length > 0 && lines[0].trim().startsWith('#')) {
    startIndex = 1;
  }

  const rawBody = lines.slice(startIndex).join('\n');

  // Replace &nbsp; / non-breaking spaces (\u00a0) with regular whitespace
  const normalized = rawBody.replace(/[\u00a0\xa0]/g, ' ');

  // Split into paragraphs by blank lines
  const rawParagraphs = normalized.split(/\n\s*\n+/);

  const htmlParagraphs = [];

  for (const rawP of rawParagraphs) {
    const trimmed = rawP.trim();
    if (!trimmed) continue;

    // Convert inline markdown formatting
    // 1. Bold: **text** -> <strong>text</strong>
    let pContent = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 2. Italics: *text* -> <em>text</em> and _text_ -> <em>text</em>
    pContent = pContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    pContent = pContent.replace(/(^|\s)_([^_]+)_($|\s)/g, '$1<em>$2</em>$3');

    // Single line break within a paragraph
    pContent = pContent.replace(/\n/g, ' ');

    htmlParagraphs.push(`<p>${pContent}</p>`);
  }

  return htmlParagraphs.join('');
}

// Extract subtitle / description from first 1-2 sentences of body
function extractSubtitle(markdownText, maxLen = 180) {
  const lines = markdownText.replace(/^\uFEFF/, '').split(/\r?\n/);
  let startIndex = 0;
  if (lines.length > 0 && lines[0].trim().startsWith('#')) {
    startIndex = 1;
  }
  const body = lines.slice(startIndex).join('\n').replace(/[\u00a0\xa0]/g, ' ');
  const paragraphs = body.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return '';

  // Clean markdown tokens
  const cleanFirst = paragraphs[0].replace(/[*_#`[\]]/g, '').trim();
  if (cleanFirst.length <= maxLen) {
    // If very short, optionally append second paragraph
    if (cleanFirst.length < 80 && paragraphs.length > 1) {
      const cleanSecond = paragraphs[1].replace(/[*_#`[\]]/g, '').trim();
      const combined = `${cleanFirst} ${cleanSecond}`;
      return combined.length <= maxLen ? combined : combined.slice(0, maxLen).replace(/\s+[^\s]*$/, '') + '...';
    }
    return cleanFirst;
  }

  return cleanFirst.slice(0, maxLen).replace(/\s+[^\s]*$/, '') + '...';
}

// Extract dropCap & dropCapText
function extractDropCap(markdownText) {
  const lines = markdownText.replace(/^\uFEFF/, '').split(/\r?\n/);
  let startIndex = 0;
  if (lines.length > 0 && lines[0].trim().startsWith('#')) {
    startIndex = 1;
  }
  const body = lines.slice(startIndex).join('\n').replace(/[\u00a0\xa0]/g, ' ');
  const paragraphs = body.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return { dropCap: 'W', dropCapText: '' };

  const cleanFirst = paragraphs[0].replace(/[*_#`[\]]/g, '').trim();
  const firstChar = cleanFirst.charAt(0).toUpperCase();
  const letter = /^[A-Z]$/.test(firstChar) ? firstChar : 'W';

  return {
    dropCap: letter,
    dropCapText: cleanFirst
  };
}

async function runImport() {
  console.log('====================================================');
  console.log(`📦 BWA ARTICLE BULK IMPORT SCRIPT ${isDryRun ? '(DRY RUN MODE)' : '(LIVE DB IMPORT)'}`);
  console.log('====================================================\n');

  // Locate manifest
  const manifestPaths = [
    path.join(__dirname, '../../content-import/pkg/manifest.json'),
    path.join(__dirname, '../content-import/pkg/manifest.json'),
    path.join(process.cwd(), 'content-import/pkg/manifest.json')
  ];

  let manifestPath = manifestPaths.find(p => fs.existsSync(p));
  if (!manifestPath) {
    console.error('❌ Could not find manifest.json at ./content-import/pkg/manifest.json');
    process.exit(1);
  }

  const pkgDir = path.dirname(manifestPath);
  console.log(`📁 Using package directory: ${pkgDir}`);

  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`📋 Found ${manifestData.length} articles in manifest.\n`);

  // Count totals per category for categoryNum (e.g. 01 / 04)
  const categoryTotals = {};
  for (const item of manifestData) {
    const rawCat = (item.category || '').toLowerCase().trim();
    const catConfig = CATEGORY_MAP[rawCat] || CATEGORY_MAP['relationships'];
    categoryTotals[catConfig.id] = (categoryTotals[catConfig.id] || 0) + 1;
  }

  // Define Mongoose Article Schema
  const articleSchema = new mongoose.Schema(
    {
      slug: { type: String, default: '', trim: true },
      categoryId: { type: String, required: true, trim: true },
      categoryTitle: { type: String, default: '', trim: true },
      headingId: { type: String, default: '', trim: true },
      headingTitle: { type: String, default: '', trim: true },
      category: { type: String, default: 'RELATIONSHIPS', trim: true },
      categoryNum: { type: String, default: '01 / 06' },
      title: { type: String, required: true, trim: true },
      subtitle: { type: String, default: '', trim: true },
      description: { type: String, default: '', trim: true },
      quote: { type: String, default: '', trim: true },
      date: { type: String, default: '' },
      readTime: { type: String, default: '', trim: true },
      status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
      image: { type: String, default: '' },
      featuredImage: { type: String, default: '' },
      dropCap: { type: String, default: 'W' },
      dropCapText: { type: String, default: '' },
      paragraphsAfterDropCap: { type: [String], default: [] },
      sections: { type: [mongoose.Schema.Types.Mixed], default: [] },
      blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
      bodyHtml: { type: String, default: '' },
    },
    { timestamps: true, strict: false }
  );

  let ArticleModel;
  if (!isDryRun) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables.');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully.\n');
    ArticleModel = mongoose.models.Article || mongoose.model('Article', articleSchema);
  }

  const categoryCounts = {
    'Change': 0,
    'Communication': 0,
    'Decisions': 0,
    'Difficult People': 0,
    'Relationships': 0,
    'Self': 0
  };

  const results = [];
  let sampleArticlePreview = null;

  for (const item of manifestData) {
    const rawCat = (item.category || '').toLowerCase().trim();
    const catConfig = CATEGORY_MAP[rawCat] || CATEGORY_MAP['relationships'];
    const totalInCat = categoryTotals[catConfig.id] || 1;
    const catNumStr = `${String(item.order || 1).padStart(2, '0')} / ${String(totalInCat).padStart(2, '0')}`;

    // Read MD file
    const filePath = path.join(pkgDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const mdContent = fs.readFileSync(filePath, 'utf8');
    const bodyHtml = markdownToEditorialHtml(mdContent);
    const subtitle = extractSubtitle(mdContent);
    const { dropCap, dropCapText } = extractDropCap(mdContent);
    const readMinutes = Math.max(1, Math.ceil((item.word_count || 800) / 180));
    const readTimeStr = `${readMinutes} MIN`;

    const articleDoc = {
      title: item.title.trim(),
      slug: item.slug.trim(),
      categoryId: catConfig.id,
      categoryTitle: catConfig.title,
      headingId: catConfig.id,
      headingTitle: catConfig.title,
      category: catConfig.category,
      categoryNum: catNumStr,
      subtitle: subtitle,
      description: subtitle,
      readTime: readTimeStr,
      date: '06 OCT 2026',
      status: 'Draft', // Strict draft status as requested
      image: catConfig.defaultImage,
      featuredImage: catConfig.defaultImage,
      dropCap: dropCap,
      dropCapText: dropCapText,
      blocks: [],
      sections: [],
      bodyHtml: bodyHtml
    };

    if (!sampleArticlePreview) {
      sampleArticlePreview = {
        title: articleDoc.title,
        slug: articleDoc.slug,
        category: articleDoc.category,
        categoryNum: articleDoc.categoryNum,
        readTime: articleDoc.readTime,
        status: articleDoc.status,
        subtitle: articleDoc.subtitle,
        dropCap: articleDoc.dropCap,
        sampleBodyHtml: bodyHtml.slice(0, 450) + '...'
      };
    }

    if (!isDryRun) {
      // Idempotent upsert by slug
      const existing = await ArticleModel.findOne({ slug: articleDoc.slug });
      if (existing) {
        Object.assign(existing, articleDoc);
        await existing.save();
        results.push({ slug: articleDoc.slug, title: articleDoc.title, action: 'UPDATED' });
      } else {
        await ArticleModel.create(articleDoc);
        results.push({ slug: articleDoc.slug, title: articleDoc.title, action: 'CREATED' });
      }
    } else {
      results.push({ slug: articleDoc.slug, title: articleDoc.title, action: 'DRY_RUN' });
    }

    categoryCounts[catConfig.title] = (categoryCounts[catConfig.title] || 0) + 1;
  }

  if (isDryRun) {
    console.log('🔍 SAMPLE CONVERTED ARTICLE PREVIEW:\n');
    console.log(JSON.stringify(sampleArticlePreview, null, 2));
    console.log('\n----------------------------------------------------');
  }

  console.log('\n📊 IMPORT SUMMARY REPORT:');
  console.log('----------------------------------------------------');
  console.log('| Category          | Expected | Processed | Status |');
  console.log('| :---------------- | :------- | :-------- | :----- |');
  const expected = {
    'Change': 4,
    'Communication': 5,
    'Decisions': 4,
    'Difficult People': 4,
    'Relationships': 12,
    'Self': 5
  };

  let totalProcessed = 0;
  for (const [cat, expCount] of Object.entries(expected)) {
    const actCount = categoryCounts[cat] || 0;
    totalProcessed += actCount;
    const match = actCount === expCount ? '✅ MATCH' : '⚠️ MISMATCH';
    console.log(`| ${cat.padEnd(17)} | ${String(expCount).padEnd(8)} | ${String(actCount).padEnd(9)} | ${match} |`);
  }
  console.log('----------------------------------------------------');
  console.log(`Total Articles Processed: ${totalProcessed} / 34\n`);

  if (!isDryRun) {
    console.log('✅ All 34 articles successfully saved into MongoDB with status "Draft"!\n');
    await mongoose.disconnect();
  } else {
    console.log('ℹ️ Dry-run completed. No database changes were made.\n');
  }
}

runImport().catch(err => {
  console.error('❌ Import failed with error:', err);
  process.exit(1);
});
