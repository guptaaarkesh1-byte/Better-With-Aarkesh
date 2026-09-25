import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CaretRight, Sparkle, BookmarkSimple, X, MagnifyingGlass } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { renderFormattedTitle, resolveImageUrl } from '../../pages/articles/ArticleReaderView';
import LoginModal from '../layout/LoginModal';

export const LIBRARY_CATEGORIES = [
  {
    num: '01',
    id: 'relationships',
    title: 'Relationships',
    subtitle: 'On love, friendship and what it means to stay close.',
    articles: [
      {
        id: 'rel-1',
        title: "Attention Feels Like *Love* (But Isn't)",
        slug: 'attention-feels-like-love',
        category: 'RELATIONSHIPS',
        categoryNum: '01 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 6 MIN READ',
        badgeText: 'ATTENTION IS NOT ALWAYS AFFECTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Why attention can feel intimate — and how a kinder, braver you can take the next step,',
        highlightText: 'even in uncertainty.',
        quote: '“Not all attention is a promise. Sometimes it’s just a moment.”',
      },
      {
        id: 'rel-2',
        title: 'The Problem With Closure',
        slug: 'the-problem-with-closure',
        category: 'RELATIONSHIPS',
        categoryNum: '02 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 5 MIN READ',
        badgeText: 'CLOSURE IS AN INTERNAL WORK',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Waiting for someone else to explain why things ended gives them power over your healing. Real closure begins when you',
        highlightText: 'stop asking why.',
        quote: '“You do not need their explanation to author your own peace.”',
      },
      {
        id: 'rel-3',
        title: 'A Kinder Way to Disagree',
        slug: 'a-kinder-way-to-disagree',
        category: 'RELATIONSHIPS',
        categoryNum: '03 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 7 MIN READ',
        badgeText: 'CONNECTION OVER CONQUEST',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Winning an argument often means losing the connection. How to hold your truth without needing to',
        highlightText: 'diminish theirs.',
        quote: '“Kindness in disagreement is not weakness; it is the ultimate strength.”',
      },
      {
        id: 'rel-4',
        title: 'Love Is Not a Performance',
        slug: 'love-is-not-a-performance',
        category: 'RELATIONSHIPS',
        categoryNum: '04 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 5 MIN READ',
        badgeText: 'AUTHENTIC DEVOTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'When we treat love like an exam we must constantly pass, we replace intimacy with anxiety. Real connection lives in',
        highlightText: 'effortless presence.',
        quote: '“True belonging does not ask you to prove your worthiness each morning.”',
      },
      {
        id: 'rel-5',
        title: 'Why We Distance Those Who Love Us',
        slug: 'why-we-distance-those-who-love-us',
        category: 'RELATIONSHIPS',
        categoryNum: '05 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 6 MIN READ',
        badgeText: 'UNPACKING DEFENSIVENESS',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Fear of intimacy often disguises itself as independence. How to recognize emotional withdrawal before it becomes',
        highlightText: 'a permanent wall.',
        quote: '“Vulnerability is not a hazard; it is the birthplace of all tenderness.”',
      },
      {
        id: 'rel-6',
        title: 'The Art of Emotional Boundaries',
        slug: 'the-art-of-emotional-boundaries',
        category: 'RELATIONSHIPS',
        categoryNum: '06 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 7 MIN READ',
        badgeText: 'LOVING DETACHMENT',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Boundaries are the distance at which I can love both you and me simultaneously without resentment or',
        highlightText: 'emotional exhaustion.',
        quote: '“A boundary is a doorway that keeps connection safe, not a prison wall.”',
      },
      {
        id: 'rel-7',
        title: 'Forgiveness Without Reconciliation',
        slug: 'forgiveness-without-reconciliation',
        category: 'RELATIONSHIPS',
        categoryNum: '07 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 5 MIN READ',
        badgeText: 'PEACE OVER ACCESS',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You can forgive someone completely for your own peace while still denying them future access to your life and',
        highlightText: 'emotional energy.',
        quote: '“Forgiveness releases the past; wisdom guards the present.”',
      },
      {
        id: 'rel-8',
        title: 'Intimacy Requires Vulnerability',
        slug: 'intimacy-requires-vulnerability',
        category: 'RELATIONSHIPS',
        categoryNum: '08 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 6 MIN READ',
        badgeText: 'THE COURAGE TO BE SEEN',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You cannot experience deep closeness while wearing emotional armor. Dropping your guard is where real love',
        highlightText: 'begins to breathe.',
        quote: '“To be loved deeply, one must first risk being seen truthfully.”',
      },
      {
        id: 'rel-9',
        title: 'Holding Space Without Fixing',
        slug: 'holding-space-without-fixing',
        category: 'RELATIONSHIPS',
        categoryNum: '09 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 5 MIN READ',
        badgeText: 'SILENT PRESENCE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Most people in pain do not need a technician to solve their storm; they need a steady anchor to',
        highlightText: 'sit beside them.',
        quote: '“Presence is the rarest and purest form of generosity.”',
      },
      {
        id: 'rel-10',
        title: 'When to Walk Away With Grace',
        slug: 'when-to-walk-away-with-grace',
        category: 'RELATIONSHIPS',
        categoryNum: '10 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 6 MIN READ',
        badgeText: 'SACRED CLOSURE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Knowing when an era has concluded is the highest form of self-respect. Step forward without bitterness, drama, or',
        highlightText: 'unnecessary spite.',
        quote: '“Leaving with quiet dignity honors what once was and what is yet to come.”',
      }
    ]
  },
  {
    num: '02',
    id: 'self',
    title: 'Self',
    subtitle: 'On identity, self-trust and becoming a steadier you.',
    articles: [
      {
        id: 'self-1',
        title: "You Don't Have a Career Problem",
        slug: 'you-dont-have-a-career-problem',
        category: 'SELF',
        categoryNum: '01 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · SELF · 6 MIN READ',
        badgeText: 'PURPOSE PRECEDES PROFESSION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Most exhaustion isn’t from doing too much work; it’s from doing too little of what makes you feel',
        highlightText: 'truly alive.',
        quote: '“When you align with who you are, the work finds its natural rhythm.”',
      },
      {
        id: 'self-2',
        title: 'You Have a Waiting Problem',
        slug: 'you-have-a-waiting-problem',
        category: 'SELF',
        categoryNum: '02 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · SELF · 5 MIN READ',
        badgeText: 'MOMENTUM OVER PERFECTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Waiting until you feel 100% ready is the safest way to guarantee you never begin. Courage arrives',
        highlightText: 'after you take the step.',
        quote: '“Readiness is a decision, not an emotional weather report.”',
      },
      {
        id: 'self-3',
        title: "Discomfort Is a Sign You're Growing",
        slug: 'discomfort-is-a-sign-youre-growing',
        category: 'SELF',
        categoryNum: '03 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · SELF · 6 MIN READ',
        badgeText: 'EXPANSION REQUIRES FRICTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'The uneasiness you feel is not a red light. It is the friction of your old self stretching into',
        highlightText: 'who you are becoming.',
        quote: '“Growth always feels like disruption before it feels like grace.”',
      },
      {
        id: 'self-4',
        title: 'Befriending Your Inner Critic',
        slug: 'befriending-your-inner-critic',
        category: 'SELF',
        categoryNum: '04 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · SELF · 5 MIN READ',
        badgeText: 'INTERNAL ALLIANCE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Your inner critic is not your enemy; it is a frightened protector that learned poor strategies. Learn to',
        highlightText: 'reassure rather than fight it.',
        quote: '“Speak to yourself as you would to a child you are teaching to walk.”',
      },
      {
        id: 'self-5',
        title: 'The Myth of Being 100% Ready',
        slug: 'the-myth-of-being-100-percent-ready',
        category: 'SELF',
        categoryNum: '05 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · SELF · 6 MIN READ',
        badgeText: 'ACTION BEFORE CLARITY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Perfectionism is merely anxiety in a tailored suit. You build capacity on the field, not in endless',
        highlightText: 'theoretical rehearsals.',
        quote: '“You don’t need more preparation; you need the bravery to be imperfect.”',
      },
      {
        id: 'self-6',
        title: 'Rebuilding Trust With Yourself',
        slug: 'rebuilding-trust-with-yourself',
        category: 'SELF',
        categoryNum: '06 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · SELF · 7 MIN READ',
        badgeText: 'INTERNAL INTEGRITY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Every broken micro-promise chips away at your self-belief. Rebuilding trust starts with keeping small promises made in',
        highlightText: 'complete privacy.',
        quote: '“Self-trust is the quiet foundation upon which all bold living rests.”',
      },
      {
        id: 'self-7',
        title: 'The Quiet Power of Rest',
        slug: 'the-quiet-power-of-rest',
        category: 'SELF',
        categoryNum: '07 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · SELF · 5 MIN READ',
        badgeText: 'REST AS REBELLION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'In a culture that worships exhaustion, stillness is the ultimate rebellion. Rest is not a reward you earn; it is',
        highlightText: 'a biological necessity.',
        quote: '“You cannot pour clarity from an empty, fractured vessel.”',
      },
      {
        id: 'self-8',
        title: 'Living Without External Validation',
        slug: 'living-without-external-validation',
        category: 'SELF',
        categoryNum: '08 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · SELF · 6 MIN READ',
        badgeText: 'INTERNAL ANCHOR',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'When you tether your worth to the applause of others, you hand them the keys to your emotional peace. Find',
        highlightText: 'your own steady applause.',
        quote: '“If applause is your oxygen, silence will feel like suffocation.”',
      },
      {
        id: 'self-9',
        title: 'Embracing Your Shadow Self',
        slug: 'embracing-your-shadow-self',
        category: 'SELF',
        categoryNum: '09 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · SELF · 7 MIN READ',
        badgeText: 'RADICAL INTEGRATION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Wholeness does not mean perfection. It means welcoming the fragmented, neglected parts of yourself back into',
        highlightText: 'the light of compassion.',
        quote: '“Only when we look into the dark can we fully appreciate the flame.”',
      },
      {
        id: 'self-10',
        title: 'Becoming Your Own Safe Harbor',
        slug: 'becoming-your-own-safe-harbor',
        category: 'SELF',
        categoryNum: '10 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · SELF · 6 MIN READ',
        badgeText: 'SELF SOVEREIGNTY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'The ultimate achievement of personal development is becoming a person you feel safe coming home to at the end of',
        highlightText: 'any stormy day.',
        quote: '“You are the sanctuary you have been looking for everywhere else.”',
      }
    ]
  },
  {
    num: '03',
    id: 'change',
    title: 'Change',
    subtitle: 'On letting go, starting over and becoming who you want to be.',
    articles: [
      {
        id: 'chg-1',
        title: "Everybody Says They've Changed",
        slug: 'everybody-says-theyve-changed',
        category: 'CHANGE',
        categoryNum: '01 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · CHANGE · 5 MIN READ',
        badgeText: 'EVIDENCE OVER INTENTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Change is not declared in words or promises; it is verified in daily, unremarkable choices when',
        highlightText: 'no one is watching.',
        quote: '“Behavior is the only honest language of transformation.”',
      },
      {
        id: 'chg-2',
        title: 'The In-Between Is a Part of the Process',
        slug: 'the-in-between-is-a-part-of-the-process',
        category: 'CHANGE',
        categoryNum: '02 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · CHANGE · 7 MIN READ',
        badgeText: 'THE LIMINAL TRANSITION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'When the old life has dissolved and the new one hasn’t yet taken shape, learn to tolerate the stillness',
        highlightText: 'without panic.',
        quote: '“The cocoon is not empty; it is rearranging destiny.”',
      },
      {
        id: 'chg-3',
        title: 'You Can Be Both',
        slug: 'you-can-be-both',
        category: 'CHANGE',
        categoryNum: '03 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · CHANGE · 6 MIN READ',
        badgeText: 'EMBRACING PARADOX',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You can be grieving what was lost and excited for what lies ahead. Human wholeness requires room for',
        highlightText: 'complex truths.',
        quote: '“Maturity is the capacity to hold conflicting feelings with tenderness.”',
      },
      {
        id: 'chg-4',
        title: 'Why Starting Over Feels Terrifying',
        slug: 'why-starting-over-feels-terrifying',
        category: 'CHANGE',
        categoryNum: '04 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · CHANGE · 6 MIN READ',
        badgeText: 'REBIRTH OVER RUIN',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Starting from scratch is not a setback; it is starting from experience with cleaner eyes and',
        highlightText: 'sharper boundaries.',
        quote: '“Every blank page is an invitation, not a punishment for lost time.”',
      },
      {
        id: 'chg-5',
        title: 'The Courage to Outgrow Old Versions',
        slug: 'the-courage-to-outgrow-old-versions',
        category: 'CHANGE',
        categoryNum: '05 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · CHANGE · 5 MIN READ',
        badgeText: 'SHEDDING THE PAST',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You owe no loyalty to a version of yourself that no longer serves your expansion. Give yourself permission to',
        highlightText: 'quietly evolve.',
        quote: '“Growth requires the funeral of who you used to be.”',
      },
      {
        id: 'chg-6',
        title: 'Letting Go of What Was Never Yours',
        slug: 'letting-go-of-what-was-never-yours',
        category: 'CHANGE',
        categoryNum: '06 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · CHANGE · 7 MIN READ',
        badgeText: 'RELEASE AND RENEWAL',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Grieving potential is harder than grieving reality. Releasing phantom outcomes frees your hands to receive',
        highlightText: 'what is genuine.',
        quote: '“You cannot welcome real light while clinging to illusions.”',
      },
      {
        id: 'chg-7',
        title: 'Patience Through the Plateau',
        slug: 'patience-through-the-plateau',
        category: 'CHANGE',
        categoryNum: '07 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · CHANGE · 5 MIN READ',
        badgeText: 'SILENT ACCUMULATION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'When progress seems invisible, deep roots are forming beneath the soil. Trust the silent accumulation of',
        highlightText: 'unseen effort.',
        quote: '“The bamboo tree spends four years growing underground before shooting fifty feet high.”',
      },
      {
        id: 'chg-8',
        title: 'Reinventing Yourself Silently',
        slug: 'reinventing-yourself-silently',
        category: 'CHANGE',
        categoryNum: '08 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · CHANGE · 6 MIN READ',
        badgeText: 'QUIET EVOLUTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You do not need to announce your metamorphosis on social feeds. True transformations occur in private, disciplined',
        highlightText: 'daily routines.',
        quote: '“Build your masterpiece in silence; let the peace of your life be the noise.”',
      },
      {
        id: 'chg-9',
        title: 'Trusting the Unknown Next Chapter',
        slug: 'trusting-the-unknown-next-chapter',
        category: 'CHANGE',
        categoryNum: '09 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · CHANGE · 6 MIN READ',
        badgeText: 'COURAGEOUS FAITH',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Uncertainty is not the absence of safety; it is the presence of infinite possibility. Step forward with',
        highlightText: 'an open heart.',
        quote: '“The unknown is where all discovery is born.”',
      },
      {
        id: 'chg-10',
        title: 'Grief as a Companion to Growth',
        slug: 'grief-as-a-companion-to-growth',
        category: 'CHANGE',
        categoryNum: '10 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · CHANGE · 7 MIN READ',
        badgeText: 'HONORING LOSS',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Every meaningful change involves a subtle form of bereavement. Acknowledge what had to die for you to',
        highlightText: 'step into life.',
        quote: '“Grief is the price we pay for having dared to love deeply.”',
      }
    ]
  },
  {
    num: '04',
    id: 'decisions',
    title: 'Decisions',
    subtitle: 'On better thinking, trade-offs and choosing a life you mean.',
    articles: [
      {
        id: 'dec-1',
        title: 'More Options, A Less Happy You',
        slug: 'more-options-a-less-happy-you',
        category: 'DECISIONS',
        categoryNum: '01 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DECISIONS · 6 MIN READ',
        badgeText: 'THE PARADOX OF CHOICE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Abundance of alternatives creates analysis paralysis and phantom regret. True contentment comes from',
        highlightText: 'committing deeply.',
        quote: '“Freedom isn’t having endless doors open; it’s choosing one and walking in.”',
      },
      {
        id: 'dec-2',
        title: "The Cost of a 'Safe' Decision",
        slug: 'the-cost-of-a-safe-decision',
        category: 'DECISIONS',
        categoryNum: '02 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DECISIONS · 5 MIN READ',
        badgeText: 'RISK OF NO RISK',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Choosing safety to avoid temporary discomfort often locks you into long-term quiet regret. Weigh the price of',
        highlightText: 'staying unchanged.',
        quote: '“The safest harbor keeps the ship safe, but ships were built for the open sea.”',
      },
      {
        id: 'dec-3',
        title: 'Clarity Comes After Action',
        slug: 'clarity-comes-after-action',
        category: 'DECISIONS',
        categoryNum: '03 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · DECISIONS · 7 MIN READ',
        badgeText: 'ACTION CREATES VISION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You cannot think your way into a new way of living. You must act your way into',
        highlightText: 'a new way of thinking.',
        quote: '“Clarity is never found at the desk of overthinking; it is forged on the path.”',
      },
      {
        id: 'dec-4',
        title: 'How to Make Peace With Trade-offs',
        slug: 'how-to-make-peace-with-trade-offs',
        category: 'DECISIONS',
        categoryNum: '04 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DECISIONS · 6 MIN READ',
        badgeText: 'SACRIFICE WITH PURPOSE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Every yes is a thousand silent noes. Mature living means choosing what problems you are willing to embrace with',
        highlightText: 'grace and conviction.',
        quote: '“You cannot have everything; choose what matters and let the rest go.”',
      },
      {
        id: 'dec-5',
        title: 'Regret Minimization in Practice',
        slug: 'regret-minimization-in-practice',
        category: 'DECISIONS',
        categoryNum: '05 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DECISIONS · 5 MIN READ',
        badgeText: 'LONG HORIZON THINKING',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Projecting your perspective to age eighty clarifies which fears are trivial and which risks are',
        highlightText: 'vitally essential.',
        quote: '“In the end, we only regret the chances we did not dare to take.”',
      },
      {
        id: 'dec-6',
        title: 'Intuition Versus Anxiety',
        slug: 'intuition-versus-anxiety',
        category: 'DECISIONS',
        categoryNum: '06 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DECISIONS · 6 MIN READ',
        badgeText: 'DISCERNING THE INNER VOICE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Anxiety screams with urgency and catastrophizing; intuition whispers with quiet, unwavering certainty. How to tell them',
        highlightText: 'distinctly apart.',
        quote: '“Intuition guides you forward; fear only rushes you backward.”',
      },
      {
        id: 'dec-7',
        title: "Stop Asking for Everyone's Permission",
        slug: 'stop-asking-for-everyones-permission',
        category: 'DECISIONS',
        categoryNum: '07 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DECISIONS · 5 MIN READ',
        badgeText: 'AUTONOMOUS RESOLVE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Poll-taking your decisions dilutes your vision and invites other people’s unlived fears into your life. Stand firmly in',
        highlightText: 'your own authority.',
        quote: '“You don’t need a committee to approve your soul’s direction.”',
      },
      {
        id: 'dec-8',
        title: 'Deciding Once and Committing Fully',
        slug: 'deciding-once-and-committing-fully',
        category: 'DECISIONS',
        categoryNum: '08 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DECISIONS · 6 MIN READ',
        badgeText: 'COGNITIVE ELEGANCE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Re-litigating old choices drains willpower daily. Make the decision once, close the mental door, and direct all power toward',
        highlightText: 'the execution.',
        quote: '“Commitment is making the choice stick long after the mood has passed.”',
      },
      {
        id: 'dec-9',
        title: 'The Fallacy of Sunk Costs',
        slug: 'the-fallacy-of-sunk-costs',
        category: 'DECISIONS',
        categoryNum: '09 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DECISIONS · 5 MIN READ',
        badgeText: 'HONEST DETACHMENT',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Do not stay in a burning building simply because you spent years decorating the walls. Cut your losses with',
        highlightText: 'clear-headed resolve.',
        quote: '“Money and time spent are gone; do not waste your future paying for a past mistake.”',
      },
      {
        id: 'dec-10',
        title: 'Wisdom in the Second Choice',
        slug: 'wisdom-in-the-second-choice',
        category: 'DECISIONS',
        categoryNum: '10 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · DECISIONS · 7 MIN READ',
        badgeText: 'PIVOTING WITH PURPOSE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'When plan A dissolves, plan B is not a consolation prize; it is often where our deepest resourcefulness and destiny',
        highlightText: 'find their true soil.',
        quote: '“Life rarely follows the straight line, but the detour often holds the treasure.”',
      }
    ]
  },
  {
    num: '05',
    id: 'difficult-people',
    title: 'Difficult People',
    subtitle: 'On boundaries, perspective and dealing with the hard ones.',
    articles: [
      {
        id: 'dif-1',
        title: 'When Understanding Becomes an Excuse',
        slug: 'when-understanding-becomes-an-excuse',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '01 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 6 MIN READ',
        badgeText: 'EMPATHY WITH BOUNDARIES',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You can understand why someone hurt you without granting them continuous access to do it again. Empathy does not mean',
        highlightText: 'self-erasure.',
        quote: '“Understanding someone’s trauma does not obligate you to absorb their disrespect.”',
      },
      {
        id: 'dif-2',
        title: 'The Peace in Not Reacting',
        slug: 'the-peace-in-not-reacting',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '02 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 5 MIN READ',
        badgeText: 'EMOTIONAL SOVEREIGNTY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Not every provocation warrants your energy. The moment you realize your silence is more powerful than their noise, you win',
        highlightText: 'your peace back.',
        quote: '“You don’t have to attend every argument you’re invited to.”',
      },
      {
        id: 'dif-3',
        title: "You Can't Make Everyone Like You",
        slug: 'you-cant-make-everyone-like-you',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '03 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 6 MIN READ',
        badgeText: 'UNAPOLOGETIC PRESENCE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'People perceive you through the lens of their own projections and unresolved wounds. Release the impossible burden of',
        highlightText: 'managing their opinions.',
        quote: '“Be willing to be misunderstood by those committed to not seeing you.”',
      },
      {
        id: 'dif-4',
        title: 'Setting Boundaries Without Guilt',
        slug: 'setting-boundaries-without-guilt',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '04 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 6 MIN READ',
        badgeText: 'UNSHAKABLE RESOLVE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Guilt is the tax we pay for unlearning people-pleasing. Stand firm through the initial discomfort knowing that peace',
        highlightText: 'is on the other side.',
        quote: '“Those who get angry at your boundaries are the ones who benefited from your lack of them.”',
      },
      {
        id: 'dif-5',
        title: 'Navigating Passive-Aggressive Dynamics',
        slug: 'navigating-passive-aggressive-dynamics',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '05 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 7 MIN READ',
        badgeText: 'DIRECT TRANSPARENCY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Subtle jabs and covert hostility wither when met with direct, unflinching, calm clarity. Do not play the games of',
        highlightText: 'veiled contempt.',
        quote: '“Shine the light of direct conversation into the shadows of passive aggression.”',
      },
      {
        id: 'dif-6',
        title: 'Reclaiming Your Energetic Space',
        slug: 'reclaiming-your-energetic-space',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '06 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 5 MIN READ',
        badgeText: 'ENERGY PRESERVATION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Certain interactions leave you drained and foggy. Recognize psychic vampires and establish strict energetic curtains around',
        highlightText: 'your sacred inner garden.',
        quote: '“Your energy is finite; spend it on soil that bears fruit, not thorns.”',
      },
      {
        id: 'dif-7',
        title: 'Responding Rather Than Defending',
        slug: 'responding-rather-than-defending',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '07 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 6 MIN READ',
        badgeText: 'CALM COMPOSURE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'When accused falsely or provoked unjustly, frantic defense implies vulnerability to their verdict. Respond calmly from a place of',
        highlightText: 'unassailable self-knowledge.',
        quote: '“A lion does not need to justify its roar to the hyenas.”',
      },
      {
        id: 'dif-8',
        title: 'The Trap of People Pleasing',
        slug: 'the-trap-of-people-pleasing',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '08 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 5 MIN READ',
        badgeText: 'BREAKING THE COMPLIANCE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Pleasing others at the expense of your truth is not kindness; it is manipulation disguised as virtue. Say no when',
        highlightText: 'your heart says no.',
        quote: '“When you say yes to others, make sure you are not saying no to yourself.”',
      },
      {
        id: 'dif-9',
        title: 'Emotional Detachment With Compassion',
        slug: 'emotional-detachment-with-compassion',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '09 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 6 MIN READ',
        badgeText: 'LOVING DETACHMENT',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You can hold love in your heart for someone while stepping out of their chaotic blast radius. Wish them well from',
        highlightText: 'a healthy distance.',
        quote: '“Detachment is not unfeeling; it is refusing to drown in someone else’s ocean.”',
      },
      {
        id: 'dif-10',
        title: 'Walking Away With Silence and Dignity',
        slug: 'walking-away-with-silence-and-dignity',
        category: 'DIFFICULT PEOPLE',
        categoryNum: '10 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 7 MIN READ',
        badgeText: 'QUIET DEPARTURE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'The ultimate power over a toxic dynamic is total non-engagement. You don’t need the last word when you already have',
        highlightText: 'the peace of departure.',
        quote: '“Silence is the most devastating answer to relentless disrespect.”',
      }
    ]
  },
  {
    num: '06',
    id: 'communication',
    title: 'Communication',
    subtitle: 'On saying what matters, listening better and finding clarity in conversation.',
    articles: [
      {
        id: 'com-1',
        title: 'Say Less, Say Better',
        slug: 'say-less-say-better',
        category: 'COMMUNICATION',
        categoryNum: '01 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 5 MIN READ',
        badgeText: 'THE ELOQUENCE OF BREVITY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Over-explaining is often an anxious attempt to seek permission. State your thoughts clearly, warmly, and without',
        highlightText: 'unnecessary defense.',
        quote: '“Clear words carry weight because they leave space for truth to land.”',
      },
      {
        id: 'com-2',
        title: "It's Not What You Say, It's How They Receive It",
        slug: 'its-not-what-you-say-how-they-receive',
        category: 'COMMUNICATION',
        categoryNum: '02 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 7 MIN READ',
        badgeText: 'TUNED RECEPTIVITY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Communication is not the message spoken; it is the message understood. Meet people at their emotional frequency to create',
        highlightText: 'genuine resonance.',
        quote: '“Listening is not waiting to speak; it is creating a sanctuary for another’s voice.”',
      },
      {
        id: 'com-3',
        title: 'Honesty Can Be Kind',
        slug: 'honesty-can-be-kind',
        category: 'COMMUNICATION',
        categoryNum: '03 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 6 MIN READ',
        badgeText: 'COMPASSIONATE TRUTH',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Brutal honesty is more about cruelty than truth. Real courage is delivering necessary truth with patience, empathy, and',
        highlightText: 'unwavering warmth.',
        quote: '“Truth without love is weaponized; truth with love is medicine.”',
      },
      {
        id: 'com-4',
        title: 'The Art of Deep Active Listening',
        slug: 'the-art-of-deep-active-listening',
        category: 'COMMUNICATION',
        categoryNum: '04 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 6 MIN READ',
        badgeText: 'SACRED ATTENTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Listening without formulating your comeback in your head is the rarest gift you can offer another human being. Listen to',
        highlightText: 'understand, not reply.',
        quote: '“The greatest compliment is not to be praised, but to be truly heard.”',
      },
      {
        id: 'com-5',
        title: 'Difficult Conversations Made Simpler',
        slug: 'difficult-conversations-made-simpler',
        category: 'COMMUNICATION',
        categoryNum: '05 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 7 MIN READ',
        badgeText: 'COURAGEOUS DIALOGUE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Avoiding uncomfortable conversations only converts temporary friction into permanent resentment. Step into the discomfort with',
        highlightText: 'poise and structure.',
        quote: '“A hard conversation today saves ten years of silent estrangement.”',
      },
      {
        id: 'com-6',
        title: 'Stopping Over-Explanation',
        slug: 'stopping-over-explanation',
        category: 'COMMUNICATION',
        categoryNum: '06 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 5 MIN READ',
        badgeText: 'CALM BREVITY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'No is a complete sentence. Learn to state boundaries and choices without wrapping them in layers of nervous, defensive',
        highlightText: 'apologies.',
        quote: '“You do not owe the world a justification for choosing your sanity.”',
      },
      {
        id: 'com-7',
        title: 'Speaking From Needs, Not Blame',
        slug: 'speaking-from-needs-not-blame',
        category: 'COMMUNICATION',
        categoryNum: '07 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 6 MIN READ',
        badgeText: 'NON-VIOLENT DIALOGUE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Accusations trigger immediate defensive shields. Expressing your vulnerable needs invites curiosity, collaboration, and',
        highlightText: 'authentic care.',
        quote: '“When you trade blame for vulnerability, enemies become allies.”',
      },
      {
        id: 'com-8',
        title: 'Silence as a Powerful Language',
        slug: 'silence-as-a-powerful-language',
        category: 'COMMUNICATION',
        categoryNum: '08 / 10',
        readTime: '5 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 5 MIN READ',
        badgeText: 'THE PAUSE OF WISDOM',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'The pause between hearing and answering is where wisdom lives. Master the silence before words to maintain mastery over',
        highlightText: 'the entire room.',
        quote: '“Speak only if it improves upon the silence.”',
      },
      {
        id: 'com-9',
        title: 'Repairing After a Misunderstanding',
        slug: 'repairing-after-a-misunderstanding',
        category: 'COMMUNICATION',
        categoryNum: '09 / 10',
        readTime: '7 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 7 MIN READ',
        badgeText: 'RELATIONAL REPAIR',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Rupture in connection is inevitable; what defines lasting maturity is the speed and sincerity of your repair attempt without',
        highlightText: 'ego getting in the way.',
        quote: '“A relationship is not measured by its conflicts, but by the beauty of its repairs.”',
      },
      {
        id: 'com-10',
        title: 'Holding Your Truth Calmly',
        slug: 'holding-your-truth-calmly',
        category: 'COMMUNICATION',
        categoryNum: '10 / 10',
        readTime: '6 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 6 MIN READ',
        badgeText: 'UNSHAKABLE INTEGRITY',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You do not need to shout to be convincing. The most transformative truths are spoken in a quiet, measured, and',
        highlightText: 'peaceful voice.',
        quote: '“Truth spoken with calm conviction requires no loud amplification.”',
      }
    ]
  }
];

