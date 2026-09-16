import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const coachingTermsHtml = `
<h2>1. Introduction &amp; Overview</h2>
<p>Welcome to <strong>Better With Aarkesh</strong> ("we," "us," or "our"), operated by <strong>Better With Aarkesh (Proprietorship of Aarkesh Gupta)</strong>. By accessing our website, booking 1:1 life-coaching sessions, or using any related coaching services, you agree to comply with and be bound by these Terms &amp; Conditions.</p>

<h2>2. Life Coaching Disclaimer — Not Medical or Mental Health Treatment</h2>
<p><strong>IMPORTANT DISCLAIMER:</strong> Life coaching, 1:1 mentorship, guidance sessions, and any related materials provided by Better With Aarkesh and Aarkesh Gupta are intended solely for personal development, goal setting, self-mastery, perspective enhancement, and educational purposes.</p>
<p>Life coaching is <strong>NOT</strong> medical treatment, psychotherapy, psychoanalysis, psychiatric diagnosis, psychological counseling, cognitive therapy, or emergency mental-health care. We are not licensed medical healthcare practitioners, physicians, or licensed clinical psychologists. If you are experiencing acute psychological distress, mental illness, clinical depression, or emergency mental-health situations, you must immediately seek the care of a licensed medical or mental healthcare professional or emergency medical services in your local jurisdiction.</p>

<h2>3. Eligibility &amp; Client Responsibilities</h2>
<p>You must be at least 18 years of age (or the age of majority in your jurisdiction) to book coaching sessions. As a client, you acknowledge that your personal and professional growth depends on your own commitment, decisions, and independent actions. We make no guarantee of specific financial, career, personal, or emotional outcomes.</p>

<h2>4. Session Bookings, Scheduling &amp; Rescheduling</h2>
<p>All coaching sessions must be scheduled in advance via our official online booking portal. You are responsible for ensuring accurate time-zone selection and providing a valid email address and phone number for session communication.</p>
<ul>
  <li><strong>Rescheduling Window:</strong> Sessions may be rescheduled at no additional charge up to <strong>24 hours prior to the scheduled session start time</strong> via your confirmation link or by contacting <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a>.</li>
  <li><strong>No-Show Policy:</strong> If you fail to attend a confirmed session within 15 minutes of the start time without prior written notice within the allowed 24-hour window, the session will be considered completed and non-refundable.</li>
</ul>

<h2>5. Payments &amp; Billing</h2>
<p>Payments for coaching sessions are processed securely via verified third-party payment gateways (including Razorpay). Prices are listed clearly in Indian Rupees (INR) on the website before booking. By completing a booking, you authorize the charge to your selected payment method.</p>

<h2>6. Intellectual Property &amp; Confidentiality</h2>
<p>All coaching frameworks, proprietary worksheets, guides, and materials shared during or after coaching sessions remain the exclusive intellectual property of Better With Aarkesh. You may not reproduce, publish, record, distribute, or create derivative works from our materials without prior written consent.</p>
<p>We respect your privacy and treat personal disclosures made during 1:1 coaching with utmost confidentiality, subject to applicable legal disclosure mandates (such as an imminent threat of harm to self or others).</p>

<h2>7. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, Better With Aarkesh, its owner, agents, and affiliates shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising out of your participation in coaching sessions or reliance on information provided on this website.</p>

<h2>8. Modifications to Services &amp; Terms</h2>
<p>We reserve the right to revise or update these Terms &amp; Conditions at any time. Any changes will be posted on this page with an updated revision date. Continued use of our services following changes constitutes acceptance of the new terms.</p>

<h2>9. Contact Information</h2>
<p>For questions regarding these Terms &amp; Conditions or your coaching bookings, please contact us at:</p>
<p><strong>Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a> / <a href="mailto:contact@aarkeshgupta.com">contact@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const coachingPrivacyHtml = `
<h2>1. Introduction</h2>
<p><strong>Better With Aarkesh</strong> ("we," "our," or "us"), operated by <strong>Better With Aarkesh (Proprietor: Aarkesh Gupta)</strong>, is committed to safeguarding your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit our website or book 1:1 life-coaching services.</p>

