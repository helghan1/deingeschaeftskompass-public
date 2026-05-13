import React from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SimSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  onChange: (val: number) => void;
  prefix?: string;
  description?: string;
}

export const SimSlider: React.FC<SimSliderProps> = ({
  label,
  value,
  min,
  max,
  unit = '%',
  step = 1,
  onChange,
  prefix = '',
  description,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="bg-[#191818] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
      <div className="flex justify-between items-center mb-6">
        <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
          {label}
        </label>
        <span className={cn(
          "text-sm font-black px-4 py-1.5 rounded-xl border",
          value > 0 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : 
          value < 0 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : 
          "text-slate-500 bg-slate-500/10 border-white/5"
        )}>
          {prefix}{value}{unit}
        </span>
      </div>

      <div className="relative h-6 flex items-center group">
        {/* Track */}
        <div className="absolute w-full h-1.5 bg-white/5 rounded-full" />
        
        {/* Active Track */}
        <div 
          className="absolute h-1.5 bg-[#008cba] rounded-full shadow-[0_0_15px_rgba(0,140,186,0.3)]" 
          style={{ 
            left: value >= 0 ? '50%' : `${percentage}%`,
            width: `${Math.abs(percentage - 50)}%`
          }} 
        />

        {/* Center Indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white/10 rounded-full" />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full appearance-none bg-transparent cursor-pointer z-10 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-6 
            [&::-webkit-slider-thumb]:h-6 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:border-[5px] 
            [&::-webkit-slider-thumb]:border-[#008cba]
            [&::-webkit-slider-thumb]:shadow-[0_4px_10px_rgba(0,0,0,0.5)]
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-transform"
        />
      </div>
    </div>
  );
};
