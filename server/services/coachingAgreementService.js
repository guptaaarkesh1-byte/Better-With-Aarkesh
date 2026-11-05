import PDFDocument from 'pdfkit';
import { Resend } from 'resend';
import crypto from 'crypto';

function renderMeetingLink(meetLink) {
  const rawLink = String(meetLink || '').trim();
  let url;

  try {
    url = new URL(rawLink);
  } catch {
    return '<span style="color: #7A756B;">Meeting link will be shared shortly.</span>';
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return '<span style="color: #7A756B;">Meeting link will be shared shortly.</span>';
  }

  const safeLink = url.href.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  return `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="color: #C25E38; font-weight: 700; text-decoration: none;">Join Google Meet</a>`;
}

/**
 * Generate a cryptographically random, unguessable token for agreement review & acceptance.
 */
export function generateAgreementToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate agreement token expiration date (default: 7 days from generation).
 */
export function getAgreementTokenExpiry(days = 7) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Generate a realistic Google Meet link fallback (e.g., https://meet.google.com/abc-defg-hij)
 */
export function generateGoogleMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randPart = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
}

/**
 * Generate an exact 1:1 replica of the Coaching Agreement PDF.
 * Pure white document, Times serif typography, identical section structure, dividers, and blank signature lines.
 */
