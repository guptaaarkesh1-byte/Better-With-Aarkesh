import { Resend } from 'resend';

const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

/**
 * Send Course Purchase Tax Invoice & Enrollment Receipt Email
 */
export async function sendCoursePurchaseInvoiceEmail({
  studentEmail,
  studentName = 'Valued Student',
  txnId = '',
  orderId = '',
  amount = 11800,
  basePrice = 10000,
  gstRate = 18,
  gstAmount = 1800,
  isGstIncluded = false,
  courseTitle = 'The Presence Protocol™',
  invoiceItemTitle = '',
  invoiceItemSubtitle = '',
  bonusItemTitle = '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh',
  bonusItemSubtitle = 'Valued at ₹15,000 — 100% Complimentary student bonus',
  purchaseDate = new Date(),
}) {
  if (!studentEmail) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping purchase invoice email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const dateObj = purchaseDate instanceof Date ? purchaseDate : new Date(purchaseDate);
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const cleanTxnId = txnId || `pay_${Date.now().toString(36)}`;
    const invoiceNumber = `INV-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}-${cleanTxnId.slice(-6).toUpperCase()}`;
    const mainHeading = invoiceItemTitle || `${courseTitle} — Masterclass Lifetime Access`;
    const mainSubtitle = invoiceItemSubtitle || 'HD video frameworks, modular curriculum, worksheets & community';
    const clientUrl = getClientUrl();
    const courseAccessUrl = `${clientUrl}/course`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Invoice & Enrollment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
        <table width="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #050505; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #0c0c0c; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 36px 36px 24px; background: linear-gradient(180deg, #16130e 0%, #0c0c0c 100%); border-bottom: 1px solid #1f1f1f;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            Better With Aarkesh
                          </div>
                          <div style="font-size: 11px; color: #c79c6e; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                            Official Tax Invoice &amp; Enrollment Bill
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 5px 12px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                            PAID IN FULL
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Success Banner -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #12100d; border-bottom: 1px solid #1f1f1f;">
                    <h2 style="margin: 0 0 8px; font-size: 18px; color: #ffffff; font-weight: 600;">
                      Congratulations, ${studentName}! 🎉
                    </h2>
                    <p style="margin: 0; font-size: 13px; color: #a3a3a3; line-height: 1.6;">
                      Your enrollment for <strong style="color: #c79c6e;">${courseTitle}</strong> is active. You have full lifetime access to all course lessons, exercises, and community updates.
                    </p>
                  </td>
                </tr>

                <!-- Invoice Meta Details -->
                <tr>
                  <td style="padding: 24px 36px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 16px;">
                          <div style="font-size: 10px; color: #c79c6e; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 4px;">Billed To</div>
                          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${studentName}</div>
                          <div style="color: #888888; font-size: 12px; margin-top: 2px;">${studentEmail}</div>
                        </td>
                        <td width="50%" valign="top" align="right" style="padding-bottom: 16px;">
                          <div style="font-size: 10px; color: #c79c6e; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 4px;">Invoice Number</div>
                          <div style="font-size: 13px; font-weight: bold; color: #ffffff; font-family: monospace;">${invoiceNumber}</div>
                          <div style="color: #888888; font-size: 11px; margin-top: 2px;">Date: ${formattedDate}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top">
                          <div style="font-size: 10px; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Transaction ID</div>
                          <div style="font-family: monospace; font-size: 11px; color: #d4d4d4;">${cleanTxnId}</div>
                        </td>
                        <td width="50%" valign="top" align="right">
                          <div style="font-size: 10px; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Order ID</div>
                          <div style="font-family: monospace; font-size: 11px; color: #d4d4d4;">${orderId || 'N/A'}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Itemized Invoice Table -->
                <tr>
                  <td style="padding: 10px 36px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #262626; text-transform: uppercase; font-size: 10px; color: #737373; letter-spacing: 1px;">
                          <th align="left" style="padding: 10px 0;">Description</th>
                          <th align="center" style="padding: 10px 10px;">Qty</th>
                          <th align="right" style="padding: 10px 0;">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Line Item 1: Course -->
                        <tr style="border-bottom: 1px solid #1a1a1a;">
                          <td style="padding: 14px 0 10px;">
                            <div style="font-weight: 600; color: #ffffff; font-size: 13px;">${mainHeading}</div>
                            <div style="font-size: 11px; color: #737373; margin-top: 3px;">${mainSubtitle}</div>
                          </td>
                          <td align="center" style="color: #a3a3a3; font-family: monospace;">1</td>
                          <td align="right" style="font-weight: 600; color: #ffffff; font-family: monospace;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                        </tr>

                        <!-- Line Item 2: GST -->
                        <tr style="border-bottom: 1px solid #1a1a1a;">
                          <td style="padding: 10px 0;">
                            <div style="color: #d4d4d4;">Goods &amp; Services Tax (GST @ ${gstRate}%) ${isGstIncluded ? '<span style="font-size: 10px; color: #737373;">(Inclusive)</span>' : ''}</div>
                          </td>
                          <td align="center" style="color: #737373; font-family: monospace;">-</td>
                          <td align="right" style="color: #d4d4d4; font-family: monospace;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
                        </tr>

                        <!-- Line Item 3: Bonus -->
                        ${bonusItemTitle ? `
                        <tr style="border-bottom: 1px solid #1a1a1a;">
                          <td style="padding: 10px 0;">
                            <div style="color: #34d399; font-weight: 600;">✦ ${bonusItemTitle}</div>
                            <div style="font-size: 11px; color: #737373; margin-top: 2px;">${bonusItemSubtitle}</div>
                          </td>
                          <td align="center" style="color: #34d399; font-family: monospace;">3</td>
                          <td align="right" style="color: #34d399; font-weight: bold; font-family: monospace;">FREE (₹0)</td>
                        </tr>
                        ` : ''}
                      </tbody>
                    </table>

                    <!-- Totals Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; border-top: 1px solid #262626; padding-top: 12px; font-size: 12px;">
                      <tr>
                        <td align="right" style="color: #888888; padding-bottom: 6px;">Course Subtotal:</td>
                        <td align="right" width="100" style="color: #ffffff; font-family: monospace; padding-bottom: 6px;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td align="right" style="color: #888888; padding-bottom: 6px;">GST (${gstRate}%):</td>
                        <td align="right" width="100" style="color: #c79c6e; font-family: monospace; padding-bottom: 6px;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style="font-size: 15px; font-weight: bold;">
                        <td align="right" style="color: #ffffff; padding-top: 8px; border-top: 1px solid #262626;">Total Paid:</td>
                        <td align="right" width="100" style="color: #c79c6e; font-family: monospace; padding-top: 8px; border-top: 1px solid #262626;">₹${Number(amount).toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Call to Action -->
                <tr>
                  <td align="center" style="padding: 10px 36px 36px;">
                    <a href="${courseAccessUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #c79c6e 0%, #a67c52 100%); color: #000000; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 24px; border-radius: 10px; text-align: center; box-shadow: 0 4px 20px rgba(199, 156, 110, 0.3);">
                      Access Your Course Dashboard &rarr;
                    </a>
                    <div style="font-size: 11px; color: #666666; margin-top: 12px;">
                      You can also view and download this tax invoice anytime from your <strong style="color: #a3a3a3;">Student Profile &gt; Invoices &amp; Billing</strong> tab.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #080808; border-top: 1px solid #1a1a1a; text-align: center; font-size: 11px; color: #555555; line-height: 1.5;">
                    <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                    <div>For any invoice or technical queries, contact <a href="mailto:support@betterwithaarkesh.com" style="color: #c79c6e; text-decoration: none;">support@betterwithaarkesh.com</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <support@yashrajtech.online>',
      to: studentEmail,
      subject: `Official Tax Invoice & Enrollment Receipt — ${courseTitle} (${invoiceNumber})`,
      html: emailHtml,
    });

    if (error) {
      console.warn('⚠️ Purchase Invoice Email sending warning:', error);
    } else {
      console.log(`✉️ Purchase invoice email sent successfully to ${studentEmail} (ID: ${data?.id})`);
    }
  } catch (err) {
    console.error('Failed to send purchase invoice email:', err);
  }
}

