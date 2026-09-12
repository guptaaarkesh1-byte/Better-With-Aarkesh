import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import CourseProgress from '../models/CourseProgress.js';
import Appointment from '../models/Appointment.js';
import Note from '../models/Note.js';

import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';

dotenv.config();

async function inspectAndClear() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const courseUsersCount = await CourseUser.countDocuments();
    const coursePurchasesCount = await CoursePurchase.countDocuments();
    const courseProgressCount = await CourseProgress.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    const notesCount = await Note.countDocuments();
    const commentsCount = await Comment.countDocuments();
    const commentLikesCount = await CommentLike.countDocuments();
    const nonAdminUsersCount = await User.countDocuments({ isAdmin: { $ne: true } });
    const adminUsersCount = await User.countDocuments({ isAdmin: true });

    console.log('--- BEFORE CLEAR ---');
    console.log('Course Users (Students):', courseUsersCount);
    console.log('Course Purchases:', coursePurchasesCount);
    console.log('Course Progress:', courseProgressCount);
    console.log('Appointments/Bookings:', appointmentsCount);
    console.log('Notes:', notesCount);
    console.log('Comments:', commentsCount);
    console.log('Comment Likes:', commentLikesCount);
    console.log('Non-Admin Client Users:', nonAdminUsersCount);
    console.log('Admin Users (will be preserved):', adminUsersCount);

    // Delete non-admin user records, student data, comments & bookings
    const delCourseUsers = await CourseUser.deleteMany({});
    const delCoursePurchases = await CoursePurchase.deleteMany({});
    const delCourseProgress = await CourseProgress.deleteMany({});
    const delAppointments = await Appointment.deleteMany({});
    const delNotes = await Note.deleteMany({});
    const delComments = await Comment.deleteMany({});
    const delCommentLikes = await CommentLike.deleteMany({});
    const delNonAdminUsers = await User.deleteMany({ isAdmin: { $ne: true } });

    console.log('--- AFTER CLEAR ---');
    console.log('Deleted Course Users:', delCourseUsers.deletedCount);
    console.log('Deleted Course Purchases:', delCoursePurchases.deletedCount);
    console.log('Deleted Course Progresses:', delCourseProgress.deletedCount);
    console.log('Deleted Appointments:', delAppointments.deletedCount);
    console.log('Deleted Notes:', delNotes.deletedCount);
    console.log('Deleted Comments:', delComments.deletedCount);
    console.log('Deleted Comment Likes:', delCommentLikes.deletedCount);
    console.log('Deleted Non-Admin Users:', delNonAdminUsers.deletedCount);

    const remainingAdmins = await User.find({ isAdmin: true }, 'fullName email isAdmin');
    console.log('Preserved Admin Users:', remainingAdmins);

    await mongoose.disconnect();
    console.log('Database cleaned successfully.');
  } catch (error) {
    console.error('Error clearing user data:', error);
    process.exit(1);
  }
}

inspectAndClear();
