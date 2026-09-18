import mongoose from 'mongoose';

const srcUri = 'mongodb+srv://Yash:dYQS9imycdkqhBc0@cluster0.wp8rmxv.mongodb.net/Life-Coaching';
const targetUri = 'mongodb+srv://guptaaarkesh1_db_user:DyjIzi7zsNut1Oy4@betterwithaarkesh.bcnxgzd.mongodb.net/BetterWithAarkesh?retryWrites=true&w=majority';

async function migrate() {
  console.log('Connecting to source DB...');
  const srcConn = await mongoose.createConnection(srcUri).asPromise();
  console.log('Source DB connected.');

  console.log('Connecting to target DB...');
  const targetConn = await mongoose.createConnection(targetUri).asPromise();
  console.log('Target DB connected.');

  const collections = ['footerdocuments', 'footercolumns', 'sociallinks', 'coursecards', 'coursefaqs'];

  for (const colName of collections) {
    const srcDocs = await srcConn.collection(colName).find({}).toArray();
    console.log(`Found ${srcDocs.length} documents in source collection: ${colName}`);
    if (srcDocs.length > 0) {
      const targetCol = targetConn.collection(colName);
      await targetCol.deleteMany({});
      await targetCol.insertMany(srcDocs);
      console.log(`Successfully migrated ${srcDocs.length} documents to target collection: ${colName}`);
    } else {
      console.log(`No documents found in ${colName} to migrate.`);
    }
  }

  await srcConn.close();
  await targetConn.close();
  console.log('All footer data migrated to new MongoDB successfully!');
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
