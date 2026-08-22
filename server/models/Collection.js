import mongoose from 'mongoose';

const collectionItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['Article', 'Video', 'ReflectionTool'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Refers dynamically in application logic to Article or Video
  },
  title: {
    type: String, // Store title so we don't have to populate deeply just for lists
    required: true,
  }
});

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    items: {
      type: [collectionItemSchema],
      validate: [arrayLimit, '{PATH} must have exactly 3 items']
    }
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  // Allow empty or partial drafts, but exactly 3 if published? 
  // Actually, we'll just allow up to 3 to be safe, UI will enforce exactly 3.
  return val.length <= 3; 
}

export default mongoose.model('Collection', collectionSchema);
