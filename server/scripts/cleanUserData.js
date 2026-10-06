import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import CourseProgress from '../models/CourseProgress.js';
import Appointment from '../models/Appointment.js';
import PastClient from '../models/PastClient.js';
import Note from '../models/Note.js';

async function cleanUserData() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/better-with-aarkesh';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('--- Cleaning User & Client Data ---');

    // 1. Delete non-admin coaching users
    const userRes = await User.deleteMany({ isAdmin: { $ne: true } });
    console.log(`Deleted coaching users (non-admin): ${userRes.deletedCount}`);

    // 2. Delete all course users
    const courseUserRes = await CourseUser.deleteMany({});
    console.log(`Deleted course users: ${courseUserRes.deletedCount}`);

    // 3. Delete course purchases
    const purchaseRes = await CoursePurchase.deleteMany({});
    console.log(`Deleted course purchases: ${purchaseRes.deletedCount}`);

    // 4. Delete course progress records
    const progressRes = await CourseProgress.deleteMany({});
    console.log(`Deleted course progress records: ${progressRes.deletedCount}`);

    // 5. Delete all appointments
    const apptRes = await Appointment.deleteMany({});
    console.log(`Deleted appointments: ${apptRes.deletedCount}`);

    // 6. Delete past client logs
    const pastRes = await PastClient.deleteMany({});
    console.log(`Deleted past client logs: ${pastRes.deletedCount}`);

    // 7. Delete notes
    const notesRes = await Note.deleteMany({});
    console.log(`Deleted notes: ${notesRes.deletedCount}`);

    console.log('✅ All user, appointment, and purchase data successfully cleared for fresh testing!');
  } catch (err) {
    console.error('Error cleaning user data:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanUserData();
