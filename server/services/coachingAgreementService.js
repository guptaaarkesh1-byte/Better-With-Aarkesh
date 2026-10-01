import PDFDocument from 'pdfkit';
import { Resend } from 'resend';

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
      doc.text(`Sessions: ${isSingle ? '[X]' : '[  ]'} Single     ${isPackage ? '[X]' : '[  ]'} Package`);
      doc.moveDown(0.6);
      doc.text(`Start Date: ${startDateTime || '_______________________________________'}`);
      doc.moveDown(0.6);
      doc.text(`Mode of Coaching: ${modeOfCoaching || '_________________________________'}`);
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
      doc.moveDown(0.6);
      doc.text('Any additional between-session support agreed for this engagement:');
      doc.moveDown(0.8);
      doc.font(fontRegular).fillColor('#999999').text('_________________________________________________________________________________');
      doc.moveDown(0.4);
      doc.text('_________________________________________________________________________________');
      doc.fillColor('#000000');
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
      doc.text('By signing below, both parties confirm that the information above accurately reflects the coaching arrangement agreed between them.');
      doc.moveDown(0.9);

      // Client Signature Block (Identical to original template)
      doc.font(fontBold).fontSize(11.5).text('Client');
      doc.moveDown(0.6);
      doc.font(fontRegular).fontSize(10.5).text(`Name: ${clientName || '___________________________________________'}`);
      doc.moveDown(0.6);
      doc.text('Signature: ______________________________________');
      doc.moveDown(0.6);
      doc.text(`Date: ${agreementDate || '___________________________________________'}`);
      doc.moveDown(1.1);

      // Coach Signature Block (Identical to original template)
      doc.font(fontBold).fontSize(11.5).text('Coach');
      doc.moveDown(0.4);
      doc.font(fontRegular).fontSize(10.5).text('Aarkesh Gupta');
      doc.text('BetterWithAarkesh');
      doc.moveDown(0.6);
      doc.text('Signature: ______________________________________');
      doc.moveDown(0.6);
      doc.text(`Date: ${agreementDate || '___________________________________________'}`);
      doc.moveDown(1.0);

      drawDivider(doc.y);
      doc.moveDown(1.1);

      // Additional Agreed Terms
      doc.font(fontBold).fontSize(11.5).text('Additional Agreed Terms, if any');
      doc.moveDown(0.8);
      doc.font(fontRegular).fillColor('#999999').text('_________________________________________________________________________________');
      doc.moveDown(0.4);
      doc.text('_________________________________________________________________________________');
      doc.moveDown(0.4);
      doc.text('_________________________________________________________________________________');
      doc.fillColor('#000000');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send Coaching Session Confirmation Email with dynamically filled PDF Agreement attached.
 */
