import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function updateDatabaseEmails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // 1. Update Settings collection (contact settings, footer brand settings, etc.)
    const settingsCollection = db.collection('settings');
    const allSettings = await settingsCollection.find({}).toArray();

    for (const setting of allSettings) {
      let settingStr = JSON.stringify(setting.value);
      if (settingStr && settingStr.includes('coaching@betterwithaarkesh.com')) {
        settingStr = settingStr.replaceAll('coaching@betterwithaarkesh.com', 'coaching@aarkeshgupta.com');
        const updatedVal = JSON.parse(settingStr);
        await settingsCollection.updateOne({ _id: setting._id }, { $set: { value: updatedVal } });
        console.log(`Updated setting key: ${setting.key}`);
      }
    }

    // 2. Update FooterDocument collection (Terms, Privacy, Refund, etc.)
    const footerDocsCollection = db.collection('footerdocuments');
    const allFooterDocs = await footerDocsCollection.find({}).toArray();

    for (const doc of allFooterDocs) {
      let docStr = JSON.stringify(doc);
      if (docStr.includes('coaching@betterwithaarkesh.com')) {
        docStr = docStr.replaceAll('coaching@betterwithaarkesh.com', 'coaching@aarkeshgupta.com');
        const updatedDoc = JSON.parse(docStr);
        delete updatedDoc._id;
        await footerDocsCollection.updateOne({ _id: doc._id }, { $set: updatedDoc });
        console.log(`Updated FooterDocument: ${doc.title || doc.slug}`);
      }
    }

    // 3. Update FooterColumn collection
    const footerColCollection = db.collection('footercolumns');
    const allFooterCols = await footerColCollection.find({}).toArray();

    for (const col of allFooterCols) {
      let colStr = JSON.stringify(col);
      if (colStr.includes('coaching@betterwithaarkesh.com')) {
        colStr = colStr.replaceAll('coaching@betterwithaarkesh.com', 'coaching@aarkeshgupta.com');
        const updatedCol = JSON.parse(colStr);
        delete updatedCol._id;
        await footerColCollection.updateOne({ _id: col._id }, { $set: updatedCol });
        console.log(`Updated FooterColumn: ${col.title}`);
      }
    }

    console.log('All database collections successfully scanned and updated to coaching@aarkeshgupta.com!');
  } catch (err) {
    console.error('Error updating DB emails:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateDatabaseEmails();
