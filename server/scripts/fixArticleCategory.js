import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));

  const updated = await Article.findOneAndUpdate(
    { slug: 'how-many-votes-does-your-life-require' },
    {
      $set: {
        category: 'RELATIONSHIPS',
        categoryId: 'relationships',
        categoryTitle: 'Relationships',
        headingId: 'relationships',
        headingTitle: 'Relationships',
        categoryNum: '01 / 06'
      }
    },
    { new: true }
  );

  console.log('Successfully updated article:', updated ? updated.title : 'Not found');
  
  // Count by category
  const relCount = await Article.countDocuments({
    $or: [{ categoryId: 'relationships' }, { category: 'RELATIONSHIPS' }]
  });
  console.log('Total articles in Relationships now:', relCount);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
