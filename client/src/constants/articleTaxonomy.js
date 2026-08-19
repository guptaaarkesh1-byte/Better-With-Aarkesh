import {
  Heart,
  Leaf,
  Shield,
  ArrowsClockwise,
  Signpost,
  Sun,
} from '@phosphor-icons/react';

export const topics = [
  {
    id: 'relationships',
    icon: Heart,
    title: 'RELATIONSHIPS',
    desc: 'Connection, conflict, trust and the distance between people.',
    subItems: [
      { id: 'conflict', title: 'Conflict' },
      { id: 'heartbreak', title: 'Heartbreak' },
      { id: 'relationship-patterns', title: 'Relationship Patterns' },
      { id: 'relationship-with-self', title: 'Your Relationship With Yourself' },
    ],
  },
  {
    id: 'growth',
    icon: Leaf,
    title: 'GROWTH',
    desc: 'The person you are becoming and what makes change possible.',
    subItems: [
      { id: 'understanding-yourself', title: 'Understanding Yourself' },
      { id: 'becoming-someone-new', title: 'Becoming Someone New' },
      { id: 'accountability', title: 'Accountability' },
      { id: 'making-change-last', title: 'Making Change Last' },
    ],
  },
  {
    id: 'boundaries',
    icon: Shield,
    title: 'BOUNDARIES',
    desc: 'Where you end, others begin, and limits become honest action.',
    subItems: [
      { id: 'knowing-your-limits', title: 'Knowing Your Limits' },
      { id: 'communicating-boundaries', title: 'Communicating Boundaries' },
      { id: 'handling-pushback', title: 'Handling Pushback' },
      { id: 'difficult-people', title: 'Difficult People' },
    ],
  },
  {
    id: 'patterns',
    icon: ArrowsClockwise,
    title: 'PATTERNS',
    desc: 'What keeps recurring, what sustains it, and where it began.',
    subItems: [
      { id: 'emotional-patterns', title: 'Emotional Patterns' },
      { id: 'behavioural-patterns', title: 'Behavioural Patterns' },
      { id: 'roles-you-keep-playing', title: 'Roles You Keep Playing' },
      { id: 'where-patterns-come-from', title: 'Where Patterns Come From' },
    ],
  },
  {
    id: 'decisions',
    icon: Signpost,
    title: 'DECISIONS',
    desc: 'What you choose when every option carries something.',
    subItems: [
      { id: 'staying-or-leaving', title: 'Staying or Leaving' },
      { id: 'competing-priorities', title: 'Competing Priorities' },
      { id: 'fear-and-uncertainty', title: 'Fear and Uncertainty' },
      { id: 'living-with-a-decision', title: 'Living With a Decision' },
    ],
  },
  {
    id: 'clarity',
    icon: Sun,
    title: 'CLARITY',
    desc: 'How a person understands the present situation before acting.',
    subItems: [
      { id: 'what-is-true', title: 'What Is True?' },
      { id: 'what-am-i-feeling', title: 'What Am I Feeling?' },
      { id: 'what-matters-to-me', title: 'What Matters to Me?' },
      { id: 'what-am-i-not-seeing', title: 'What Am I Not Seeing?' },
    ],
  },
];