export async function generateCoachingAgreementPdf(data = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 65, right: 65 },
        bufferPages: true,
        info: {
          Title: `Coaching Agreement - ${data.clientName || 'Client'}`,
          Author: 'Aarkesh Gupta / BetterWithAarkesh',
          Subject: 'Coaching Agreement',
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Data extraction with fallbacks
      const clientName = (data.clientName || data.name || '').trim();
      const clientEmail = (data.clientEmail || data.email || '').trim();
      const clientPhone = (data.clientPhone || data.phoneNumber || data.phone || '').trim();
      const sessionDate = data.sessionDate || data.date || '';
      const sessionTime = data.sessionTime || data.time || '';
      const startDateTime = sessionTime ? `${sessionDate} at ${sessionTime} (IST)` : sessionDate;
      
      const isPackage = Boolean(data.isPackage || data.isCoursePackage || data.isFreeSession);
      const isSingle = !isPackage;
      const agreementDate = data.agreementDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const modeOfCoaching = data.modeOfCoaching || 'Online Video (Google Meet)';

      // Typography
      const fontRegular = 'Times-Roman';
      const fontBold = 'Times-Bold';
      const fontItalic = 'Times-Italic';

      const leftMargin = 65;
      const rightMargin = 530;

      const drawDivider = (yPos) => {
        doc.save()
           .strokeColor('#b8b8b8')
           .lineWidth(0.6)
           .moveTo(leftMargin, yPos)
           .lineTo(rightMargin, yPos)
           .stroke()
           .restore();
      };

      // ==========================================
      // PAGE 1
      // ==========================================
      doc.font(fontBold).fontSize(18).fillColor('#000000').text('COACHING AGREEMENT', leftMargin, 60);
      doc.moveDown(0.9);

      doc.font(fontRegular).fontSize(10.5).lineGap(3).fillColor('#000000');
      doc.text('This Coaching Agreement is entered into between ', { continued: true });
      doc.font(fontBold).text('Aarkesh Gupta / BetterWithAarkesh');
      doc.font(fontRegular).text('("Coach") and:');
      doc.moveDown(0.8);

      // Meta Fields
      doc.text(`Client Name: ${clientName || '______________________________________'}`);
      doc.moveDown(0.3);
      doc.text(`Email: ${clientEmail || '____________________________________________'}`);
      doc.moveDown(0.3);
      doc.text(`Phone: ${clientPhone || '____________________________________________'}`);
      doc.moveDown(0.3);
      doc.text(`Date: ${agreementDate || '_____________________________________________'}`);
      doc.moveDown(1.1);

      // 1. Coaching Engagement
      doc.font(fontBold).fontSize(13).text('1. Coaching Engagement');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5);
      const packageLabel = data.totalSessions ? ` Package (${data.totalSessions} Sessions)` : ' Package';
      doc.text(`Sessions: ${isSingle ? '[X]' : '[  ]'} Single     ${isPackage ? '[X]' : '[  ]'}${packageLabel}`);
      doc.moveDown(0.6);
      
      if (data.sessionsList && Array.isArray(data.sessionsList) && data.sessionsList.length > 0) {
        doc.font(fontBold).text('Session Schedule:');
        doc.font(fontRegular);
        data.sessionsList.forEach((s, idx) => {
          doc.moveDown(0.25);
          doc.text(`   • Session ${idx + 1}: ${s.date || s} at ${s.time || ''} (IST)`);
        });
        doc.moveDown(0.5);
      } else {
        doc.text(`Start Date: ${startDateTime || '_______________________________________'}`);
        doc.moveDown(0.6);
      }
      
      doc.text(`Mode of Coaching: ${modeOfCoaching || 'Online Video (Google Meet)'}`);
      if (data.meetLink) {
        doc.moveDown(0.5);
        doc.text(`Meeting Link: ${data.meetLink}`);
      }
      if (data.totalAmount) {
        doc.moveDown(0.5);
        doc.text(`Package Fee Paid: Rs. ${Number(data.totalAmount).toLocaleString('en-IN')}`);
      }
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 2. Coaching Focus
      doc.font(fontBold).fontSize(13).text('2. Coaching Focus');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('The focus of the coaching engagement will be established collaboratively by the Client and Coach during the course of coaching.');
      doc.moveDown(0.6);
      doc.text('It may include specific goals, challenges, patterns, behaviours or areas of development that both parties agree are useful to explore.');
      doc.moveDown(0.6);
      doc.text('The focus may evolve or change as the coaching progresses.');
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 3. Nature of the Engagement
      doc.font(fontBold).fontSize(13).text('3. Nature of the Engagement');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('Coaching is a collaborative process intended to support reflection, decision-making, behavioural change and personal development.');
      doc.moveDown(0.6);
      doc.text('The Coach may provide questions, observations, feedback, exercises, frameworks and recommendations.');
      doc.moveDown(0.6);
      doc.text('The Client remains responsible for their own decisions, actions and outcomes.');
      doc.moveDown(0.6);
      doc.text('Coaching is not psychotherapy, medical treatment, psychiatric care, legal advice, financial advice or another regulated professional service.');
      doc.moveDown(1.0);

      drawDivider(doc.y);

      // ==========================================
      // PAGE 2
      // ==========================================
      doc.addPage();

      // 4. Sessions, Cancellation & Rescheduling
      doc.font(fontBold).fontSize(13).text('4. Sessions, Cancellation & Rescheduling', leftMargin, 60);
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('Sessions are reserved specifically for the Client.');
      doc.moveDown(0.6);

      doc.text('A session may be cancelled or rescheduled without penalty where notice is received ', { continued: true });
      doc.font(fontBold).text('at least 48 hours', { continued: true });
      doc.font(fontRegular).text(' before the scheduled start time.');
      doc.moveDown(0.6);

      doc.text('Requests made within 48 hours will ordinarily result in the session being treated as used.');
      doc.moveDown(0.6);
      doc.text('No-shows will ordinarily be treated as used sessions.');
      doc.moveDown(0.6);
      doc.text('If the Client arrives late, the session will still normally end at the originally scheduled time.');
      doc.moveDown(0.6);
      
      doc.text('The full Refund & Cancellation Policy and Rescheduling Policy available on ');
      doc.fillColor('#0044cc').text('www.aarkeshgupta.com', { underline: true, continued: true });
      doc.fillColor('#000000').text(' apply to this engagement.');
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 5. Confidentiality
      doc.font(fontBold).fontSize(13).text('5. Confidentiality');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('Information discussed during coaching will be treated as confidential, subject to the exceptions described in the BetterWithAarkesh Terms & Conditions and Privacy Policy.');
      doc.moveDown(0.6);
      doc.text('Neither party may record a coaching session without the knowledge and agreement of the other.');
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 6. Between-Session Communication
      doc.font(fontBold).fontSize(13).text('6. Between-Session Communication');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('Unless otherwise agreed, communication between sessions is primarily for scheduling, administration and brief follow-up.');
      if (data.betweenSessionSupport && String(data.betweenSessionSupport).trim()) {
        doc.moveDown(0.6);
        doc.text('Any additional between-session support agreed for this engagement:');
        doc.moveDown(0.6);
        doc.font(fontItalic).text(String(data.betweenSessionSupport).trim());
        doc.font(fontRegular);
      }
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 7. Ending the Coaching Engagement
      doc.font(fontBold).fontSize(13).text('7. Ending the Coaching Engagement');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('Either the Client or Coach may decide to end the coaching relationship.');
      doc.moveDown(0.6);
      doc.text('Once coaching has commenced, unused sessions are ordinarily non-refundable unless both the Client and Coach agree that continuing the coaching engagement is no longer necessary or appropriate.');

      // ==========================================
      // PAGE 3
      // ==========================================
      doc.addPage();

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5).text('Any eligible unused portion will be handled according to the BetterWithAarkesh Refund & Cancellation Policy.', leftMargin, 60);
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 8. Applicable Policies
      doc.font(fontBold).fontSize(13).text('8. Applicable Policies');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('By signing this Agreement, the Client confirms that they have been given access to and agree to the relevant BetterWithAarkesh:');
      doc.moveDown(0.4);
      doc.text('•  Terms & Conditions');
      doc.moveDown(0.2);
      doc.text('•  Privacy Policy');
      doc.moveDown(0.2);
      doc.text('•  Refund & Cancellation Policy');
      doc.moveDown(0.2);
      doc.text('•  Rescheduling Policy');
      doc.moveDown(0.5);
      doc.text('available through ', { continued: true });
      doc.fillColor('#0044cc').text('www.aarkeshgupta.com', { underline: true, continued: true });
      doc.fillColor('#000000').text('.');
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // 9. Agreement
      doc.font(fontBold).fontSize(13).text('9. Agreement');
      doc.moveDown(0.6);

      doc.font(fontRegular).fontSize(10.5).lineGap(3.5);
      doc.text('Both parties confirm that the information above accurately reflects the coaching arrangement agreed between them.');
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // Additional Agreed Terms
      if (data.additionalAgreedTerms && String(data.additionalAgreedTerms).trim()) {
        doc.font(fontBold).fontSize(11.5).text('Additional Agreed Terms, if any');
        doc.moveDown(0.8);
        doc.font(fontItalic).fontSize(10.5).lineGap(3.5).text(String(data.additionalAgreedTerms).trim());
        doc.font(fontRegular);
        doc.moveDown(1.0);
      }

      // Digital Acceptance Audit Footer (generated only after client acceptance)
      if (data.isAccepted || data.acceptedAt) {
        doc.moveDown(1.3);
        drawDivider(doc.y);
        doc.moveDown(0.9);
        doc.font(fontBold).fontSize(9.5).fillColor('#15803d');
        const acceptedDateStr = data.acceptedAt
          ? new Date(data.acceptedAt).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : new Date().toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

        doc.text(`✓ Accepted digitally on ${acceptedDateStr} (IST) by ${clientName || 'Client'}${data.acceptedIp ? ` (IP: ${data.acceptedIp})` : ''}`);
        doc.fillColor('#000000');
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send Coaching Session Confirmation Email with dynamically filled PDF Agreement attached.
 */
/**
 * Send Admin / Coach Alert Email when a new booking is created.
 * The client does NOT receive the agreement yet; it awaits Aarkesh sir's review in Admin Dashboard.
 */
export async function sendCoachBookingAlertEmail({ appointment, isFreeSession = false }) {
  if (!appointment) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping coach booking alert email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const clientName = appointment.name || 'Valued Client';
    const clientEmail = (appointment.email || '').trim().toLowerCase();
    const cleanDate = appointment.date || 'Scheduled Date';
    const cleanTime = appointment.time || 'Scheduled Time';
    const duration = appointment.duration || 60;
    const isFirstSession = appointment.isFirstSession;
    let meetLink = (appointment.meetLink || '').trim();
    if (!meetLink) {
      meetLink = generateGoogleMeetLink();
      appointment.meetLink = meetLink;
      if (typeof appointment.save === 'function') {
        appointment.save().catch(() => {});
      }
    }

    const coachEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Coaching Booking Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            BetterWith<span style="color: #C25E38;">Aarkesh</span>
                          </div>
                          <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                            🚨 ACTION REQUIRED · REVIEW COACHING AGREEMENT
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 5px 12px; background-color: #FEF3C7; border: 1px solid #F59E0B; color: #B45309; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                            NEEDS ACTION
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Banner -->
                <tr>
                  <td style="padding: 28px 36px;">
                    <h2 style="margin: 0 0 10px; font-size: 20px; color: #1A1A1A; font-weight: 600;">
                      New Booking from ${clientName}
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #555555; line-height: 1.6;">
                      A new coaching session has been reserved. The client has <strong>NOT</strong> been sent their Coaching Agreement yet. It is awaiting your review and approval in the Admin Dashboard.
                    </p>

                    <!-- Client & Session Details Box -->
                    <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #777777;" width="140">Client Name:</td>
                          <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${clientName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Client Email:</td>
                          <td style="padding: 6px 0; color: #C25E38; font-weight: 600;"><a href="mailto:${clientEmail}" style="color: #C25E38; text-decoration: none;">${clientEmail}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Phone Number:</td>
                          <td style="padding: 6px 0; color: #1A1A1A; font-family: monospace;">${appointment.phoneNumber || appointment.phone || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Date &amp; Time:</td>
                          <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${cleanDate} at ${cleanTime} (IST)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Duration / Type:</td>
                          <td style="padding: 6px 0; color: #C25E38; font-weight: 600;">${duration} mins (${isFirstSession ? 'First Session' : 'Returning Client'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Booking Type:</td>
                          <td style="padding: 6px 0; color: ${isFreeSession ? '#059669' : '#1A1A1A'}; font-weight: 600;">${isFreeSession ? 'Course Bonus (Complimentary)' : 'Standard Paid Session'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #777777;" valign="top">Meeting Link:</td>
                          <td style="padding: 10px 0;">
                            <a href="${meetLink}" target="_blank" style="color: #C25E38; font-weight: 700; text-decoration: underline; font-size: 13.5px; word-break: break-all;">
                              ${meetLink}
                            </a>
                            <div style="margin-top: 6px;">
                              <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #2D3748; color: #FFFFFF; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 12px; border-radius: 5px; text-decoration: none;">
                                Join / Test Meeting &rarr;
                              </a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Workflow Callout -->
                    <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                      <div style="font-size: 13px; font-weight: 700; color: #92400E; margin-bottom: 4px;">
                        📝 Action Required: Review &amp; Send Agreement
                      </div>
                      <div style="font-size: 12px; color: #78350F; line-height: 1.5;">
                        Log in to your <strong>Admin Dashboard &rarr; Appointments &rarr; Needs Action</strong> tab to review client details, add custom coaching notes or terms, preview the generated PDF, and click <strong>Approve &amp; Send</strong> to dispatch the agreement to the client.
                      </div>
                    </div>

                    <div style="text-align: center; margin: 28px 0 10px;">
                      <a href="https://aarkeshgupta.com/admin/appointments" style="display: inline-block; background-color: #C25E38; color: #FFFFFF; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(194, 94, 56, 0.3);">
                        Review &amp; Send Agreement &rarr;
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #777777; line-height: 1.5;">
                    <div>Better With Aarkesh · Admin Coaching Dashboard Notification</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: process.env.ADMIN_EMAIL || 'guptaaarkesh1@gmail.com',
      subject: `🚨 Review Required: New Booking from ${clientName} (${cleanDate} at ${cleanTime})`,
      html: coachEmailHtml,
    });

    console.log(`✉️ Dispatched coach alert email for new booking by ${clientEmail}`);
  } catch (err) {
    console.error('Failed to send coach booking alert email:', err);
  }
}

/**
 * Send Coaching Agreement & Official Confirmation to the client once approved by Aarkesh sir.
 * NOTE: As per digital agreement requirements, NO PDF IS ATTACHED.
 * The email includes a secure, tokenized CTA button leading to /agreement/:token.
 */
export async function sendClientCoachingAgreementEmail({ appointment, customData = {}, agreementUrl = '', isResend = false }) {
  if (!appointment || !appointment.email) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping client coaching agreement email.');
      return;
    }

    const resend = new Resend(resendApiKey);

    // Merge appointment defaults with any custom overrides made by Aarkesh sir
    const clientName = (customData.clientName || appointment.name || 'Valued Client').trim();
    const clientEmail = (customData.clientEmail || appointment.email).trim().toLowerCase();
    const cleanDate = (customData.sessionDate || appointment.date || 'Scheduled Date').trim();
    const cleanTime = (customData.sessionTime || appointment.time || 'Scheduled Time').trim();
    const duration = customData.duration || appointment.duration || 60;
    const isFirstSession = appointment.isFirstSession;
    let meetLink = (customData.meetLink || appointment.meetLink || '').trim();
    if (!meetLink) {
      meetLink = generateGoogleMeetLink();
      appointment.meetLink = meetLink;
      appointment.save().catch(() => {});
    }
    const modeOfCoaching = (customData.modeOfCoaching || 'Online Video (Google Meet)').trim();

    // Determine secure review URL
    const clientBaseUrl = (process.env.CLIENT_URL || 'https://aarkeshgupta.com').replace(/\/+$/, '');
    const finalAgreementUrl = agreementUrl || `${clientBaseUrl}/agreement/${appointment.agreementToken || ''}`;

    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coaching Session Confirmed & Agreement Ready</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            BetterWith<span style="color: #C25E38;">Aarkesh</span>
                          </div>
                          <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                            1-on-1 Executive Coaching Confirmed
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 5px 12px; background-color: rgba(194, 94, 56, 0.1); border: 1px solid rgba(194, 94, 56, 0.3); color: #C25E38; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                            ${isResend ? 'REMINDER' : 'ACTION REQUIRED'}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Banner -->
                <tr>
                  <td style="padding: 28px 36px;">
                    <h2 style="margin: 0 0 10px; font-size: 20px; color: #1A1A1A; font-weight: 600;">
                      Session Confirmed & Agreement Ready, ${clientName}!
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #555555; line-height: 1.6;">
                      Your private 1-on-1 coaching session with Aarkesh Gupta has been confirmed. Prior to our call, please review and digitally accept your official <strong>Coaching Agreement</strong>.
                    </p>

                    <!-- Digital Agreement CTA Card -->
                    <div style="background-color: #FAF4EE; border: 1.5px solid #C25E38; border-radius: 14px; padding: 24px 22px; margin-bottom: 24px; text-align: center;">
                      <div style="font-size: 11px; font-weight: 700; color: #C25E38; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                        📝 Action Required Prior to Session
                      </div>
                      <div style="font-size: 17px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; font-family: Georgia, serif;">
                        Review &amp; Accept Your Coaching Agreement
                      </div>
                      <div style="font-size: 13.5px; color: #555555; line-height: 1.6; margin-bottom: 18px; max-width: 480px; margin-left: auto; margin-right: auto;">
                        Aarkesh has prepared your personalized agreement. Please click the button below to review the terms and complete your digital acceptance with a single click.
                      </div>
                      <div style="margin-bottom: 16px;">
                        <a href="${finalAgreementUrl}" target="_blank" style="display: inline-block; background-color: #C25E38; color: #FFFFFF; font-size: 13.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; padding: 13px 30px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(194, 94, 56, 0.35);">
                          Review &amp; Accept Coaching Agreement &rarr;
                        </a>
                      </div>
                      <div style="font-size: 11px; color: #777777; line-height: 1.5; word-break: break-all; border-top: 1px solid #EBE2D7; padding-top: 12px; margin-top: 14px;">
                        Direct link: <a href="${finalAgreementUrl}" target="_blank" style="color: #C25E38; text-decoration: underline;">${finalAgreementUrl}</a>
                      </div>
                    </div>

                    <!-- Session Details Box -->
                    <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #777777;" width="140">Date:</td>
                          <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${cleanDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Time Slot:</td>
                          <td style="padding: 6px 0; color: #1A1A1A; font-weight: 600;">${cleanTime} (IST)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Session Duration:</td>
                          <td style="padding: 6px 0; color: #C25E38; font-weight: 600;">${duration} Minutes (${isFirstSession ? 'First Session' : 'Returning Client'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #777777;">Format:</td>
                          <td style="padding: 6px 0; color: #1A1A1A;">${modeOfCoaching}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #777777;" valign="top">Meeting Link:</td>
                          <td style="padding: 10px 0;">
                            <a href="${meetLink}" target="_blank" style="color: #C25E38; font-weight: 700; text-decoration: underline; font-size: 13.5px; word-break: break-all;">
                              ${meetLink}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Google Meet Join Card -->
                    <div style="background-color: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                      <div style="font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 6px;">
                        📹 Your Google Meet Video Session
                      </div>
                      <div style="font-size: 13px; color: #15803D; margin-bottom: 12px; word-break: break-all;">
                        <a href="${meetLink}" target="_blank" style="color: #15803D; font-weight: 700; text-decoration: underline;">
                          ${meetLink}
                        </a>
                      </div>
                      <div>
                        <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #15803D; color: #FFFFFF; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(22, 101, 52, 0.2);">
                          Join Google Meet Call &rarr;
                        </a>
                      </div>
                    </div>

                    <p style="font-size: 13px; color: #777777; line-height: 1.6; margin: 0;">
                      Please be in a quiet space with stable internet 5 minutes before your scheduled start time. If you need to reschedule, please ensure at least 48 hours notice as per the Coaching Agreement.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #777777; line-height: 1.5;">
                    <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                    <div>Questions? Reach out to <a href="mailto:coaching@aarkeshgupta.com" style="color: #C25E38; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: clientEmail,
      subject: `${isResend ? 'Reminder: ' : 'Action Required: '}Review & Accept Your Coaching Agreement — ${cleanDate}`,
      html: clientEmailHtml,
    });

    console.log(`✉️ Successfully delivered Digital Agreement link to ${clientEmail} (${finalAgreementUrl})`);
  } catch (err) {
    console.error('Failed to send client agreement review email:', err);
    throw err;
  }
}

/**
 * Send confirmation email after client successfully accepts digital agreement.
 */
export async function sendClientAgreementAcceptedConfirmationEmail({ appointment }) {
  if (!appointment || !appointment.email) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    const resend = new Resend(resendApiKey);
    const clientName = (appointment.name || 'Valued Client').trim();
    const clientEmail = appointment.email.trim().toLowerCase();
    const cleanDate = (appointment.date || 'Scheduled Date').trim();
    const cleanTime = (appointment.time || 'Scheduled Time').trim();
    const meetLink = appointment.meetLink || '';
    const clientBaseUrl = (process.env.CLIENT_URL || 'https://aarkeshgupta.com').replace(/\/+$/, '');
    const agreementUrl = `${clientBaseUrl}/agreement/${appointment.agreementToken || ''}`;

    const acceptedDateStr = appointment.agreementAcceptedAt
      ? new Date(appointment.agreementAcceptedAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      : new Date().toLocaleDateString('en-IN');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background-color:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#333;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #EAE3D9;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.05);">
          <div style="padding:28px 32px;background:#FAF7F2;border-bottom:1px solid #EAE3D9;">
            <div style="font-size:20px;font-weight:bold;color:#1A1A1A;font-family:Georgia,serif;">BetterWith<span style="color:#C25E38;">Aarkesh</span></div>
            <div style="font-size:11px;color:#15803D;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;">✓ Coaching Agreement Confirmed &amp; Recorded</div>
          </div>
          <div style="padding:28px 32px;">
            <h2 style="font-size:19px;color:#1A1A1A;margin:0 0 10px;">Agreement Accepted, ${clientName}</h2>
            <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 18px;">
              Thank you for reviewing and accepting your Coaching Agreement on <strong>${acceptedDateStr} (IST)</strong>. Your digital acceptance has been securely logged and your official PDF document has been archived for our records.
            </p>
            <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
              <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:4px;">Session Schedule</div>
              <div style="font-size:14px;color:#1A1A1A;font-weight:600;">${cleanDate} at ${cleanTime} (IST)</div>
              ${meetLink ? `<div style="margin-top:8px;font-size:13px;"><a href="${meetLink}" target="_blank" style="color:#15803D;font-weight:700;text-decoration:underline;">Join Google Meet: ${meetLink}</a></div>` : ''}
            </div>
            <div style="text-align:center;margin:22px 0;">
              <a href="${agreementUrl}" target="_blank" style="display:inline-block;padding:11px 24px;background:#1c1714;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.5px;">
                View Accepted Agreement &amp; Download PDF &rarr;
              </a>
            </div>
          </div>
          <div style="padding:16px 32px;background:#FAF7F2;border-top:1px solid #EAE3D9;text-align:center;font-size:11px;color:#777;">
            Better With Aarkesh · Executive Leadership &amp; Personal Coaching
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: clientEmail,
      subject: `✓ Coaching Agreement Accepted — See You on ${cleanDate}`,
      html,
    });
    console.log(`✉️ Delivered agreement acceptance confirmation to ${clientEmail}`);
  } catch (err) {
    console.warn('Could not send agreement acceptance confirmation email:', err?.message);
  }
}

