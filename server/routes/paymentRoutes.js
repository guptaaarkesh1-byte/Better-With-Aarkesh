import express from 'express';
import Razorpay from 'razorpay';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to get Razorpay instance
const getRazorpayInstance = async () => {
  const settings = await Settings.findOne({ key: 'razorpay' });
  if (!settings || !settings.value || !settings.value.keyId || !settings.value.keySecret) {
    throw new Error('Razorpay keys not configured');
  }
  return new Razorpay({
    key_id: settings.value.keyId,
    key_secret: settings.value.keySecret,
  });
};

// @desc    Get Razorpay public key
// @route   GET /api/payment/public-key
// @access  Public
router.get('/public-key', async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'razorpay' });
    if (!settings || !settings.value || !settings.value.keyId) {
      return res.status(404).json({ message: 'Razorpay keys not configured' });
    }
    res.json({ keyId: settings.value.keyId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching key' });
  }
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
    
    const instance = await getRazorpayInstance();
    
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
});

// @desc    Get Razorpay Settings (Admin)
// @route   GET /api/payment/settings
// @access  Private/Admin
router.get('/settings', admin, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'razorpay' });
    if (!settings) {
      return res.json({ keyId: '', keySecret: '' });
    }
    res.json(settings.value);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @desc    Update Razorpay Settings (Admin)
// @route   POST /api/payment/settings
// @access  Private/Admin
router.post('/settings', admin, async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    
    let settings = await Settings.findOne({ key: 'razorpay' });
    
    if (settings) {
      settings.value = { keyId, keySecret };
      await settings.save();
    } else {
      settings = await Settings.create({
        key: 'razorpay',
        value: { keyId, keySecret }
      });
    }
    
    res.json({ message: 'Razorpay settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

export default router;
