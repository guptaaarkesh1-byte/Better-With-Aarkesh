import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight, 
  ArrowDown, 
  Heart, 
  Leaf, 
  Shield, 
  ArrowsClockwise, 
  Signpost, 
  Sun 
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export const topics = [
  {
    id: 'relationships',
    icon: Heart,
    title: 'RELATIONSHIPS',
    desc: 'Connection, conflict, trust and the distance between people.',
    subItems: [
      {
        title: 'Conflict',
        pathways: ['With a partner', 'With family', 'With friends or colleagues']
      },
      {
        title: 'Heartbreak',
        pathways: ['When the relationship has ended', 'When you cannot let go', 'When you are considering reconnecting']
      },
      {
        title: 'Relationship Patterns',
        pathways: ['Repeating the same conflict', 'Choosing emotionally unavailable people', 'Confusing intensity with compatibility']
      },
      {
        title: 'Your Relationship With Yourself',
        pathways: ['Trusting your own judgment', 'Depending on external validation', 'Abandoning yourself to preserve connection']
      }
    ]
  },
  {
    id: 'growth',
    icon: Leaf,
    title: 'GROWTH',
    desc: 'The person you are becoming and what makes change possible.',
    subItems: [
      {
        title: 'Understanding Yourself',
        pathways: ['Recognising what you need', 'Questioning the stories you believe', 'Discovering what you may have overlooked']
      },
      {
        title: 'Becoming Someone New',
        pathways: ['Outgrowing an older version of yourself', 'Changing without losing yourself', 'Living beyond other people\'s expectations']
      },
      {
        title: 'Accountability',
        pathways: ['Admitting when you may be wrong', 'Taking ownership without attacking yourself', 'Repairing the harm you have caused']
      },
      {
        title: 'Making Change Last',
        pathways: ['Wanting change versus being ready', 'Returning to familiar behaviour', 'Building consistency after motivation fades']
      }
    ]
  },
  {
    id: 'boundaries',
    icon: Shield,
    title: 'BOUNDARIES',
    desc: 'Where you end, others begin, and limits become honest action.',
    subItems: [
      {
        title: 'Knowing Your Limits',
        pathways: ['Recognising what no longer feels acceptable', 'Separating discomfort from genuine harm', 'Deciding what you are willing to participate in']
      },
      {
        title: 'Communicating Boundaries',
        pathways: ['Saying no clearly', 'Asking for what you need', 'Setting consequences you can uphold']
      },
      {
        title: 'Handling Pushback',
        pathways: ['When someone becomes angry', 'When guilt makes you reconsider', 'When your boundary is repeatedly ignored']
      },
      {
        title: 'Difficult People',
        pathways: ['Controlling or manipulative behaviour', 'Constant criticism or intrusion', 'Relationships that leave you emotionally depleted']
      }
    ]
  },
  {
    id: 'patterns',
    icon: ArrowsClockwise,
    title: 'PATTERNS',
    desc: 'What keeps recurring, what sustains it, and where it began.',
    subItems: [
      {
        title: 'Emotional Patterns',
        pathways: ['Becoming defensive when challenged', 'Shutting down or avoiding', 'Spiralling into overthinking']
      },
      {
        title: 'Behavioural Patterns',
        pathways: ['Procrastinating on what matters', 'Sabotaging your own progress', 'Starting intensely and losing consistency']
      },
      {
        title: 'Roles You Keep Playing',
        pathways: ['Rescuing everyone', 'Pleasing people to avoid rejection', 'Taking responsibility for other people\'s emotions']
      },
      {
        title: 'Where Patterns Come From',
        pathways: ['What you learned in your family', 'What past experiences taught you to expect', 'Coping strategies that have outlived their purpose']
      }
    ]
  },
  {
    id: 'decisions',
    icon: Signpost,
    title: 'DECISIONS',
    desc: 'What you choose when every option carries something.',
    subItems: [
      {
        title: 'Staying or Leaving',
        pathways: ['A relationship', 'A job or career', 'A familiar version of your life']
      },
      {
        title: 'Competing Priorities',
        pathways: ['What you want versus what others expect', 'Security versus possibility', 'Present comfort versus future consequences']
      },
      {
        title: 'Fear and Uncertainty',
        pathways: ['Fear of making the wrong choice', 'Waiting for certainty that may never come', 'Mistaking anxiety for evidence']
      },
      {
        title: 'Living With a Decision',
        pathways: ['Accepting the trade-offs', 'Handling doubt or regret', 'Committing without knowing the outcome']
      }
    ]
  },
  {
    id: 'clarity',
    icon: Sun,
    title: 'CLARITY',
    desc: 'How a person understands the present situation before acting.',
    subItems: [
      {
        title: 'What Is True?',
        pathways: ['Separating facts from interpretations', 'Testing assumptions against evidence', 'Recognising what remains unknown']
      },
      {
        title: 'What Am I Feeling?',
        pathways: ['Naming the emotion accurately', 'Understanding what it may be communicating', 'Feeling something without automatically obeying it']
      },
      {
        title: 'What Matters to Me?',
        pathways: ['Identifying your values', 'Distinguishing needs from preferences', 'Acknowledging the trade-offs you can accept']
      },
      {
        title: 'What Am I Not Seeing?',
        pathways: ['Recognising your blind spots', 'Considering another perspective', 'Examining what you may be avoiding']
      }
    ]
  }
];

