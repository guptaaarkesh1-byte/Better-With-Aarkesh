import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const appointmentSchema = new mongoose.Schema({
  date: String,
  status: String,
  isFreeSession: Boolean,
}, { strict: false, timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const all = await Appointment.find({ status: 'COMPLETED' });
    let fixed = 0;
    for (const app of all) {
      const parts = app.date ? app.date.split('-') : [];
      let d;
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = new Date(app.date);
      }
      if (!isNaN(d) && d >= today) {
        await Appointment.findByIdAndUpdate(app._id, { status: 'UPCOMING' });
        console.log(`Reset to UPCOMING: ${app.date} ${app._id}`);
        fixed++;
      }
    }
    console.log(`Fixed ${fixed} appointment(s). Done!`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

fix();
