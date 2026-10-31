import dns from 'dns';
import { Resend } from 'resend';

// List of common disposable / temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'yopmail.com', 'trashmail.com', 'getairmail.com',
  'dispostable.com', 'temp-mail.org', 'fakemailgenerator.com', 'throwawaymail.com',
  'generator.email', 'tempmailo.com', 'burnermail.io', 'inboxkitten.com',
  'mytemp.email', 'dropmail.me', 'mohmal.com', 'crazymailing.com'
]);

// In-memory OTP storage: key -> { otp, expires, attempts, createdAt }
const otpStore = new Map();

// In-memory rate limiting storage: key -> { count, resetAt }
const rateLimitMap = new Map();

// Periodic cleanup of expired store records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expires < now) {
      otpStore.delete(key);
    }
  }
  for (const [key, val] of rateLimitMap.entries()) {
    if (val.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Validate standard RFC-compliant email format
 * Trims whitespace and lowercases the address
 */
export const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Please enter your email address.', cleanEmail: '' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { valid: false, error: 'Please enter your email address.', cleanEmail: '' };
  }
  // Standard RFC-compliant email regex
  const rfcRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcRegex.test(cleanEmail)) {
    return { valid: false, error: 'Please enter a valid email address.', cleanEmail };
  }
  return { valid: true, cleanEmail };
};

/**
 * Check if the domain is a known disposable email provider
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  return DISPOSABLE_DOMAINS.has(parts[1].toLowerCase());
};

/**
 * Verify domain has valid DNS MX records
 */
export const verifyDomainMx = async (domain) => {
  if (!domain || typeof domain !== 'string') return false;
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    // ENOTFOUND, ENODATA, SERVFAIL, etc.
    return false;
  }
};

/**
 * Verify email deliverability: format, non-disposable domain, and DNS MX records
 */
export const verifyEmailDeliverability = async (email) => {
  const { valid, error: formatError, cleanEmail } = validateEmailFormat(email);
  if (!valid) {
    return { valid: false, message: formatError || 'Please enter a valid email address.' };
  }

  if (isDisposableEmail(cleanEmail)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  const domain = cleanEmail.split('@')[1];
  const hasMx = await verifyDomainMx(domain);
  if (!hasMx) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  return { valid: true, cleanEmail };
};

/**
 * In-memory rate limiting check (e.g. max 5 per hour)
 */
export const checkRateLimit = (key, max = 5, windowMs = 60 * 60 * 1000) => {
  const now = Date.now();
  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(key, entry);
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(key, entry);
    return { allowed: true };
  }

  if (entry.count >= max) {
    const waitMins = Math.ceil((entry.resetAt - now) / 60000);
    return { 
      allowed: false, 
      error: `Too many OTP requests. Please wait ${waitMins} minute${waitMins > 1 ? 's' : ''} before trying again.` 
    };
  }

  entry.count += 1;
  return { allowed: true };
};

/**
 * Generate 4-digit numeric OTP
 */
export const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

/**
 * Validate email, check DNS MX records, rate limit, and send OTP via Resend
 */
