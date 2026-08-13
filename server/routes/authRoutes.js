import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// In-memory store for pending registrations (OTP mock)
const pendingRegistrations = new Map();

// In-memory store for pending password resets (OTP mock)
const pendingPasswordResets = new Map();

// @route   POST /api/auth/register-init
// @desc    Initiate registration and send OTP
// @access  Public
router.post('/register-init', async (req, res) => {
  try {
    const { fullName, email, password, countryCode, phoneNumber } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email ID already exists. Use a different one.' });
    }

    // Generate 4-digit OTP (hardcoded to 1234 for testing)
    const otp = '1234';
    
    // Store in memory for 10 minutes
    pendingRegistrations.set(email, {
      fullName,
      email,
      password,
      countryCode,
      phoneNumber,
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    // MOCK EMAIL SENDING
    console.log(`\n==========================================`);
    console.log(`MOCK EMAIL SENT TO: ${email}`);
    console.log(`YOUR REGISTRATION OTP IS: ${otp}`);
    console.log(`==========================================\n`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Init Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register-verify
// @desc    Verify OTP and register user
// @access  Public
router.post('/register-verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingData = pendingRegistrations.get(email);

    if (!pendingData) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try registering again.' });
    }

    if (pendingData.expires < Date.now()) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please try registering again.' });
    }

    if (pendingData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, proceed with user creation
    const { fullName, password, countryCode, phoneNumber } = pendingData;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email ID already exists. Use a different one.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      countryCode,
      phoneNumber,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        dob: user.dob,
        gender: user.gender,
        token: generateToken(user._id),
      });
      // Clear pending data
      pendingRegistrations.delete(email);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Verify Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User account does not exist, please register first' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        dob: user.dob,
        gender: user.gender,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   POST /api/auth/forgot-password-init
// @desc    Initiate forgot password and send OTP
// @access  Public
router.post('/forgot-password-init', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User account does not exist' });
    }

    const otp = '1234'; // hardcoded for testing
    
    pendingPasswordResets.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    console.log(`\n==========================================`);
    console.log(`MOCK PASSWORD RESET EMAIL SENT TO: ${email}`);
    console.log(`YOUR PASSWORD RESET OTP IS: ${otp}`);
    console.log(`==========================================\n`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot Password Init Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password-reset
// @desc    Verify OTP and reset password
// @access  Public
router.post('/forgot-password-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const pendingData = pendingPasswordResets.get(email);
    if (!pendingData) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try again.' });
    }

    if (pendingData.expires < Date.now()) {
      pendingPasswordResets.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please try again.' });
    }

    if (pendingData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    pendingPasswordResets.delete(email);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Forgot Password Reset Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