<h2>2. Information We Collect</h2>
<p>We collect information that you provide directly to us when interacting with our website and coaching services:</p>
<ul>
  <li><strong>Contact Details:</strong> Full name, email address, phone number, and location/country.</li>
  <li><strong>Booking &amp; Consultation Information:</strong> Selected session date/time, personal notes, coaching goals, and intake questionnaire responses submitted prior to sessions.</li>
  <li><strong>Payment Information:</strong> Transaction ID, order ID, payment amount, and billing status. <em>Please note: We do not store or process your full credit card numbers, CVV, or banking passwords directly on our servers. All financial transactions are handled securely by Razorpay and authorized payment gateways adhering to PCI-DSS standards.</em></li>
  <li><strong>Technical &amp; Analytics Data:</strong> IP address, browser type, device information, and anonymous session telemetry used to improve site performance and security.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>Your information is used strictly for legitimate business and coaching delivery purposes, including:</p>
<ul>
  <li>Scheduling, confirming, and managing your 1:1 coaching sessions.</li>
  <li>Sending meeting access links (e.g., Google Meet / Zoom), calendar invites, and session reminders.</li>
  <li>Issuing transaction receipts and tax invoices.</li>
  <li>Responding to your inquiries, support requests, and feedback.</li>
  <li>Maintaining site security, fraud prevention, and regulatory compliance.</li>
</ul>

<h2>4. Information Sharing &amp; Third-Party Services</h2>
<p>We do not sell, rent, or trade your personal data. We share necessary data only with trusted third-party service providers essential for delivering our services:</p>
<ul>
  <li><strong>Payment Processors:</strong> Razorpay (for secure transaction processing).</li>
  <li><strong>Email &amp; Communication Providers:</strong> Transactional email service providers (e.g., Brevo / Nodemailer) for automated booking confirmations and reminders.</li>
  <li><strong>Video Conferencing:</strong> Google Meet / Zoom for conducting live online 1:1 sessions.</li>
  <li><strong>Legal Requirements:</strong> When mandated by law, court order, or governmental authorities.</li>
</ul>

<h2>5. Data Security &amp; Retention</h2>
<p>We implement industry-standard technical and organizational security measures (including SSL/TLS encryption and restricted database access) to protect your personal data against unauthorized access, alteration, disclosure, or destruction. We retain personal records only as long as necessary to fulfill coaching engagements and meet statutory tax/accounting obligations.</p>

<h2>6. Your Privacy Rights</h2>
<p>Depending on your jurisdiction, you have the right to request access to, correction of, or deletion of your personal information held by us. To exercise any of these rights, please contact our privacy representative at <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a>.</p>

<h2>7. Cookies &amp; Tracking Technologies</h2>
<p>Our website may use essential cookies and lightweight local storage to maintain session state, user preferences, and secure site operations. You can control or disable cookies through your browser settings.</p>

<h2>8. Contact Us</h2>
<p>If you have any questions or concerns about this Privacy Policy or our data handling practices, please contact us at:</p>
<p><strong>Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const coachingRefundHtml = `
<h2>1. Overview</h2>
<p>At <strong>Better With Aarkesh</strong> (operated by <strong>Better With Aarkesh / Aarkesh Gupta</strong>), we strive to provide high-value, transformative 1:1 coaching experiences. Because our 1:1 sessions require dedicated calendar allocation and preparation time by the coach, our refund and cancellation terms are outlined below.</p>

<h2>2. 1:1 Coaching Sessions — Cancellation &amp; Rescheduling</h2>
<p>We understand that unexpected circumstances arise. We offer flexible rescheduling options subject to the following conditions:</p>
<ul>
  <li><strong>Rescheduling Notice:</strong> You may reschedule your booked 1:1 session at no additional charge by notifying us at least <strong>24 hours prior to the scheduled session start time</strong> via your booking confirmation link or by emailing <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a>.</li>
  <li><strong>Late Cancellations &amp; No-Shows:</strong> Cancellations made with less than <strong>24 hours notice</strong>, or failure to join the scheduled video call within 15 minutes of the start time (no-show), are non-refundable and will forfeit the session slot.</li>
  <li><strong>Cancellations by the Coach:</strong> In the rare event that the coach must cancel or reschedule due to illness, emergency, or technical outage, you will be offered an immediate full reschedule at your earliest convenience or a 100% full refund.</li>
</ul>

<h2>3. Refund Eligibility &amp; Processing</h2>
<ul>
  <li><strong>Eligible Refunds:</strong> Approved refunds for cancelled bookings within the permitted window or coach-initiated cancellations will be processed to the original payment method (via Razorpay).</li>
  <li><strong>Processing Timeline:</strong> Refunds are typically initiated within 2 business days and appear in your bank account / card statement within 5 to 7 business days, depending on your bank's settlement cycle.</li>
  <li><strong>Completed Sessions:</strong> Once a 1:1 coaching session has taken place, fees for that completed session are non-refundable.</li>
</ul>

<h2>4. How to Request Assistance</h2>
<p>To request a reschedule, cancellation, or billing review, please contact our support team with your booking reference number and email address at:</p>
<p><strong>Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a> / <a href="mailto:contact@aarkeshgupta.com">contact@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const shippingPolicyHtml = `
<h2>1. Digital Delivery Policy — No Physical Products Shipped</h2>
<p><strong>Better With Aarkesh</strong> (operated by <strong>Better With Aarkesh / Aarkesh Gupta</strong>) specializes exclusively in digital services, live online 1:1 coaching sessions, and online digital masterclasses. <strong>We do not sell, ship, or deliver any physical goods or merchandise.</strong></p>