export async function sendCoachingBookingConfirmationEmail({
  appointment,
  isFreeSession = false,
  freeSessionsRemaining = null,
}) {
  if (!appointment || !appointment.email) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping coaching booking confirmation email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const clientName = appointment.name || 'Valued Client';
    const clientEmail = appointment.email.trim().toLowerCase();
    const cleanDate = appointment.date || 'Scheduled Date';
    const cleanTime = appointment.time || 'Scheduled Time';
    const duration = appointment.duration || 60;
    const isFirstSession = appointment.isFirstSession;
    const meetLink = appointment.meetLink || '';

    // Generate exact replica PDF Buffer
    const pdfBuffer = await generateCoachingAgreementPdf({
      clientName,
      clientEmail,
      clientPhone: appointment.phoneNumber || appointment.phone || '',
      sessionDate: cleanDate,
      sessionTime: cleanTime,
      agreementDate: new Date(appointment.createdAt || Date.now()).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      isPackage: isFreeSession || Boolean(appointment.isCoursePackage),
      modeOfCoaching: 'Online Video (Google Meet)',
      meetLink,
    });

    const safeFilename = `Coaching_Agreement_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coaching Session Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
        <table width="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #050505; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #0c0c0c; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 36px 36px 24px; background: linear-gradient(180deg, #16130e 0%, #0c0c0c 100%); border-bottom: 1px solid #1f1f1f;">
                    <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                      Better With Aarkesh
                    </div>
                    <div style="font-size: 11px; color: #c79c6e; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                      1-on-1 Executive Coaching Confirmed
                    </div>
                  </td>
                </tr>

                <!-- Content Banner -->
                <tr>
                  <td style="padding: 28px 36px;">
                    <h2 style="margin: 0 0 10px; font-size: 20px; color: #ffffff; font-weight: 600;">
                      Session Confirmed, ${clientName}!
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #a3a3a3; line-height: 1.6;">
                      Your private 1-on-1 coaching session with Aarkesh Gupta has been reserved on the schedule.
                    </p>

                    <!-- Session Details Box -->
                    <div style="background-color: #12100d; border: 1px solid #26211a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #888888;" width="140">Date:</td>
                          <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${cleanDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #888888;">Time Slot:</td>
                          <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${cleanTime} (IST)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #888888;">Session Duration:</td>
                          <td style="padding: 6px 0; color: #c79c6e; font-weight: 600;">${duration} Minutes (${isFirstSession ? 'First Session' : 'Returning Client'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #888888;">Format:</td>
                          <td style="padding: 6px 0; color: #ffffff;">Private 1-on-1 Video Consultation</td>
                        </tr>
                        ${freeSessionsRemaining !== null ? `
                        <tr>
                          <td style="padding: 6px 0; color: #888888;">Remaining Credits:</td>
                          <td style="padding: 6px 0; color: #34d399; font-weight: 600;">${freeSessionsRemaining} Complimentary Sessions</td>
                        </tr>
                        ` : ''}
                        ${meetLink ? `
                        <tr>
                          <td style="padding: 6px 0; color: #888888;">Meeting Link:</td>
                          <td style="padding: 6px 0;"><a href="${meetLink}" style="color: #c79c6e; text-decoration: underline;">Join Google Meet Call</a></td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>

                    <!-- PDF Attachment Callout -->
                    <div style="background-color: #171511; border: 1px dashed #c79c6e; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                      <div style="font-size: 13px; font-weight: 600; color: #c79c6e; margin-bottom: 4px;">
                        📄 Attached: Coaching Agreement
                      </div>
                      <div style="font-size: 12px; color: #a3a3a3; line-height: 1.5;">
                        Your <strong>Coaching Agreement (${safeFilename})</strong> is attached to this email for your reference and records.
                      </div>
                    </div>

                    <p style="font-size: 13px; color: #888888; line-height: 1.6; margin: 0;">
                      Please be in a quiet space with stable internet 5 minutes before your scheduled start time. If you need to reschedule, please ensure at least 48 hours notice as per the Coaching Agreement.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #080808; border-top: 1px solid #1a1a1a; text-align: center; font-size: 11px; color: #555555; line-height: 1.5;">
                    <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                    <div>Questions? Reach out to <a href="mailto:coaching@betterwithaarkesh.com" style="color: #c79c6e; text-decoration: none;">coaching@betterwithaarkesh.com</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const coachEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222; line-height: 1.6;">
        <h2 style="color: #111010; border-bottom: 2px solid #c79c6e; padding-bottom: 8px;">New 1-on-1 Coaching Session Booked</h2>
        <p>A new coaching session has been reserved and confirmed:</p>
        <div style="background: #f8f6f0; border: 1px solid #e0d9cb; padding: 18px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Client Name:</strong> ${clientName}</p>
          <p style="margin: 4px 0;"><strong>Client Email:</strong> ${clientEmail}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${appointment.phoneNumber || appointment.phone || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${cleanDate} at ${cleanTime} (IST)</p>
          <p style="margin: 4px 0;"><strong>Duration:</strong> ${duration} mins (${isFirstSession ? 'First Session' : 'Returning Client'})</p>
          <p style="margin: 4px 0;"><strong>Type:</strong> ${isFreeSession ? 'Course Bonus (Complimentary)' : 'Standard Paid Session'}</p>
          ${meetLink ? `<p style="margin: 4px 0;"><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ''}
        </div>
        <p style="font-size: 13px; color: #555;">
          The <strong>Coaching Agreement PDF</strong> is attached to this notification.
        </p>
      </div>
    `;

    const attachments = [
      {
        filename: safeFilename,
        content: pdfBuffer,
      }
    ];

    const emailPromises = [
      // Send to Client with PDF attachment
      resend.emails.send({
        from: process.env.EMAIL_FROM || 'Better With Aarkesh <support@yashrajtech.online>',
        to: clientEmail,
        subject: `Coaching Session Confirmed + Coaching Agreement — ${cleanDate}`,
        html: clientEmailHtml,
        attachments,
      }),
      // Send to Coach / Admin with PDF attachment
      resend.emails.send({
        from: process.env.EMAIL_FROM || 'Better With Aarkesh <support@yashrajtech.online>',
        to: process.env.ADMIN_EMAIL || 'support@yashrajtech.online',
        subject: `New Coaching Booking: ${clientName} (${cleanDate} at ${cleanTime})`,
        html: coachEmailHtml,
        attachments,
      })
    ];

    const results = await Promise.allSettled(emailPromises);
    console.log(`✉️ Dispatched booking confirmation emails with agreement PDF for ${clientEmail}:`, results.map(r => r.status));
  } catch (err) {
    console.error('Failed to send booking confirmation email with PDF agreement:', err);
  }
}
