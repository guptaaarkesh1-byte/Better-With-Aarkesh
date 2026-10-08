import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));
  
  const res = await Article.updateMany({}, { status: 'Published' });
  console.log('Updated articles to Published:', res.modifiedCount);

  const published = await Article.find({ status: 'Published' }).lean();
  console.log('Total Published in MongoDB:', published.length);
  published.forEach((a, i) => console.log(`${i+1}. [${a.category}] ${a.title}`));

  await mongoose.disconnect();
};
run();
