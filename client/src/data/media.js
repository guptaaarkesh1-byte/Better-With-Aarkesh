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
      id: 'DMLGaOgTszV',
      t: 'Some people don’t leave your life with a bang (Outgrowing connections)',
      c: 'Relationships'
    },
    {
      id: 'DEMO_IG_1',
      t: 'Why calmness is a trained skill, not an innate talent',
      c: 'Mindset'
    },
    {
      id: 'DEMO_IG_2',
      t: 'Cockpit clarity: What to do when pressure hits',
      c: 'Aviation'
    },
    {
      id: 'DEMO_IG_3',
      t: 'How to stop reacting and start choosing consciously',
      c: 'Mindset'
    },
    {
      id: 'DEMO_IG_4',
      t: 'Real communication without masks or pretense',
      c: 'Relationships'
    },
    {
      id: 'DEMO_IG_5',
      t: 'The morning checklist that sets high-performance tone',
      c: 'Habits'
    },
    {
      id: 'DEMO_IG_6',
      t: 'Navigating career crossroads when stakes feel high',
      c: 'Career'
    },
    {
      id: 'DEMO_IG_7',
      t: 'When runway lights appear: Taking the final decisive step',
      c: 'Aviation'
    },
    {
      id: 'DEMO_IG_8',
      t: 'Science-backed tools paired with authentic human empathy',
      c: 'Mindset'
    },
    {
      id: 'DEMO_IG_9',
      t: 'Walking beside someone instead of lecturing from ahead',
      c: 'Relationships'
    },
    {
      id: 'DEMO_IG_10',
      t: 'Micro-habits that restore clarity during chaotic weeks',
      c: 'Habits'
    },
    {
      id: 'DEMO_IG_11',
      t: 'Overcoming executive imposter syndrome with quiet authority',
      c: 'Career'
    },
    {
      id: 'DEMO_IG_12',
      t: 'The crucial power of the 3-second pause',
      c: 'Mindset'
    },
    {
      id: 'DEMO_IG_13',
      t: 'Turbulence lessons: You do not fight it, you ride it',
      c: 'Aviation'
    },
    {
      id: 'DEMO_IG_14',
      t: 'Holding difficult conversations with quiet grace',
      c: 'Relationships'
    },
    {
      id: 'DEMO_IG_15',
      t: 'The compound momentum of consistency over intensity',
      c: 'Habits'
    },
    {
      id: 'DEMO_IG_16',
      t: 'Leading with calm authority: From presence to impact',
      c: 'Career'
    }
  ]
};
