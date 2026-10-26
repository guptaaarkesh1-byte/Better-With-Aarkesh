import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

// Default baseline of strictly authorized Administrator emails
export const DEFAULT_ADMIN_EMAILS = [
  'guptaaarkesh1@gmail.com',
  'admin@aarkeshgupta.com',
  'admin@betterwithaarkesh.com',
  'yashrajsingh28359@gmail.com',
  'gauravajm@gmail.com',
  'merakimovies@gmail.com',
];

// In-memory OTP storage: key -> { otp, expires, attempts, lastSentAt, purpose }
const otpStore = new Map();

// Daily count storage: email:YYYY-MM-DD -> count
const dailyCountStore = new Map();

// Constants for security and rate limiting
const OTP_COOLDOWN_SECONDS = 30;
const OTP_EXPIRY_MINUTES = 2; // OTP valid for 2 minutes
const MAX_DAILY_OTP_ATTEMPTS = 5; // Max 5 OTPs per day per email
const MAX_FAILED_ATTEMPTS = 5; // Max 5 failed attempts per OTP

/**
 * Format IST Date string (YYYY-MM-DD)
 */
const getTodayDateStr = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10);
};

/**
 * Normalize email string
 */
export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

/**
 * Generate 4-digit numeric OTP
 */
export const generateOtp = (length = 4) => {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(length, '0');
};

/**
 * Returns dynamic authorized admin email list from Settings in MongoDB or defaults
 */
export const getAllowedAdminEmails = async () => {
  try {
    let settingDoc = await Settings.findOne({ key: 'authorizedAdminEmails' });
    if (settingDoc && Array.isArray(settingDoc.value) && settingDoc.value.length > 0) {
      const dbEmails = settingDoc.value
        .map((e) => normalizeEmail(e))
        .filter(Boolean);
      if (dbEmails.length > 0) {
        return Array.from(new Set(dbEmails));
      }
    } else if (!settingDoc) {
      // Auto-initialize in Settings
      const initialList = Array.from(new Set([
        ...DEFAULT_ADMIN_EMAILS.map(normalizeEmail),
        ...(process.env.ADMIN_EMAIL ? [normalizeEmail(process.env.ADMIN_EMAIL)] : []),
        ...(process.env.ALLOWED_ADMIN_EMAILS ? process.env.ALLOWED_ADMIN_EMAILS.split(',').map(normalizeEmail) : [])
      ])).filter(Boolean);

      try {
        await Settings.create({
          key: 'authorizedAdminEmails',
          value: initialList
        });
      } catch (_) {}

      return initialList;
    }
  } catch (err) {
    console.error('Error fetching authorizedAdminEmails from db:', err);
  }

  const envList = (process.env.ALLOWED_ADMIN_EMAILS || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
  const singleAdmin = process.env.ADMIN_EMAIL ? [normalizeEmail(process.env.ADMIN_EMAIL)] : [];

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...singleAdmin, ...envList]));
};

/**
 * Helper to verify if an email is authorized
 */
export const isEmailAuthorized = async (email) => {
  if (!email) return false;
  const clean = normalizeEmail(email);
  const allowed = await getAllowedAdminEmails();
  return allowed.includes(clean);
};

/**
 * Send branded HTML email with OTP via Resend
 */
