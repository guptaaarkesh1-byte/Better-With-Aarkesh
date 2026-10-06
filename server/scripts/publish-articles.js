import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function publishAll() {
  const manifestPaths = [
    path.join(__dirname, '../../content-import/pkg/manifest.json'),
    path.join(__dirname, '../content-import/pkg/manifest.json'),
    path.join(process.cwd(), 'content-import/pkg/manifest.json')
  ];

  const manifestPath = manifestPaths.find(p => fs.existsSync(p));
  if (!manifestPath) {
    console.error('❌ Could not find manifest.json');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const slugs = manifest.map(m => m.slug);

  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  const res = await mongoose.connection.db.collection('articles').updateMany(
    { slug: { $in: slugs } },
    { $set: { status: 'Published' } }
  );

  console.log(`🎉 Successfully published ${res.modifiedCount} articles!`);

  const publishedCount = await mongoose.connection.db.collection('articles').countDocuments({
    slug: { $in: slugs },
    status: 'Published'
  });

  console.log(`📊 Total published articles in this package: ${publishedCount} / ${slugs.length}`);

  await mongoose.disconnect();
}

publishAll().catch(err => {
  console.error('Error publishing articles:', err);
  process.exit(1);
});
