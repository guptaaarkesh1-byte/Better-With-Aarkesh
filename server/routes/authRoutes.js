import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import User from '../models/User.js';

const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

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

    // Generate 6-digit OTP
    const otp = generateOTP();
    
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

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailHtmlTemplate = `
        <table width="100%" bgcolor="#090909" cellpadding="0" cellspacing="0" style="background-color: #090909; margin: 0; padding: 40px 0; width: 100%;">
          <tr>
            <td align="center">
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #090909; color: #B8B1A7; text-align: left;">
                <div style="border: 1px solid #333333; border-radius: 10px; background-color: #111111; padding: 30px;">
                  <h2 style="color: #F5F2EB; text-align: center; margin-bottom: 20px;">Welcome to Better With Aarkesh!</h2>
                  <p style="font-size: 16px; line-height: 1.5;">Hi ${fullName},</p>
                  <p style="font-size: 16px; line-height: 1.5;">Thank you for starting your onboarding journey with us. Please use the following One-Time Password (OTP) to verify your email address:</p>
                  <div style="text-align: center; margin: 40px 0;">
                    <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #111111; background-color: #B98A56; padding: 12px 24px; border-radius: 6px; letter-spacing: 6px;">${otp}</span>
                  </div>
                  <p style="font-size: 14px; text-align: center; color: #888888;">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      `;

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Onboarding <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email - Better With Aarkesh',
        html: emailHtmlTemplate,
      });

      if (error) {
        console.error('Resend Error:', error);
        return res.status(500).json({ message: 'Failed to send OTP email' });
      }

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
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

    const otp = generateOTP();
    
    pendingPasswordResets.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailHtmlTemplate = `
        <table width="100%" bgcolor="#090909" cellpadding="0" cellspacing="0" style="background-color: #090909; margin: 0; padding: 40px 0; width: 100%;">
          <tr>
            <td align="center">
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #090909; color: #B8B1A7; text-align: left;">
                <div style="border: 1px solid #333333; border-radius: 10px; background-color: #111111; padding: 30px;">
                  <h2 style="color: #F5F2EB; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
                  <p style="font-size: 16px; line-height: 1.5;">Hi there,</p>
                  <p style="font-size: 16px; line-height: 1.5;">We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                  <div style="text-align: center; margin: 40px 0;">
                    <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #111111; background-color: #B98A56; padding: 12px 24px; border-radius: 6px; letter-spacing: 6px;">${otp}</span>
                  </div>
                  <p style="font-size: 14px; text-align: center; color: #888888;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      `;

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset OTP - Better With Aarkesh',
        html: emailHtmlTemplate,
      });

      if (error) {
        console.error('Resend Error:', error);
        return res.status(500).json({ message: 'Failed to send reset OTP email' });
      }

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send reset OTP email' });
    }
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
// @route   POST /api/auth/admin/login
// @desc    Admin login, initializes admin if doesn't exist
// @access  Public
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== 'admin@betterwithaarkesh.com') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    let adminUser = await User.findOne({ email });

    // Auto-initialize admin on first login attempt if missing
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser = await User.create({
        fullName: 'Administrator',
        email: 'admin@betterwithaarkesh.com',
        password: hashedPassword,
        isAdmin: true
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (isMatch && adminUser.isAdmin) {
      res.json({
        _id: adminUser._id,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
        token: generateToken(adminUser._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/admin/change-password
// @desc    Change admin password in DB
// @access  Private (Admin)
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/admin/change-password', protect, admin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const adminUser = await User.findById(req.user._id);

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);
    await adminUser.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Admin Password Change Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
