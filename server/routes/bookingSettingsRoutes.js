import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

export const DEFAULT_BOOKING_SETTINGS = {
  general: {
    bgImageUrl: '',
    overlayOpacity: 60,
    privacyNoteLine1: 'Your information is private and only visible to me.',
    privacyNoteLine2: 'It helps me show up better for you.'
  },
  step1: {
    chapterTag: 'CHAPTER 1 OF 3',
    title: "Let's Find a Time That Works",
    subtitleLine1: "You don't need to have everything figured out before you begin.",
    subtitleLine2: "This is a space for honest conversation and real clarity.",
    dateHeading: "CHOOSE A DATE",
    timeHeading: "CHOOSE A TIME",
    noSlotsText: "No slots available on this date. Please pick another date.",
    morningLabel: "Morning",
    morningSub: "Before 12:00 PM",
    afternoonLabel: "Afternoon",
    afternoonSub: "12:00 PM – 5:00 PM",
    eveningLabel: "Evening",
    eveningSub: "5:00 PM Onwards",
  },
  step2: {
    chapterTag: 'CHAPTER 2 OF 3',
    title: "A Little About You",
    subtitleLine1: "This helps me understand you better before we meet.",
    subtitleLine2: "Share only what you're comfortable with.",
    nameLabel: "YOUR NAME",
    namePlaceholder: "What should I call you?",
    sourceLabel: "HOW DID YOU HEAR ABOUT ME? (OPTIONAL)",
    sourcePlaceholder: "Select an option",
    otherSourcePlaceholder: "Please specify (e.g. YouTube, Podcast, Friend, Book...)",
    emailLabel: "EMAIL",
    emailPlaceholder: "your.email@example.com",
    phoneLabel: "PHONE NUMBER",
    phonePlaceholder: "Enter 10-digit number",
    reasonLabel: "WHAT BRINGS YOU HERE?",
    reasonPlaceholder: "Tell me a little about where you are right now and what you're hoping to get out of our time together...",
    extraLabel: "ANYTHING ELSE I SHOULD KNOW? (OPTIONAL)",
    extraPlaceholder: "Any specific questions, concerns, or background context...",
    continueButtonText: "CONTINUE TO CONFIRMATION",
    backButtonText: "BACK",
  },
  step3: {
    chapterTag: 'CHAPTER 3 OF 3',
    title: "Confirm & Secure Your Session",
    subtitleLine1: "Almost there. Review your session details",
    subtitleLine2: "and let's make it official.",
    sessionDetailsHeading: "SESSION DETAILS",
    dateLabel: "Date",
    timeLabel: "Time",
    sessionTypeLabel: "Session Type",
    durationLabel: "Duration",
    whereLabel: "Where",
    whereValue: "Google Meet",
    whereNote: "(Link will be shared after booking)",
    totalAmountLabel: "Total Amount",
    whatHappensNextHeading: "WHAT HAPPENS NEXT",
    nextSteps: [
      {
        title: "You'll receive a confirmation email",
        description: "With all the details and next steps."
      },
      {
        title: "A reminder before our session",
        description: "So you can show up fully."
      },
      {
        title: "A private, confidential space",
        description: "Built for honest conversations."
      },
      {
        title: "This is your time",
        description: "To reflect, gain clarity, and move forward."
      }
    ],
    rescheduleHeading: "NEED TO RESCHEDULE?",
    rescheduleText: "You can reschedule or cancel up to 24 hours before the session.",
    reschedulePolicyLinkText: "View Rescheduling Policy",
    agreementPrefix: "I agree to the",
    agreementLinkText: "terms and conditions",
    agreementSuffix: "and understand that the amount above is the total payment shown in this summary.",
    confirmButtonText: "CONFIRM & BOOK",
    confirmFreeButtonText: "CONFIRM FREE SESSION",
    backButtonText: "BACK",
  },
  success: {
    backButtonText: "RETURN TO HOME",
    badgeTag: "YOUR SESSION IS RESERVED",
    titleLine1: "Thank you for trusting me",
    titleLine2: "with a part of your story.",
    subtitleLine1: "I've sent a confirmation email with everything you'll need.",
    subtitleLine2: "Until then, don't worry about preparing the \"right\" answers.",
    subtitleHighlight: "Just bring yourself.",
    appointmentCardBadge: "YOUR APPOINTMENT",
    cardImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop",
    whereValue: "Google Meet",
    whereNote: "(Link shared in confirmation email)",
    whatHappensNextHeading: "WHAT HAPPENS NEXT",
    nextSteps: [
      {
        title: "CONFIRMATION EMAIL",
        description: "You'll receive a confirmation email with all the details and next steps."
      },
      {
        title: "CALENDAR INVITE",
        description: "A calendar invite has been sent. Add it to your calendar."
      },
      {
        title: "MEETING LINK",
        description: "Your Google Meet link is included in the email. Check your spam folder if you don't see it."
      },
      {
        title: "BE YOURSELF",
        description: "This is a space for honesty, clarity, and real conversations. You don't have to have it all figured out."
      }
    ],
    addToCalendarButtonText: "ADD TO CALENDAR",
    myJourneyButtonText: "MY JOURNEY",
    exploreLibraryButtonText: "EXPLORE LIBRARY",
    createAccountButtonText: "CREATE ACCOUNT TO VIEW JOURNEY",
    quoteLine1: "Clarity doesn't come from having all the answers.",
    quoteLine2: "It comes from asking better questions.",
    changeHeading: "NEED TO MAKE A CHANGE?",
    changeText: "You can reschedule or cancel up to 24 hours before the session.",
    changePolicyLinkText: "View Rescheduling Policy →"
  }
};

