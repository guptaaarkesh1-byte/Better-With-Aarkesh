import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.js';

async function checkAdminPass() {
  await mongoose.connect(process.env.MONGO_URI);
  let adminUser = await User.findOne({ 
    $or: [{ email: 'admin@betterwithaarkesh.com' }, { email: 'admin@aarkeshgupta.com' }, { isAdmin: true }] 
  });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);
    adminUser = await User.create({
      fullName: 'Administrator',
      email: 'admin@betterwithaarkesh.com',
      password,
      isAdmin: true
    });
    console.log('Created admin user');
  } else {
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash('admin123', salt);
    adminUser.isAdmin = true;
    await adminUser.save();
    console.log('Updated admin password to admin123 for:', adminUser.email);
  }
  await mongoose.disconnect();
}

checkAdminPass();
