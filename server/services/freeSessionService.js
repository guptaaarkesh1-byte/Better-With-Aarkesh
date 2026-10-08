import mongoose from 'mongoose';
import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import Appointment from '../models/Appointment.js';
import Settings from '../models/Settings.js';
import Course from '../models/Course.js';
import { DEFAULT_COURSE_DETAILS_MAP } from '../routes/courseDetailSettingsRoutes.js';

export async function getDynamicCourseFreeSessions(slug = 'better-man') {
  try {
    const multiSetting = await Settings.findOne({ key: 'course_multi_details_settings' });
    const allDetails = { ...DEFAULT_COURSE_DETAILS_MAP, ...(multiSetting?.value || {}) };
    const cData = allDetails[slug] || allDetails['better-man'] || {};

    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const dbCourse = await Course.findOne(
      isObjectId ? { $or: [{ slug }, { _id: slug }] } : { slug }
    ).sort({ createdAt: 1 }) || await Course.findOne().sort({ createdAt: 1 });

    if (cData?.includeFreeSessions === false || dbCourse?.includeFreeSessions === false) {
      return 0;
    }
    if (cData?.freeSessionsCount !== undefined) {
      return Math.max(0, Number(cData.freeSessionsCount));
    }
    if (cData?.pricingSection?.freeSessionsCount !== undefined) {
      return Math.max(0, Number(cData.pricingSection.freeSessionsCount));
    }
    if (dbCourse?.freeSessionsCount !== undefined) {
      return Math.max(0, Number(dbCourse.freeSessionsCount));
    }
    if (dbCourse?.pricingSection?.freeSessionsCount !== undefined) {
      return Math.max(0, Number(dbCourse.pricingSection.freeSessionsCount));
    }
  } catch (err) {
    console.error('Error fetching dynamic course free sessions:', err.message);
  }
  return 5;
}

export async function calculateAndSyncFreeSessions(email) {
  if (!email || typeof email !== 'string') {
    return { totalGranted: 0, claimed: 0, remaining: 0, isCoursePurchaser: false };
  }

  const cleanEmail = email.trim().toLowerCase();
  const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

  try {
    const [courseUser, coachingUser, purchases, settingsDoc, allCourses] = await Promise.all([
      CourseUser.findOne({ email: emailRegex }),
      User.findOne({ email: emailRegex }),
      CoursePurchase.find({ studentEmail: emailRegex, paymentStatus: 'Paid' }),
      Settings.findOne({ key: 'course_multi_details_settings' }),
      Course.find()
    ]);

    const multiSettings = { ...DEFAULT_COURSE_DETAILS_MAP, ...(settingsDoc?.value || {}) };
    const isPurchased = Boolean(courseUser?.isPurchased || purchases.length > 0 || coachingUser?.courseSessionsGranted);

    if (!isPurchased) {
      if (coachingUser && coachingUser.freeSessions !== 0) {
        coachingUser.freeSessions = 0;
        coachingUser.courseSessionsGranted = false;
        await coachingUser.save();
      }
      return { totalGranted: 0, claimed: 0, remaining: 0, isCoursePurchaser: false };
    }

    const purchasedSlugs = new Set();
    if (Array.isArray(courseUser?.purchasedCourses)) {
      courseUser.purchasedCourses.forEach(s => s && purchasedSlugs.add(s));
    }
    purchases.forEach(p => {
      if (p.courseSlug) purchasedSlugs.add(p.courseSlug);
    });
    if (purchasedSlugs.size === 0) {
      purchasedSlugs.add('better-man');
    }

    let totalGranted = 0;
    for (const slug of purchasedSlugs) {
      const purchase = purchases.find(p => p.courseSlug === slug);
      if (purchase && purchase.freeSessionsGranted !== undefined && Number(purchase.freeSessionsGranted) > 0) {
        totalGranted += Number(purchase.freeSessionsGranted);
      } else if (coachingUser && coachingUser.freeSessions !== undefined && Number(coachingUser.freeSessions) > 0) {
        totalGranted += Number(coachingUser.freeSessions);
      } else {
        const cData = multiSettings[slug] || {};
        const dbCourse = allCourses.find(c => c.slug === slug || String(c._id) === slug);
        let freeCnt = 3;
        if (cData?.freeSessionsCount !== undefined && Number(cData.freeSessionsCount) > 0) {
          freeCnt = Math.max(0, Number(cData.freeSessionsCount));
        } else if (cData?.pricingSection?.freeSessionsCount !== undefined && Number(cData.pricingSection.freeSessionsCount) > 0) {
          freeCnt = Math.max(0, Number(cData.pricingSection.freeSessionsCount));
        } else if (dbCourse?.freeSessionsCount !== undefined && Number(dbCourse.freeSessionsCount) > 0) {
          freeCnt = Math.max(0, Number(dbCourse.freeSessionsCount));
        } else if (dbCourse?.pricingSection?.freeSessionsCount !== undefined && Number(dbCourse.pricingSection.freeSessionsCount) > 0) {
          freeCnt = Math.max(0, Number(dbCourse.pricingSection.freeSessionsCount));
        }
        totalGranted += (freeCnt > 0 ? freeCnt : 3);
      }
    }

    const relevantAppointments = await Appointment.find({
      email: emailRegex,
      status: { $ne: 'CANCELLED' }
    });

    let claimedCount = 0;
    for (const app of relevantAppointments) {
      if (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') claimedCount += 1;
      if (app.rescheduleRequest && app.rescheduleRequest.usedFreeSessionCredit === true) claimedCount += 1;
    }

    const remaining = Math.max(0, totalGranted - claimedCount);

    // Persist synchronously to keep MongoDB records in full agreement
    if (coachingUser) {
      coachingUser.freeSessions = remaining;
      coachingUser.courseSessionsGranted = true;
      await coachingUser.save();
    }
    if (courseUser) {
      courseUser.freeSessions = remaining;
      courseUser.courseSessionsGranted = true;
      await courseUser.save();
    }

    return {
      totalGranted,
      claimed: claimedCount,
      remaining,
      isCoursePurchaser: true
    };
  } catch (err) {
    console.error('Error in calculateAndSyncFreeSessions:', err);
    return { totalGranted: 5, claimed: 0, remaining: 5, isCoursePurchaser: true };
  }
}
