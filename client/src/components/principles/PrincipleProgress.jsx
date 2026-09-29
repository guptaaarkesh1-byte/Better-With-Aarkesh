export default function PrincipleProgress({ activeStep }) {
  const steps = [
    { num: '01', text: 'THINK', active: activeStep === 1, id: 'think-principle' },
    { num: '02', text: 'FEEL', active: activeStep === 2, id: 'feel-principle' },
    { num: '03', text: 'DECIDE', active: activeStep === 3, id: 'decide-principle' },
    { num: '04', text: 'COACHING', active: activeStep === 4, id: 'coaching' },
    { num: '05', text: 'STORIES', active: activeStep === 5, id: 'testimonials' },
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex flex-col items-start py-8 z-20 select-none">
      
      {/* Vertical line connecting steps */}
      <div className="absolute top-10 bottom-10 left-[14px] w-[1.5px] bg-black/15 z-0 pointer-events-none" />

      <div className="flex flex-col justify-between h-[520px] relative z-10">
        {steps.map((step, idx) => (
          <button 
            key={idx} 
            onClick={() => handleScroll(step.id)}
            className={`flex items-center gap-3.5 group cursor-pointer text-left focus:outline-none px-3 py-2 -ml-2.5 rounded-2xl transition-all duration-300 ease-out will-change-transform ${
              step.active 
                ? 'bg-white/95 border border-[#ff5722]/50 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_0_24px_rgba(255,87,34,0.3)] translate-x-1' 
                : 'bg-transparent border border-transparent hover:bg-white/50'
            }`}
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Dot Container with Neon Glow */}
            <div className="relative flex items-center justify-center shrink-0 z-10">
              <div 
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ease-out ${
                  step.active 
                    ? 'bg-white border-2 border-[#ff5722] shadow-[0_0_14px_#ff5722,0_0_28px_#ff7a45,0_0_40px_rgba(255,87,34,0.55)] scale-110' 
                    : 'bg-white/90 border border-black/25 shadow-xs group-hover:border-[#ff5722]/50'
                }`}
              >
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ease-out ${
                    step.active 
                      ? 'bg-[#ff4500] shadow-[0_0_6px_#ffffff,0_0_14px_#ff4500]' 
                      : 'bg-black/50 group-hover:bg-[#ff5722]'
                  }`} 
                />
              </div>
            </div>
            
            {/* Text with Neon Highlighting */}
            <div className={`flex flex-col transition-all duration-300 ease-out ${step.active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
              <span className={`font-sans text-[0.66rem] tracking-widest font-extrabold transition-colors duration-300 ${
                step.active 
                  ? 'text-[#e03d0e] [text-shadow:0_0_10px_rgba(255,87,34,0.85)]' 
                  : 'text-[#3d3833]'
              }`}>
                {step.num}
              </span>
              <span className={`font-sans text-[0.74rem] uppercase tracking-[0.22em] font-extrabold transition-colors duration-300 ${
                step.active 
                  ? 'text-[#d43405] [text-shadow:0_0_10px_rgba(255,87,34,0.85)]' 
                  : 'text-[#111010]'
              }`}>
                {step.text}
              </span>
            </div>
          </button>
        ))}
      </div>
      
    </div>
  );
}
