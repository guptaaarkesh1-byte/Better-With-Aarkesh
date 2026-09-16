import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_FAQS = [
  {
    question: 'How long do I have access to the course materials?',
    answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.',
    order: 0,
    isActive: true,
  },
  {
    question: 'How do the 3 free coaching sessions work?',
    answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.',
    order: 1,
    isActive: true,
  },
  {
    question: 'What format is the course delivered in?',
    answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.',
    order: 2,
    isActive: true,
  },
  {
    question: 'Is this course beginner-friendly?',
    answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.',
    order: 3,
    isActive: true,
  },
];

async function seedFaqs() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/better-with-aarkesh';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('coursefaqs');
  await collection.deleteMany({});

  const docs = DEFAULT_FAQS.map(f => ({
    ...f,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const res = await collection.insertMany(docs);
  console.log(`✓ Successfully seeded ${res.insertedCount} FAQs into MongoDB:`);
  docs.forEach((d, i) => console.log(`  [${i+1}] Q: ${d.question}`));

  process.exit(0);
}

seedFaqs().catch((err) => {
  console.error('Error seeding FAQs:', err);
  process.exit(1);
});
