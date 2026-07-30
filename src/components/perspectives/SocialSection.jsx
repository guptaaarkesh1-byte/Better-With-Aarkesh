import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight,
  ArrowDown,
  X,
  InstagramLogo,
  YoutubeLogo,
  ChatTeardrop,
  PlayCircle,
  Heart,
  Users,
  PaperPlaneRight
} from '@phosphor-icons/react';

const socialItems = [
  {
    id: 'instagram',
    platform: 'INSTAGRAM',
    title: 'Short reflections.\nDaily reminders.\nReal moments.',
    handle: '@betterwithaarkesh',
    link: 'https://www.instagram.com/betterwithaarkesh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D',
    icon: InstagramLogo,
    iconBg: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]',
    hoverPoints: [
      'Daily thoughts',
      'Behind the perspectives',
      'Stories that stay with you',
      'Community conversations'
    ]
  },
  {
    id: 'youtube',
    platform: 'YOUTUBE',
    title: 'Longer conversations.\nDeeper dives.\nHonest discussions.',
    handle: 'BetterWithAarkesh',
    link: 'https://youtube.com/@betterwithaarkesh',
    icon: YoutubeLogo,
    iconBg: 'bg-red-600',
    hoverPoints: [
      'Long-form essays',
      'Podcast episodes',
      'Guest interviews',
      'Live Q&A sessions'
    ]
  }
];

const footerPoints = [
  { icon: ChatTeardrop, title: "MORE THAN CONTENT", desc: "Thoughts that don't\nmake it to articles." },
  { icon: PlayCircle, title: "MORE THAN MOTIVATION", desc: "Conversations that go\nbeyond inspiration." },
  { icon: Heart, title: "MORE THAN INFORMATION", desc: "Human experiences,\nnot just ideas." },
  { icon: Users, title: "MORE THAN FOLLOWERS", desc: "A space for real ones,\nnot numbers." },
  { icon: PaperPlaneRight, title: "WHEREVER YOU ARE", desc: "One message. Many forms.\nAlways the same intent." },
];

export default function SocialSection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.social-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.social-card', 
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1.2, 
        stagger: 0.1,
        ease: 'power3.out',
      },
      "+=0.4"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-20 pb-8 flex flex-col items-center border-t border-white/5">
      
      {/* Header */}
      <div className="social-header text-center mb-12 flex flex-col items-center z-10 px-6 opacity-0">
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#c79c6e] mb-6">
          STAY CONNECTED
        </span>
        <h2 className="font-serif text-2xl md:text-4xl text-white font-light tracking-wide mb-4">
          Ideas don't end here.<br/>
          The conversation continues.
        </h2>
        <p className="font-sans text-white/50 text-xs md:text-sm font-light tracking-wide leading-relaxed">
          Follow along for real conversations,<br/>
          raw reflections, and new perspectives<br/>
          shared beyond the library.
        </p>
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-16 z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {socialItems.map((item, index) => {
            const isFirst = index === 0;
            const isDimmed = hoveredCard !== null && hoveredCard !== item.id;
            return (
            <div 
              key={item.id}
              className={`
                social-card relative flex flex-col p-8 
                border border-white/10 rounded-xl bg-[#0a0a0a]/40 backdrop-blur-md z-10
                transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer min-h-[400px]
                hover:scale-[1.05] hover:shadow-2xl hover:border-[#c79c6e]/50 hover:bg-[#0a0a0a]/70
                ${hoveredCard === item.id ? 'z-[60]' : ''}
                ${isDimmed ? 'opacity-30 scale-95 blur-[2px]' : ''}
              `}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setHoveredCard(item.id)}
            >
              {/* Top Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 ${item.iconBg}`}>
                <item.icon size={36} className="text-white" weight="fill" />
              </div>

              {/* Text Content */}
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e] mb-4">
                {item.platform}
              </span>
              <h4 className="font-serif text-xl text-white/90 font-light whitespace-pre-line leading-relaxed mb-auto">
                {item.title}
              </h4>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[#c79c6e] group-hover:text-white transition-colors duration-500">
                <span className="font-sans text-xs font-medium tracking-wider">{item.handle}</span>
                <ArrowRight size={16} weight="bold" />
              </div>

              {/* Hover Pop-up Menu */}
              <div 
                className={`
                  absolute top-1/2 -translate-y-1/2 w-[280px]
                  bg-[#080808] border border-[#c79c6e]/20 rounded-xl p-8 shadow-2xl z-50
                  flex flex-col text-left transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                  left-1/2
                  md:left-[80%]
                  ${hoveredCard === item.id 
                    ? "opacity-100 scale-100 pointer-events-auto -translate-x-1/2 md:translate-x-0"
                    : "opacity-0 scale-90 pointer-events-none -translate-x-1/2 md:translate-x-4"}
                `}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e]">
                    {item.platform}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredCard(null);
                    }}
                    className="p-1 -mr-1 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-white/50 hover:text-white" />
                  </button>
                </div>

                <p className="font-sans text-white/90 text-xs leading-relaxed mb-6">
                  Real-time reflections for<br/>real-life moments.
                </p>

                <div className="w-full h-[1px] bg-white/10 mb-6" />

                <ul className="flex flex-col gap-4 mb-8">
                  {item.hoverPoints.map((point, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-[#c79c6e] rounded-full" />
                      <span className="font-sans text-white/70 text-xs font-light">{point}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-auto flex items-center justify-between text-[#c79c6e] hover:text-white transition-colors"
                >
                  <span className="font-sans text-xs font-medium tracking-wider">Visit {item.platform === 'INSTAGRAM' ? 'Instagram' : 'YouTube'}</span>
                  <ArrowRight size={14} weight="bold" />
                </a>
              </div>

            </div>
            )})}
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 mb-8 z-10">
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 p-6 border border-white/10 rounded-xl bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
          {footerPoints.map((point, i) => (
            <div key={i} className="flex flex-col items-start gap-4">
              <point.icon size={26} weight="light" className="text-[#c79c6e] shrink-0" />
              <div className="flex flex-col gap-2">
                <h4 className="font-sans text-[0.6rem] uppercase tracking-widest font-medium text-[#c79c6e]">
                  {point.title}
                </h4>
                <p className="font-sans text-white/60 text-[0.65rem] md:text-[0.6rem] font-light leading-relaxed whitespace-pre-line">
                  {point.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to continue */}
      <div className="mt-4 mb-8 flex flex-col items-center gap-3 z-10 opacity-70">
        <div className="w-5 h-8 border border-[#c79c6e]/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-1 bg-[#c79c6e] rounded-full animate-bounce" />
        </div>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]">
          SCROLL TO CONTINUE
        </span>
        <ArrowDown size={14} className="text-[#c79c6e] animate-pulse" weight="bold" />
      </div>

    </section>
  );
}