/**
 * Send instant confirmation and payment receipt email to the client upon booking.
 */
export async function sendClientBookingConfirmationEmail({ 
  appointment, 
  isFreeSession = false, 
  paymentId, 
  orderId 
}) {
  if (!appointment || !appointment.email) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping client booking confirmation email.');
      return;
    }

    const resend = new Resend(resendApiKey);

    const clientName = (appointment.name || 'Valued Client').trim();
    const rawFirstName = clientName.split(' ')[0] || 'Valued Client';
    const clientFirstName = rawFirstName ? (rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1)) : 'Valued Client';
    const clientEmail = (appointment.email || '').trim().toLowerCase();
    const clientPhone = (appointment.countryCode ? appointment.countryCode + ' ' : '') + (appointment.phoneNumber || appointment.phone || '').trim();
    const cleanDate = (appointment.date || 'Scheduled Date').trim();
    const cleanTime = (appointment.time || 'Scheduled Time').trim();
    const duration = appointment.duration || 60;
    const isFirstSession = appointment.isFirstSession;
    const meetingLinkHtml = renderMeetingLink(appointment.meetLink);

    const displayPaymentId = paymentId || appointment.paymentId || (isFreeSession ? 'COMPLIMENTARY_PERK' : 'CONFIRMED');
    const displayOrderId = orderId || appointment.orderId || 'BWA_SESSION';
    const amountVal = isFreeSession ? 0 : (appointment.amount !== undefined ? Number(appointment.amount) : 5000);
    const amountFormatted = isFreeSession 
      ? '₹0 — 100% Complimentary (Course Perk)' 
      : `₹${amountVal.toLocaleString('en-IN')}`;

    const clientUrl = process.env.CLIENT_URL || 'https://betterwithaarkesh.com';
    const myJourneyUrl = `${clientUrl}/my-journey`;

    const emailSubject = isFreeSession
      ? `Coaching Session Reserved (Complimentary Perk) — Better With Aarkesh`
      : `Booking Confirmed & Payment Successful — Better With Aarkesh`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2523;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.06);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 32px 36px 24px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 24px; font-weight: bold; color: #1A1A1A; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            BetterWith<span style="color: #C25E38;">Aarkesh</span>
                          </div>
                          <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                            1-on-1 Executive Coaching
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 6px 14px; background-color: ${isFreeSession ? '#FEF3C7' : '#ECFDF5'}; border: 1px solid ${isFreeSession ? '#F59E0B' : '#10B981'}; color: ${isFreeSession ? '#B45309' : '#047857'}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-radius: 9999px;">
                            ${isFreeSession ? '✨ COMPLIMENTARY PERK' : '✓ PAYMENT SUCCESSFUL'}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Content Body -->
                <tr>
                  <td style="padding: 32px 36px;">
                    <h1 style="margin: 0 0 12px; font-size: 22px; color: #1A1A1A; font-weight: 700; font-family: Georgia, serif; line-height: 1.3;">
                      ${isFreeSession ? 'Your Complimentary Coaching Session is Confirmed!' : 'Booking Confirmed & Payment Received!'}
                    </h1>
                    <p style="margin: 0 0 22px; font-size: 14.5px; color: #555047; line-height: 1.6;">
                      Hi <strong>${clientFirstName}</strong>, thank you for scheduling your session with <strong>Aarkesh Gupta</strong>. Your appointment has been officially registered and your slot is reserved on our calendar.
                    </p>

                    <!-- REASSURANCE NEXT STEP BOX (Highlighted as requested) -->
                    <div style="background-color: #FFF8F3; border: 1.5px solid #F3D2C1; border-left: 5px solid #C25E38; border-radius: 12px; padding: 20px 22px; margin-bottom: 26px;">
                      <div style="font-size: 12px; font-weight: 800; color: #C25E38; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                        ⏳ IMPORTANT NEXT STEP · COACHING AGREEMENT
                      </div>
                      <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #1C1714; line-height: 1.5;">
                        Your Google Meet link is included below. Your personalized Coaching Agreement will be sent after review.
                      </p>
                      <p style="margin: 0; font-size: 13.5px; color: #555047; line-height: 1.6;">
                        Prior to our session, Aarkesh personally reviews your booking and intake responses to tailor the conversation specifically to your goals. You will receive a separate email with your Coaching Agreement after it has been approved.
                      </p>
                    </div>

                    <!-- Payment / Receipt Summary Box -->
                    <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 12px; padding: 20px; margin-bottom: 22px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: #8C827A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #EAE3D9; padding-bottom: 8px;">
                        💳 Payment &amp; Transaction Details
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13.5px;">
                        <tr>
                          <td style="padding: 6px 0; color: #716962;" width="150">Payment Status:</td>
                          <td style="padding: 6px 0; color: #047857; font-weight: 700;">
                            ${isFreeSession ? '● Complimentary (Course Student Perk)' : '● Paid &amp; Confirmed'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Amount Paid:</td>
                          <td style="padding: 6px 0; color: #1C1714; font-weight: 700; font-size: 14px;">
                            ${amountFormatted}
                          </td>
                        </tr>
                        ${!isFreeSession && displayPaymentId ? `
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Payment ID:</td>
                          <td style="padding: 6px 0; color: #1C1714; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 600; font-size: 12.5px;">
                            ${displayPaymentId}
                          </td>
                        </tr>
                        ` : ''}
                        ${displayOrderId ? `
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Order Reference:</td>
                          <td style="padding: 6px 0; color: #1C1714; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12.5px;">
                            ${displayOrderId}
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>

                    <!-- Session Details Box -->
                    <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: #8C827A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #EAE3D9; padding-bottom: 8px;">
                        🗓️ Session Reservation Details
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13.5px;">
                        <tr>
                          <td style="padding: 6px 0; color: #716962;" width="150">Session Date:</td>
                          <td style="padding: 6px 0; color: #1C1714; font-weight: 700;">${cleanDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Time Slot:</td>
                          <td style="padding: 6px 0; color: #1C1714; font-weight: 700;">${cleanTime} (IST)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Session Duration:</td>
                          <td style="padding: 6px 0; color: #C25E38; font-weight: 700;">${duration} Minutes (${isFirstSession ? 'First Session' : 'Follow-up Session'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Google Meet:</td>
                          <td style="padding: 6px 0;">${meetingLinkHtml}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Client Name:</td>
                          <td style="padding: 6px 0; color: #1C1714; font-weight: 600;">${clientName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Registered Email:</td>
                          <td style="padding: 6px 0; color: #1C1714;">${clientEmail}</td>
                        </tr>
                        ${clientPhone ? `
                        <tr>
                          <td style="padding: 6px 0; color: #716962;">Phone Number:</td>
                          <td style="padding: 6px 0; color: #1C1714;">${clientPhone}</td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>

                    <!-- Call To Action Button -->
                    <div style="text-align: center; margin: 30px 0 24px;">
                      <a href="${myJourneyUrl}" target="_blank" style="display: inline-block; background-color: #1C1714; color: #FFFFFF; font-weight: 700; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                        View My Journey &amp; Profile →
                      </a>
                    </div>

                    <p style="font-size: 13px; color: #716962; line-height: 1.6; margin: 0; text-align: center;">
                      Have questions or need to update your time? You can reply directly to this email or reach us anytime at <a href="mailto:guptaaarkesh1@gmail.com" style="color: #C25E38; text-decoration: none; font-weight: 600;">guptaaarkesh1@gmail.com</a>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11.5px; color: #8C827A; line-height: 1.6;">
                    <div style="font-weight: 600; color: #1C1714; margin-bottom: 4px;">Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                    <div>Sent with care to ${clientEmail}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: clientEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    console.log(`✉️ Dispatched client booking confirmation & payment receipt to ${clientEmail} (isFreeSession: ${isFreeSession})`);
  } catch (err) {
    console.error('Failed to send client booking confirmation email:', err);
  }
}