const sendAdminOtpMail = async ({ email, otp, purpose = 'admin:login' }) => {
  const cleanEmail = normalizeEmail(email);
  const isAddAdmin = purpose === 'admin:add-email';

  const subject = isAddAdmin
    ? 'Verify New Administrator Email - Better With Aarkesh'
    : 'Admin Portal Verification Code - Better With Aarkesh';

  const title = isAddAdmin
    ? 'Confirm New Administrator'
    : 'Admin Portal Access';

  const message = isAddAdmin
    ? 'You are adding this email to the authorized administrator whitelist for <strong>Better With Aarkesh</strong>. Please enter the verification passcode below to confirm authorization:'
    : 'A login request was initiated for the <strong>Better With Aarkesh Admin Portal</strong>. Please enter the secure one-time passcode below to complete your authentication:';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f1f1f;">
      <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; padding: 36px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 14px 40px rgba(40, 30, 20, 0.06);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 36px 20px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="font-size: 22px; font-weight: bold; color: #111111; letter-spacing: -0.5px; font-family: Georgia, serif;">
                          BetterWith<span style="color: #c9542f;">Aarkesh</span>
                        </div>
                        <div style="font-size: 11px; color: #c9542f; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                          Admin Security Portal
                        </div>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; padding: 5px 12px; background-color: rgba(201, 84, 47, 0.1); border: 1px solid rgba(201, 84, 47, 0.3); color: #c9542f; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 6px;">
                          SECURE OTP
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Content Body -->
              <tr>
                <td style="padding: 34px 36px 28px;">
                  <h2 style="margin: 0 0 12px; font-size: 22px; color: #111111; font-weight: 600; font-family: Georgia, serif;">
                    ${title}
                  </h2>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #555555; line-height: 1.6;">
                    ${message}
                  </p>
                  <!-- OTP Box -->
                  <div style="text-align: center; margin: 28px 0 26px;">
                    <div style="display: inline-block; background-color: #FAF4EF; border: 1.5px solid #c9542f; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 16px rgba(201, 84, 47, 0.12);">
                      <span style="font-size: 34px; font-weight: 800; color: #c9542f; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace;">${otp}</span>
                    </div>
                  </div>
                  <!-- Validity Notice -->
                  <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 10px; padding: 14px 18px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5;">
                      ⏳ This verification passcode is valid for <strong style="color: #c9542f;">2 minutes</strong>. Strictly for authorized administrators only. Never share this code with anyone.
                    </p>
                  </div>
                  <p style="margin: 22px 0 0; font-size: 12px; color: #888888; line-height: 1.5;">
                    If you did not request this verification code, please ignore this email or review your administrator security settings.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 18px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #777777; line-height: 1.6;">
                  <div>Better With Aarkesh · Executive Leadership & Mindset Coaching</div>
                  <div>Direct Support: <a href="mailto:coaching@aarkeshgupta.com" style="color: #c9542f; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  console.log(`\n========================================`);
  console.log(`🔐 [ADMIN OTP] ${cleanEmail} -> OTP: ${otp} (Purpose: ${purpose})`);
  console.log(`========================================\n`);

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not found in environment.');
      return { success: true, message: 'OTP generated (Dev Mode: see server logs)', devOtp: otp };
    }

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: cleanEmail,
      subject,
      html,
    });

    if (error) {
      console.warn('⚠️ Resend email sending warning:', error.message || error);
      return { success: true, message: 'OTP generated (Dev Mode)', devOtp: otp };
    }

    return { success: true, message: 'OTP sent successfully.' };
  } catch (err) {
    console.warn('⚠️ Email send exception:', err.message);
    return { success: true, message: 'OTP generated (Dev Mode)', devOtp: otp };
  }
};

/**
 * @desc    Send OTP to authorized admin email
 * @route   POST /api/admin/auth/send-otp
 * @access  Public (Strictly restricted to Whitelisted Admin Emails)
 */