export default function QuestionsSection() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSubTopic, setActiveSubTopic] = useState(null);
  const containerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = (topicId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (activeTopic !== topicId) {
      setActiveSubTopic(null); // Reset subtopic when changing main topic
    }
    setActiveTopic(topicId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveTopic(null);
      setActiveSubTopic(null);
    }, 150); // 150ms bridge gap
  };

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.section-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.topic-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.1,
        ease: 'power3.out',
      },
      "-=0.5"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-20 pb-12 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="section-header w-full px-4 md:px-8 mb-8 flex flex-col items-start z-10 opacity-0">
        <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-3">
          START WITH WHAT YOU'RE FACING
        </span>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-light tracking-tight mb-3 max-w-3xl leading-[1.1]">
          Some things are easier to find when you begin with what they feel like.
        </h2>
        <p className="font-sans text-white/60 text-xs md:text-sm font-light">
          Choose what feels closest. You can refine it once you're inside.
        </p>
      </div>

      {/* Grid */}
      <div className="relative w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 z-50">
        {topics.map((topic, i) => {
          const isActive = activeTopic === topic.id;
          
          let popup1Class = '';
          let popup2Class = '';
          if (i % 3 === 0) { // Left column
            popup1Class = 'left-[103%]';
            popup2Class = 'left-[103%]';
          } else if (i % 3 === 1) { // Middle column
            popup1Class = 'right-[103%]';
            popup2Class = 'left-[103%]';
          } else { // Right column
            popup1Class = 'right-[103%]';
            popup2Class = 'right-[103%]';
          }

          return (
            <div 
              key={topic.id}
              className={`topic-card relative border rounded-lg px-6 py-10 flex flex-col items-center text-center gap-5 cursor-pointer transition-all duration-300 min-h-[220px] justify-center
                ${isActive 
                  ? 'border-[#c79c6e]/60 bg-black shadow-[0_0_30px_rgba(199,156,110,0.1)] z-50 scale-[1.02]' 
                  : 'border-white/10 bg-[#050505]/40 hover:border-white/30 hover:bg-[#050505]/60 z-10'
                }
              `}
              onMouseEnter={() => handleMouseEnter(topic.id)}
              onMouseLeave={handleMouseLeave}
            >
              <topic.icon 
                size={36} 
                weight="light" 
                className={`transition-colors duration-300 ${isActive ? 'text-[#c79c6e]' : 'text-[#c79c6e]/70'}`}
              />
              <div className="flex flex-col items-center gap-3">
                 <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
                   {topic.title}
                 </span>
                 <p className="font-sans text-[0.8rem] text-white/70 font-light leading-relaxed max-w-[200px]">
                   {topic.desc}
                 </p>
              </div>
              
              {/* Popup Submenu */}
              {isActive && (
                <div 
                  className={`absolute top-0 w-full min-h-full flex flex-col border border-[#c79c6e]/40 rounded-lg p-5 bg-[#050505]/95 backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${popup1Class}`}
                  onMouseEnter={() => handleMouseEnter(topic.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#c79c6e]/10">
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">{topic.title}</span>
                  </div>
                  <p className="text-left font-sans text-xs text-white/80 font-light mb-4 leading-relaxed">
                    Not every difficult {topic.id.toLowerCase().replace(/s$/, '')} needs the same question.
                  </p>
                  
                  {topic.subItems.map((sub, idx) => (
                    <div 
                      key={idx} 
                      className="border-b border-[#c79c6e]/10 last:border-0"
                      onMouseEnter={() => setActiveSubTopic(idx)}
                    >
                      <button className="w-full text-left font-sans text-[0.65rem] md:text-[0.7rem] text-white/90 hover:text-[#c79c6e] font-light py-3 flex gap-3 items-center transition-colors group">
                        <ArrowRight size={14} className={`transition-colors ${activeSubTopic === idx ? 'text-[#c79c6e]' : 'text-white/30 group-hover:text-[#c79c6e]'}`} weight="light" />
                        {sub.title}
                      </button>
                    </div>
                  ))}

                  {/* Second Popup (Nested Pathways) */}
                  {activeSubTopic !== null && (
                    <div 
                      className={`absolute top-0 w-full min-h-[105%] flex flex-col border border-[#c79c6e]/40 rounded-lg p-5 bg-[#050505]/95 backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${popup2Class}`}
                    >
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#c79c6e]/10">
                        <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">{topic.title}</span>
                      </div>
                      <p className="text-left font-sans text-xs text-[#c79c6e] font-medium mb-4 uppercase tracking-widest">
                        {topic.subItems[activeSubTopic].title}
                      </p>
                      
                      <div className="flex flex-col gap-3">
                        {topic.subItems[activeSubTopic].pathways.map((pathway, pIdx) => (
                          <a 
                            key={pIdx} 
                            href={`/library/${topic.id}/${topic.subItems[activeSubTopic].title.toLowerCase().replace(/ /g, '-')}#${pathway.toLowerCase().replace(/ /g, '-')}`} 
                            className="font-sans text-[0.6rem] md:text-[0.65rem] text-white/80 hover:text-white font-light transition-colors flex flex-col gap-1 border border-[#c79c6e]/20 bg-[#c79c6e]/5 rounded-md p-3 group hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/10"
                          >
                            <span className="leading-relaxed">{pathway}</span>
                          </a>
                        ))}
                      </div>
                      
                      <a href={`/library/${topic.id}`} className="mt-auto pt-4 text-left font-sans text-[0.65rem] md:text-[0.7rem] text-[#c79c6e] hover:text-white transition-colors flex items-center gap-2 group">
                        EXPLORE PERSPECTIVES <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" weight="bold" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scroll to continue */}
      <div className="mt-20 flex flex-col items-center gap-3 z-10 opacity-70">
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          OR BEGIN WITH A FEATURED PERSPECTIVE
        </span>
        <ArrowDown size={14} className="text-[#c79c6e]" weight="light" />
      </div>
    </section>
  );
}