/**
 * Send Multi-Session Package Booking Confirmation & Receipt Email to Client
 */
export async function sendClientPackageBookingConfirmationEmail({ packageDoc, appointments = [], paymentId, orderId }) {
  if (!packageDoc) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping package booking confirmation email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const clientName = packageDoc.clientName || 'Valued Client';
    const clientEmail = (packageDoc.clientEmail || '').trim().toLowerCase();
    const totalSessions = packageDoc.totalSessions || appointments.length || 0;
    const totalPaid = Number(packageDoc.totalAmount || 0).toLocaleString('en-IN');
    const transactionId = paymentId || packageDoc.paymentId || 'Completed';

    const sessionsRowsHtml = appointments.map((app, idx) => {
      const meetingLinkHtml = renderMeetingLink(app.meetLink);
      return `
        <div style="padding: 14px 18px; margin-bottom: 12px; background: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size: 13px; font-weight: 700; color: #C25E38; text-transform: uppercase; letter-spacing: 0.5px;">
                Session ${idx + 1} of ${totalSessions}
              </td>
              <td align="right" style="font-size: 11px; color: #8C827A; text-transform: uppercase; font-weight: 600;">
                ${app.duration || packageDoc.sessionDuration || 60} Mins
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 6px; font-size: 15px; font-weight: 600; color: #1C1714;">
                ${app.date} · ${app.time} (IST)
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 8px;">
                <span style="display: inline-block; font-size: 11.5px; color: #7A756B; background: #FAF7F2; border: 1px solid #EAE3D9; padding: 5px 10px; border-radius: 6px; font-weight: 500;">
                  📹 Google Meet · ${meetingLinkHtml}
                </span>
              </td>
            </tr>
          </table>
        </div>
      `;
    }).join('');

    const emailSubject = `Booking Confirmed: Your ${totalSessions}-Session Coaching Package with Aarkesh`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coaching Package Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 36px 24px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; font-family: Georgia, serif;">
                      BetterWith<span style="color: #C25E38;">Aarkesh</span>
                    </div>
                    <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                      ✓ COACHING PACKAGE CONFIRMED
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px;">
                    <h2 style="font-size: 22px; color: #1C1714; font-family: Georgia, serif; margin: 0 0 14px 0; font-weight: normal;">
                      Welcome to your coaching journey, ${clientName}.
                    </h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #555047; margin: 0 0 24px 0;">
                      Your <strong>${totalSessions}-session coaching package</strong> is fully booked and confirmed. Each session has been reserved specifically for you.
                    </p>

                    <!-- REASSURANCE NEXT STEP BOX -->
                    <div style="background-color: #FFF8F3; border: 1.5px solid #F3D2C1; border-left: 5px solid #C25E38; border-radius: 12px; padding: 20px 22px; margin-bottom: 26px;">
                      <div style="font-size: 12px; font-weight: 800; color: #C25E38; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                        ⏳ IMPORTANT NEXT STEP · COACHING AGREEMENT
                      </div>
                      <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #1C1714; line-height: 1.5;">
                        Google Meet links for all sessions are included in your schedule below. Your Coaching Agreement will be sent after review.
                      </p>
                      <p style="margin: 0; font-size: 13.5px; color: #555047; line-height: 1.6;">
                        Prior to our sessions, Coach Aarkesh personally reviews your intake responses and booking details to tailor your coaching plan. You will receive a separate email with your Coaching Agreement after it has been approved.
                      </p>
                    </div>

                    <!-- Receipt Summary -->
                    <div style="background-color: #FAF7F2; border: 1px solid #EAE3D9; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size: 13px; color: #7A756B;">Total Sessions</td>
                          <td align="right" style="font-size: 14px; font-weight: 600; color: #1C1714;">${totalSessions} 1-on-1 Sessions</td>
                        </tr>
                        <tr>
                          <td style="padding-top: 8px; font-size: 13px; color: #7A756B;">Total Amount Paid</td>
                          <td align="right" style="padding-top: 8px; font-size: 16px; font-weight: 700; color: #2E7D32;">₹${totalPaid}</td>
                        </tr>
                        <tr>
                          <td style="padding-top: 8px; font-size: 12px; color: #7A756B;">Payment ID</td>
                          <td align="right" style="padding-top: 8px; font-size: 12px; color: #555047; font-family: monospace;">${transactionId}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Sessions Schedule -->
                    <div style="font-size: 13px; font-weight: 700; color: #1C1714; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                      Your Session Schedule
                    </div>
                    ${sessionsRowsHtml}

                    <!-- Notice / Reschedule Policy -->
                    <div style="margin-top: 24px; padding: 16px; background: #FAF7F2; border-radius: 10px; font-size: 12.5px; color: #7A756B; line-height: 1.6;">
                      <strong style="color: #1C1714;">Rescheduling Policy:</strong> You can reschedule any individual session with at least 48 hours notice directly from your client dashboard.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11.5px; color: #8C827A; line-height: 1.6;">
                    <div style="font-weight: 600; color: #1C1714; margin-bottom: 4px;">Better With Aarkesh · 1-on-1 Coaching with Aarkesh</div>
                    <div>Sent with care to ${clientEmail}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: clientEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    console.log(`✉️ Dispatched client package booking confirmation to ${clientEmail}`);
  } catch (err) {
    console.error('Failed to send client package booking confirmation email:', err);
  }
}

