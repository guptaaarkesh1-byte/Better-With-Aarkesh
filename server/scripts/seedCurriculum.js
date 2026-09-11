import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import CourseLesson from '../models/CourseLesson.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Find or create primary course
  let course = await Course.findOne();
  if (!course) {
    course = await Course.create({
      title: 'The Presence Protocol™',
      slug: 'the-presence-protocol',
      subtitle: 'Master the psychology of calm authority, magnetic communication, and effortless self-command.',
      description: 'The definitive masterclass designed for high-impact leaders, founders, and professionals.',
      price: 15000,
      comparePrice: 25000,
      duration: '3.5 Hours',
      level: 'Masterclass',
      instructor: 'Aarkesh Gupta',
      status: 'Published',
    });
  }

  // Clear existing modules and lessons for this course
  await CourseModule.deleteMany({ courseId: course._id });
  await CourseLesson.deleteMany({ courseId: course._id });

  const dummyData = [
    {
      title: 'Day 1: The Foundation of Presence',
      description: 'Master grounding techniques, psychological anchoring, and inner stillness under pressure.',
      position: 0,
      lessons: [
        {
          title: 'Introduction to Inner Stillness',
          description: 'In this opening session, we explore the biology of nervous system regulation and how to immediately anchor yourself before walking into high-stakes environments.',
          duration: '12:30',
          position: 0,
          isFreePreview: true,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: [
            {
              title: 'Day 1 Grounding Exercise Worksheet.pdf',
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              fileSize: '1.2 MB'
            }
          ]
        },
        {
          title: 'Breaking the Reactive Cycle',
          description: 'Learn how to insert a deliberate micro-pause between external triggers and your physical response.',
          duration: '18:15',
          position: 1,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: []
        },
        {
          title: 'Guided Grounding & Breathwork Meditation',
          description: 'A 15-minute daily practice to reset baseline stress levels and project centered calm authority.',
          duration: '15:00',
          position: 2,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: []
        }
      ]
    },
    {
      title: 'Day 2: Mastering High-Stakes Communication',
      description: 'The art of active listening, body language micro-adjustments, and asserting authentic boundaries.',
      position: 1,
      lessons: [
        {
          title: 'The Art of Active Listening & Emotional Framing',
          description: 'Discover how elite communicators make others feel completely heard while maintaining conversational control.',
          duration: '22:10',
          position: 0,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: [
            {
              title: 'Active Listening & Tone Modulation Guide.pdf',
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              fileSize: '2.4 MB'
            }
          ]
        },
        {
          title: 'Reading Non-Verbal Cues & Room Dynamics',
          description: 'Decoding micro-expressions, posture shifts, and subtext in boardroom and social settings.',
          duration: '28:45',
          position: 1,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: []
        },
        {
          title: 'Expressing Authentic Boundaries Without Friction',
          description: 'Saying no with absolute clarity, grace, and zero defensive posture.',
          duration: '24:20',
          position: 2,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: []
        }
      ]
    },
    {
      title: 'Day 3: Leadership & Unshakable Authority',
      description: 'Cultivate magnetic charisma, command respect effortlessly, and sustain long-term executive presence.',
      position: 2,
      lessons: [
        {
          title: 'Cultivating Charisma & Magnetic Energy',
          description: 'The exact psychological principles that draw people in and make your presence unforgettable.',
          duration: '30:00',
          position: 0,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: [
            {
              title: 'Executive Presence Blueprint & Checklist.pdf',
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              fileSize: '3.1 MB'
            }
          ]
        },
        {
          title: 'Leading with Vulnerability & Command',
          description: 'Balancing strength with authentic openness to inspire loyalty and trust.',
          duration: '25:15',
          position: 1,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: []
        },
        {
          title: 'The Ripple Effect: Sustaining Your Daily Presence',
          description: 'Integrating the Presence Protocol into your morning routines, key meetings, and long-term career.',
          duration: '35:45',
          position: 2,
          videoStatus: 'ready',
          muxPlaybackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O012014022n844',
          resources: []
        }
      ]
    }
  ];

  for (const modData of dummyData) {
    const { lessons, ...modFields } = modData;
    const module = await CourseModule.create({
      courseId: course._id,
      ...modFields,
      isPublished: true,
    });
    console.log(`Created Module: ${module.title}`);

    for (const lessonData of lessons) {
      const lesson = await CourseLesson.create({
        courseId: course._id,
        moduleId: module._id,
        ...lessonData,
        isPublished: true,
      });
      console.log(`  -> Created Lesson: ${lesson.title}`);
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
