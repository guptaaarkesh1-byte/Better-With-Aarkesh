/**
 * ============================================================================
 * MEDIA DATA CONFIGURATION (YouTube & Instagram Reels)
 * ============================================================================
 * 
 * To add or edit videos:
 * - YouTube entry:  { id: 'YOUTUBE_ID', t: 'English Title', c: 'Category' }
 * - Instagram reel: { id: 'REEL_CODE',  t: 'English Title', c: 'Category', img: 'optional-cover.jpg' }
 * 
 * Categories available:
 * 'Mindset' | 'Aviation' | 'Relationships' | 'Habits' | 'Career'
 * 
 * Notes:
 * - YouTube thumbnails automatically resolve to: https://img.youtube.com/vi/{id}/mqdefault.jpg
 * - Instagram reels without 'img' will render the gradient placeholder tile with play icon.
 * - Items starting with 'DEMO' or 'PLACEHOLDER' display a friendly demo banner in the player.
 */

export const CATEGORIES = ['Mindset', 'Aviation', 'Relationships', 'Habits', 'Career'];

export const GRADIENTS = [
  '#f9c98f,#e98b5b',
  '#f6e3cc,#c9a074',
  '#ffb76b,#d9644a',
  '#e8c9a3,#b07a55',
  '#f4b183,#8a4b3a'
];

export const INTRO_VIDEO = {
  title: 'A Message From Aarkesh: Staying Calm Under Pressure',
  subtitle: 'A 2-Minute Introduction',
  duration: '2:00',
  id: 'DEMO_INTRO',
  videoUrl: '', // optional direct mp4 url
  youtubeId: '', // add youtube id here if available e.g. 'DMLGaOgTszV'
  poster: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png'
};

const reelThumbnail = (id) => `${import.meta.env.BASE_URL}images/about-reels/${id}.jpg`;

