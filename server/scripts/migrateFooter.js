import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/better-with-aarkesh');
  const collection = mongoose.connection.collection('footerdocuments');
  
  // Set existing docs to category: 'coaching' if not set
  await collection.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'coaching' } }
  );
  
  // Check if course docs exist
  const count = await collection.countDocuments({ category: 'course' });
  if (count === 0) {
    await collection.insertMany([
      {
        title: 'Course Terms & Conditions',
        slug: 'course-terms-and-conditions',
        contentHtml: '<h1>Course Terms & Conditions</h1><p>Welcome to the Better With Aarkesh Course terms...</p>',
        status: 'Published',
        category: 'course',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Course Refund Policy',
        slug: 'course-refund-policy',
        contentHtml: '<h1>Course Refund Policy</h1><p>Our 100% money-back guarantee terms and refund conditions...</p>',
        status: 'Published',
        category: 'course',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Course Privacy Policy',
        slug: 'course-privacy-policy',
        contentHtml: '<h1>Course Privacy Policy</h1><p>Privacy policy regarding course access, materials, and community...</p>',
        status: 'Published',
        category: 'course',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Seeded 3 course footer documents.');
  }
  
  const allDocs = await collection.find({}).toArray();
  console.log('Total documents:', allDocs.length);
  allDocs.forEach(d => console.log(` - [${d.category}] ${d.title} (/${d.slug})`));
  process.exit(0);
}
migrate().catch(console.error);
