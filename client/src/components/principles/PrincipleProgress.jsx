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
      <div className="absolute top-8 bottom-8 left-3 w-[1px] bg-black/15 z-0" />

      <div className="flex flex-col justify-between h-[500px] relative z-10">
        {steps.map((step, idx) => (
          <button 
            key={idx} 
            onClick={() => handleScroll(step.id)}
            className="flex items-center gap-4 group cursor-pointer text-left focus:outline-none"
          >
            {/* Dot */}
            <div className="w-6 h-6 flex items-center justify-center bg-[#f5f1e8] border border-black/10 rounded-full shrink-0 z-10 shadow-xs">
              <div 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step.active ? 'bg-[#c9542f] shadow-[0_0_8px_rgba(201,84,47,0.5)] scale-110' : 'bg-black/20 group-hover:bg-black/50'}`} 
              />
            </div>
            
            {/* Text */}
            <div className={`flex flex-col transition-opacity duration-500 ${step.active ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}>
              <span className={`font-sans text-[0.62rem] tracking-widest font-bold ${step.active ? 'text-[#c9542f]' : 'text-[#888275]'}`}>
                {step.num}
              </span>
              <span className={`font-sans text-[0.68rem] uppercase tracking-[0.2em] font-semibold ${step.active ? 'text-[#111010]' : 'text-[#555047]'}`}>
                {step.text}
              </span>
            </div>
          </button>
        ))}
      </div>
      
    </div>
  );
}
