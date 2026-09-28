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
    <div className="relative flex flex-col items-start py-8 z-20">
      
      {/* Vertical line connecting steps */}
      <div className="absolute top-8 bottom-8 left-3 w-[1.5px] bg-black/20 z-0" />

      <div className="flex flex-col justify-between h-[500px] relative z-10">
        {steps.map((step, idx) => (
          <button 
            key={idx} 
            onClick={() => handleScroll(step.id)}
            className="flex items-center gap-4 group cursor-pointer text-left focus:outline-none"
          >
            {/* Dot */}
            <div className={`w-6 h-6 flex items-center justify-center rounded-full shrink-0 z-10 transition-all duration-300 ${
              step.active 
                ? 'bg-white border-2 border-[#802673] shadow-[0_0_14px_rgba(128,38,115,0.8),0_0_28px_rgba(128,38,115,0.45)] scale-110' 
                : 'bg-white/95 border border-black/30 shadow-xs group-hover:border-[#802673]/60'
            }`}>
              <div 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step.active 
                    ? 'bg-[#802673] shadow-[0_0_10px_#802673,0_0_18px_#a83397]' 
                    : 'bg-black/50 group-hover:bg-[#802673]'
                }`} 
              />
            </div>
            
            {/* Text */}
            <div className={`flex flex-col transition-all duration-300 ${step.active ? 'opacity-100 scale-[1.03] origin-left' : 'opacity-85 group-hover:opacity-100'}`}>
              <span className={`font-sans text-[0.65rem] tracking-widest font-extrabold ${
                step.active 
                  ? 'text-[#802673] [text-shadow:0_0_10px_rgba(128,38,115,0.9),0_0_22px_rgba(168,51,151,0.65)]' 
                  : 'text-[#2b2723]'
              }`}>
                {step.num}
              </span>
              <span className={`font-sans text-[0.72rem] uppercase tracking-[0.22em] font-extrabold ${
                step.active 
                  ? 'text-[#802673] [text-shadow:0_0_10px_rgba(128,38,115,0.9),0_0_22px_rgba(168,51,151,0.65)]' 
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