export const sendOtpEmail = async ({ email, ip, purpose = 'register', recipientName = '' }) => {
  // 1. Format validation
  const { valid, error: formatError, cleanEmail } = validateEmailFormat(email);
  if (!valid) {
    return { success: false, error: formatError || 'Please enter a valid email address.' };
  }

  // 2. Check disposable email domain
  if (isDisposableEmail(cleanEmail)) {
    return { success: false, error: "We couldn't send an OTP to this email. Please enter a valid email address." };
  }

  // 3. DNS MX record check
  const domain = cleanEmail.split('@')[1];
  const hasMx = await verifyDomainMx(domain);
  if (!hasMx) {
    return { success: false, error: "We couldn't send an OTP to this email. Please enter a valid email address." };
  }

  // 4. Rate limiting check (per IP & per email)
  if (ip) {
    const ipLimit = checkRateLimit(`ip:${ip}`, 10, 60 * 60 * 1000);
    if (!ipLimit.allowed) return { success: false, error: ipLimit.error };
  }
  const emailLimit = checkRateLimit(`email:${cleanEmail}`, 5, 60 * 60 * 1000);
  if (!emailLimit.allowed) return { success: false, error: emailLimit.error };

  // 5. Generate and store OTP (10 minutes, max 5 attempts)
  const otp = generateOTP();
  const cacheKey = `${purpose}:${cleanEmail}`;
  otpStore.set(cacheKey, {
    otp,
    expires: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    createdAt: Date.now()
  });

  console.log(`\n========================================`);
  console.log(`🔑 [OTP - ${purpose.toUpperCase()}] ${cleanEmail} -> OTP: ${otp}`);
  console.log(`========================================\n`);

  // 6. Send via Resend
  const isBooking = purpose === 'booking';
  const isLogin = purpose === 'login';
  const subject = isBooking
    ? 'Verify your email for Session Booking - Better With Aarkesh'
    : isLogin
    ? 'Your Login Verification Code - Better With Aarkesh'
    : 'Verify your email - Better With Aarkesh';

  const headingText = isBooking 
    ? 'Confirm Your Coaching Session' 
    : isLogin 
    ? 'Login Verification Code 🔐' 
    : 'Welcome to Better With Aarkesh! ✨';

  const subtext = isBooking
    ? `Hi ${recipientName || 'there'}, please enter the One-Time Password (OTP) below to verify your email address and continue with your session booking:`
    : isLogin
    ? `Hi ${recipientName || 'there'}, use the One-Time Password (OTP) below to securely log in to your Better With Aarkesh account:`
    : `Hi ${recipientName || 'there'}, thank you for beginning your coaching journey. Please use the One-Time Password (OTP) below to verify your email address:`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
      <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
              <tr>
                <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; letter-spacing: -0.5px; font-family: Georgia, serif;">
                          BetterWith<span style="color: #c9542f;">Aarkesh</span>
                        </div>
                        <div style="font-size: 11px; color: #c9542f; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                          ${isBooking ? 'Private Coaching Booking' : 'Executive Coaching Portal'}
                        </div>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; padding: 5px 12px; background-color: rgba(201, 84, 47, 0.1); border: 1px solid rgba(201, 84, 47, 0.3); color: #c9542f; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                          VERIFICATION CODE
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 36px 28px;">
                  <h2 style="margin: 0 0 10px; font-size: 20px; color: #1A1A1A; font-weight: 600;">
                    ${headingText}
                  </h2>
                  <p style="margin: 0 0 16px; font-size: 14px; color: #555555; line-height: 1.6;">
                    ${subtext}
                  </p>
                  <div style="text-align: center; margin: 30px 0 28px;">
                    <div style="display: inline-block; background-color: #FDF7F3; border: 1.5px solid #c9542f; padding: 14px 34px; border-radius: 12px; box-shadow: 0 6px 18px rgba(201, 84, 47, 0.12);">
                      <span style="font-size: 32px; font-weight: 800; color: #c9542f; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                    </div>
                  </div>
                  <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 10px; padding: 14px 18px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #777777; line-height: 1.5;">
                      ⏳ This OTP is valid for <strong style="color: #c9542f;">10 minutes</strong>. For your security, please do not share this code with anyone.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #777777; line-height: 1.5;">
                  <div>Better With Aarkesh · Executive Leadership &amp; Mindset Coaching</div>
                  <div>For assistance, contact <a href="mailto:coaching@aarkeshgupta.com" style="color: #c9542f; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured.');
      if (process.env.NODE_ENV !== 'production') {
        return { success: true, message: 'OTP generated (Dev Mode)', devOtp: otp };
      }
      return { success: false, error: "We couldn't send an OTP to this email. Please enter a valid email address." };
    }

    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: cleanEmail,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.warn('⚠️ Resend Warning:', error.message || error);
      if (process.env.NODE_ENV !== 'production') {
        return { success: true, message: 'OTP generated (Dev Mode: check backend console)', devOtp: otp };
      }
      return { success: false, error: "We couldn't send an OTP to this email. Please enter a valid email address." };
    }

    return { success: true, message: 'OTP sent successfully', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined };
  } catch (err) {
    console.warn('⚠️ Email send exception:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, message: 'OTP generated (Dev Mode: check backend console)', devOtp: otp };
    }
    return { success: false, error: "We couldn't send an OTP to this email. Please enter a valid email address." };
  }
};

/**
 * Verify entered OTP for given email and purpose
 */
export const verifyOtp = ({ email, otp, purpose = 'register' }) => {
  const { valid, cleanEmail } = validateEmailFormat(email);
  if (!valid || !cleanEmail) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const cacheKey = `${purpose}:${cleanEmail}`;
  const stored = otpStore.get(cacheKey);

  if (!stored) {
    return { success: false, error: 'Session expired or OTP not requested. Please request a new OTP.' };
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(cacheKey);
    return { success: false, error: 'OTP expired. Please request a new code.' };
  }

  if (stored.attempts >= 5) {
    otpStore.delete(cacheKey);
    return { success: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
  }

  if (stored.otp !== (otp || '').trim()) {
    stored.attempts += 1;
    const remaining = 5 - stored.attempts;
    if (remaining <= 0) {
      otpStore.delete(cacheKey);
      return { success: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
    }
    return { success: false, error: `Invalid OTP. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` };
  }

  // OTP verified successfully
  otpStore.delete(cacheKey);
  return { success: true };
};
