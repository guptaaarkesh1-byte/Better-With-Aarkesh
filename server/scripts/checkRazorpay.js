import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const razorpay = await Settings.findOne({ key: 'razorpay' });
console.log('Razorpay in DB:', razorpay);

process.exit(0);
