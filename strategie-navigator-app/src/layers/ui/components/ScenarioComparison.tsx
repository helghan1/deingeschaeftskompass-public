import React from 'react';
import { useStore } from '../../../shared/store/useStore';
import { BIChart } from './BIChart';
import { Check, Plus, Trash2, LayoutGrid, List } from 'lucide-react';

export const ScenarioComparison: React.FC = () => {
  const { 
    activeProject, 
    comparedScenarioIds, 
    toggleScenarioComparison, 
    getComparisonData 
  } = useStore();

  if (!activeProject) return null;

  const comparisonData = getComparisonData();
  const scenarios = activeProject.scenarios;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black mb-2">Szenarien-Vergleich</h2>
          <p className="text-slate-500">Wähle bis zu 4 Szenarien aus, um sie direkt mit deinem Basis-Zustand zu vergleichen.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          <button className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-white transition-all">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Scenario Selection List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Verfügbare Szenarien</h3>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleScenarioComparison(s.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                comparedScenarioIds.includes(s.id)
                  ? 'bg-primary/10 border-primary/30 text-white'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">{s.name}</span>
                <span className="text-[10px] uppercase font-black opacity-50 tracking-widest">{s.type}</span>
              </div>
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                comparedScenarioIds.includes(s.id)
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/5 border-white/10 text-transparent group-hover:border-white/30'
              }`}>
                <Check className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Comparison Dashboard */}
        <div className="lg:col-span-3 space-y-8">
          {comparedScenarioIds.length === 0 ? (
            <div className="h-full min-h-[400px] bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="text-xl font-black mb-2">Kein Vergleich aktiv</h4>
              <p className="text-slate-500 max-w-xs mx-auto">Wähle links Szenarien aus, um die Auswirkungen auf deinen Erfolg direkt zu visualisieren.</p>
            </div>
          ) : (
            <>
              {/* Comparison Chart */}
              <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black">Benchmark Simulation</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#008cba]" />
                      <span className="text-[10px] font-black uppercase text-slate-500">Umsatz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                      <span className="text-[10px] font-black uppercase text-slate-500">Gewinn</span>
                    </div>
                  </div>
                </div>
                <BIChart 
                  type="bar" 
                  data={comparisonData}
                  metrics={[
                    { key: 'umsatz', color: '#008cba', label: 'Umsatz' },
                    { key: 'gewinn', color: '#10b981', label: 'Gewinn' }
                  ]}
                />
              </div>

              {/* Metric Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-x-4 border-spacing-y-0">
                  <thead>
                    <tr>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">Metrik</th>
                      {comparisonData.map((d, i) => (
                        <th key={i} className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 text-center">
                          {d.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['umsatz', 'gewinn'].map((metric) => (
                      <tr key={metric} className="group">
                        <td className="py-4 border-b border-white/5 text-sm font-bold text-slate-400 capitalize px-4">
                          {metric === 'umsatz' ? 'Monats-Umsatz' : 'Operativer Gewinn'}
                        </td>
                        {comparisonData.map((d, i) => (
                          <td key={i} className="py-4 border-b border-white/5 text-center px-4">
                            <span className={`text-sm font-black ${i === 0 ? 'text-slate-300' : 'text-white'}`}>
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(d[metric])}
                            </span>
                            {i > 0 && (
                              <div className={`text-[10px] font-black mt-1 ${d[metric] >= comparisonData[0][metric] ? 'text-green-500' : 'text-red-500'}`}>
                                {d[metric] >= comparisonData[0][metric] ? '+' : ''}
                                {Math.round(((d[metric] - comparisonData[0][metric]) / Math.max(1, comparisonData[0][metric])) * 100)}%
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