export default function LibraryDirectorySection() {
  const navigate = useNavigate();
  const [directorySettings, setDirectorySettings] = useState(null);
  const [categoriesData, setCategoriesData] = useState(LIBRARY_CATEGORIES);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSaveId, setPendingSaveId] = useState(null);

  const fetchSaved = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSavedArticleIds([]);
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/users/saved-articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const ids = [];
        (data || []).forEach(a => {
          if (typeof a === 'object' && a) {
            if (a._id) ids.push(a._id.toString());
            if (a.id) ids.push(a.id.toString());
            if (a.slug) ids.push(a.slug);
            if (a.title) ids.push(a.title);
          } else if (a) {
            ids.push(a.toString());
          }
        });
        setSavedArticleIds([...new Set(ids)]);
      }
    } catch (err) {
      console.error('Failed to fetch saved articles', err);
    }
  };

  useEffect(() => {
    fetchSaved();
    window.addEventListener('auth-change', fetchSaved);
    window.addEventListener('storage', fetchSaved);
    return () => {
      window.removeEventListener('auth-change', fetchSaved);
      window.removeEventListener('storage', fetchSaved);
    };
  }, []);

  const isArtSaved = (art) => {
    if (!art) return false;
    const artId = art._id?.toString() || art.id?.toString() || art.slug || art.title;
    return savedArticleIds.some(id => 
      id === artId || 
      id === art._id?.toString() || 
      id === art.id?.toString() || 
      id === art.slug || 
      id === art.title
    );
  };

  const handleToggleSave = async (article, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    const artObj = typeof article === 'object' && article ? article : (hoveredArticle || { id: article, title: article });
    const articleId = artObj._id || artObj.id || artObj.slug || article;

    if (!token) {
      setPendingSaveId(artObj);
      setShowLoginModal(true);
      return;
    }

    const isCurrentlySaved = isArtSaved(artObj);

    // Optimistic UI update
    setSavedArticleIds(prev => {
      if (isCurrentlySaved) {
        return prev.filter(id => 
          id !== articleId && 
          id !== artObj._id?.toString() && 
          id !== artObj.id?.toString() && 
          id !== artObj.slug && 
          id !== artObj.title
        );
      } else {
        const toAdd = [articleId?.toString(), artObj._id?.toString(), artObj.id?.toString(), artObj.slug, artObj.title].filter(Boolean);
        return [...new Set([...prev, ...toAdd])];
      }
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          articleId,
          title: artObj.title,
          category: artObj.category || 'RELATIONSHIPS',
          excerpt: artObj.excerpt || artObj.subtitle || artObj.description || '',
          image: artObj.image || artObj.featuredImage || '/library_preview_silhouette.jpg',
          slug: artObj.slug || ''
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isSaved === false) {
          setSavedArticleIds(prev => 
            prev.filter(id => 
              id !== articleId && 
              id !== artObj._id?.toString() && 
              id !== artObj.id?.toString() && 
              id !== artObj.slug && 
              id !== artObj.title &&
              (data.articleId ? id !== data.articleId.toString() : true)
            )
          );
        } else {
          const idsToAdd = [
            data.articleId?.toString(),
            articleId?.toString(),
            artObj._id?.toString(),
            artObj.id?.toString(),
            artObj.slug,
            artObj.title
          ].filter(Boolean);
          setSavedArticleIds(prev => [...new Set([...prev, ...idsToAdd])]);
        }
      }
    } catch (err) {
      console.error('Save article error:', err);
    }
  };

  const handleLoginSuccess = async (loginResult) => {
    setShowLoginModal(false);
    window.dispatchEvent(new Event('auth-change'));

    if (pendingSaveId) {
      const artObj = pendingSaveId;
      setPendingSaveId(null);
      const token = localStorage.getItem('token') || loginResult?.token;
      if (token) {
        const articleId = artObj._id || artObj.id || artObj.slug || (typeof artObj === 'string' ? artObj : artObj.title);
        
        // Optimistic UI update
        const toAdd = [articleId?.toString(), artObj._id?.toString(), artObj.id?.toString(), artObj.slug, artObj.title].filter(Boolean);
        setSavedArticleIds(prev => [...new Set([...prev, ...toAdd])]);

        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiUrl}/api/users/save-article`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              articleId,
              title: artObj.title,
              category: artObj.category || 'RELATIONSHIPS',
              excerpt: artObj.excerpt || artObj.subtitle || artObj.description || '',
              image: artObj.image || artObj.featuredImage || '/library_preview_silhouette.jpg',
              slug: artObj.slug || ''
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const idsToAdd = [
              data.articleId?.toString(),
              articleId?.toString(),
              artObj._id?.toString(),
              artObj.id?.toString(),
              artObj.slug,
              artObj.title
            ].filter(Boolean);
            setSavedArticleIds(prev => [...new Set([...prev, ...idsToAdd])]);
          }
        } catch (err) {
          console.error('Save article error after login:', err);
        }
      }
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/library-settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.directory) {
            setDirectorySettings(data.directory);
            if (data.directory.categories && Array.isArray(data.directory.categories) && data.directory.categories.length > 0) {
              setCategoriesData(prev => {
                return data.directory.categories.map((c, idx) => {
                  const existing = prev.find(p => 
                    (p.id || '').toLowerCase() === (c.id || '').toLowerCase() || 
                    (p.id || '').toLowerCase() === (c.key || '').toLowerCase() ||
                    (p.title || '').toLowerCase() === (c.title || '').toLowerCase()
                  );
                  return {
                    num: c.num || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
                    id: c.id || existing?.id || `cat-${idx + 1}`,
                    title: c.title || existing?.title || 'Category',
                    subtitle: c.subtitle || existing?.subtitle || '',
                    articles: existing ? existing.articles : []
                  };
                });
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load directory settings:', err);
      }
    };

    const fetchCustomArticles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/articles`);
        if (res.ok) {
          const dbArticles = await res.json();
          if (Array.isArray(dbArticles) && dbArticles.length > 0) {
            setCategoriesData(prev => {
              const updated = prev.map(cat => ({ ...cat, articles: [...cat.articles] }));
              dbArticles.forEach(dbA => {
                const catId = (dbA.categoryId || dbA.category || '').toLowerCase();
                const targetCat = updated.find(c => 
                  (c.id || '').toLowerCase() === catId || 
                  (c.title || '').toLowerCase() === catId
                );
                if (targetCat) {
                  const existingIdx = targetCat.articles.findIndex(a => a.id === dbA._id || a.id === dbA.id || a.slug === dbA.slug);
                  const articleObj = {
                    id: dbA._id || dbA.id || dbA.slug,
                    title: dbA.title,
                    slug: dbA.slug || dbA.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    category: targetCat.title.toUpperCase(),
                    categoryNum: dbA.categoryNum || '01 / 03',
                    readTime: dbA.readTime || '5 MIN READ',
                    meta: `IDEAS · ${targetCat.title.toUpperCase()}`,
                    badgeText: dbA.badgeText || 'ATTENTION IS NOT ALWAYS AFFECTION',
                    image: dbA.featuredImage || dbA.image || '/library_preview_silhouette.jpg',
                    excerpt: dbA.description || dbA.subtitle || dbA.excerpt || '',
                    highlightText: dbA.highlightText || '',
                    quote: dbA.quote || '',
                    dropCap: dbA.dropCap,
                    dropCapText: dbA.dropCapText,
                    blocks: dbA.blocks,
                    sections: dbA.sections,
                    bodyHtml: dbA.bodyHtml
                  };
                  if (existingIdx !== -1) {
                    targetCat.articles[existingIdx] = { ...targetCat.articles[existingIdx], ...articleObj };
                  } else {
                    targetCat.articles.unshift(articleObj);
                  }
                }
              });

              return updated;
            });
          }
        }
      } catch (err) {
        console.log('Using default curated articles');
      }
    };

    fetchSettings();
    fetchCustomArticles();
  }, []);

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const closeTimeoutRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');

  // All articles flattened for search
  const allArticlesList = categoriesData.flatMap(c => c.articles);
  const matchingArticles = searchQuery.trim()
    ? allArticlesList.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
          (a.title || '').toLowerCase().includes(q) ||
          (a.excerpt || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q)
        );
      })
    : [];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    if (matchingArticles.length > 0) {
      handleArticleClick(matchingArticles[0]);
    } else {
      navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        rafId = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);


  const isHoveringPopupRef = useRef(false);
  const rafRef = useRef(null);
  const enterTimeoutRef = useRef(null);

  const handleArticleClick = (article) => {
    sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
    navigate(`/articles?article=${article.slug || article.id}&title=${encodeURIComponent(article.title)}`);
  };

  const handleArticleMouseEnter = (article, e) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }
    isHoveringPopupRef.current = false;
    const currentTarget = e.currentTarget;

    enterTimeoutRef.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = currentTarget.getBoundingClientRect();
        const sectionContainer = document.getElementById('library-directory-container');
        const containerRect = sectionContainer 
          ? sectionContainer.getBoundingClientRect() 
          : { top: 0, left: 0, height: 1000 };
        
        const cardHeight = 440;
        const itemOffsetInContainer = rect.top - containerRect.top;
        let desiredTop = itemOffsetInContainer + (rect.height / 2) - (cardHeight / 2);
        
        // Calculate where the card would land in the current viewport
        let cardViewportTop = rect.top + (rect.height / 2) - (cardHeight / 2);
        let cardViewportBottom = cardViewportTop + cardHeight;
        const minViewportTop = 126; // Buffer below extended top navbar
        const maxViewportBottom = window.innerHeight - 20; // Buffer above screen bottom
        
        // 1. If overflowing below the screen bottom, pull it up
        if (cardViewportBottom > maxViewportBottom) {
          const bottomOverflow = cardViewportBottom - maxViewportBottom;
          desiredTop -= bottomOverflow;
          cardViewportTop -= bottomOverflow;
        }
        
        // 2. If pushed too high above the navbar, push it down
        if (cardViewportTop < minViewportTop) {
          const topOverflow = minViewportTop - cardViewportTop;
          desiredTop += topOverflow;
        }
        
        // 3. Keep within container bounds
        const topPos = Math.max(10, desiredTop);
        const leftPos = rect.left - containerRect.left;
        
        setPopupPos({ top: topPos, left: leftPos });
        setHoveredArticle(article);
      });
    }, 40);
  };

  const handleArticleMouseLeave = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringPopupRef.current) {
        setHoveredArticle(null);
      }
    }, 220);
  };

  const handlePopupMouseEnter = () => {
    isHoveringPopupRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    isHoveringPopupRef.current = false;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredArticle(null);
    }, 250);
  };

  return (
    <section className="relative w-full bg-[#080706] text-white pt-[118px] sm:pt-[122px] lg:pt-[124px] pb-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-visible">
      
      {/* Background Soft, Seamless Golden Ambient Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden" 
        style={{
          background: 'radial-gradient(ellipse at 75% 25%, rgba(199, 156, 110, 0.07) 0%, rgba(140, 95, 50, 0.02) 45%, transparent 70%), radial-gradient(ellipse at 25% 60%, rgba(199, 156, 110, 0.04) 0%, transparent 60%)'
        }}
      />
      <div className="absolute top-10 right-1/4 w-[600px] h-[400px] bg-[#c79c6e]/[0.05] rounded-full blur-[180px] pointer-events-none will-change-transform" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#c79c6e]/[0.03] rounded-full blur-[180px] pointer-events-none will-change-transform" />

      {/* Main Section Flex Container */}
      <div className="max-w-[1440px] mx-auto flex items-start justify-between gap-8 xl:gap-12 relative z-10">

        {/* Left / Main Content: Header + 6 Categories */}
        <div id="library-directory-container" className="flex-1 min-w-0 flex flex-col gap-0 pt-0 pb-0 relative z-30">
          
          {/* =========================================================
              HEADER AREA
             ========================================================= */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-10 pb-8 sm:pb-9">
          
          {/* Left Column: Eyebrow + Large Title + Serif Description */}
          <div className="flex flex-col gap-2.5 max-w-xl">
            <span className="font-sans text-[0.68rem] md:text-[0.72rem] uppercase tracking-[0.25em] font-semibold text-[#c79c6e]">
              {directorySettings?.eyebrowText || 'IDEAS FOR A MORE THOUGHTFUL LIFE'}
            </span>
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.05]">
              {directorySettings?.headingText || 'Library'}
            </h2>
            <p className="font-serif text-white/75 text-base sm:text-lg lg:text-[1.15rem] font-normal leading-relaxed mt-0.5">
              {directorySettings?.description || 'A collection of ideas about how we think, relate, choose and change.'}
            </p>
          </div>

          {/* Right Group: Search Bar (on left) + Quote Block (on right) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 shrink-0">
            
            {/* Ultra-Sleek Modern Luxury Search Bar */}
            <div className="w-full sm:w-64 md:w-72 lg:w-80 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c79c6e]/0 via-[#c79c6e]/25 to-[#c79c6e]/0 rounded-full blur-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <form 
                onSubmit={handleSearchSubmit} 
                className="relative w-full flex items-center bg-[#110e0b]/90 hover:bg-[#17130e]/95 backdrop-blur-xl border border-white/10 group-hover:border-[#c79c6e]/40 group-focus-within:border-[#c79c6e] group-focus-within:ring-2 group-focus-within:ring-[#c79c6e]/20 rounded-full py-1.5 pl-3.5 sm:pl-4 pr-1.5 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              >
                <div className="text-white/40 group-focus-within:text-[#c79c6e] group-hover:text-white/70 transition-colors mr-2.5 shrink-0">
                  <MagnifyingGlass size={16} weight="regular" />
                </div>

                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={directorySettings?.searchPlaceholder || "Describe what you're facing..."}
                  className="w-full bg-transparent text-white placeholder:text-white/35 font-light text-xs sm:text-sm focus:outline-none tracking-wide"
                />

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="w-7 h-7 rounded-full bg-[#c79c6e]/15 hover:bg-[#c79c6e] text-[#c79c6e] hover:text-black group-focus-within:bg-[#c79c6e] group-focus-within:text-black flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    title="Search"
                  >
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </div>
              </form>

              {/* Floating Dynamic Search Dropdown Overlay */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2.5 z-[100] bg-[#0d0a08]/95 backdrop-blur-2xl border border-[#c79c6e]/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  {matchingArticles.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {matchingArticles.slice(0, 4).map((art) => (
                        <div
                          key={art.id || art.slug}
                          onClick={() => {
                            setSearchQuery('');
                            handleArticleClick(art);
                          }}
                          className="group/match p-2.5 rounded-xl border border-white/5 hover:border-[#c79c6e]/60 bg-white/[0.02] hover:bg-[#1a1510] transition-all duration-200 cursor-pointer flex flex-col gap-1 shadow-sm"
                        >
                          <span className="text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e]">
                            {art.category}
                          </span>
                          <h4 className="font-serif text-xs sm:text-sm text-white font-normal group-hover/match:text-[#c79c6e] transition-colors leading-snug line-clamp-1">
                            {renderFormattedTitle(art.title)}
                          </h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-white/70 text-xs font-light">
                        No articles matching "<span className="text-white">{searchQuery}</span>".
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Quote with matching height vertical divider in 2 lines */}
            <div className="flex flex-col justify-center border-l border-[#c79c6e]/50 pl-5 sm:pl-6 py-0.5 max-w-[280px] sm:max-w-xs shrink-0">
              <p className="font-serif text-base sm:text-lg lg:text-[1.18rem] text-white/95 italic leading-[1.35] whitespace-pre-line">
                {directorySettings?.quoteText 
                  ? (directorySettings.quoteText.includes('\n') 
                      ? directorySettings.quoteText 
                      : directorySettings.quoteText.replace(/mind\s+/i, 'mind\n'))
                  : '“A quieter mind\nbuilds a braver, kinder life.”'}
              </p>
              <span className="font-sans text-[0.65rem] md:text-[0.68rem] uppercase tracking-[0.25em] font-semibold text-[#c79c6e] mt-2.5">
                {directorySettings?.quoteAuthor || '— AARKESH GUPTA'}
              </span>
            </div>

          </div>

        </div>

        {/* =========================================================
            6 SECTION CATEGORIES & HOVER ROWS (UNIFIED SEAMLESS BLEND)
           ========================================================= */}
        <div className="flex flex-col relative">
          {categoriesData.map((cat, index) => {
            const isHovered = hoveredCategory === cat.id;

            return (
              <div 
                key={cat.id} 
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`py-6 sm:py-7 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 items-start relative transition-colors duration-200 cursor-default rounded-none border-x-0 ${
                  isHovered 
                    ? 'bg-gradient-to-r from-[#c79c6e]/[0.08] via-[#c79c6e]/[0.03] to-transparent border-y border-[#c79c6e]/70 shadow-[0_12px_36px_rgba(0,0,0,0.85)] z-30 opacity-100' 
                    : `bg-transparent opacity-100 border-t border-white/10 border-b-transparent z-10 ${index === categoriesData.length - 1 ? 'border-b border-b-white/10' : ''}`
                }`}
              >
                {/* Category Number & Title (Left Part) */}
                <div className="md:col-span-5 flex items-start gap-5 sm:gap-7 md:pr-8 lg:pr-12">
                  <span className={`font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-light leading-none shrink-0 select-none pt-0.5 transition-colors duration-200 ${
                    isHovered 
                      ? 'text-[#f6cb90]' 
                      : 'text-[#c79c6e]'
                  }`}>
                    {cat.num}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-3xl sm:text-[2rem] lg:text-[2.25rem] font-normal leading-tight text-white transition-colors duration-200">
                      {cat.title}
                    </h3>
                    <p className="font-sans text-sm sm:text-[0.95rem] lg:text-[1.02rem] leading-relaxed font-light pr-2 text-white/75 transition-colors duration-200">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Articles List (Right Part) - Simple Clean Vertical Separator Line */}
                <div className={`md:col-span-7 flex flex-col gap-1 sm:gap-1.5 pt-1 md:pt-0 md:pl-8 lg:pl-12 md:border-l transition-colors duration-200 ${
                  isHovered ? 'md:border-[#c79c6e]/60' : 'md:border-[#c79c6e]/30'
                }`}>
                  {cat.articles.map((art) => {
                    const saved = isArtSaved(art);
                    const isArtActive = hoveredArticle?.id === art.id || hoveredArticle?.slug === art.slug;

                    return (
                      <div
                        key={art.id || art.slug}
                        onMouseEnter={(e) => handleArticleMouseEnter(art, e)}
                        onMouseLeave={handleArticleMouseLeave}
                        onClick={() => handleArticleClick(art)}
                        className="group/item flex items-center justify-between cursor-pointer py-0.5 relative"
                      >
                        <span className={`font-serif text-lg sm:text-xl lg:text-[1.18rem] transition-colors duration-150 pr-3 leading-snug flex-1 ${
                          isArtActive
                            ? 'text-[#fce0a6] underline underline-offset-4 decoration-[#c79c6e] [&_*]:text-[#fce0a6]'
                            : 'text-white/95 group-hover/item:text-[#fce0a6] group-hover/item:underline group-hover/item:underline-offset-4 group-hover/item:decoration-[#c79c6e] [&_*]:text-white/95 group-hover/item:[&_*]:text-[#fce0a6]'
                        }`}>
                          {renderFormattedTitle(art.title)}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              handleToggleSave(art, e);
                            }}
                            className={`p-1.5 rounded transition-opacity duration-150 ${
                              saved 
                                ? 'opacity-100 text-[#c79c6e]' 
                                : 'opacity-0 group-hover/item:opacity-100 text-white/40 hover:text-[#c79c6e] hover:bg-white/5'
                            }`}
                            title={saved ? "Remove from Saved" : "Save Article"}
                          >
                            <BookmarkSimple 
                              size={17} 
                              weight={saved ? "fill" : "regular"} 
                            />
                          </button>
                          
                          <CaretRight 
                            size={17} 
                            className={`transition-all duration-150 ${
                              isArtActive
                                ? 'text-[#fce0a6] translate-x-1'
                                : 'text-white/30 group-hover/item:text-[#fce0a6] group-hover/item:translate-x-1'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================
            DYNAMIC FLOATING POPUP PREVIEW CARD (GPU ACCELERATED)
           ========================================================= */}
        {hoveredArticle && (
          <div 
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
            style={{
              top: `${popupPos.top}px`,
              right: window.innerWidth >= 1280 ? '-80px' : window.innerWidth >= 1024 ? '0px' : '0px',
              maxWidth: 'calc(100vw - 32px)'
            }}
            className="absolute z-50 w-[320px] sm:w-[350px] lg:w-[370px] max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar rounded-2xl border border-[#c79c6e]/50 bg-[#0e0c0a] p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_20px_rgba(199,156,110,0.2)] animate-in fade-in zoom-in-95 duration-100 pointer-events-auto transform-gpu will-change-transform before:content-[''] before:absolute before:-left-12 before:top-0 before:w-12 before:h-full before:pointer-events-auto"
          >
            {/* Top Celestial Image Visual - Normal / Static */}
            <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#c79c6e]/30 bg-black mb-4 relative shadow-inner">
              <img 
                src={resolveImageUrl(hoveredArticle.image, '/library_celestial_column.jpg')} 
                alt={typeof hoveredArticle.title === 'string' ? hoveredArticle.title : 'Article Artwork'}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Category Tag pill */}
              <div className="absolute bottom-2.5 left-3">
                <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[0.62rem] uppercase tracking-widest font-semibold text-[#c79c6e] border border-[#c79c6e]/30">
                  {hoveredArticle.category}
                </span>
              </div>
            </div>

            {/* Article Title */}
            <h4 className="font-serif text-xl sm:text-[1.4rem] font-normal text-white leading-snug mb-2.5">
              {renderFormattedTitle(hoveredArticle.title)}
            </h4>

            {/* Excerpt with Gold Highlight */}
            <p className="font-serif text-white/75 text-xs sm:text-[0.84rem] font-normal leading-relaxed mb-4">
              {hoveredArticle.excerpt ? (
                <>
                  {renderFormattedTitle(hoveredArticle.excerpt)}
                  {hoveredArticle.highlightText && (
                    <>
                      {' '}
                      <span className="text-[#c79c6e] italic font-serif">
                        {hoveredArticle.highlightText}
                      </span>
                    </>
                  )}
                </>
              ) : (
                renderFormattedTitle(hoveredArticle.subtitle || hoveredArticle.description || '')
              )}
            </p>

            {/* CTA Action Row: Read Article + Bookmark */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleArticleClick(hoveredArticle)}
                className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] font-semibold text-[#c79c6e] hover:text-white transition-colors cursor-pointer group/cta"
              >
                <span>Read article</span>
                <ArrowRight size={13} weight="bold" className="group-hover/cta:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  handleToggleSave(hoveredArticle, e);
                }}
                className={`px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                  isArtSaved(hoveredArticle)
                    ? 'bg-[#c79c6e] text-black border-[#c79c6e]'
                    : 'bg-black/80 text-[#c79c6e] border-[#c79c6e]/50 hover:bg-[#c79c6e] hover:text-black'
                }`}
                title={isArtSaved(hoveredArticle) ? "Remove from Saved" : "Save Article"}
              >
                <BookmarkSimple 
                  size={16} 
                  weight={isArtSaved(hoveredArticle) ? "fill" : "regular"} 
                />
                <span className="font-sans text-[0.65rem] uppercase tracking-wider font-semibold">
                  {isArtSaved(hoveredArticle) ? "Saved" : "Save"}
                </span>
              </button>
            </div>
          </div>
        )}

        </div>

        {/* =========================================================
            STICKY FIXED CELESTIAL RIGHT BAR
            (Stays fixed in viewport through Categories 01-06, then scrolls off before footer)
           ========================================================= */}
        <aside className="hidden lg:flex sticky top-[125px] self-start shrink-0 z-20 w-52 xl:w-60 h-[calc(100vh-135px)] border-l border-[#c79c6e]/25 rounded-none flex-col justify-between items-center py-8 px-4 overflow-hidden bg-transparent select-none pointer-events-none transition-all duration-300">
  
          {/* Celestial Art Background Image - Natural Proportion */}
          <div className="absolute inset-0 z-0 overflow-hidden opacity-85 mix-blend-screen flex items-center justify-center">
            <img 
              src="/library_celestial_column.jpg" 
              alt="Celestial Sacred Geometry" 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070605]/95 via-transparent to-[#070605]/95" />
          </div>

          {/* Ambient Warm Golden Glow — GPU layer */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#c79c6e]/15 rounded-full blur-3xl will-change-transform" />

          {/* Top Typography Header (Left Aligned as in reference) */}
          <div className="w-full flex flex-col items-start text-left gap-3 z-10 pt-2 pl-2 sm:pl-3">
            <div className="font-sans text-[0.68rem] tracking-[0.3em] font-medium text-[#c79c6e] leading-[2] uppercase">
              CLEARER<br/>THINKING<br/>KINDER<br/>CHOICES<br/>A FULLER<br/>LIFE
            </div>
            <div className="w-7 h-[2px] bg-[#c79c6e]/80 mt-1" />
          </div>

          {/* Bottom Typography Footer (Left Aligned as in reference) */}
          <div className="w-full flex flex-col items-start text-left gap-3 z-10 pb-4 pl-2 sm:pl-3">
            <div className="w-7 h-[2px] bg-[#c79c6e]/80 mb-1" />
            <div className="font-sans text-[0.68rem] tracking-[0.3em] font-semibold text-[#c79c6e] leading-[2] uppercase">
              IDEAS<br/>PERSPECTIVE<br/>PROGRESS<br/>A CALMER YOU
            </div>
          </div>
        </aside>

      </div>

      {/* Auth / Login Modal when unauthenticated user clicks Save */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={handleLoginSuccess} 
      />
    </section>
  );
}

