import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_CARDS = [
  {
    title: 'The Foundation of Presence',
    description: 'Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy.',
    order: 0,
    isActive: true,
  },
  {
    title: 'Breaking Reactive Patterns',
    description: 'Identify and dissolve the emotional triggers that cause you to react instead of respond.',
    order: 1,
    isActive: true,
  },
  {
    title: 'Magnetic Communication',
    description: 'Develop a voice and language that people naturally lean toward and remember.',
    order: 2,
    isActive: true,
  },
  {
    title: 'Non-Verbal Mastery',
    description: 'Harness the 93% of communication that happens without words — posture, eye contact, space.',
    order: 3,
    isActive: true,
  },
  {
    title: 'Leadership from Within',
    description: 'Stop performing authority and start embodying it — people will follow without being asked.',
    order: 4,
    isActive: true,
  },
  {
    title: 'Emotional Sovereignty',
    description: 'Condition your nervous system to stay laser-focused, composed, and mentally sharp under extreme stress.',
    order: 5,
    isActive: true,
  },
  {
    title: 'Executive Gravitas & Charisma',
    description: 'Command high-stakes rooms and social dynamics with effortless poise, vocal resonance, and respect.',
    order: 6,
    isActive: true,
  },
  {
    title: 'The Ripple Effect',
    description: 'Turn your internal transformation into lasting impact on every relationship and environment.',
    order: 7,
    isActive: true,
  },
];

async function seedCards() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/better-with-aarkesh';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('coursecards');
  await collection.deleteMany({});
  
  const docs = DEFAULT_CARDS.map(c => ({
    ...c,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const res = await collection.insertMany(docs);
  console.log(`✓ Successfully seeded ${res.insertedCount} curriculum cards into MongoDB:`);
  docs.forEach((d, i) => console.log(`  [${i+1}] ${d.title}`));

  process.exit(0);
}

seedCards().catch((err) => {
  console.error('Error seeding cards:', err);
  process.exit(1);
});
