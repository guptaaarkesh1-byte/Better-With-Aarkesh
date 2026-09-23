import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';

dotenv.config();

const clean = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/better-with-aarkesh');
    console.log('Connected to DB');

    const all = await Article.find();
    console.log('Current DB articles count:', all.length);
    all.forEach(a => console.log(' - ' + a._id + ' | ' + a.title + ' | ' + (a.category || a.categoryId)));

    // Remove unwanted articles
    const delResult = await Article.deleteMany({
      $or: [
        { title: { $regex: /Argument Is Older/i } },
        { title: { $regex: /Solving the Conflict/i } },
        { title: { $regex: /dummy/i } },
        { title: { $regex: /Effective Communication/i } },
        { title: { $regex: /Building Resilience/i } }
      ]
    });
    console.log('Deleted articles count:', delResult.deletedCount);

    const remaining = await Article.find();
    console.log('Remaining articles count:', remaining.length);
    remaining.forEach(a => console.log(' - ' + a.title));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clean();
