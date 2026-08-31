import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FooterDocument from './models/FooterDocument.js';

dotenv.config();

const seedFooter = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    const privacyPolicy = await FooterDocument.findOne({ slug: 'privacy-policy' });
    if (!privacyPolicy) {
      await FooterDocument.create({
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        contentHtml: '<h1>Privacy Policy</h1><p>Your privacy policy content goes here...</p>',
        status: 'Published',
        order: 1
      });
      console.log('Created Privacy Policy default page');
    }

    const terms = await FooterDocument.findOne({ slug: 'terms-and-conditions' });
    if (!terms) {
      await FooterDocument.create({
        title: 'Terms & Conditions',
        slug: 'terms-and-conditions',
        contentHtml: '<h1>Terms & Conditions</h1><p>Your terms and conditions content goes here...</p>',
        status: 'Published',
        order: 2
      });
      console.log('Created Terms & Conditions default page');
    }

    const rescheduling = await FooterDocument.findOne({ slug: 'rescheduling-policy' });
    if (!rescheduling) {
      await FooterDocument.create({
        title: 'Rescheduling Policy',
        slug: 'rescheduling-policy',
        contentHtml: '<h1>Rescheduling Policy</h1><p>Your rescheduling policy content goes here...</p>',
        status: 'Published',
        order: 3
      });
      console.log('Created Rescheduling Policy default page');
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedFooter();
