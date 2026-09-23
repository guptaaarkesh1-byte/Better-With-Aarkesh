import React, { useState, useRef } from 'react';
import { ArrowRight, CaretRight, Sparkle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export const LIBRARY_CATEGORIES = [
  {
    num: '01',
    id: 'relationships',
    title: 'Relationships',
    subtitle: 'On love, friendship and what it means to stay close.',
    articles: [
      {
        id: 'rel-1',
        title: "Attention Feels Like Love (But Isn't)",
        slug: 'attention-feels-like-love',
        category: 'RELATIONSHIPS',
        categoryNum: '01 / 03',
        readTime: '6 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 6 MIN READ',
        badgeText: 'ATTENTION IS NOT ALWAYS AFFECTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Why clarity often comes after action, not before — and how a kinder, braver you can take the next step,',
        highlightText: 'even in uncertainty.',
        quote: '“Not all attention is a promise. Sometimes it’s just a moment.”',
      },
      {
        id: 'rel-2',
        title: 'The Problem With Closure',
        slug: 'the-problem-with-closure',
        category: 'RELATIONSHIPS',
        categoryNum: '02 / 03',
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
        categoryNum: '03 / 03',
        readTime: '7 MIN READ',
        meta: 'IDEAS · RELATIONSHIPS · 7 MIN READ',
        badgeText: 'CONNECTION OVER CONQUEST',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Winning an argument often means losing the connection. How to hold your truth without needing to',
        highlightText: 'diminish theirs.',
        quote: '“Kindness in disagreement is not weakness; it is the ultimate strength.”',
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
        categoryNum: '01 / 03',
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
        categoryNum: '02 / 03',
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
        categoryNum: '03 / 03',
        readTime: '6 MIN READ',
        meta: 'IDEAS · SELF · 6 MIN READ',
        badgeText: 'EXPANSION REQUIRES FRICTION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'The uneasiness you feel is not a red light. It is the friction of your old self stretching into',
        highlightText: 'who you are becoming.',
        quote: '“Growth always feels like disruption before it feels like grace.”',
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
        categoryNum: '01 / 03',
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
        categoryNum: '02 / 03',
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
        categoryNum: '03 / 03',
        readTime: '6 MIN READ',
        meta: 'IDEAS · CHANGE · 6 MIN READ',
        badgeText: 'EMBRACING PARADOX',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You can be grieving what was lost and excited for what lies ahead. Human wholeness requires room for',
        highlightText: 'complex truths.',
        quote: '“Maturity is the capacity to hold conflicting feelings with tenderness.”',
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
        categoryNum: '01 / 03',
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
        categoryNum: '02 / 03',
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
        categoryNum: '03 / 03',
        readTime: '7 MIN READ',
        meta: 'IDEAS · DECISIONS · 7 MIN READ',
        badgeText: 'ACTION CREATES VISION',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'You cannot think your way into a new way of living. You must act your way into',
        highlightText: 'a new way of thinking.',
        quote: '“Clarity is never found at the desk of overthinking; it is forged on the path.”',
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
        categoryNum: '01 / 03',
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
        categoryNum: '02 / 03',
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
        categoryNum: '03 / 03',
        readTime: '6 MIN READ',
        meta: 'IDEAS · DIFFICULT PEOPLE · 6 MIN READ',
        badgeText: 'UNAPOLOGETIC PRESENCE',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'People perceive you through the lens of their own projections and unresolved wounds. Release the impossible burden of',
        highlightText: 'managing their opinions.',
        quote: '“Be willing to be misunderstood by those committed to not seeing you.”',
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
        categoryNum: '01 / 03',
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
        categoryNum: '02 / 03',
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
        categoryNum: '03 / 03',
        readTime: '6 MIN READ',
        meta: 'IDEAS · COMMUNICATION · 6 MIN READ',
        badgeText: 'COMPASSIONATE TRUTH',
        image: '/library_preview_silhouette.jpg',
        excerpt: 'Brutal honesty is more about cruelty than truth. Real courage is delivering necessary truth with patience, empathy, and',
        highlightText: 'unwavering warmth.',
        quote: '“Truth without love is weaponized; truth with love is medicine.”',
      }
    ]
  }
];

export default function LibraryDirectorySection() {
  const navigate = useNavigate();
  const [activeArticle, setActiveArticle] = useState(LIBRARY_CATEGORIES[0].articles[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardRef = useRef(null);

  const handleArticleHover = (article) => {
    if (activeArticle?.id === article.id) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveArticle(article);
      setIsTransitioning(false);
    }, 150);
  };

  const handleArticleClick = (article) => {
    sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
    navigate(`/articles?article=${article.slug || article.id}&title=${encodeURIComponent(article.title)}`);
  };

  return (
    <section className="relative w-full bg-[#050505] text-white py-20 lg:py-28 px-4 sm:px-6 md:px-10 lg:px-16 border-t border-white/5">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#c79c6e]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#c79c6e]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto flex flex-col gap-14 lg:gap-20 relative z-10">
        
        {/* =========================================================
            HEADER AREA
           ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/10">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="font-sans text-[0.68rem] md:text-[0.72rem] uppercase tracking-[0.25em] font-semibold text-[#c79c6e]">
              Ideas for a more thoughtful life
            </span>
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05]">
              Library
            </h2>
            <p className="font-sans text-white/60 text-base sm:text-lg font-light leading-relaxed mt-1">
              A collection of ideas about how we think, relate, choose and change.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end text-left lg:text-right max-w-md">
            <p className="font-serif text-lg sm:text-xl text-white/80 italic leading-snug">
              “A quieter mind builds a braver, kinder life.”
            </p>
            <span className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e] mt-2">
              — Aarkesh Gupta
            </span>
          </div>
        </div>

        {/* =========================================================
            MAIN 2-COLUMN DIRECTORY + HOVER PREVIEW
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start relative">
          
          {/* LEFT COLUMN: 6 Section Categories & Article Rows */}
          <div className="lg:col-span-7 flex flex-col">
            {LIBRARY_CATEGORIES.map((cat, idx) => (
              <div 
                key={cat.id} 
                className={`py-7 sm:py-8 lg:py-9 border-b border-white/10 ${idx === 0 ? 'pt-0' : ''} ${idx === LIBRARY_CATEGORIES.length - 1 ? 'border-b-0' : ''} grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 items-start group`}
              >
                {/* Category Number & Meta (Left Part with Vertical Divider) */}
                <div className="md:col-span-5 md:pr-6 lg:pr-8 md:border-r md:border-white/10 flex items-start gap-4 sm:gap-6">
                  <span className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] text-[#c79c6e] font-light leading-none shrink-0 select-none pt-0.5">
                    {cat.num}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-2xl sm:text-[1.65rem] text-white font-normal group-hover:text-[#c79c6e] transition-colors leading-tight">
                      {cat.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-[0.78rem] text-white/50 leading-relaxed font-light pr-2">
                      {cat.subtitle}
                    </p>
                    <span className="font-sans text-[0.62rem] uppercase tracking-[0.25em] font-semibold text-[#c79c6e] mt-1">
                      {cat.articles.length} Articles
                    </span>
                  </div>
                </div>

                {/* Articles List (Right Part) */}
                <div className="md:col-span-7 md:pl-6 lg:pl-8 flex flex-col justify-center gap-3.5 sm:gap-4 pt-1 sm:pt-0">
                  {cat.articles.map((art) => {
                    const isCurrent = activeArticle?.id === art.id;
                    return (
                      <div
                        key={art.id}
                        onMouseEnter={() => handleArticleHover(art)}
                        onClick={() => handleArticleClick(art)}
                        className="group/item flex items-center justify-between cursor-pointer transition-all duration-200 py-1"
                      >
                        <span className={`font-serif text-base sm:text-lg transition-all duration-200 line-clamp-1 pr-3 ${
                          isCurrent 
                            ? 'text-white underline underline-offset-4 decoration-[#c79c6e] font-normal' 
                            : 'text-white/80 group-hover/item:text-white group-hover/item:underline group-hover/item:underline-offset-4 group-hover/item:decoration-white/30'
                        }`}>
                          {art.title}
                        </span>

                        <CaretRight 
                          size={15} 
                          weight={isCurrent ? 'bold' : 'regular'}
                          className={`shrink-0 transition-all duration-300 ml-3 ${
                            isCurrent 
                              ? 'text-[#c79c6e] translate-x-1 scale-110' 
                              : 'text-white/30 group-hover/item:text-[#c79c6e] group-hover/item:translate-x-1'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Interactive Sticky Preview Card (Full Screen Height, Locked on Scroll) */}
          <div className="lg:col-span-5 sticky top-20 lg:top-[5.5rem] h-[calc(100vh-6.5rem)] min-h-[580px] max-h-[calc(100vh-6.5rem)] self-start z-20">
            <div 
              ref={cardRef}
              className={`w-full h-full rounded-2xl border border-[#c79c6e]/30 bg-gradient-to-b from-[#120e0a] via-[#090807] to-[#050505] p-6 sm:p-7 xl:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(199,156,110,0.15)] relative overflow-hidden transition-all duration-300 ${
                isTransitioning ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
              }`}
            >
              {/* Outer Golden Border Accent Glow */}
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#c79c6e]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header: Category Tag + Index */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <span className="font-sans text-[0.65rem] sm:text-[0.68rem] uppercase tracking-[0.25em] font-bold text-[#c79c6e]">
                  {activeArticle.category}
                </span>
                <span className="font-mono text-xs text-white/50 font-medium">
                  {activeArticle.categoryNum}
                </span>
              </div>

              {/* Article Title */}
              <h3 className="font-serif text-2xl sm:text-[1.75rem] xl:text-[2rem] font-normal text-white leading-tight shrink-0">
                {activeArticle.title}
              </h3>

              {/* Artwork / Banner Illustration */}
              <div className="w-full flex-1 min-h-[160px] max-h-[240px] aspect-[16/9] rounded-xl overflow-hidden relative border border-[#c79c6e]/20 bg-black group/art shadow-inner my-1">
                <img 
                  src={activeArticle.image} 
                  alt={activeArticle.title}
                  className="w-full h-full object-cover object-center group-hover/art:scale-105 transition-transform duration-700"
                />
                
                {/* Badge text on artwork */}
                {activeArticle.badgeText && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end text-right pointer-events-none max-w-[130px]">
                    <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] font-bold text-[#c79c6e] leading-snug drop-shadow-md">
                      {activeArticle.badgeText}
                    </span>
                    <div className="w-6 h-[1.5px] bg-[#c79c6e] mt-1.5" />
                  </div>
                )}
              </div>

              {/* Excerpt with Gold Highlight */}
              <p className="font-sans text-white/70 text-xs sm:text-[0.88rem] font-light leading-relaxed shrink-0">
                {activeArticle.excerpt}{' '}
                {activeArticle.highlightText && (
                  <span className="bg-[#c79c6e]/20 text-[#c79c6e] px-1.5 py-0.5 rounded font-normal">
                    {activeArticle.highlightText}
                  </span>
                )}
              </p>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => handleArticleClick(activeArticle)}
                className="w-fit inline-flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#c79c6e] hover:text-white transition-colors cursor-pointer group/cta shrink-0"
              >
                <span>Read Article</span>
                <ArrowRight size={14} weight="bold" className="group-hover/cta:translate-x-1 transition-transform" />
              </button>

              {/* Footer Italic Quote */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
                <p className="font-serif text-xs sm:text-[0.85rem] text-white/80 italic leading-snug">
                  {activeArticle.quote}
                </p>

                <div className="w-8 h-[1px] bg-[#c79c6e]/60 mt-0.5" />
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