/**
 * Send Coach (Aarkesh) Alert when a New Package is Booked
 */
export async function sendCoachPackageBookingAlertEmail({ packageDoc, appointments = [] }) {
  if (!packageDoc) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping coach package alert email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const clientName = packageDoc.clientName || 'Valued Client';
    const clientEmail = (packageDoc.clientEmail || '').trim().toLowerCase();
    const clientPhone = packageDoc.phoneNumber ? `${packageDoc.countryCode || '+91'} ${packageDoc.phoneNumber}` : 'Not provided';
    const totalSessions = packageDoc.totalSessions || appointments.length || 0;
    const totalAmount = Number(packageDoc.totalAmount || 0).toLocaleString('en-IN');
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';

    const scheduleListHtml = appointments.map((app, idx) => `
      <li style="margin-bottom: 6px; font-size: 13.5px; color: #333333;">
        <strong>Session ${idx + 1}:</strong> ${app.date} at ${app.time} (IST)
      </li>
    `).join('');

    const emailSubject = `🚨 NEW PACKAGE BOOKING: ${clientName} (${totalSessions} Sessions - ₹${totalAmount})`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Coaching Package Booking</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                
                <tr>
                  <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; font-family: Georgia, serif;">
                      BetterWith<span style="color: #C25E38;">Aarkesh</span>
                    </div>
                    <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                      🚨 ACTION REQUIRED · REVIEW COACHING PACKAGE AGREEMENT
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 36px;">
                    <h2 style="font-size: 22px; color: #1C1714; font-family: Georgia, serif; margin: 0 0 14px 0;">
                      New Package Booking Alert
                    </h2>
                    <p style="font-size: 15px; color: #555047; line-height: 1.6; margin: 0 0 24px 0;">
                      <strong>${clientName}</strong> has just booked a <strong>${totalSessions}-session coaching package</strong> for <strong>₹${totalAmount}</strong>.
                    </p>

                    <div style="background-color: #FAF7F2; border: 1px solid #EAE3D9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <div style="font-size: 13px; font-weight: 700; color: #1C1714; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                        Client Contact Details
                      </div>
                      <div style="font-size: 14px; margin-bottom: 6px;"><strong>Email:</strong> ${clientEmail}</div>
                      <div style="font-size: 14px; margin-bottom: 6px;"><strong>Phone:</strong> ${clientPhone}</div>
                      ${packageDoc.reason ? `<div style="font-size: 14px; margin-top: 8px;"><strong>Focus / Goal:</strong> ${packageDoc.reason}</div>` : ''}
                    </div>

                    <div style="font-size: 13px; font-weight: 700; color: #1C1714; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                      Scheduled Sessions (${totalSessions} Total)
                    </div>
                    <ul style="padding-left: 20px; margin: 0 0 28px 0; line-height: 1.8;">
                      ${scheduleListHtml}
                    </ul>

                    <div style="text-align: center; margin: 32px 0 16px;">
                      <a href="${adminUrl}/appointments" style="display: inline-block; background-color: #C25E38; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: 0.5px;">
                        Review &amp; Send Package Agreement &rarr;
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11.5px; color: #8C827A;">
                    Better With Aarkesh Admin Notification System
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'guptaaarkesh1@gmail.com';
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: adminEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    console.log(`✉️ Dispatched coach package booking alert to ${adminEmail}`);
  } catch (err) {
    console.error('Failed to send coach package alert email:', err);
  }
}

