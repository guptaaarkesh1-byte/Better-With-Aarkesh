import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import CourseUser from '../models/CourseUser.js';

const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

const pendingRegistrations = new Map();
const pendingPasswordResets = new Map();

// @route   POST /api/course-auth/register-init
router.post('/register-init', async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    const userExists = await CourseUser.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email ID already exists for the course. Please log in.' });
    }

    const otp = generateOTP();
    
    pendingRegistrations.set(email, {
      fullName,
      email,
      password,
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
                  <h2 style="color: #F5F2EB; text-align: center; margin-bottom: 20px;">Welcome to the Course!</h2>
                  <p style="font-size: 16px; line-height: 1.5;">Hi ${fullName},</p>
                  <p style="font-size: 16px; line-height: 1.5;">Thank you for registering for the course. Please use the following One-Time Password (OTP) to verify your email address:</p>
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
        from: process.env.EMAIL_FROM || 'Course Onboarding <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your course registration - Better With Aarkesh',
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

// @route   POST /api/course-auth/register-verify
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

    const { fullName, password, phoneNumber } = pendingData;

    const userExists = await CourseUser.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email ID already exists for the course.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await CourseUser.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isPurchased: user.isPurchased,
        token: generateToken(user._id),
      });
      pendingRegistrations.delete(email);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Course Registration Verify Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/course-auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await CourseUser.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User account does not exist. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isPurchased: user.isPurchased,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Course Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/course-auth/forgot-password-init
router.post('/forgot-password-init', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await CourseUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Course user account does not exist' });
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
                  <h2 style="color: #F5F2EB; text-align: center; margin-bottom: 20px;">Course Password Reset</h2>
                  <p style="font-size: 16px; line-height: 1.5;">Hi there,</p>
                  <p style="font-size: 16px; line-height: 1.5;">We received a request to reset your course password. Please use the following One-Time Password (OTP) to proceed:</p>
                  <div style="text-align: center; margin: 40px 0;">
                    <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #111111; background-color: #B98A56; padding: 12px 24px; border-radius: 6px; letter-spacing: 6px;">${otp}</span>
                  </div>
                  <p style="font-size: 14px; text-align: center; color: #888888;">This OTP is valid for 10 minutes.</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      `;

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Course Support <onboarding@resend.dev>',
        to: email,
        subject: 'Course Password Reset OTP - Better With Aarkesh',
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
    console.error('Course Forgot Password Init Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/course-auth/forgot-password-reset
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

    await CourseUser.findOneAndUpdate({ email }, { password: hashedPassword });
    pendingPasswordResets.delete(email);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Course Forgot Password Reset Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
