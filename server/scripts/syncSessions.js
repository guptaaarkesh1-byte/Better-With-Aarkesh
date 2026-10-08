import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/Meraki Movies/Life Coaching website/Better With Aarkesh/server/.env' });
import CoursePurchase from '../models/CoursePurchase.js';
import CourseUser from '../models/CourseUser.js';
import User from '../models/User.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const pRes = await CoursePurchase.updateMany(
    { paymentStatus: 'Paid', freeSessionsGranted: { $in: [0, null, undefined] } },
    { $set: { freeSessionsGranted: 3 } }
  );
  console.log('Updated Purchases:', pRes);

  const uRes = await CourseUser.updateMany(
    { isPurchased: true },
    { $set: { freeSessions: 3, courseSessionsGranted: true } }
  );
  console.log('Updated CourseUsers:', uRes);

  const cuRes = await User.updateMany(
    { courseSessionsGranted: true, freeSessions: 0 },
    { $set: { freeSessions: 3 } }
  );
  console.log('Updated Users:', cuRes);

  const yashCourse = await CourseUser.findOne({ email: /yashraj/i });
  const yashCoach = await User.findOne({ email: /yashraj/i });
  const yashPurch = await CoursePurchase.find({ studentEmail: /yashraj/i });

  const { calculateAndSyncFreeSessions } = await import('../services/freeSessionService.js');
  const sessionCheck = await calculateAndSyncFreeSessions('yashrajsingh28359@gmail.com');
  console.log('calculateAndSyncFreeSessions check:', sessionCheck);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
