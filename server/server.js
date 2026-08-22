import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
import appointmentRoutes from './routes/appointmentRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import calRoutes from './routes/calRoutes.js';

app.use('/api/cal', calRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/collections', collectionRoutes);

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
