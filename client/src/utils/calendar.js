export const generateGoogleCalendarLink = (dateString, timeString, durationMinutes = 60) => {
  try {
    if (!dateString) return '#';

    // Extract first time like '10:30 AM' or '02:00 PM' from timeString
    let cleanTime = timeString || '10:00 AM';
    const timeMatch = String(cleanTime).match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
    if (timeMatch) {
      cleanTime = timeMatch[1];
    }
    
    // Clean date string if it has day prefix like 'Thursday, '
    let cleanDate = dateString;
    if (typeof dateString === 'string') {
      cleanDate = dateString.replace(/^[A-Za-z]+,\s*/, '');
    }

    let start = new Date(`${cleanDate} ${cleanTime}`);
    if (isNaN(start.getTime())) {
      start = new Date(dateString);
    }
    if (isNaN(start.getTime())) {
      console.warn("Invalid date/time passed to calendar generator:", dateString, timeString);
      return '#';
    }

    const end = new Date(start.getTime() + (durationMinutes || 60) * 60000);

    const formatForGoogle = (date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const formattedStart = formatForGoogle(start);
    const formattedEnd = formatForGoogle(end);

    const title = '1-on-1 Coaching Session with Aarkesh';
    const details = 'Coaching Session with Aarkesh. Google Meet link will be shared via email and in your My Journey portal.';
    const location = 'Google Meet';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  } catch (error) {
    console.error('Error generating calendar link', error);
    return '#';
  }
};