export const sendAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your admin email address.',
      });
    }

    const cleanEmail = normalizeEmail(email);

    // 1. STRICT WHITELIST CHECK: Reject immediately if not authorized
    const authorized = await isEmailAuthorized(cleanEmail);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This email is not authorized for Admin access.',
      });
    }

    const todayStr = getTodayDateStr();
    const dailyKey = `${cleanEmail}:${todayStr}`;
    const dailyCount = dailyCountStore.get(dailyKey) || 0;

    // 2. DAILY LIMIT CHECK (Max 5 per day)
    if (dailyCount >= MAX_DAILY_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Daily OTP limit reached (maximum 5 times per day). Please contact our support team at coaching@aarkeshgupta.com for assistance.',
        dailyLimitReached: true,
        maxDaily: MAX_DAILY_OTP_ATTEMPTS,
      });
    }

    // 3. COOLDOWN CHECK (30 seconds)
    const storeKey = `admin:login:${cleanEmail}`;
    const existing = otpStore.get(storeKey);
    const now = Date.now();

    if (existing && existing.lastSentAt) {
      const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
      if (elapsedSeconds < OTP_COOLDOWN_SECONDS) {
        const remaining = OTP_COOLDOWN_SECONDS - elapsedSeconds;
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new code.`,
          cooldownRemaining: remaining,
        });
      }
    }

    // 4. Generate & store OTP
    const otp = generateOtp(4);
    otpStore.set(storeKey, {
      otp,
      expires: now + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
      purpose: 'admin:login',
    });

    // Increment daily count
    dailyCountStore.set(dailyKey, dailyCount + 1);

    // 5. Send OTP Email
    await sendAdminOtpMail({
      email: cleanEmail,
      otp,
      purpose: 'admin:login',
    });

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    console.error('sendAdminOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.',
    });
  }
};

/**
 * @desc    Resend OTP to authorized admin email
 * @route   POST /api/admin/auth/resend-otp
 * @access  Public (Strictly restricted to Whitelisted Admin Emails)
 */
export const resendAdminOtp = async (req, res) => {
  return sendAdminOtp(req, res);
};

/**
 * @desc    Verify OTP and generate Admin authentication token
 * @route   POST /api/admin/auth/verify-otp
 * @access  Public (Strictly restricted to Whitelisted Admin Emails)
 */
export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP verification code are both required.',
      });
    }

    const cleanEmail = normalizeEmail(email);

    // STRICT WHITELIST CHECK
    const authorized = await isEmailAuthorized(cleanEmail);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This email is not authorized for Admin access.',
      });
    }

    const storeKey = `admin:login:${cleanEmail}`;
    const stored = otpStore.get(storeKey);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP session expired or not found. Please request a new verification code.',
      });
    }

    const now = Date.now();
    if (now > stored.expires) {
      otpStore.delete(storeKey);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    if (stored.attempts >= MAX_FAILED_ATTEMPTS) {
      otpStore.delete(storeKey);
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.',
      });
    }

    const cleanOtp = String(otp).trim();
    if (stored.otp !== cleanOtp) {
      stored.attempts += 1;
      const remaining = MAX_FAILED_ATTEMPTS - stored.attempts;
      if (remaining <= 0) {
        otpStore.delete(storeKey);
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts exceeded. Please request a new code.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Invalid code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      });
    }

    // OTP is valid! Remove from store to prevent replay
    otpStore.delete(storeKey);

    // Ensure User exists and has isAdmin = true
    let adminUser = await User.findOne({ email: cleanEmail });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);
      adminUser = await User.create({
        fullName: 'Administrator',
        email: cleanEmail,
        password: hashedPassword,
        isAdmin: true,
      });
    } else if (!adminUser.isAdmin) {
      adminUser.isAdmin = true;
      await adminUser.save();
    }

    // Generate Admin JWT Token (30 days validity)
    const token = jwt.sign(
      { id: adminUser._id, email: cleanEmail, role: 'admin', isAdmin: true },
      process.env.JWT_SECRET || 'better_with_aarkesh_jwt_secret_key_2026_super_secure',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        _id: adminUser._id,
        email: cleanEmail,
        fullName: adminUser.fullName || 'Administrator',
        role: 'admin',
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error('verifyAdminOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying code. Please try again.',
    });
  }
};

/**
 * @desc    Get allowed admin emails for public client pre-check
 * @route   GET /api/admin/auth/allowed-emails
 * @access  Public
 */
export const getPublicAllowedAdminEmails = async (req, res) => {
  try {
    const emails = await getAllowedAdminEmails();
    return res.status(200).json({
      success: true,
      emails,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      emails: DEFAULT_ADMIN_EMAILS,
    });
  }
};

/**
 * @desc    Send verification OTP before adding an email as Admin
 * @route   POST /api/admin/auth/emails/send-otp
 * @access  Private (Admin only)
 */
export const sendAddAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const cleanEmail = normalizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const currentList = await getAllowedAdminEmails();
    if (currentList.includes(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in the authorized administrator list.',
      });
    }

    const storeKey = `admin:add-email:${cleanEmail}`;
    const existing = otpStore.get(storeKey);
    const now = Date.now();

    if (existing && existing.lastSentAt) {
      const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
      if (elapsedSeconds < OTP_COOLDOWN_SECONDS) {
        const remaining = OTP_COOLDOWN_SECONDS - elapsedSeconds;
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining}s before requesting a new code.`,
          cooldownRemaining: remaining,
        });
      }
    }

    const otp = generateOtp(4);
    otpStore.set(storeKey, {
      otp,
      expires: now + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
      purpose: 'admin:add-email',
    });

    await sendAdminOtpMail({
      email: cleanEmail,
      otp,
      purpose: 'admin:add-email',
    });

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please enter the code to confirm authorization.`,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    console.error('sendAddAdminOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code to this email.',
    });
  }
};

/**
 * @desc    Resend verification OTP for adding admin email
 * @route   POST /api/admin/auth/emails/resend-otp
 * @access  Private (Admin only)
 */
export const resendAddAdminOtp = async (req, res) => {
  return sendAddAdminOtp(req, res);
};

/**
 * @desc    Verify OTP and Add a new authorized admin email
 * @route   POST /api/admin/auth/emails
 * @access  Private (Admin only)
 */
export const addAuthorizedAdminEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Verification OTP code is required to authorize this email as Administrator.',
      });
    }

    const cleanEmail = normalizeEmail(email);
    const storeKey = `admin:add-email:${cleanEmail}`;
    const stored = otpStore.get(storeKey);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP session expired or not found. Please request a new verification code.',
      });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(storeKey);
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request a new code.',
      });
    }

    if (stored.otp !== String(otp).trim()) {
      stored.attempts += 1;
      const remaining = MAX_FAILED_ATTEMPTS - stored.attempts;
      if (remaining <= 0) {
        otpStore.delete(storeKey);
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new code.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      });
    }

    // Code verified! Remove from store
    otpStore.delete(storeKey);

    // Save into Settings
    let settingDoc = await Settings.findOne({ key: 'authorizedAdminEmails' });
    let currentList = [];

    if (settingDoc && Array.isArray(settingDoc.value)) {
      currentList = settingDoc.value.map(normalizeEmail);
    } else {
      currentList = await getAllowedAdminEmails();
    }

    if (!currentList.includes(cleanEmail)) {
      currentList.push(cleanEmail);
    }

    const updatedList = Array.from(new Set(currentList));

    if (settingDoc) {
      settingDoc.value = updatedList;
      await settingDoc.save();
    } else {
      await Settings.create({
        key: 'authorizedAdminEmails',
        value: updatedList,
      });
    }

    // Also ensure User in DB has isAdmin = true if exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && !existingUser.isAdmin) {
      existingUser.isAdmin = true;
      await existingUser.save();
    }

    return res.status(200).json({
      success: true,
      message: `${cleanEmail} verified and successfully added to authorized administrators.`,
      emails: updatedList,
    });
  } catch (error) {
    console.error('addAuthorizedAdminEmail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authorize admin email.',
    });
  }
};

/**
 * @desc    Get all authorized admin emails
 * @route   GET /api/admin/auth/emails
 * @access  Private (Admin only)
 */
export const getAuthorizedAdminEmails = async (req, res) => {
  try {
    const emails = await getAllowedAdminEmails();
    return res.status(200).json({
      success: true,
      emails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch authorized admin emails.',
    });
  }
};

/**
 * @desc    Remove an authorized admin email
 * @route   DELETE /api/admin/auth/emails
 * @access  Private (Admin only)
 */
export const removeAuthorizedAdminEmail = async (req, res) => {
  try {
    const emailToRemove = req.body?.email || req.query?.email;
    if (!emailToRemove) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the email to remove.',
      });
    }

    const cleanEmail = normalizeEmail(emailToRemove);
    let currentList = await getAllowedAdminEmails();

    if (!currentList.includes(cleanEmail)) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in the authorized list.',
      });
    }

    if (currentList.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last remaining administrator email. At least one admin must exist.',
      });
    }

    currentList = currentList.filter((e) => e !== cleanEmail);

    let settingDoc = await Settings.findOne({ key: 'authorizedAdminEmails' });
    if (settingDoc) {
      settingDoc.value = currentList;
      await settingDoc.save();
    } else {
      await Settings.create({
        key: 'authorizedAdminEmails',
        value: currentList,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${cleanEmail} has been removed from authorized administrators.`,
      emails: currentList,
    });
  } catch (error) {
    console.error('removeAuthorizedAdminEmail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove authorized admin email.',
    });
  }
};

/**
 * @desc    Get current admin session details
 * @route   GET /api/admin/auth/me
 * @access  Private (Admin only)
 */
export const getAdminSession = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.user || { role: 'admin' },
  });
};
