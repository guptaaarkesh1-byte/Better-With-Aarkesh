export const generateGoogleCalendarLink = (dateString, timeString, durationMinutes = 60) => {
  try {
    const start = new Date(`${dateString} ${timeString}`);
    
    if (isNaN(start.getTime())) {
      console.warn("Invalid date/time passed to calendar generator:", dateString, timeString);
      return '#';
    }

    const end = new Date(start.getTime() + durationMinutes * 60000);

    const formatForGoogle = (date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const formattedStart = formatForGoogle(start);
    const formattedEnd = formatForGoogle(end);

    const title = 'Coaching Session with Aarkesh';
    const details = 'Link will be sent to your email or available in the portal.';
    const location = 'Google Meet';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  } catch (error) {
    console.error('Error generating calendar link', error);
    return '#';
  }
};