export const MEDIA_DATA = {
  yt: [
    {
      id: 'DEMO_YT_1',
      t: 'Mastering Calm Under Extreme Pressure: The Cockpit Framework',
      c: 'Mindset'
    },
    {
      id: 'DEMO_YT_2',
      t: 'How Airline Pilots Make Life-or-Death Decisions in Seconds',
      c: 'Aviation'
    },
    {
      id: 'DEMO_YT_3',
      t: 'Deep Listening: What Most Coaches and Leaders Miss',
      c: 'Relationships'
    },
    {
      id: 'DEMO_YT_4',
      t: 'The Daily Disciplines That Prevent Executive Burnout',
      c: 'Habits'
    }
  ],
  ig: [
    {
      id: 'DOSD-viE8Lr',
      t: 'Attention isn’t love',
      c: 'Relationships',
      img: reelThumbnail('DOSD-viE8Lr')
    },
    {
      id: 'DOQA8jJE7Dz',
      t: 'Attention feels incredible — but fireworks don’t keep you warm',
      c: 'Relationships',
      img: reelThumbnail('DOQA8jJE7Dz')
    },
    {
      id: 'DOI2oPIE4NI',
      t: 'Happiness isn’t always about having more',
      c: 'Mindset',
      img: reelThumbnail('DOI2oPIE4NI')
    },
    {
      id: 'DNdgI9YTtA7',
      t: 'I don’t want followers. I want conversations.',
      c: 'Relationships',
      img: reelThumbnail('DNdgI9YTtA7')
    },
    {
      id: 'DNTO_0YTLuI',
      t: 'Most people don’t change — they hide who they were',
      c: 'Mindset',
      img: reelThumbnail('DNTO_0YTLuI')
    },
    {
      id: 'DNQfP5IzRmx',
      t: 'Aarkesh Gupta — Instagram Reel',
      c: 'Relationships',
      img: reelThumbnail('DNQfP5IzRmx')
    },
    {
      id: 'DNQfGJ-T700',
      t: 'Apologies don’t erase the cracks',
      c: 'Relationships',
      img: reelThumbnail('DNQfGJ-T700')
    },
    {
      id: 'DNOL1eHzOfK',
      t: 'Every day you wait, the gap widens',
      c: 'Mindset',
      img: reelThumbnail('DNOL1eHzOfK')
    },
    {
      id: 'DNL4_VUNx-U',
      t: 'You don’t move on from grief — you move forward',
      c: 'Relationships',
      img: reelThumbnail('DNL4_VUNx-U')
    },
    {
      id: 'DNJFHoftWAw',
      t: 'Wanted: a client who takes responsibility',
      c: 'Career',
      img: reelThumbnail('DNJFHoftWAw')
    },
    {
      id: 'DNG96AcTQ6j',
      t: 'Most men aren’t emotionally unavailable',
      c: 'Relationships',
      img: reelThumbnail('DNG96AcTQ6j')
    },
    {
      id: 'DNEF-R4TLnf',
      t: 'If happiness is the goal, why does chasing it feel empty?',
      c: 'Mindset',
      img: reelThumbnail('DNEF-R4TLnf')
    },
    {
      id: 'DNBfz-gz1bj',
      t: 'Who wrote this plan? Oh right... me.',
      c: 'Habits',
      img: reelThumbnail('DNBfz-gz1bj')
    },
    {
      id: 'DNAcs6Dz69_',
      t: 'Some men try so hard to be “safe” they stop being seen',
      c: 'Relationships',
      img: reelThumbnail('DNAcs6Dz69_')
    },
    {
      id: 'DM_DAppTYEG',
      t: 'Softness without stability can feel unsafe',
      c: 'Relationships',
      img: reelThumbnail('DM_DAppTYEG')
    },
    {
      id: 'DM8X4cVzFst',
      t: 'You’re waiting for fear to disappear',
      c: 'Mindset',
      img: reelThumbnail('DM8X4cVzFst')
    },
    {
      id: 'DM5e0LlT8qa',
      t: 'Some friendships aren’t rooted in truth',
      c: 'Relationships',
      img: reelThumbnail('DM5e0LlT8qa')
    },
    {
      id: 'DM2qcF4TWlB',
      t: 'He opened up. She flinched.',
      c: 'Relationships',
      img: reelThumbnail('DM2qcF4TWlB')
    },
    {
      id: 'DM0gSzAzaJm',
      t: 'You did everything right. And now you feel nothing.',
      c: 'Mindset',
      img: reelThumbnail('DM0gSzAzaJm')
    },
    {
      id: 'DMyd9vczjCg',
      t: 'Are you trying too hard in life?',
      c: 'Habits',
      img: reelThumbnail('DMyd9vczjCg')
    },
    {
      id: 'DMyJd9sTsBt',
      t: 'Healing doesn’t always mean staying calm',
      c: 'Mindset',
      img: reelThumbnail('DMyJd9sTsBt')
    },
    {
      id: 'DMweEjNzYsu',
      t: 'Love, attachment, and effort',
      c: 'Relationships',
      img: reelThumbnail('DMweEjNzYsu')
    },
    {
      id: 'DMu9wO0zq3v',
      t: 'Stop waiting for the right person',
      c: 'Relationships',
      img: reelThumbnail('DMu9wO0zq3v')
    },
    {
      id: 'DMuRWLsTUNt',
      t: 'Don’t hold your healing hostage to an apology',
      c: 'Relationships',
      img: reelThumbnail('DMuRWLsTUNt')
    },
    {
      id: 'DMuQxNizVv1',
      t: 'Bitterness promises protection',
      c: 'Relationships',
      img: reelThumbnail('DMuQxNizVv1')
    },
    {
      id: 'DMs-ateTyvW',
      t: 'Who taught you what your worth was?',
      c: 'Mindset',
      img: reelThumbnail('DMs-ateTyvW')
    },
    {
      id: 'DMqZTDlTSKl',
      t: 'You weren’t born people-pleasing',
      c: 'Relationships',
      img: reelThumbnail('DMqZTDlTSKl')
    },
    {
      id: 'DMoiymmTNLj',
      t: 'Some truths don’t soothe — they set you free',
      c: 'Mindset',
      img: reelThumbnail('DMoiymmTNLj')
    },
    {
      id: 'DMkpxaOTbkD',
      t: 'Love isn’t signing up for emotional debt',
      c: 'Relationships',
      img: reelThumbnail('DMkpxaOTbkD')
    },
    {
      id: 'DMhsoJStaHG',
      t: 'Be someone people feel safe talking to',
      c: 'Relationships',
      img: reelThumbnail('DMhsoJStaHG')
    },
    {
      id: 'DMfEdLAtTmJ',
      t: 'Making this reel wasn’t easy',
      c: 'Relationships',
      img: reelThumbnail('DMfEdLAtTmJ')
    },
    {
      id: 'DMdGQJgzcYg',
      t: 'A shortcut to healing isn’t always the answer',
      c: 'Mindset',
      img: reelThumbnail('DMdGQJgzcYg')
    },
    {
      id: 'DMaHTD2zZJp',
      t: 'Some people survive by being “nice”',
      c: 'Relationships',
      img: reelThumbnail('DMaHTD2zZJp')
    },
    {
      id: 'DMXLDLHzqnv',
      t: 'The loudest pain can be the silence',
      c: 'Relationships',
      img: reelThumbnail('DMXLDLHzqnv')
    },
    {
      id: 'DMVIQNjN5jD',
      t: 'You don’t raise your voice. You disappear.',
      c: 'Relationships',
      img: reelThumbnail('DMVIQNjN5jD')
    },
    {
      id: 'DMSlv4tNFy9',
      t: 'Ever been called “too much”?',
      c: 'Relationships',
      img: reelThumbnail('DMSlv4tNFy9')
    },
    {
      id: 'DMQRYAiNxpK',
      t: 'If you’ve ever felt too sensitive, pause',
      c: 'Mindset',
      img: reelThumbnail('DMQRYAiNxpK')
    },
    {
      id: 'DMP5ii9tFzY',
      t: 'Aarkesh Gupta — Instagram Reel',
      c: 'Relationships',
      img: reelThumbnail('DMP5ii9tFzY')
    },
    {
      id: 'DMNa1T3T1IQ',
      t: 'You’re over-explaining because you fear being misunderstood',
      c: 'Relationships',
      img: reelThumbnail('DMNa1T3T1IQ')
    },
    {
      id: 'DMLGaOgTszV',
      t: 'Some people don’t leave your life with a bang',
      c: 'Relationships',
      img: reelThumbnail('DMLGaOgTszV')
    },
    {
      id: 'DMIaoo1Tsum',
      t: 'Your tone can make people feel unheard',
      c: 'Relationships',
      img: reelThumbnail('DMIaoo1Tsum')
    },
    {
      id: 'DMGFEIcT_bZ',
      t: 'You don’t always notice healing as it happens',
      c: 'Mindset',
      img: reelThumbnail('DMGFEIcT_bZ')
    }
  ]
};