<h2>2. Delivery &amp; Access of 1:1 Coaching Services</h2>
<ul>
  <li><strong>Mode of Delivery:</strong> All 1:1 coaching sessions are conducted live online via secure video conferencing platforms (e.g., Google Meet or Zoom).</li>
  <li><strong>Delivery Timeline:</strong> Upon successful booking and payment confirmation, meeting access links, calendar invites, and session details are automatically delivered to your registered email address immediately.</li>
  <li><strong>Shipping Fees:</strong> There are zero (₹0) shipping, courier, or physical handling fees associated with any of our coaching services.</li>
</ul>

<h2>3. Delivery &amp; Access of Online Masterclasses / Courses</h2>
<ul>
  <li><strong>Instant Digital Access:</strong> Upon successful verification of your course payment via our secure payment gateway (Razorpay), your course account is unlocked automatically and immediately.</li>
  <li><strong>Account Credentials &amp; Receipts:</strong> You will receive an immediate electronic payment invoice and access confirmation at your registered email address. You can access course videos, modules, and workbooks 24/7 by logging into your dashboard on our website.</li>
  <li><strong>No Physical Media:</strong> Course materials, video lessons, and guides are delivered entirely digitally through our web portal. No physical DVDs, USB drives, or printed materials are shipped.</li>
</ul>

<h2>4. Troubleshooting Access &amp; Inquiries</h2>
<p>If you experience any delay in receiving your email confirmation, meeting link, or digital course access after a successful transaction, please check your spam/promotions folder or contact our support desk immediately:</p>
<p><strong>Support Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a><br/>
<strong>Contact Email:</strong> <a href="mailto:contact@aarkeshgupta.com">contact@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const courseTermsHtml = `
<h2>1. Agreement to Course Terms</h2>
<p>By registering for, purchasing, or accessing <strong>The Better Man™</strong> or any online course/masterclass provided by <strong>Better With Aarkesh</strong> ("we," "us," or "our"), operated by <strong>Better With Aarkesh (Proprietor: Aarkesh Gupta)</strong>, you agree to be bound by these Course Terms &amp; Conditions.</p>

<h2>2. Nature of Digital Courses — Personal Development Disclaimer</h2>
<p>The course content, video modules, exercises, and community discussions are designed for self-improvement, executive presence, communication mastery, and personal development. <strong>The course is not psychological therapy, psychiatric medical treatment, or emergency mental health counseling.</strong> Participants are solely responsible for their personal decisions and practical application of course frameworks.</p>

<h2>3. User Accounts &amp; Access Rights</h2>
<ul>
  <li><strong>Individual License:</strong> Your purchase grants you a personal, single-user, non-transferable, revocable license to view course materials for your private, non-commercial use.</li>
  <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and OTPs. Sharing login accounts, bulk distribution of credentials, or unauthorized multi-user access is strictly prohibited and will result in immediate termination of access without refund.</li>
  <li><strong>Lifetime Access:</strong> Lifetime access grants continuous access to course video modules and materials for as long as the course is actively maintained and hosted on the Better With Aarkesh platform.</li>
</ul>

<h2>4. Intellectual Property &amp; Anti-Piracy</h2>
<p>All course videos, audio recordings, curriculum structure, text guides, worksheets, frameworks, and trademarks (including <em>The Better Man™</em>) are the exclusive intellectual property of Better With Aarkesh and Aarkesh Gupta.</p>
<p><strong>Strict Prohibitions:</strong> You may not copy, download without authorization, screen-record, rip, resell, rebroadcast, publicize, or share course materials on file-sharing networks, torrent sites, or unauthorized platforms. Any infringement will be prosecuted under applicable copyright and cyber-law statutes.</p>

<h2>5. Course Payments, Taxes &amp; Invoicing</h2>
<p>Course fees are clearly stated at checkout. Applicable GST / taxes are calculated and displayed transparently prior to payment confirmation. Payments are securely processed via Razorpay. Digital tax receipts are issued upon successful transaction completion.</p>

<h2>6. Bundled 1:1 Coaching Calls (If Applicable)</h2>
<p>If your course enrollment package includes bundled 1:1 private coaching sessions with Aarkesh Gupta, such sessions must be scheduled within <strong>6 months of enrollment</strong> and are subject to the standard coaching cancellation/rescheduling policies.</p>

<h2>7. Limitation of Liability</h2>
<p>Better With Aarkesh shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the course platform, technical interruptions, or individual outcomes.</p>

<h2>8. Contact &amp; Support</h2>
<p>For questions or support regarding your course access or billing, please contact:</p>
<p><strong>Support Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const coursePrivacyHtml = `
<h2>1. Introduction</h2>
<p>This Course Privacy Policy explains how <strong>Better With Aarkesh</strong> (operated by <strong>Better With Aarkesh / Aarkesh Gupta</strong>) collects, processes, and protects your information when you register for, purchase, and access our online digital courses and masterclasses.</p>

