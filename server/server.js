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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
