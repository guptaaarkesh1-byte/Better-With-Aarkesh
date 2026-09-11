import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import Appointment from '../models/Appointment.js';

async function clearData() {
  let connected = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt}/3)...`);
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
      });
      console.log('Connected to MongoDB');
      connected = true;
      break;
    } catch (e) {
      console.error(`Connection attempt ${attempt} failed:`, e.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!connected) {
    console.error('Could not connect to MongoDB after 3 attempts.');
    process.exit(1);
  }

  try {
    // Delete non-admin users (preserve admin account)
    const userRes = await User.deleteMany({ isAdmin: { $ne: true } });
    console.log(`Deleted ${userRes.deletedCount} coaching User(s)`);

    // Delete all course users
    const courseRes = await CourseUser.deleteMany({});
    console.log(`Deleted ${courseRes.deletedCount} CourseUser(s)`);

    // Delete all appointments
    const apptRes = await Appointment.deleteMany({});
    console.log(`Deleted ${apptRes.deletedCount} Appointment(s)`);

    console.log('Database successfully cleaned for fresh testing!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
}

clearData();