/**
 * Send Client Coaching Package Agreement for Review & Digital Acceptance
 */
export async function sendClientPackageAgreementEmail({ packageDoc, appointments = [], customData = {}, agreementUrl = '', isResend = false }) {
  if (!packageDoc) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping package agreement email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const clientName = packageDoc.clientName || 'Valued Client';
    const clientEmail = (packageDoc.clientEmail || '').trim().toLowerCase();
    const totalSessions = packageDoc.totalSessions || appointments.length || 0;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const finalAgreementUrl = agreementUrl || `${clientUrl}/agreement/${packageDoc.agreementToken}`;

    const scheduleListHtml = appointments.map((app, idx) => `
      <li style="margin-bottom: 6px; font-size: 13.5px; color: #333333;">
        <strong>Session ${idx + 1}:</strong> ${app.date} at ${app.time} (IST)
      </li>
    `).join('');

    const emailSubject = `${isResend ? '[Reminder] ' : ''}Action Required: Review & Accept Your Coaching Package Agreement`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coaching Package Agreement</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                
                <tr>
                  <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; font-family: Georgia, serif;">
                      BetterWith<span style="color: #C25E38;">Aarkesh</span>
                    </div>
                    <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                      COACHING AGREEMENT · ${totalSessions}-SESSION PACKAGE
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 36px;">
                    <h2 style="font-size: 22px; color: #1C1714; font-family: Georgia, serif; margin: 0 0 14px 0;">
                      Hello ${clientName},
                    </h2>
                    <p style="font-size: 15px; color: #555047; line-height: 1.6; margin: 0 0 20px 0;">
                      Aarkesh has prepared your <strong>Coaching Agreement</strong> covering all <strong>${totalSessions} sessions</strong> of your coaching package.
                    </p>
                    <p style="font-size: 14.5px; color: #555047; line-height: 1.6; margin: 0 0 24px 0;">
                      Please take a moment to review the agreement and digitally accept it before your first session.
                    </p>

                    <div style="background-color: #FAF7F2; border: 1px solid #EAE3D9; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                      <div style="font-size: 13px; font-weight: 700; color: #1C1714; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                        Package Session Schedule
                      </div>
                      <ul style="padding-left: 20px; margin: 0; line-height: 1.8;">
                        ${scheduleListHtml}
                      </ul>
                    </div>

                    <div style="text-align: center; margin: 32px 0 20px;">
                      <a href="${finalAgreementUrl}" style="display: inline-block; background-color: #C25E38; color: #FFFFFF; font-size: 14.5px; font-weight: 600; text-decoration: none; padding: 15px 36px; border-radius: 10px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(194, 94, 56, 0.25);">
                        Review &amp; Accept Package Agreement &rarr;
                      </a>
                    </div>

                    <div style="font-size: 12px; color: #8C827A; text-align: center; word-break: break-all; margin-top: 14px;">
                      Direct link: <a href="${finalAgreementUrl}" style="color: #C25E38;">${finalAgreementUrl}</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11.5px; color: #8C827A;">
                    Better With Aarkesh · 1-on-1 Coaching
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: clientEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    console.log(`✉️ Dispatched client package agreement email to ${clientEmail}`);
  } catch (err) {
    console.error('Failed to send client package agreement email:', err);
  }
}