// @desc    Get All Booking Settings
// @route   GET /api/booking-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'booking_all_steps_settings' });
    if (!doc) {
      return res.json(DEFAULT_BOOKING_SETTINGS);
    }
    const result = {
      general: { ...DEFAULT_BOOKING_SETTINGS.general, ...(doc.value?.general || {}) },
      step1: { ...DEFAULT_BOOKING_SETTINGS.step1, ...(doc.value?.step1 || {}) },
      step2: { ...DEFAULT_BOOKING_SETTINGS.step2, ...(doc.value?.step2 || {}) },
      step3: {
        ...DEFAULT_BOOKING_SETTINGS.step3,
        ...(doc.value?.step3 || {}),
        nextSteps: doc.value?.step3?.nextSteps || DEFAULT_BOOKING_SETTINGS.step3.nextSteps
      },
      success: {
        ...DEFAULT_BOOKING_SETTINGS.success,
        ...(doc.value?.success || {}),
        nextSteps: doc.value?.success?.nextSteps || DEFAULT_BOOKING_SETTINGS.success.nextSteps
      }
    };
    res.json(result);
  } catch (err) {
    console.error('Error fetching booking settings:', err);
    res.status(500).json({ message: 'Failed to fetch booking settings' });
  }
});

// @desc    Get Specific Step Settings
// @route   GET /api/booking-settings/:step
// @access  Public
router.get('/:step', async (req, res) => {
  try {
    const { step } = req.params;
    const defaultStepData = DEFAULT_BOOKING_SETTINGS[step] || {};
    const doc = await Settings.findOne({ key: 'booking_all_steps_settings' });
    
    if (!doc || !doc.value || !doc.value[step]) {
      return res.json(defaultStepData);
    }
    
    res.json({ ...defaultStepData, ...doc.value[step] });
  } catch (err) {
    console.error(`Error fetching booking step ${req.params.step}:`, err);
    res.status(500).json({ message: 'Failed to fetch booking step settings' });
  }
});

// @desc    Update Specific Step Settings
// @route   PUT /api/booking-settings/:step
// @access  Admin
router.put('/:step', async (req, res) => {
  try {
    const { step } = req.params;
    const stepData = req.body;

    let doc = await Settings.findOne({ key: 'booking_all_steps_settings' });
    let allSteps = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_BOOKING_SETTINGS };

    allSteps[step] = {
      ...(DEFAULT_BOOKING_SETTINGS[step] || {}),
      ...(allSteps[step] || {}),
      ...stepData
    };

    const updated = await Settings.findOneAndUpdate(
      { key: 'booking_all_steps_settings' },
      { $set: { value: allSteps } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `${step} updated successfully`, data: updated.value[step] });
  } catch (err) {
    console.error(`Error updating booking step ${req.params.step}:`, err);
    res.status(500).json({ message: 'Failed to update booking step settings' });
  }
});

export default router;
