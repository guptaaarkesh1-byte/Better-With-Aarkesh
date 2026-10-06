import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Settings from '../models/Settings.js';
import CourseLesson from '../models/CourseLesson.js';
import Course from '../models/Course.js';

async function clearCourseVideos() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/better-with-aarkesh';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('--- Clearing All Course Videos & Streaming Sources ---');

    // 1. Clear CourseLesson videos in MongoDB
    const lessonRes = await CourseLesson.updateMany({}, {
      $set: {
        videoUrl: null,
        youtubeUrl: null,
        youtubeVideoId: null,
        muxPlaybackId: null,
        muxAssetId: null,
        muxUploadId: null,
        videoStatus: 'pending',
        videoSourceType: 'mux'
      }
    });
    console.log(`Updated CourseLesson documents cleared: ${lessonRes.modifiedCount}`);

    // 2. Clear Course trailers
    const courseRes = await Course.updateMany({}, {
      $set: {
        trailerVideoUrl: null,
        trailerVideoMuxPlaybackId: null
      }
    });
    console.log(`Updated Course documents trailers cleared: ${courseRes.modifiedCount}`);

    // 3. Clear video sources from Settings (course_details_map and course_details_*)
    const allDetailSettings = await Settings.find({
      key: { $regex: /^course_details/ }
    });

    for (const setting of allDetailSettings) {
      const val = setting.value;
      if (!val) continue;

      if (setting.key === 'course_details_map') {
        Object.keys(val).forEach(slug => {
          const courseObj = val[slug];
          if (courseObj) {
            courseObj.trailer = '';
            courseObj.trailerVideo = '';
            courseObj.trailerMuxPlaybackId = '';
            if (courseObj.heroSection) {
              courseObj.heroSection.trailerVideo = '';
            }
            if (Array.isArray(courseObj.days)) {
              courseObj.days.forEach(day => {
                if (Array.isArray(day.lessons)) {
                  day.lessons.forEach(lesson => {
                    lesson.src = null;
                    lesson.muxPlaybackId = null;
                    lesson.videoUrl = null;
                    lesson.youtubeUrl = null;
                  });
                }
              });
            }
          }
        });
      } else {
        // Individual course settings object
        val.trailer = '';
        val.trailerVideo = '';
        val.trailerMuxPlaybackId = '';
        if (val.heroSection) {
          val.heroSection.trailerVideo = '';
        }
        if (Array.isArray(val.days)) {
          val.days.forEach(day => {
            if (Array.isArray(day.lessons)) {
              day.lessons.forEach(lesson => {
                lesson.src = null;
                lesson.muxPlaybackId = null;
                lesson.videoUrl = null;
                lesson.youtubeUrl = null;
              });
            }
          });
        }
      }

      setting.markModified('value');
      await setting.save();
      console.log(`Updated Settings record: ${setting.key}`);
    }

    console.log('✅ All course videos removed successfully! All lessons now ready for fresh video uploads.');
  } catch (err) {
    console.error('Error clearing course videos:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearCourseVideos();