<h2>2. Information We Collect for Course Access</h2>
<ul>
  <li><strong>Account &amp; Profile Data:</strong> Full name, email address, password hash, and optional profile phone number.</li>
  <li><strong>Course Progress &amp; Telemetry:</strong> Video watch progress, completed modules, quiz/notes submissions, and completion certificate generation records.</li>
  <li><strong>Payment &amp; Transaction Details:</strong> Razorpay order ID, payment ID, amount paid, GST calculation breakdown, and transaction timestamps. <em>We never store credit card numbers, CVVs, or banking PINs.</em></li>
  <li><strong>Technical &amp; Device Information:</strong> IP address, device type, browser information, and login security tokens used to prevent account compromise and unauthorized access.</li>
</ul>

<h2>3. How We Use Your Course Data</h2>
<ul>
  <li>To authenticate your student account and provide uninterrupted access to course content.</li>
  <li>To track lesson progression and issue verified completion certificates.</li>
  <li>To send course-related announcements, curriculum updates, and transaction receipts.</li>
  <li>To ensure content protection, prevent illegal pirating/screen sharing, and maintain system security.</li>
</ul>

<h2>4. Third-Party Integrations</h2>
<p>We partner only with reputable infrastructure providers:</p>
<ul>
  <li><strong>Payment Processing:</strong> Razorpay (PCI-DSS compliant payment gateway).</li>
  <li><strong>Video Streaming Infrastructure:</strong> High-performance secure video streaming hosts (Mux / YouTube Secure Embeds) for optimized playback.</li>
  <li><strong>Email Infrastructure:</strong> Transactional email service for OTP verification, password resets, and invoices.</li>
</ul>

<h2>5. Data Retention &amp; Rights</h2>
<p>Your course account and progression records are retained for the lifetime of your active enrollment. You may request account deletion or data review at any time by contacting our data protection support at <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a>.</p>

<h2>6. Contact Details</h2>
<p><strong>Support Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const courseRefundHtml = `
<h2>1. Digital Course Refund Policy</h2>
<p>At <strong>Better With Aarkesh</strong> (operated by <strong>Better With Aarkesh / Aarkesh Gupta</strong>), we are committed to providing premium, transformative masterclass content through <strong>The Better Man™</strong>.</p>

<h2>2. Refund Window &amp; Eligibility Criteria</h2>
<p>Because digital courses provide instant access to intellectual property, downloadable frameworks, and proprietary video content upon purchase, refund requests are evaluated according to the following transparent terms:</p>
<ul>
  <li><strong>Refund Period:</strong> Refund requests must be submitted in writing to <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a> within <strong>7 days of your initial purchase date</strong>.</li>
  <li><strong>Eligibility Conditions:</strong> To be eligible for a refund, you must have completed <strong>less than 20% of the course video content</strong>, and no 1:1 coaching calls included in the package must have been redeemed.</li>
  <li><strong>Exceptions:</strong> Purchases made during promotional sales or where the course has been fully consumed/downloaded are non-refundable.</li>
</ul>

<h2>3. Refund Processing</h2>
<ul>
  <li>Upon approval of your refund request, your course enrollment, community access, and video portal privileges will be immediately revoked.</li>
  <li>Approved refunds are credited back to the original payment method (processed through Razorpay) within 5 to 7 business days.</li>
</ul>

<h2>4. Contact for Refund Inquiries</h2>
<p>To submit a refund request or discuss billing concerns, please email us with your full name, registered email address, and Razorpay payment ID at:</p>
<p><strong>Support Email:</strong> <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a><br/>
<strong>Legal Entity:</strong> Better With Aarkesh (Proprietor: Aarkesh Gupta)<br/>
<strong>Address:</strong> Mumbai, Maharashtra, India</p>
`;

