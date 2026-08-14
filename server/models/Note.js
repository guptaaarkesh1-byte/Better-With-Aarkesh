import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  attachedTo: {
    type: String,
    trim: true,
    default: 'Standalone note'
  }
}, {
  timestamps: true
});

export default mongoose.model('Note', noteSchema);
