import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const updateContact = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGO_URI in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('settings');

    const contactSettings = {
      backButtonText: 'Back',
      headerBadge: 'Get In Touch',
      headerTitle: 'How can we support you?',
      headerSubtitle: 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.',
      cards: [
        {
          id: 'card-1',
          icon: 'email',
          title: 'Email Support',
          subtitle: 'We reply within 24 hours',
          items: [
            {
              id: 'item-1',
              label: '',
              value: 'coaching@betterwithaarkesh.com'
            }
          ]
        },
        {
          id: 'card-2',
          icon: 'phone',
          title: 'Phone Support',
          subtitle: '11am - 8pm (Mon-Sat)',
          items: [
            {
              id: 'item-2',
              label: '',
              value: '1234567890'
            }
          ]
        }
      ],
      addressTitle: 'Registered Office & Address',
      addressSubtitle: 'Official business details and communication location',
      operatingLocationLabel: 'Operating Location',
      operatingLocation: 'Mumbai, Maharashtra, India',
      operatingHoursLabel: 'Working Hours',
      operatingHours: 'Monday – Saturday, 11:00 AM – 8:00 PM IST',
      addressCtaText: 'Book 1:1 Coaching',
      addressCtaUrl: '/book'
    };

    await collection.updateOne(
      { key: 'contact_page_settings' },
      { $set: { key: 'contact_page_settings', value: contactSettings, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log('Successfully updated contact_page_settings with phone: 1234567890');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
};

updateContact();
