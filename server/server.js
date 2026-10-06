import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import footerDocumentRoutes from './routes/footerDocumentRoutes.js';
import footerColumnRoutes from './routes/footerColumnRoutes.js';
import socialLinkRoutes from './routes/socialLinkRoutes.js';
import courseAuthRoutes from './routes/courseAuthRoutes.js';
import courseAdminRoutes from './routes/courseAdminRoutes.js';
import muxWebhookRoutes from './routes/muxWebhookRoutes.js';
import coursePublicRoutes from './routes/coursePublicRoutes.js';
import courseCardRoutes from './routes/courseCardRoutes.js';
import courseFaqRoutes from './routes/courseFaqRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import calRoutes from './routes/calRoutes.js';
import contactSettingsRoutes from './routes/contactSettingsRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import homeSettingsRoutes from './routes/homeSettingsRoutes.js';
import librarySettingsRoutes from './routes/librarySettingsRoutes.js';
import bookingSettingsRoutes from './routes/bookingSettingsRoutes.js';
import questionnaireRoutes from './routes/questionnaireRoutes.js';
import visualSettingsRoutes from './routes/visualSettingsRoutes.js';
import courseLandingSettingsRoutes from './routes/courseLandingSettingsRoutes.js';
import courseDetailSettingsRoutes from './routes/courseDetailSettingsRoutes.js';

import http from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  // Join lesson discussion room
  socket.on('join_lesson', (lessonId) => {
    if (lessonId) {
      socket.join(`lesson:${lessonId}`);
    }
  });

  socket.on('leave_lesson', (lessonId) => {
    if (lessonId) {
      socket.leave(`lesson:${lessonId}`);
    }
  });

  // Join admin discussion room
  socket.on('join_admin', () => {
    socket.join('admin');
  });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/course-auth', courseAuthRoutes);
app.use('/api/admin/courses', courseAdminRoutes);
app.use('/api/courses/cards', courseCardRoutes);
app.use('/api/courses/faqs', courseFaqRoutes);
app.use('/api/mux', muxWebhookRoutes);
app.use('/api/courses', coursePublicRoutes);
app.use('/api/cal', calRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/footer-documents', footerDocumentRoutes);
app.use('/api/footer-columns', footerColumnRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/contact-settings', contactSettingsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/home-settings', homeSettingsRoutes);
app.use('/api/library-settings', librarySettingsRoutes);
app.use('/api/booking-settings', bookingSettingsRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/visual-settings', visualSettingsRoutes);
app.use('/api/course-landing-settings', courseLandingSettingsRoutes);
app.use('/api/courses/landing-settings', courseLandingSettingsRoutes);
app.use('/api/course-detail-settings', courseDetailSettingsRoutes);
app.use('/api/courses/details-settings', courseDetailSettingsRoutes);

// Make static folders accessible to client and admin
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use('/assets', express.static(path.join(__dirname, '../client/src/assets')));
app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MONGO_URI is not defined in .env file. Skipping MongoDB connection.');
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

server.listen(PORT, () => {
  console.log(`Server is running with Socket.io on port ${PORT}`);
});
