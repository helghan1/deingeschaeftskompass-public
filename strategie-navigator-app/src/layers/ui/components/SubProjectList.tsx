import React from 'react';
import { SubProject } from '../../domain/core/types';
import { useStore } from '../../../shared/store/useStore';
import { Plus, Power, Calendar } from 'lucide-react';

// Simple alternative to clsx if not available
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const SubProjectList: React.FC = () => {
  const { activeProject, addSubProject, toggleSubProject } = useStore();

  const handleAdd = () => {
    const newSub: SubProject = {
      id: crypto.randomUUID(),
      name: 'Neues Teilprojekt',
      startMonth: 2, // Start in März
      durationMonths: 6,
      isActive: true,
      params: {
        newProductRevenue: 2000,
        newProductCosts: 500,
      }
    };
    addSubProject(newSub);
  };

  if (!activeProject) return null;

  return (
    <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-orange/20 text-accent-orange rounded-xl">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black">Projekt-Simulationen</h3>
        </div>
        <button 
          onClick={handleAdd}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
        >
          <Plus className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        {activeProject.subProjects.length === 0 && (
          <p className="text-slate-500 text-sm italic text-center py-4">
            Keine aktiven Teilprojekte vorhanden.
          </p>
        )}
        
        {activeProject.subProjects.map((sub) => (
          <div 
            key={sub.id}
            className={cn(
              "p-6 rounded-2xl border transition-all flex justify-between items-center",
              sub.isActive ? "bg-white/5 border-white/10" : "bg-transparent border-white/5 opacity-50"
            )}
          >
            <div>
              <h4 className="font-bold text-sm mb-1">{sub.name}</h4>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Dauer: {sub.durationMonths} Monate
                </span>
                <span>
                  Start: Monat {sub.startMonth + 1}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => toggleSubProject(sub.id)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  sub.isActive ? "bg-green-500/20 text-green-500" : "bg-slate-500/20 text-slate-500"
                )}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
        Hinweis: Teilprojekte wirken additiv auf die monatliche Simulation und spiegeln sich in der Jahresprojektion wider.
      </p>
    </div>
  );
};