/**
 * Send Client Confirmation after Package Agreement has been Accepted
 */
export async function sendClientPackageAgreementAcceptedConfirmationEmail({ packageDoc, appointments = [] }) {
  if (!packageDoc) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    const resend = new Resend(resendApiKey);
    const clientName = packageDoc.clientName || 'Valued Client';
    const clientEmail = (packageDoc.clientEmail || '').trim().toLowerCase();
    const totalSessions = packageDoc.totalSessions || appointments.length || 0;

    const emailSubject = `Confirmed: Your Signed Coaching Package Agreement`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agreement Signed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
        <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                <tr>
                  <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                    <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; font-family: Georgia, serif;">
                      BetterWith<span style="color: #C25E38;">Aarkesh</span>
                    </div>
                    <div style="font-size: 11px; color: #2E7D32; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                      ✓ AGREEMENT DIGITALLY ACCEPTED
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px;">
                    <h2 style="font-size: 22px; color: #1C1714; font-family: Georgia, serif; margin: 0 0 14px 0;">
                      Thank you, ${clientName}.
                    </h2>
                    <p style="font-size: 15px; color: #555047; line-height: 1.6; margin: 0 0 20px 0;">
                      Your Coaching Agreement for your <strong>${totalSessions}-session coaching package</strong> is now active and on file.
                    </p>
                    ${packageDoc.agreementPdfUrl ? `
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${packageDoc.agreementPdfUrl}" style="display: inline-block; background-color: #1C1714; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 10px;">
                        📄 Download Signed Agreement PDF &rarr;
                      </a>
                    </div>
                    ` : ''}
                    <p style="font-size: 14px; color: #7A756B; line-height: 1.6; margin-top: 20px;">
                      We look forward to partnering with you on this transformational coaching engagement.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11.5px; color: #8C827A;">
                    Better With Aarkesh · 1-on-1 Coaching
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
      to: clientEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    console.log(`✉️ Dispatched client signed package agreement confirmation to ${clientEmail}`);
  } catch (err) {
    console.error('Failed to send signed package agreement confirmation email:', err);
  }
}


/**
 * Backwards compatibility wrapper (if called elsewhere)
 */
export async function sendCoachingBookingConfirmationEmail(params) {
  return sendCoachBookingAlertEmail(params);
}
