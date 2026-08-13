export default function PhilosophyProgress() {
  const steps = [
    { num: '01', text: 'THINK', active: true },
    { num: '02', text: 'FEEL', active: false },
    { num: '03', text: 'DECIDE', active: false },
  ];

  return (
    <div className="relative flex flex-col items-center py-8 z-20">
      
      {/* Vertical line connecting steps */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10 z-0" />

      <div className="flex flex-col justify-between h-[300px] relative z-10">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4 group">
            {/* Dot */}
            <div className="w-6 h-6 flex items-center justify-center bg-[#0a0a0a] rounded-full shrink-0 z-10">
              <div 
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${step.active ? 'bg-accent-gold shadow-[0_0_10px_rgba(185,138,86,0.6)]' : 'bg-white/20'}`} 
              />
            </div>
            
            {/* Text */}
            <div className={`flex flex-col transition-opacity duration-500 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`font-sans text-[0.6rem] tracking-widest ${step.active ? 'text-accent-gold' : 'text-white'}`}>
                {step.num}
              </span>
              <span className={`font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium ${step.active ? 'text-white' : 'text-white'}`}>
                {step.text}
              </span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
