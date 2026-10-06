import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('🚀 Starting Cloudinary Bulk Upload Script...');
console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

const targetDirs = [
  path.join(__dirname, '..', '..', 'client', 'public'),
  path.join(__dirname, '..', '..', 'client', 'src', 'assets'),
  path.join(__dirname, '..', 'uploads'),
];

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.avif', '.gif']);

// Find all image files recursively
function getAllImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
        getAllImageFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.has(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function uploadToCloudinary(filePath) {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const relativeFolder = path.relative(path.join(__dirname, '..', '..'), path.dirname(filePath)).replace(/\\/g, '/');

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `better_with_aarkesh/${relativeFolder}`,
      public_id: `${baseName}_${Date.now().toString().slice(-4)}`,
      resource_type: 'auto',
      overwrite: true,
    });
    return result.secure_url;
  } catch (err) {
    console.error(`❌ Failed to upload ${filePath}:`, err.message);
    return null;
  }
}

async function run() {
  let allFiles = [];
  for (const d of targetDirs) {
    allFiles = getAllImageFiles(d, allFiles);
  }

  // Deduplicate
  allFiles = Array.from(new Set(allFiles));
  console.log(`📸 Found ${allFiles.length} images to upload.`);

  const urlMap = {};
  let successCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const rel = path.relative(path.join(__dirname, '..', '..'), file).replace(/\\/g, '/');
    console.log(`[${i + 1}/${allFiles.length}] Uploading: ${rel}...`);
    const secureUrl = await uploadToCloudinary(file);
    if (secureUrl) {
      urlMap[rel] = secureUrl;
      urlMap[path.basename(file)] = secureUrl;
      successCount++;
      console.log(`  ✅ Done -> ${secureUrl}`);
    }
  }

  // Save mapping file for future references
  const mapPath = path.join(__dirname, '..', 'cloudinary_image_map.json');
  fs.writeFileSync(mapPath, JSON.stringify(urlMap, null, 2));
  console.log(`\n🎉 Upload Completed! ${successCount}/${allFiles.length} images uploaded.`);
  console.log(`📄 Map saved to ${mapPath}`);

  // Connect to DB and update any local /uploads/... paths in database
  if (process.env.MONGO_URI) {
    try {
      console.log('\n🔄 Updating MongoDB image references to Cloudinary URLs...');
      await mongoose.connect(process.env.MONGO_URI);
      const db = mongoose.connection.db;

      // Update courses collection
      const coursesCollection = db.collection('courses');
      const courses = await coursesCollection.find({}).toArray();
      for (const course of courses) {
        let updated = false;
        let updateDoc = {};

        if (course.thumbnail && !course.thumbnail.startsWith('http')) {
          const key = path.basename(course.thumbnail);
          if (urlMap[key]) {
            updateDoc.thumbnail = urlMap[key];
            updated = true;
          }
        }

        if (updated) {
          await coursesCollection.updateOne({ _id: course._id }, { $set: updateDoc });
          console.log(`  Updated Course [${course.title || course._id}] thumbnail to Cloudinary URL.`);
        }
      }

      // Update users avatars
      const usersCollection = db.collection('users');
      const users = await usersCollection.find({}).toArray();
      for (const user of users) {
        if (user.avatar && !user.avatar.startsWith('http')) {
          const key = path.basename(user.avatar);
          if (urlMap[key]) {
            await usersCollection.updateOne({ _id: user._id }, { $set: { avatar: urlMap[key] } });
            console.log(`  Updated User [${user.email || user._id}] avatar to Cloudinary.`);
          }
        }
      }

      console.log('✅ MongoDB sync complete.');
      await mongoose.disconnect();
    } catch (dbErr) {
      console.error('Database update error:', dbErr.message);
    }
  }

  process.exit(0);
}

run();
