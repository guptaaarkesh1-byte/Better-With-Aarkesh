import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function check() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const users = await User.find({});
  console.log('Coaching Users in DB:', users.length);
  users.forEach(u => console.log(' -', u.email, '| id:', u._id));
  await mongoose.connection.close();
}
check().catch(console.error);
