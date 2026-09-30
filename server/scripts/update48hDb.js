import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/better-with-aarkesh';

async function updateDb() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Keep booking UI text as 48 hours
    const Settings = mongoose.connection.collection('settings');
    const doc = await Settings.findOne({ key: 'booking_all_steps_settings' });
    if (doc && doc.value) {
      if (!doc.value.step3) doc.value.step3 = {};
      doc.value.step3.rescheduleText = "You can reschedule or cancel up to 48 hours before the session.";
      if (!doc.value.success) doc.value.success = {};
      doc.value.success.changeText = "You can reschedule or cancel up to 48 hours before the session.";
      await Settings.updateOne({ key: 'booking_all_steps_settings' }, { $set: { value: doc.value } });
      console.log('Updated booking UI text to 48 hours in DB');
    }

    // Ensure legal policies retain standard 24 hours policy
    const Policy = mongoose.connection.collection('policies');
    const policies = await Policy.find({}).toArray();
    for (const pol of policies) {
      if (pol.content && pol.content.includes('48 hours')) {
        const newContent = pol.content
          .replace(/48 hours/g, '24 hours')
          .replace(/48-hour/g, '24-hour');
        await Policy.updateOne({ _id: pol._id }, { $set: { content: newContent } });
        console.log('Reverted policy to original 24h:', pol.slug);
      }
    }

    console.log('Finished updating.');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await mongoose.disconnect();
  }
}

updateDb();