const courseShippingHtml = `
<h2>1. Digital Delivery Confirmation</h2>
<p><strong>Better With Aarkesh</strong> (operated by <strong>Better With Aarkesh / Aarkesh Gupta</strong>) delivers all course products, lessons, workbooks, and community features 100% digitally. <strong>No physical products, disks, books, or merchandise are shipped.</strong></p>

<h2>2. Instant Online Access</h2>
<ul>
  <li><strong>Access Time:</strong> Instantly unlocked in your student dashboard upon successful online payment verification via Razorpay.</li>
  <li><strong>Delivery Method:</strong> Online web portal streaming (desktop, tablet, and mobile browsers).</li>
  <li><strong>Confirmation Email:</strong> A tax invoice and access confirmation email are automatically dispatched to your registered email address within moments of purchase.</li>
  <li><strong>Shipping Fees:</strong> ₹0 (Zero shipping or logistics fees).</li>
</ul>

<h2>3. Support</h2>
<p>If you experience any difficulties accessing your course lessons or receipt, please contact <a href="mailto:support@aarkeshgupta.com">support@aarkeshgupta.com</a>.</p>
`;

async function seedPolicies() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/better-with-aarkesh';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB at', mongoUri);

  const collection = mongoose.connection.collection('footerdocuments');

  const policies = [
    // ─── COACHING POLICIES ───
    {
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      columnHeading: 'LEGAL',
      contentHtml: coachingTermsHtml.trim(),
      status: 'Published',
      category: 'coaching',
      order: 1,
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      columnHeading: 'LEGAL',
      contentHtml: coachingPrivacyHtml.trim(),
      status: 'Published',
      category: 'coaching',
      order: 2,
    },
    {
      title: 'Refund & Cancellation Policy',
      slug: 'refund-and-cancellation',
      columnHeading: 'LEGAL',
      contentHtml: coachingRefundHtml.trim(),
      status: 'Published',
      category: 'coaching',
      order: 3,
    },
    {
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      columnHeading: 'LEGAL',
      contentHtml: shippingPolicyHtml.trim(),
      status: 'Published',
      category: 'coaching',
      order: 4,
    },
    {
      title: 'Rescheduling Policy',
      slug: 'rescheduling-policy',
      columnHeading: 'LEGAL',
      contentHtml: coachingRefundHtml.trim(),
      status: 'Published',
      category: 'coaching',
      order: 5,
    },

    // ─── COURSE POLICIES ───
    {
      title: 'Terms & Conditions',
      slug: 'course-terms-and-conditions',
      columnHeading: 'LEGAL',
      contentHtml: courseTermsHtml.trim(),
      status: 'Published',
      category: 'course',
      order: 1,
    },
    {
      title: 'Privacy Policy',
      slug: 'course-privacy-policy',
      columnHeading: 'LEGAL',
      contentHtml: coursePrivacyHtml.trim(),
      status: 'Published',
      category: 'course',
      order: 2,
    },
    {
      title: 'Refund & Cancellation Policy',
      slug: 'course-refund-policy',
      columnHeading: 'LEGAL',
      contentHtml: courseRefundHtml.trim(),
      status: 'Published',
      category: 'course',
      order: 3,
    },
    {
      title: 'Shipping Policy',
      slug: 'course-shipping-policy',
      columnHeading: 'LEGAL',
      contentHtml: courseShippingHtml.trim(),
      status: 'Published',
      category: 'course',
      order: 4,
    },
  ];

  for (const p of policies) {
    const existing = await collection.findOne({ slug: p.slug });
    if (existing) {
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            title: p.title,
            columnHeading: p.columnHeading,
            contentHtml: p.contentHtml,
            status: p.status,
            category: p.category,
            order: p.order,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✓ Updated policy: [${p.category}] ${p.title} (/${p.slug})`);
    } else {
      await collection.insertOne({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`+ Created policy: [${p.category}] ${p.title} (/${p.slug})`);
    }
  }

  console.log('\nAll legal policies updated with realistic dummy content successfully!');
  process.exit(0);
}

seedPolicies().catch((err) => {
  console.error('Error seeding policies:', err);
  process.exit(1);
});
