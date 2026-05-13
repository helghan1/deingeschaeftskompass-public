import React from 'react';
import { useStore } from '../../../shared/store/useStore';
import { BIChart } from './BIChart';
import { History, Info, TrendingUp, Wallet } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { activeProject, getSimulatedMetrics } = useStore();

  if (!activeProject) return null;

  const historyData = activeProject.scenarios.map(s => {
    const metrics = getSimulatedMetrics(0, s.params);
    return {
      name: s.name,
      date: new Date().toLocaleDateString('de-DE'), // Simplify for now
      umsatz: metrics?.revenue || 0,
      gewinn: metrics ? metrics.revenue - (metrics.fixedCosts + metrics.variableCosts) : 0,
      liquidity: metrics?.bankBalance || 0
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black mb-2">Entwicklung & Historie</h2>
          <p className="text-slate-500">Überblick über deine gespeicherten Meilensteine und Trendentwicklungen.</p>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="bg-bg-card border border-white/5 p-20 rounded-[2.5rem] text-center">
          <History className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-black mb-2">Noch keine Historie</h3>
          <p className="text-slate-500">Speichere Simulationen ab, um deine Entwicklung hier verfolgen zu können.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trend Chart */}
            <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#008cba]/20 text-[#008cba] rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Umsatz & Gewinn Trend</h3>
              </div>
              <BIChart 
                type="bar" 
                data={historyData}
                metrics={[
                  { key: 'umsatz', color: '#008cba', label: 'Umsatz' },
                  { key: 'gewinn', color: '#10b981', label: 'Gewinn' }
                ]}
              />
            </div>

            {/* Liquidity Trend */}
            <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Liquiditäts-Verlauf</h3>
              </div>
              <BIChart 
                type="area" 
                data={historyData}
                metrics={[{ key: 'liquidity', color: '#6366f1', label: 'Kontostand' }]}
              />
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem] overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Gespeicherte Snapshots</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Die letzten 10 Einträge</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="py-4 px-2">Snapshot / Szenario</th>
                    <th className="py-4 px-2">Umsatz</th>
                    <th className="py-4 px-2">Gewinn</th>
                    <th className="py-4 px-2">Liquidität</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyData.map((row, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2 font-bold">{row.name}</td>
                      <td className="py-4 px-2 text-slate-300">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(row.umsatz)}
                      </td>
                      <td className={`py-4 px-2 font-black ${row.gewinn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(row.gewinn)}
                      </td>
                      <td className="py-4 px-2 text-[#008cba]">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(row.liquidity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
