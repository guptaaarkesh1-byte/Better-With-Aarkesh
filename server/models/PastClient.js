import mongoose from 'mongoose';

const pastClientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  firstBookedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const PastClient = mongoose.model('PastClient', pastClientSchema);
export default PastClient;
