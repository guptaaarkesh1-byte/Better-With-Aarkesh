import express from 'express';
import Razorpay from 'razorpay';
import Settings from '../models/Settings.js';
import Appointment from '../models/Appointment.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

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

// @desc    Get Session Fees
// @route   GET /api/payment/fees
// @access  Public
router.get('/fees', async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'fees' });
    if (!settings) {
      return res.json({ fee60min: 5000, fee90min: 7500 });
    }
    res.json(settings.value);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching fees' });
  }
});

// @desc    Update Session Fees
// @route   POST /api/payment/fees
// @access  Private/Admin
router.post('/fees', protect, admin, async (req, res) => {
  try {
    const { fee60min, fee90min } = req.body;
    let settings = await Settings.findOne({ key: 'fees' });
    if (settings) {
      settings.value = { fee60min, fee90min };
      await settings.save();
    } else {
      await Settings.create({
        key: 'fees',
        value: { fee60min, fee90min }
      });
    }
    res.json({ message: 'Fees updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating fees' });
  }
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public/Optional
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { email, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
    
    // 1. Determine if first session
    let isFirstSession = true;
    if (email) {
      const pastAppointments = await Appointment.countDocuments({ email: email });
      isFirstSession = pastAppointments === 0;
    }

    // 2. Fetch fees from settings
    let feeSettings = await Settings.findOne({ key: 'fees' });
    let fee60min = 5000;
    let fee90min = 7500;
    if (feeSettings && feeSettings.value) {
      fee60min = feeSettings.value.fee60min || 5000;
      fee90min = feeSettings.value.fee90min || 7500;
    }

    // 3. Calculate dynamic amount
    const amount = isFirstSession ? fee60min : fee90min;
    
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
router.get('/settings', protect, admin, async (req, res) => {
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
router.post('/settings', protect, admin, async (req, res) => {
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
