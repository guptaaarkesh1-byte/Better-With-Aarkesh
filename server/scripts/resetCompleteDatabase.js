import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Note from '../models/Note.js';
import PastClient from '../models/PastClient.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import CourseProgress from '../models/CourseProgress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetAllData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/better-with-aarkesh';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // 1. Delete all non-admin coaching users
    const delUsers = await User.deleteMany({ isAdmin: { $ne: true } });
    console.log(`✓ Deleted ${delUsers.deletedCount} non-admin coaching User accounts.`);

    // 2. Delete all appointments
    const delAppts = await Appointment.deleteMany({});
    console.log(`✓ Deleted ${delAppts.deletedCount} Appointments.`);

    // 3. Delete all notes
    const delNotes = await Note.deleteMany({});
    console.log(`✓ Deleted ${delNotes.deletedCount} Notes.`);

    // 4. Delete all past clients
    const delPast = await PastClient.deleteMany({});
    console.log(`✓ Deleted ${delPast.deletedCount} PastClient records.`);

    // 5. Delete all course users
    const delCourseUsers = await CourseUser.deleteMany({});
    console.log(`✓ Deleted ${delCourseUsers.deletedCount} CourseUser accounts.`);

    // 6. Delete all course purchases
    const delPurchases = await CoursePurchase.deleteMany({});
    console.log(`✓ Deleted ${delPurchases.deletedCount} CoursePurchase records.`);

    // 7. Delete all course progress
    const delProgress = await CourseProgress.deleteMany({});
    console.log(`✓ Deleted ${delProgress.deletedCount} CourseProgress records.`);

    // 8. Reset admin user sessions/grants if any
    const resetAdmins = await User.updateMany(
      { isAdmin: true },
      { $set: { freeSessions: 0, courseSessionsGranted: false } }
    );
    console.log(`✓ Reset sessions on ${resetAdmins.modifiedCount} Admin accounts.`);

    console.log('\n=========================================');
    console.log('🎉 ALL COACHING AND COURSE USER/APPOINTMENT DATA COMPLETELY WIPED CLEAN!');
    console.log('Database is 100% fresh and ready for clean testing.');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error wiping database:', error);
    process.exit(1);
  }
};

resetAllData();
