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

async function cleanUserData() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing from .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // 1. Delete all Course Users
    const cuRes = await CourseUser.deleteMany({});
    console.log(`✓ Deleted ${cuRes.deletedCount} Course Users.`);

    // 2. Delete all Course Purchases
    const cpRes = await CoursePurchase.deleteMany({});
    console.log(`✓ Deleted ${cpRes.deletedCount} Course Purchases.`);

    // 3. Delete all Course Progress
    const progRes = await CourseProgress.deleteMany({});
    console.log(`✓ Deleted ${progRes.deletedCount} Course Progress records.`);

    // 4. Delete all Coaching Appointments
    const appRes = await Appointment.deleteMany({});
    console.log(`✓ Deleted ${appRes.deletedCount} Coaching Appointments.`);

    // 5. Delete non-admin Coaching Users (Keep Admin safe)
    const userRes = await User.deleteMany({
      isAdmin: { $ne: true },
      email: { $nin: ['admin@aarkeshgupta.com', 'admin@betterwithaarkesh.com'] }
    });
    console.log(`✓ Deleted ${userRes.deletedCount} Non-admin Coaching Users (Admin preserved).`);

    console.log('\n🎉 ALL test user data cleared successfully for fresh testing!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing test data:', error);
    process.exit(1);
  }
}

cleanUserData();
