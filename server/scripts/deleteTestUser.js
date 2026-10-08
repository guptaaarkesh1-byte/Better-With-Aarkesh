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
import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';

const targetEmail = 'yashrajsingh28359@gmail.com';

async function deleteUser() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const emailRegex = /yash/i;

    const users = await User.find({ $or: [{ email: emailRegex }, { name: emailRegex }, { fullName: emailRegex }] });
    const userIds = users.map(u => u._id);

    const courseUsers = await CourseUser.find({ $or: [{ email: emailRegex }, { name: emailRegex }, { fullName: emailRegex }] });
    const courseUserIds = courseUsers.map(u => u._id);

    console.log(`Found ${users.length} User records, ${courseUsers.length} CourseUser records matching "yash"`);

    const allIds = [...userIds, ...courseUserIds];

    const apptResult = await Appointment.deleteMany({
      $or: [
        { email: emailRegex },
        { name: emailRegex },
        { userId: { $in: allIds } }
      ]
    });
    console.log(`Deleted ${apptResult.deletedCount} appointments`);

    const purchaseResult = await CoursePurchase.deleteMany({
      $or: [
        { email: emailRegex },
        { user: { $in: allIds } },
        { userId: { $in: allIds } }
      ]
    });
    console.log(`Deleted ${purchaseResult.deletedCount} course purchases`);

    const progressResult = await CourseProgress.deleteMany({
      $or: [
        { user: { $in: allIds } },
        { userId: { $in: allIds } }
      ]
    });
    console.log(`Deleted ${progressResult.deletedCount} course progress records`);

    const commentResult = await Comment.deleteMany({
      user: { $in: allIds }
    });
    console.log(`Deleted ${commentResult.deletedCount} comments`);

    const likeResult = await CommentLike.deleteMany({
      user: { $in: allIds }
    });
    console.log(`Deleted ${likeResult.deletedCount} comment likes`);

    const delCourseUserResult = await CourseUser.deleteMany({
      $or: [{ email: emailRegex }, { name: emailRegex }, { fullName: emailRegex }]
    });
    console.log(`Deleted ${delCourseUserResult.deletedCount} CourseUser records`);

    const delUserResult = await User.deleteMany({
      $or: [{ email: emailRegex }, { name: emailRegex }, { fullName: emailRegex }]
    });
    console.log(`Deleted ${delUserResult.deletedCount} User records`);

    console.log('Successfully cleaned up all records for:', targetEmail);
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

deleteUser();
