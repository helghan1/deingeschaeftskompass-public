import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  status?: 'good' | 'warning' | 'critical' | 'info';
  description?: string;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  trend, 
  status = 'good',
  description,
  tooltip
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'info': return 'text-[#008cba] bg-[#008cba]/10 border-[#008cba]/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[#191818] border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#008cba]/5 blur-[3rem] group-hover:bg-[#008cba]/10 transition-all" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
          {tooltip && (
            <Tooltip content={tooltip}>
              <HelpCircle className="w-3 h-3 text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
            </Tooltip>
          )}
        </div>
        <div className={`p-2 rounded-xl border ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
      </div>

      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
        {description && (
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{description}</p>
        )}
      </div>
    </div>
  );
};