/**
 * Send Course Payment Failed Notice & Bill Summary Email
 */
export async function sendCoursePaymentFailedEmail({
  studentEmail,
  studentName = 'Valued Student',
  txnId = '',
  orderId = '',
  amount = 11800,
  failureReason = 'Transaction declined by issuing bank or cancelled',
  errorCode = 'PAYMENT_FAILED',
  courseTitle = 'The Presence Protocol™',
  invoiceItemTitle = '',
  purchaseDate = new Date(),
}) {
  if (!studentEmail) return;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Skipping failed payment notice email.');
      return;
    }

    const resend = new Resend(resendApiKey);
    const dateObj = purchaseDate instanceof Date ? purchaseDate : new Date(purchaseDate);
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const cleanTxnId = txnId || `failed_${Date.now().toString(36)}`;
    const invoiceNumber = `INV-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}-${cleanTxnId.slice(-6).toUpperCase()}`;
    const mainHeading = invoiceItemTitle || `${courseTitle} — Masterclass Lifetime Access`;
    const clientUrl = getClientUrl();
    const retryCheckoutUrl = `${clientUrl}/course`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Attempt Notice</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
        <table width="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #050505; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #0c0c0c; border: 1px solid #2f1b1d; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 36px 36px 24px; background: linear-gradient(180deg, #1b0f11 0%, #0c0c0c 100%); border-bottom: 1px solid #261619;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            Better With Aarkesh
                          </div>
                          <div style="font-size: 11px; color: #f87171; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                            Payment Attempt Notice &amp; Bill Summary
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 5px 12px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                            PAYMENT FAILED
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Failed Notice Banner -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #160c0e; border-bottom: 1px solid #291518;">
                    <h2 style="margin: 0 0 8px; font-size: 17px; color: #fca5a5; font-weight: 600;">
                      Payment Incomplete for ${courseTitle}
                    </h2>
                    <p style="margin: 0; font-size: 13px; color: #d1d5db; line-height: 1.6;">
                      Hi ${studentName}, we noticed your recent enrollment payment attempt did not go through. No worries — your enrollment slot is reserved, and you can retry anytime below.
                    </p>
                  </td>
                </tr>

                <!-- Failure Diagnostic Box -->
                <tr>
                  <td style="padding: 20px 36px 12px;">
                    <div style="background-color: #14090b; border: 1px solid #3b171c; border-radius: 10px; padding: 16px;">
                      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #f87171; font-weight: bold; margin-bottom: 6px;">Diagnostic Reason:</div>
                      <div style="font-size: 13px; color: #ffffff; font-weight: 500; line-height: 1.5;">${failureReason}</div>
                      ${errorCode ? `<div style="font-family: monospace; font-size: 11px; color: #a1a1aa; margin-top: 4px;">Code: ${errorCode}</div>` : ''}
                    </div>
                  </td>
                </tr>

                <!-- Invoice Details -->
                <tr>
                  <td style="padding: 16px 36px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #a3a3a3;">
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 12px;">
                          <div style="font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Course Plan</div>
                          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${mainHeading}</div>
                        </td>
                        <td width="50%" valign="top" align="right" style="padding-bottom: 12px;">
                          <div style="font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Attempt Reference</div>
                          <div style="font-size: 12px; font-weight: bold; color: #ffffff; font-family: monospace;">${invoiceNumber}</div>
                          <div style="font-size: 11px; color: #737373; margin-top: 2px;">${formattedDate}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top">
                          <div style="font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Attempted Amount</div>
                          <div style="font-size: 14px; font-weight: bold; color: #ffffff; font-family: monospace;">₹${Number(amount).toLocaleString('en-IN')}</div>
                        </td>
                        <td width="50%" valign="top" align="right">
                          <div style="font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Order ID</div>
                          <div style="font-family: monospace; font-size: 11px; color: #d4d4d4;">${orderId || 'N/A'}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Retry CTA -->
                <tr>
                  <td align="center" style="padding: 10px 36px 30px;">
                    <a href="${retryCheckoutUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #c79c6e 0%, #a67c52 100%); color: #000000; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 24px; border-radius: 10px; text-align: center; box-shadow: 0 4px 20px rgba(199, 156, 110, 0.25);">
                      Retry Payment &amp; Complete Enrollment &rarr;
                    </a>
                    
                    <!-- Troubleshooting Tips -->
                    <div style="margin-top: 20px; text-align: left; background-color: #111111; border: 1px solid #1f1f1f; border-radius: 10px; padding: 14px 18px; font-size: 11px; color: #888888; line-height: 1.6;">
                      <strong style="color: #c79c6e; display: block; margin-bottom: 4px;">Quick Troubleshooting Tips:</strong>
                      <ul style="margin: 0; padding-left: 16px;">
                        <li>Ensure online / international transactions are enabled on your card.</li>
                        <li>Check if your UPI daily limit is sufficient for ₹${Number(amount).toLocaleString('en-IN')}.</li>
                        <li>Alternatively, try Netbanking or another UPI app (GPay / PhonePe / Paytm).</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #080808; border-top: 1px solid #1a1a1a; text-align: center; font-size: 11px; color: #555555; line-height: 1.5;">
                    <div>Better With Aarkesh · Executive Leadership Coaching</div>
                    <div>Need help? Email us directly at <a href="mailto:support@betterwithaarkesh.com" style="color: #c79c6e; text-decoration: none;">support@betterwithaarkesh.com</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Better With Aarkesh <support@yashrajtech.online>',
      to: studentEmail,
      subject: `Payment Attempt Notice — ${courseTitle} (${invoiceNumber})`,
      html: emailHtml,
    });

    if (error) {
      console.warn('⚠️ Payment Failed Email sending warning:', error);
    } else {
      console.log(`✉️ Failed payment notice email sent successfully to ${studentEmail} (ID: ${data?.id})`);
    }
  } catch (err) {
    console.error('Failed to send failed payment notice email:', err);
  }
}
