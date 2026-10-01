import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import User from '../models/User.js';

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://guptaaarkesh1_db_user:DyjIzi7zsNut1Oy4@betterwithaarkesh.bcnxgzd.mongodb.net/BetterWithAarkesh';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    const deletedPurchases = await CoursePurchase.deleteMany({});
    console.log(`Deleted ${deletedPurchases.deletedCount} CoursePurchase records.`);

    const deletedCourseUsers = await CourseUser.deleteMany({});
    console.log(`Deleted ${deletedCourseUsers.deletedCount} CourseUser records.`);

    // Also reset courseSessionsGranted and freeSessions on coaching User model
    const updatedUsers = await User.updateMany(
      { courseSessionsGranted: true },
      { $set: { courseSessionsGranted: false, freeSessions: 0 } }
    );
    console.log(`Reset ${updatedUsers.modifiedCount} coaching users.`);

    console.log('✅ ALL COURSE USERS & PURCHASES CLEARED SUCCESSFULLY FOR FRESH TESTING!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
};

clearData();
