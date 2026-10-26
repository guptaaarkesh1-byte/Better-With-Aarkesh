import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  sendAdminOtp,
  resendAdminOtp,
  verifyAdminOtp,
  getPublicAllowedAdminEmails,
  getAuthorizedAdminEmails,
  sendAddAdminOtp,
  resendAddAdminOtp,
  addAuthorizedAdminEmail,
  removeAuthorizedAdminEmail,
  getAdminSession,
} from '../controllers/adminAuthController.js';

const router = express.Router();

// Public routes for OTP-based Admin Login (strictly restricted to whitelisted admin emails)
router.post('/send-otp', sendAdminOtp);
router.post('/resend-otp', resendAdminOtp);
router.post('/verify-otp', verifyAdminOtp);
router.get('/allowed-emails', getPublicAllowedAdminEmails);

// Protected routes for Authorized Admin emails management (Requires Admin auth)
router.get('/emails', protect, admin, getAuthorizedAdminEmails);
router.post('/emails/send-otp', protect, admin, sendAddAdminOtp);
router.post('/emails/resend-otp', protect, admin, resendAddAdminOtp);
router.post('/emails', protect, admin, addAuthorizedAdminEmail);
router.delete('/emails', protect, admin, removeAuthorizedAdminEmail);

// Protected route to check active admin session
router.get('/me', protect, admin, getAdminSession);

export default router;
