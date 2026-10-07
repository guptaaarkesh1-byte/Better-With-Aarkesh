import { Resend } from 'resend';

const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

/**
 * Send Course Purchase Tax Invoice & Enrollment Receipt Email (to Student & Admin Alert)
 */
export async function sendCoursePurchaseInvoiceEmail({
  studentEmail,
  studentName = 'Valued Student',
  studentPhone = '',
  txnId = '',
  orderId = '',
  amount = 11800,
  basePrice = 10000,
  gstRate = 18,
  gstAmount = 1800,
  isGstIncluded = false,
  courseTitle = 'The Better Man™',
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
    const adminDashboardUrl = `${clientUrl}/admin`;
    const adminEmail = process.env.ADMIN_EMAIL || 'guptaaarkesh1@gmail.com';
    const emailSender = process.env.EMAIL_FROM || 'Better With Aarkesh <support@yashrajtech.online>';

    // 1. Student Tax Invoice & Enrollment Email
    const studentEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Invoice & Enrollment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #060207; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1ebf0;">
        <table width="100%" bgcolor="#060207" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #060207; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #0e0410; border: 1px solid #3d143a; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(200, 120, 190, 0.1);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 34px 36px 24px; background: linear-gradient(180deg, #1d0722 0%, #0e0410 100%); border-bottom: 1px solid #2d0e2e;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            Better With Aarkesh
                          </div>
                          <div style="font-size: 11px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                            Official Tax Invoice &amp; Enrollment Bill
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 5px 12px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(52, 211, 153, 0.45); color: #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                            PAID IN FULL
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Success Banner -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #140517; border-bottom: 1px solid #280b2a;">
                    <h2 style="margin: 0 0 8px; font-size: 18px; color: #ffffff; font-weight: 600;">
                      Congratulations, ${studentName}! 🎉
                    </h2>
                    <p style="margin: 0; font-size: 13px; color: #cbbcc9; line-height: 1.6;">
                      Your enrollment for <strong style="color: #E3B8DE;">${courseTitle}</strong> is active. You have full lifetime access to all course lessons, exercises, and community updates.
                    </p>
                  </td>
                </tr>

                <!-- Invoice Meta Details -->
                <tr>
                  <td style="padding: 24px 36px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 16px;">
                          <div style="font-size: 10px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 4px;">Billed To</div>
                          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${studentName}</div>
                          <div style="color: #9d8c9b; font-size: 12px; margin-top: 2px;">${studentEmail}</div>
                          ${studentPhone ? `<div style="color: #cbbcc9; font-size: 11px; margin-top: 3px; font-family: monospace;">📞 ${studentPhone}</div>` : ''}
                        </td>
                        <td width="50%" valign="top" align="right" style="padding-bottom: 16px;">
                          <div style="font-size: 10px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 4px;">Invoice Number</div>
                          <div style="font-size: 13px; font-weight: bold; color: #ffffff; font-family: monospace;">${invoiceNumber}</div>
                          <div style="color: #9d8c9b; font-size: 11px; margin-top: 2px;">Date: ${formattedDate}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top">
                          <div style="font-size: 10px; color: #7f6e7d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Transaction ID</div>
                          <div style="font-family: monospace; font-size: 11px; color: #d4cad3;">${cleanTxnId}</div>
                        </td>
                        <td width="50%" valign="top" align="right">
                          <div style="font-size: 10px; color: #7f6e7d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Order ID</div>
                          <div style="font-family: monospace; font-size: 11px; color: #d4cad3;">${orderId || 'N/A'}</div>
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
                        <tr style="border-bottom: 1px solid #331135; text-transform: uppercase; font-size: 10px; color: #9d8c9b; letter-spacing: 1px;">
                          <th align="left" style="padding: 10px 0;">Description</th>
                          <th align="center" style="padding: 10px 10px;">Qty</th>
                          <th align="right" style="padding: 10px 0;">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Line Item 1: Course -->
                        <tr style="border-bottom: 1px solid #230b25;">
                          <td style="padding: 14px 0 10px;">
                            <div style="font-weight: 600; color: #ffffff; font-size: 13px;">${mainHeading}</div>
                            <div style="font-size: 11px; color: #9d8c9b; margin-top: 3px;">${mainSubtitle}</div>
                          </td>
                          <td align="center" style="color: #cbbcc9; font-family: monospace;">1</td>
                          <td align="right" style="font-weight: 600; color: #ffffff; font-family: monospace;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                        </tr>

                        <!-- Line Item 2: GST -->
                        <tr style="border-bottom: 1px solid #230b25;">
                          <td style="padding: 10px 0;">
                            <div style="color: #d4cad3;">Goods &amp; Services Tax (GST @ ${gstRate}%) ${isGstIncluded ? '<span style="font-size: 10px; color: #9d8c9b;">(Inclusive)</span>' : ''}</div>
                          </td>
                          <td align="center" style="color: #7f6e7d; font-family: monospace;">-</td>
                          <td align="right" style="color: #d4cad3; font-family: monospace;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
                        </tr>

                        <!-- Line Item 3: Bonus -->
                        ${bonusItemTitle ? `
                        <tr style="border-bottom: 1px solid #230b25;">
                          <td style="padding: 10px 0;">
                            <div style="color: #34d399; font-weight: 600;">✦ ${bonusItemTitle}</div>
                            <div style="font-size: 11px; color: #9d8c9b; margin-top: 2px;">${bonusItemSubtitle}</div>
                          </td>
                          <td align="center" style="color: #34d399; font-family: monospace;">3</td>
                          <td align="right" style="color: #34d399; font-weight: bold; font-family: monospace;">FREE (₹0)</td>
                        </tr>
                        ` : ''}
                      </tbody>
                    </table>

                    <!-- Totals Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; border-top: 1px solid #331135; padding-top: 12px; font-size: 12px;">
                      <tr>
                        <td align="right" style="color: #9d8c9b; padding-bottom: 6px;">Course Subtotal:</td>
                        <td align="right" width="100" style="color: #ffffff; font-family: monospace; padding-bottom: 6px;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td align="right" style="color: #9d8c9b; padding-bottom: 6px;">GST (${gstRate}%):</td>
                        <td align="right" width="100" style="color: #E3B8DE; font-family: monospace; padding-bottom: 6px;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style="font-size: 15px; font-weight: bold;">
                        <td align="right" style="color: #ffffff; padding-top: 8px; border-top: 1px solid #331135;">Total Paid:</td>
                        <td align="right" width="100" style="color: #E3B8DE; font-family: monospace; padding-top: 8px; border-top: 1px solid #331135;">₹${Number(amount).toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Call to Action -->
                <tr>
                  <td align="center" style="padding: 10px 36px 36px;">
                    <a href="${courseAccessUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #A83B96 0%, #7A2A70 100%); color: #ffffff; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 24px; border-radius: 12px; text-align: center; box-shadow: 0 6px 24px rgba(200, 120, 190, 0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                      Access Your Course Dashboard &rarr;
                    </a>
                    <div style="font-size: 11px; color: #7f6e7d; margin-top: 12px;">
                      You can also view and download this tax invoice anytime from your <strong style="color: #cbbcc9;">Student Profile &gt; Invoices &amp; Billing</strong> tab.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #09020b; border-top: 1px solid #230b25; text-align: center; font-size: 11px; color: #6e5d6c; line-height: 1.5;">
                    <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                    <div>For any invoice or technical queries, contact <a href="mailto:coaching@aarkeshgupta.com" style="color: #E3B8DE; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 2. Admin Alert Email (Course Purchase & Revenue Notification)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Course Purchase Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #060207; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1ebf0;">
        <table width="100%" bgcolor="#060207" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #060207; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #0e0410; border: 1px solid #3d143a; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(200, 120, 190, 0.1);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 32px 36px 22px; background: linear-gradient(180deg, #1d0722 0%, #0e0410 100%); border-bottom: 1px solid #2d0e2e;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                            Better With Aarkesh
                          </div>
                          <div style="font-size: 11px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">
                            🚨 ADMIN ALERT · NEW COURSE PURCHASE
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 6px 14px; background-color: rgba(200, 120, 190, 0.18); border: 1px solid rgba(200, 120, 190, 0.5); color: #E3B8DE; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                            ₹${Number(amount).toLocaleString('en-IN')} RECEIVED
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Highlight Revenue & Course Banner -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #140517; border-bottom: 1px solid #280b2a;">
                    <div style="font-size: 12px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">New Enrollment</div>
                    <h2 style="margin: 0 0 6px; font-size: 20px; color: #ffffff; font-weight: 700;">
                      ${studentName} just purchased ${courseTitle}!
                    </h2>
                    <p style="margin: 0; font-size: 13px; color: #cbbcc9; line-height: 1.6;">
                      Payment has been verified via Razorpay and 3 private 1-on-1 coaching sessions have been credited to the student's profile.
                    </p>
                  </td>
                </tr>

                <!-- Student & Enrollment Details -->
                <tr>
                  <td style="padding: 24px 36px 16px;">
                    <div style="font-size: 11px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 12px;">Student Profile &amp; Contact</div>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #160718; border: 1px solid #351138; border-radius: 12px; padding: 18px; font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #9d8c9b;" width="38%">Student Name:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${studentName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #9d8c9b;">Student Email:</td>
                        <td style="padding: 6px 0; color: #E3B8DE; font-weight: 600;"><a href="mailto:${studentEmail}" style="color: #E3B8DE; text-decoration: none;">${studentEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #9d8c9b;">Phone Number:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-family: monospace;">${studentPhone || 'Not provided at checkout'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #9d8c9b;">Purchased Course:</td>
                        <td style="padding: 6px 0; color: #E3B8DE; font-weight: 600;">${courseTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #9d8c9b;">Private Sessions Credited:</td>
                        <td style="padding: 6px 0; color: #34d399; font-weight: 600;">3 Free 1-on-1 Sessions (Active)</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #9d8c9b;">Purchase Date &amp; Time:</td>
                        <td style="padding: 6px 0; color: #d4cad3;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Financial & Invoice Summary -->
                <tr>
                  <td style="padding: 10px 36px 24px;">
                    <div style="font-size: 11px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 12px;">Payment &amp; Invoice Breakdown</div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #331135; text-transform: uppercase; font-size: 10px; color: #9d8c9b; letter-spacing: 1px;">
                          <th align="left" style="padding: 8px 0;">Item Description</th>
                          <th align="center" style="padding: 8px 10px;">Qty</th>
                          <th align="right" style="padding: 8px 0;">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style="border-bottom: 1px solid #230b25;">
                          <td style="padding: 12px 0;">
                            <div style="font-weight: 600; color: #ffffff;">${mainHeading}</div>
                            <div style="font-size: 11px; color: #9d8c9b; margin-top: 2px;">${mainSubtitle}</div>
                          </td>
                          <td align="center" style="color: #cbbcc9; font-family: monospace;">1</td>
                          <td align="right" style="font-weight: 600; color: #ffffff; font-family: monospace;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #230b25;">
                          <td style="padding: 10px 0; color: #d4cad3;">
                            GST (${gstRate}%) ${isGstIncluded ? '(Inclusive)' : ''}
                          </td>
                          <td align="center" style="color: #7f6e7d; font-family: monospace;">-</td>
                          <td align="right" style="color: #d4cad3; font-family: monospace;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Totals Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 14px; border-top: 1px solid #331135; padding-top: 10px; font-size: 12px;">
                      <tr>
                        <td align="right" style="color: #9d8c9b; padding-bottom: 4px;">Course Base Price:</td>
                        <td align="right" width="120" style="color: #ffffff; font-family: monospace; padding-bottom: 4px;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td align="right" style="color: #9d8c9b; padding-bottom: 4px;">GST Collected:</td>
                        <td align="right" width="120" style="color: #E3B8DE; font-family: monospace; padding-bottom: 4px;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style="font-size: 16px; font-weight: bold;">
                        <td align="right" style="color: #ffffff; padding-top: 8px; border-top: 1px solid #331135;">Total Revenue Received:</td>
                        <td align="right" width="120" style="color: #34d399; font-family: monospace; padding-top: 8px; border-top: 1px solid #331135;">₹${Number(amount).toLocaleString('en-IN')}</td>
                      </tr>
                    </table>

                    <!-- Transaction Meta Reference -->
                    <div style="margin-top: 18px; padding: 12px 16px; background-color: #120414; border: 1px solid #2b0b2e; border-radius: 10px; font-size: 11px; color: #9d8c9b;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%"><strong>Invoice No:</strong> <span style="color: #ffffff; font-family: monospace;">${invoiceNumber}</span></td>
                          <td width="50%" align="right"><strong>Payment ID:</strong> <span style="color: #ffffff; font-family: monospace;">${cleanTxnId}</span></td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding-top: 6px;"><strong>Order ID:</strong> <span style="color: #ffffff; font-family: monospace;">${orderId || 'N/A'}</span></td>
                          <td width="50%" align="right" style="padding-top: 6px;"><strong>Gateway:</strong> Razorpay Secure</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Admin Quick Action Links -->
                <tr>
                  <td align="center" style="padding: 10px 36px 36px;">
                    <a href="${adminDashboardUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #A83B96 0%, #7A2A70 100%); color: #ffffff; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 24px; border-radius: 12px; text-align: center; box-shadow: 0 6px 24px rgba(200, 120, 190, 0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                      Open Admin Portal &rarr;
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #09020b; border-top: 1px solid #230b25; text-align: center; font-size: 11px; color: #6e5d6c; line-height: 1.5;">
                    <div>Better With Aarkesh · Automated Admin Alert System</div>
                    <div>This is an internal notification sent to <a href="mailto:${adminEmail}" style="color: #E3B8DE; text-decoration: none;">${adminEmail}</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Dispatch email to Student
    const studentSendPromise = resend.emails.send({
      from: emailSender,
      to: studentEmail,
      subject: `Official Tax Invoice & Enrollment Receipt — ${courseTitle} (${invoiceNumber})`,
      html: studentEmailHtml,
    });

    // Dispatch notification email to Admin (guptaaarkesh1@gmail.com)
    const adminSendPromise = resend.emails.send({
      from: emailSender,
      to: adminEmail,
      subject: `🎉 New Course Purchase: ${studentName} enrolled in ${courseTitle} (₹${Number(amount).toLocaleString('en-IN')})`,
      html: adminEmailHtml,
    });

    const [studentRes, adminRes] = await Promise.allSettled([studentSendPromise, adminSendPromise]);

    if (studentRes.status === 'fulfilled' && !studentRes.value.error) {
      console.log(`✉️ Student purchase invoice email sent to ${studentEmail} (ID: ${studentRes.value.data?.id})`);
    } else {
      console.warn('⚠️ Student purchase invoice email warning:', studentRes.value?.error || studentRes.reason);
    }

    if (adminRes.status === 'fulfilled' && !adminRes.value.error) {
      console.log(`🔔 Admin purchase notification email sent to ${adminEmail} (ID: ${adminRes.value.data?.id})`);
    } else {
      console.warn('⚠️ Admin purchase notification email warning:', adminRes.value?.error || adminRes.reason);
    }
  } catch (err) {
    console.error('Failed to send purchase emails:', err);
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
  courseTitle = 'The Better Man™',
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
                    <div>Need help? Email us directly at <a href="mailto:coaching@aarkeshgupta.com" style="color: #c79c6e; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
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
