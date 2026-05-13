import { useEffect, useState, useMemo } from 'react';
import { useStore } from './shared/store/useStore';
import { DashboardLayout } from './layers/ui/layout/DashboardLayout';
import { MetricCard } from './layers/ui/components/MetricCard';
import { BIChart } from './layers/ui/components/BIChart';
import { SimSlider } from './layers/ui/components/SimSlider';
import { SubProjectList } from './layers/ui/components/SubProjectList';
import { DataEntryWizard } from './layers/ui/components/DataEntryWizard';
import { ScenarioComparison } from './layers/ui/components/ScenarioComparison';
import { HistoryView } from './layers/ui/components/HistoryView';
import { 
  Lightbulb, AlertTriangle, TrendingUp, Plus, History, Save, Columns, Zap, 
  Activity, CheckCircle2, AlertCircle, BarChart3, ShieldCheck, LayoutDashboard, Settings
} from 'lucide-react';
import { SimulationEngine } from './layers/domain/simulation/engine';

import { initIndustryEngines } from './layers/domain/industries/registry-init';

// Simple alternative to clsx if not available
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'liquidity' | 'efficiency' | 'pricing' | 'simulation' | 'history' | 'settings'>('dashboard');
  const [simulationView, setSimulationView] = useState<'live' | 'comparison'>('live');
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');

  const { 
    activeProject, 
    loadProjects, 
    createProject, 
    setActiveProject,
    getSimulatedMetrics,
    getInsights,
    getYearlyProjection,
    getYearlyDevelopment,
    getLiquidityProjection,
    resetSimulation,
    updateSimulationParams,
    activeSimulationParams,
    saveSimulationAsScenario
  } = useStore();

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        initIndustryEngines(); // WICHTIG: Branchen-Logik starten
        await loadProjects();
        const projects = useStore.getState().projects;
        if (projects.length === 0) {
          await createProject('Mein Unternehmen', 'SERVICE_OFFLINE');
        } else {
          setActiveProject(projects[0]);
        }
      } catch (err) {
        console.error("Fehler beim Starten der App:", err);
      }
    };
    init();
  }, []);

  // Update active project if projects change and none is active
  useEffect(() => {
    const projects = useStore.getState().projects;
    if (projects.length > 0 && !activeProject) {
      setActiveProject(projects[0]);
    }
  }, [useStore.getState().projects]);

  const metrics = viewType === 'monthly' ? getSimulatedMetrics(0) : getYearlyProjection();
  const baseMetrics = activeProject?.baseMetrics['Current'];

  const profit = useMemo(() => {
    if (!metrics) return 0;
    return metrics.revenue - (metrics.fixedCosts + metrics.variableCosts);
  }, [metrics]);

  const baseProfit = useMemo(() => {
    if (!baseMetrics) return 0;
    return baseMetrics.revenue - (baseMetrics.fixedCosts + baseMetrics.variableCosts);
  }, [baseMetrics]);

  const profitTrend = useMemo(() => {
    if (!metrics || !baseMetrics) return 0;
    const currentBase = viewType === 'monthly' ? baseProfit : baseProfit * 12;
    return currentBase === 0 ? 0 : Math.round(((profit - currentBase) / Math.max(1, Math.abs(currentBase))) * 100);
  }, [profit, baseProfit, viewType, metrics, baseMetrics]);

  const chartData = useMemo(() => {
    if (!baseMetrics || !metrics) return [];
    if (viewType === 'yearly') return getYearlyDevelopment();
    return [
      { name: 'Basis', umsatz: baseMetrics.revenue, gewinn: baseProfit },
      { name: 'Simuliert', umsatz: metrics.revenue, gewinn: profit }
    ];
  }, [baseMetrics, metrics, viewType, profit, baseProfit, getYearlyDevelopment]);

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center animate-pulse mb-4">
          <TrendingUp className="text-primary w-8 h-8" />
        </div>
        <h2 className="text-xl font-black mb-2 text-white">Initialisiere Strategie-Navigator...</h2>
        <p className="text-slate-500 text-sm max-w-xs">Lade Projektdaten. Bitte stelle sicher, dass `npm install` ausgeführt wurde.</p>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!metrics || !baseMetrics) return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500 gap-4">
        <TrendingUp className="w-12 h-12 opacity-20" />
        <p>Bitte gib zuerst deine Basis-Daten im Projekt-Setup ein.</p>
      </div>
    );

    const kpis = SimulationEngine.calculateKPIs(metrics);
    
    const realityChecks = [
      metrics.billableHours > 200 && "Über 200 abrechenbare Stunden? Das entspricht einer 50h-Woche ohne Admin. Sicher?",
      metrics.taxRate < 15 && kpis.monthlyProfit > 2000 && "Deine Steuerquote erscheint sehr niedrig (typisch 25-45%).",
      metrics.fixedCosts === 0 && "0€ Fixkosten? Denke an Versicherungen, Software und Gebühren.",
      kpis.effectiveNetEarnings > 300 && `Ein Netto-Verdienst von ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.effectiveNetEarnings)} ist extrem selten.`,
    ].filter(Boolean) as string[];

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <MetricCard 
            label="Runway (Monate)" 
            value={`${kpis.runwayMonths.toFixed(1)} m`}
            status={kpis.runwayMonths >= 6 ? 'good' : kpis.runwayMonths >= 3 ? 'warning' : 'critical'}
            description="Liquiditäts-Reichweite"
            tooltip="Gibt an, wie viele Monate dein Unternehmen bei gleichbleibenden Kosten ohne weiteren Umsatz überleben kann."
          />
          <MetricCard 
            label="Eff. Stundensatz" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.effectiveNetEarnings)}
            status={kpis.effectiveNetEarnings > 50 ? 'good' : 'warning'}
            description="Netto-Verdienst / Std"
            tooltip="Dein tatsächlicher Netto-Verdienst pro geleisteter Arbeitsstunde nach Abzug aller Kosten und Steuern."
          />
          <MetricCard 
            label="Monatsgewinn" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.monthlyProfit)}
            status={kpis.monthlyProfit > 0 ? 'good' : 'critical'}
            description="Vor Steuern"
            tooltip="Dein operativer Gewinn vor Abzug der Steuern."
          />
          <MetricCard 
            label="Mindestrücklage" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.monthlyMinReserve)}
            status="info"
            description="Steuern & Puffer"
            tooltip="Die Summe aus geschätzten Steuern und deinem gewählten Risiko-Puffer, die du monatlich beiseite legen solltest."
          />
          <MetricCard 
            label="Break-Even" 
            value={`${kpis.breakEvenProgress.toFixed(0)}%`}
            status={kpis.breakEvenProgress >= 100 ? 'good' : 'warning'}
            description="Kostendeckung"
            tooltip="Der Prozentsatz deiner Kosten, der durch den aktuellen Umsatz gedeckt ist. Ziel: > 100%."
          />
          <MetricCard 
            label="Strategische Lücke" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.invisibleLoss)}
            status={kpis.invisibleLoss > 0 ? 'warning' : 'good'}
            description="Potential zum Ziel"
            tooltip="Der monatliche Umsatzbetrag, der dir noch fehlt, um dein definiertes Wunsch-Netto-Einkommen zu erreichen."
          />
        </div>

        {/* Reality Checks */}
        {realityChecks.length > 0 && (
          <div className="p-8 rounded-[2.5rem] bg-amber-500/10 border-2 border-amber-500/20 space-y-4">
            <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-widest text-sm">
              <AlertTriangle className="w-5 h-5" />
              Reality Check: Sind deine Eingaben realistisch?
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {realityChecks.map((check, idx) => (
                <li key={idx} className="text-amber-200/70 text-sm flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span> {check}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Business Health Score Banner */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-[#1c1c1c] to-[#141414] border border-white/5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
              <div className={cn(
                "p-3 rounded-2xl border",
                kpis.healthScore > 70 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : 
                kpis.healthScore > 40 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : 
                "text-rose-500 bg-rose-500/10 border-rose-500/20"
              )}>
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Business Health Score</h3>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Dein aggregierter Statusbericht basierend auf Liquidität, Rendite, Effizienz und strategischen Potenzialen.
            </p>
          </div>
          
          <div className="flex items-center gap-12 px-10 py-8 bg-black/40 rounded-[2.5rem] border border-white/5">
            <div className="text-center">
              <div className={cn(
                "text-7xl font-black mb-2 tracking-tighter",
                kpis.healthScore > 70 ? "text-emerald-500" : 
                kpis.healthScore > 40 ? "text-amber-500" : 
                "text-rose-500"
              )}>
                {kpis.healthScore}%
              </div>
              <div className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Gesamtstatus</div>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center relative overflow-hidden bg-slate-900/50">
              <div 
                className={cn(
                  "absolute bottom-0 w-full transition-all duration-1000 opacity-20",
                  kpis.healthScore > 70 ? "bg-emerald-500" : 
                  kpis.healthScore > 40 ? "bg-amber-500" : 
                  "bg-rose-500"
                )}
                style={{ height: `${kpis.healthScore}%` }}
              />
              {kpis.healthScore > 70 ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> : <AlertCircle className="w-12 h-12 text-amber-500" />}
            </div>
          </div>
        </div>

        {/* Benchmarking Section */}
        <div className="p-10 rounded-[3rem] bg-[#191818] border border-white/5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <h3 className="text-2xl font-black flex items-center gap-4">
              <BarChart3 className="text-[#008cba] w-8 h-8" />
              Business Benchmarking ({SimulationEngine.getIndustryBenchmarks(activeProject.industry, metrics.employees).marketContext})
            </h3>
            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Branchen-Schnitt: {activeProject.industry.replace('_', ' ')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Liquidität Score */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Liquidität</span>
                <span className="text-white font-black text-3xl tracking-tighter">{kpis.liquidityScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    kpis.liquidityScore > 80 ? "bg-emerald-500" : kpis.liquidityScore > 40 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${kpis.liquidityScore}%` }}
                />
              </div>
              <p className={cn("text-sm font-black italic", SimulationEngine.getMarketInsight('liquidity', kpis.runwayMonths, activeProject.industry, metrics.employees).color)}>
                {SimulationEngine.getMarketInsight('liquidity', kpis.runwayMonths, activeProject.industry, metrics.employees).text}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ziel: {SimulationEngine.getIndustryBenchmarks(activeProject.industry, metrics.employees).targetRunway} Monate Puffer</p>
            </div>

            {/* Profit Score */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Rentabilität</span>
                <span className="text-white font-black text-3xl tracking-tighter">{kpis.profitabilityScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    kpis.profitabilityScore > 80 ? "bg-emerald-500" : kpis.profitabilityScore > 40 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${kpis.profitabilityScore}%` }}
                />
              </div>
              <p className={cn("text-sm font-black italic", SimulationEngine.getMarketInsight('profitability', kpis.profitMargin, activeProject.industry, metrics.employees).color)}>
                {SimulationEngine.getMarketInsight('profitability', kpis.profitMargin, activeProject.industry, metrics.employees).text}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ziel: {SimulationEngine.getIndustryBenchmarks(activeProject.industry, metrics.employees).targetMargin}% Umsatzrendite</p>
            </div>

            {/* Efficiency Score */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Effizienz</span>
                <span className="text-white font-black text-3xl tracking-tighter">{kpis.efficiencyScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    kpis.efficiencyScore > 80 ? "bg-emerald-500" : kpis.efficiencyScore > 40 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${kpis.efficiencyScore}%` }}
                />
              </div>
              <p className={cn("text-sm font-black italic", SimulationEngine.getMarketInsight('efficiency', kpis.efficiencyScore, activeProject.industry, metrics.employees).color)}>
                {SimulationEngine.getMarketInsight('efficiency', kpis.efficiencyScore, activeProject.industry, metrics.employees).text}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ziel: {SimulationEngine.getIndustryBenchmarks(activeProject.industry, metrics.employees).targetEfficiency}% Effizienz</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-bg-card border border-white/5 p-10 rounded-[3rem] shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
              <TrendingUp className="text-[#008cba] w-7 h-7" />
              Performance Analyse
            </h3>
            <BIChart 
              type="bar" 
              data={chartData} 
              metrics={[
                { key: 'umsatz', color: '#008cba', label: 'Umsatz' },
                { key: 'gewinn', color: '#10b981', label: 'Gewinn' }
              ]} 
            />
          </div>

          <div className="bg-bg-card border border-white/5 p-10 rounded-[3rem] shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
              <Activity className="text-indigo-500 w-7 h-7" />
              Liquiditätsprognose
            </h3>
            <BIChart 
              type="area" 
              data={getLiquidityProjection()} 
              metrics={[{ key: 'liquidity', color: '#6366f1', label: 'Cash-Bestand' }]} 
            />
          </div>
        </div>
      </div>
    );
  };


  const renderSimulation = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Simulation Sub-Navigation */}
      <div className="flex justify-center">
        <div className="bg-bg-card p-1.5 rounded-[1.5rem] border border-white/5 flex gap-2">
          <button 
            onClick={() => setSimulationView('live')}
            className={cn(
              "px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3",
              simulationView === 'live' ? "bg-[#008cba] text-white shadow-lg shadow-[#008cba]/20" : "text-slate-500 hover:text-white"
            )}
          >
            <Zap className="w-4 h-4" />
            LIVE SIMULATION
          </button>
          <button 
            onClick={() => setSimulationView('comparison')}
            className={cn(
              "px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3",
              simulationView === 'comparison' ? "bg-[#008cba] text-white shadow-lg shadow-[#008cba]/20" : "text-slate-500 hover:text-white"
            )}
          >
            <Columns className="w-4 h-4" />
            BENCHMARK VERGLEICH
          </button>
        </div>
      </div>

      {simulationView === 'live' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/20 text-primary rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Globale Hebel</h3>
              </div>
              
              <div className="space-y-8">
                {/* Section A: Wachstum */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#008cba] mb-4">A. Wachstum & Umsatz</h4>
                  <SimSlider 
                    label="Preisanpassung (%)" 
                    value={activeSimulationParams.priceChangePercent || 0} 
                    min={-20} max={50} 
                    onChange={(v) => updateSimulationParams({ priceChangePercent: v })}
                  />
                  <SimSlider 
                    label="Absatzmenge (%)" 
                    value={activeSimulationParams.volumeChangePercent || 0} 
                    min={-50} max={100} 
                    onChange={(v) => updateSimulationParams({ volumeChangePercent: v })}
                  />
                  <SimSlider 
                    label="Marketing-Budget (€)" 
                    value={activeSimulationParams.marketingSpend || 0} 
                    min={0} max={5000} unit=" €" step={100}
                    onChange={(v) => updateSimulationParams({ marketingSpend: v })}
                  />
                </div>

                {/* Section B: Kosten & Effizienz */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#008cba] mb-4">B. Kosten & Effizienz</h4>
                  <SimSlider 
                    label="Personal-Bestand (%)" 
                    value={activeSimulationParams.personnelChangePercent || 0} 
                    min={-50} max={100} 
                    onChange={(v) => updateSimulationParams({ personnelChangePercent: v })}
                  />
                  <SimSlider 
                    label="Raumkosten (%)" 
                    value={activeSimulationParams.rentChangePercent || 0} 
                    min={-50} max={50} 
                    onChange={(v) => updateSimulationParams({ rentChangePercent: v })}
                  />
                  <SimSlider 
                    label="Abrechb. Stunden (+/-)" 
                    value={activeSimulationParams.billableHoursChange || 0} 
                    min={-40} max={40} unit=" Std"
                    onChange={(v) => updateSimulationParams({ billableHoursChange: v })}
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                <button 
                  onClick={() => {
                    const name = prompt('Name für dieses Szenario:');
                    if (name) saveSimulationAsScenario(name);
                  }}
                  className="w-full py-4 bg-[#008cba] text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#60e5ff] transition-all shadow-lg shadow-[#008cba]/20"
                >
                  <Save className="w-4 h-4" />
                  Szenario Speichern
                </button>
                <button 
                  onClick={() => resetSimulation()}
                  className="w-full py-4 text-slate-500 hover:text-white font-bold text-sm"
                >
                  Simulation Zurücksetzen
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Live Impact Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Sim. Umsatz</h4>
                <div className="text-3xl font-black mb-2">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(metrics.revenue)}</div>
                <div className={cn("text-sm font-bold", metrics.revenue >= baseMetrics.revenue ? "text-emerald-500" : "text-rose-500")}>
                  {metrics.revenue >= baseMetrics.revenue ? '+' : ''}{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(metrics.revenue - baseMetrics.revenue)}
                </div>
              </div>
              <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Sim. Gewinn</h4>
                <div className="text-3xl font-black mb-2">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(profit)}</div>
                <div className={cn("text-sm font-bold", profit >= baseProfit ? "text-emerald-500" : "text-rose-500")}>
                  {profit >= baseProfit ? '+' : ''}{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(profit - baseProfit)}
                </div>
              </div>
              <div className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Sim. Runway</h4>
                <div className="text-3xl font-black mb-2">{SimulationEngine.calculateKPIs(metrics).runwayMonths.toFixed(1)} m</div>
                <div className={cn("text-sm font-bold", SimulationEngine.calculateKPIs(metrics).runwayMonths >= SimulationEngine.calculateKPIs(baseMetrics).runwayMonths ? "text-emerald-500" : "text-rose-500")}>
                   {SimulationEngine.calculateKPIs(metrics).runwayMonths.toFixed(1)} Monate Reichweite
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-white/5 p-10 rounded-[3rem] shadow-xl">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-[#008cba]" />
                Live-Vergleich: Basis vs. Simulation
              </h3>
              <BIChart 
                type="bar" 
                data={[
                  { name: 'Basis', umsatz: baseMetrics.revenue, gewinn: baseProfit },
                  { name: 'Simulation', umsatz: metrics.revenue, gewinn: profit }
                ]} 
                metrics={[
                  { key: 'umsatz', color: '#008cba', label: 'Umsatz' },
                  { key: 'gewinn', color: '#10b981', label: 'Gewinn' }
                ]} 
              />
            </div>

            <SubProjectList />
          </div>
        </div>
      ) : (
        <ScenarioComparison />
      )}
    </div>
  );
  const renderLiquidity = () => {
    if (!metrics) return null;
    const kpis = SimulationEngine.calculateKPIs(metrics);
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#191818] border border-white/5 p-10 rounded-[3rem] shadow-xl">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
              <Activity className="text-indigo-500 w-7 h-7" />
              12-Monats Liquiditätsprognose
            </h3>
            <BIChart 
              type="area" 
              data={getLiquidityProjection()} 
              metrics={[{ key: 'liquidity', color: '#6366f1', label: 'Cash-Bestand' }]} 
            />
          </div>
          <div className="space-y-6">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-[2.5rem]">
              <h4 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-4">Cash-Status</h4>
              <div className="text-4xl font-black mb-2">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(metrics.bankBalance)}</div>
              <p className="text-slate-400 text-sm">Aktueller Kontostand</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem]">
              <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-4">Runway</h4>
              <div className="text-4xl font-black mb-2">{kpis.runwayMonths.toFixed(1)} Monate</div>
              <p className="text-slate-400 text-sm">Überlebensfähigkeit bei 0€ Umsatz</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEfficiency = () => {
    if (!metrics) return null;
    const kpis = SimulationEngine.calculateKPIs(metrics);
    const utilization = metrics.hoursWorked > 0 ? (metrics.billableHours / (metrics.hoursWorked * 4.33)) * 100 : 0;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Auslastung" 
            value={`${utilization.toFixed(0)}%`}
            status={utilization > 70 ? 'good' : 'warning'}
            description="Abrechenbar vs. Total"
          />
          <MetricCard 
            label="Netto / Std" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.effectiveNetEarnings)}
            status="good"
          />
          <MetricCard 
            label="Ziel-Stundensatz" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.targetHourlyRate)}
            status="info"
          />
          <MetricCard 
            label="Ist-Stundensatz" 
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.actualBillableRate)}
            status={kpis.actualBillableRate >= kpis.targetHourlyRate ? 'good' : 'warning'}
          />
        </div>

        <div className="bg-[#191818] border border-white/5 p-10 rounded-[3rem]">
          <h3 className="text-2xl font-black mb-8">Effizienz-Hebel</h3>
          <p className="text-slate-400 mb-8 max-w-2xl">Optimiere deine Zeitverwendung, um bei gleichem Aufwand mehr Netto-Einkommen zu erzielen.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <SimSlider 
                label="Admin-Aufwand reduzieren"
                value={activeSimulationParams.billableHoursChange || 0}
                onChange={(val) => updateSimulationParams({ billableHoursChange: val })}
                min={0} max={40} step={1}
                unit="Std"
                description="Zusätzliche abrechenbare Stunden durch weniger Admin"
              />
            </div>
            <div className="bg-[#008cba]/5 border border-[#008cba]/20 p-8 rounded-[2rem]">
              <h4 className="text-[#008cba] font-black uppercase tracking-widest text-xs mb-4">Impact Analyse</h4>
              <div className="text-3xl font-black text-white mb-2">
                + {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format((activeSimulationParams.billableHoursChange || 0) * kpis.actualBillableRate)}
              </div>
              <p className="text-slate-400 text-sm">Zusätzlicher Monatsumsatz durch Zeit-Hebeleffekt.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPricing = () => {
    if (!metrics) return null;
    const kpis = SimulationEngine.calculateKPIs(metrics);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#191818] border border-white/5 p-10 rounded-[3rem]">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
            <Plus className="text-emerald-500 w-8 h-8" />
            Preis- & Rendite-Optimierung
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <SimSlider 
                label="Preisanpassung"
                value={activeSimulationParams.priceChangePercent || 0}
                onChange={(val) => updateSimulationParams({ priceChangePercent: val })}
                min={-10} max={50} step={1}
                unit="%"
                description="Wie wirken sich höhere Preise auf deinen Gewinn aus?"
              />
              <SimSlider 
                label="Volumen-Änderung"
                value={activeSimulationParams.volumeChangePercent || 0}
                onChange={(val) => updateSimulationParams({ volumeChangePercent: val })}
                min={-50} max={100} step={1}
                unit="%"
                description="Reaktion des Marktes auf Preisänderungen"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem]">
                <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-4">Sim. Gewinn</h4>
                <div className="text-3xl font-black">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(getSimulatedMetrics(0)?.revenue || 0)}</div>
              </div>
              <div className="bg-[#008cba]/10 border border-[#008cba]/20 p-8 rounded-[2.5rem]">
                <h4 className="text-[#008cba] font-black uppercase tracking-widest text-xs mb-4">Umsatzrendite</h4>
                <div className="text-3xl font-black">{kpis.profitMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white">{activeTab === 'settings' ? 'Projekt-Setup' : activeProject.name}</h1>
            <p className="text-slate-500 text-sm">Status: {activeProject.industry.replace('_', ' ')}</p>
          </div>
          {activeTab !== 'settings' && (
            <div className="bg-bg-card p-1 rounded-2xl border border-white/5 flex">
              <button 
                onClick={() => setViewType('monthly')}
                className={cn("px-6 py-2 rounded-xl text-xs font-black transition-all", viewType === 'monthly' ? "bg-primary text-white" : "text-slate-500")}
              >
                MONATLICH
              </button>
              <button 
                onClick={() => setViewType('yearly')}
                className={cn("px-6 py-2 rounded-xl text-xs font-black transition-all", viewType === 'yearly' ? "bg-primary text-white" : "text-slate-500")}
              >
                JÄHRLICH
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'liquidity' && renderLiquidity()}
        {activeTab === 'efficiency' && renderEfficiency()}
        {activeTab === 'pricing' && renderPricing()}
        {activeTab === 'simulation' && renderSimulation()}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && <DataEntryWizard />}
      </div>
    </DashboardLayout>
  );
}

export default App;
