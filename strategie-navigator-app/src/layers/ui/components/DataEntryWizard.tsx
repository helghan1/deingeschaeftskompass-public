import { Save, Info, TrendingUp, DollarSign, Users, Briefcase, Trash2, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const DataEntryWizard: React.FC = () => {
  const { activeProject, updateBaseMetrics } = useStore();
  const [isExpertMode, setIsExpertMode] = React.useState(false);

  const metrics = activeProject?.baseMetrics['Current'] || {
    revenue: 0,
    fixedCosts: 0,
    variableCosts: 0,
    personnelCosts: 0,
    marketingCosts: 0,
    rentCosts: 0,
    otherCosts: 0,
    depreciation: 0,
    financingCosts: 0,
    bankBalance: 0,
    hoursWorked: 0,
    billableHours: 0,
    taxRate: 30,
    revenueBufferPercent: 10,
    targetNetIncome: 5000,
    employees: 0
  };

  const handleChange = (key: keyof typeof metrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateBaseMetrics('Current', { ...metrics, [key]: numValue });
  };

  if (!activeProject) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black mb-3 tracking-tighter">Strategisches Setup</h2>
          <p className="text-slate-400 text-lg">Definiere deine betriebswirtschaftliche Basis für präzise Simulationen.</p>
        </div>
        <button 
          onClick={() => setIsExpertMode(!isExpertMode)}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black border transition-all tracking-[0.2em] whitespace-nowrap ${
            isExpertMode 
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-lg shadow-purple-500/10' 
              : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
          }`}
        >
          {isExpertMode ? 'EXPERTE: ON' : 'EXPERTE: OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Sektion 1: Einkommen & Steuern */}
        <div className="bg-[#191818] border border-white/5 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 blur-[4rem] group-hover:bg-emerald-500/10 transition-all" />
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">Einkommen & Ziele</h3>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wunsch-Netto / Monat</label>
                <Tooltip content="Dein angestrebtes monatliches Netto-Einkommen (Privatentnahme) nach allen betrieblichen Abzügen und Steuern.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={metrics.targetNetIncome}
                  onChange={(e) => handleChange('targetNetIncome', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 focus:border-emerald-500 outline-none transition-all font-black text-2xl text-emerald-500"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500/30 font-black text-xl">€</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Steuersatz</label>
                  <Tooltip content="Dein geschätzter Einkommensteuersatz. Standardmäßig 30%. Beeinflusst die Berechnung deines verfügbaren Nettos.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="relative">
                  <input 
                    type="number"
                    value={metrics.taxRate}
                    onChange={(e) => handleChange('taxRate', e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none transition-all font-bold text-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 font-bold">%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risiko-Puffer</label>
                  <Tooltip content="Zusätzliche Sicherheitsmarge auf deine Kosten (z.B. 10%), um Unvorhergesehenes abzufangen.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="relative">
                  <input 
                    type="number"
                    value={metrics.revenueBufferPercent}
                    onChange={(e) => handleChange('revenueBufferPercent', e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none transition-all font-bold text-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sektion 2: Operative Kapazität */}
        <div className="bg-[#191818] border border-white/5 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#008cba]/5 blur-[4rem] group-hover:bg-[#008cba]/10 transition-all" />

          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-[#008cba]/10 text-[#008cba] rounded-2xl border border-[#008cba]/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">Zeit & Kapazität</h3>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wochenstunden (Total)</label>
                <Tooltip content="Wie viele Stunden du insgesamt pro Woche für dein Unternehmen arbeitest (inkl. Verwaltung, Marketing etc.).">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={metrics.hoursWorked}
                  onChange={(e) => handleChange('hoursWorked', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 focus:border-[#008cba] outline-none transition-all font-black text-2xl"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 font-black text-xl">h</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Abrechenbare Stunden / Monat</label>
                <Tooltip content="Die Anzahl der Stunden, die du tatsächlich direkt an Kunden fakturieren kannst. Entscheidend für den Ziel-Stundensatz.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={metrics.billableHours}
                  onChange={(e) => handleChange('billableHours', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 focus:border-[#008cba] outline-none transition-all font-black text-2xl text-[#008cba]"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#008cba]/30 font-black text-xl">h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sektion 3: Finanzstatus */}
        <div className="md:col-span-2 bg-[#191818] border border-white/5 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-amber-500/5 blur-[5rem] group-hover:bg-amber-500/10 transition-all" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Ist-Finanzstatus</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Monatsumsatz (Ist)</label>
                <Tooltip content="Dein aktueller durchschnittlicher Brutto-Umsatz pro Monat (ohne USt).">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.revenue}
                onChange={(e) => handleChange('revenue', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:border-amber-500 outline-none transition-all font-black text-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cash-Bestand</label>
                <Tooltip content="Deine aktuelle Liquidität auf dem Geschäftskonto. Basis für die Runway-Berechnung.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.bankBalance}
                onChange={(e) => handleChange('bankBalance', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:border-amber-500 outline-none transition-all font-black text-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wareneinsatz (COGS)</label>
                <Tooltip content="Direkte projektbezogene Kosten oder Wareneinkauf pro Monat.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.variableCosts}
                onChange={(e) => handleChange('variableCosts', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:border-amber-500 outline-none transition-all font-black text-xl"
              />
            </div>
          </div>

          {/* Detaillierte Kosten (Immer sichtbar, aber im Experten-Modus feingliedriger) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-6 border-t border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personalkosten (€)</label>
                <Tooltip content="Gehälter, Lohnnebenkosten und SV-Beiträge für deine Angestellten (ohne dein eigenes GF-Gehalt).">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.personnelCosts}
                onChange={(e) => handleChange('personnelCosts', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-[#008cba] outline-none transition-all font-bold"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Raumkosten (€)</label>
                <Tooltip content="Miete, Nebenkosten, Reinigung und Instandhaltung für Geschäftsräume.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.rentCosts}
                onChange={(e) => handleChange('rentCosts', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-[#008cba] outline-none transition-all font-bold"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[10px] font-black text-[#008cba] uppercase tracking-[0.2em]">Unternehmens-Branche</label>
                <Tooltip content="Bestimmt, gegen welche Benchmarks (Ziel-Margen, Runway) du im Dashboard verglichen wirst.">
                  <HelpCircle className="w-3.5 h-3.5 text-[#008cba]/50 hover:text-[#008cba] cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <select 
                  value={activeProject?.industry || 'SERVICE_OFFLINE'}
                  onChange={(e) => useStore.getState().updateProject({ industry: e.target.value })}
                  className="w-full bg-[#008cba]/[0.05] border border-[#008cba]/20 rounded-xl px-4 py-3 focus:border-[#008cba] outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                >
                  <optgroup label="Dienstleistungen" className="bg-[#191818] text-slate-500 font-black text-[10px] uppercase">
                    <option value="SERVICE_OFFLINE" className="bg-[#191818] text-white">Dienstleistung (Stationär/Offline)</option>
                    <option value="SERVICE_ONLINE" className="bg-[#191818] text-white">Dienstleistung (Digital/Agentur/SaaS)</option>
                  </optgroup>
                  <optgroup label="Handwerk & Produktion" className="bg-[#191818] text-slate-500 font-black text-[10px] uppercase">
                    <option value="CRAFT" className="bg-[#191818] text-white">Handwerk / Fertigung</option>
                  </optgroup>
                  <optgroup label="Handel" className="bg-[#191818] text-slate-500 font-black text-[10px] uppercase">
                    <option value="TRADE" className="bg-[#191818] text-white">Handel / E-Commerce</option>
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <TrendingUp className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Marketing (€)</label>
                <Tooltip content="Monatliches Budget für Werbung, Akquise und PR.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.marketingCosts}
                onChange={(e) => handleChange('marketingCosts', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-[#008cba] outline-none transition-all font-bold"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sonst. Fixkosten (€)</label>
                <Tooltip content="Versicherungen, Software-Abos, Leasing, KFZ und Marketing-Budgets.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input 
                type="number"
                value={metrics.otherCosts}
                onChange={(e) => handleChange('otherCosts', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-[#008cba] outline-none transition-all font-bold"
              />
            </div>
          </div>

          {isExpertMode && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-purple-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Anzahl Mitarbeiter</label>
                  <Tooltip content="Mitarbeiter in Vollzeit-Äquivalenten (FTE). Relevante Kennzahl für Benchmarks und Effizienz-KPIs.">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400/50 hover:text-purple-400 cursor-help" />
                  </Tooltip>
                </div>
                <input 
                  type="number"
                  value={metrics.employees}
                  onChange={(e) => handleChange('employees', e.target.value)}
                  className="w-full bg-purple-500/[0.05] border border-purple-500/20 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all font-bold"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Kredite / Zinsen (€)</label>
                  <Tooltip content="Monatliche Belastung durch Finanzierungskosten (Tilgung + Zins). Wichtig für den tatsächlichen Cashflow.">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400/50 hover:text-purple-400 cursor-help" />
                  </Tooltip>
                </div>
                <input 
                  type="number"
                  value={metrics.financingCosts}
                  onChange={(e) => handleChange('financingCosts', e.target.value)}
                  className="w-full bg-purple-500/[0.05] border border-purple-500/20 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all font-bold"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Abschreibungen (€)</label>
                  <Tooltip content="Monatliche AfA (Absetzung für Abnutzung). Reduziert zwar den bilanziellen Gewinn, hat aber keinen direkten Liquiditätsabfluss.">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400/50 hover:text-purple-400 cursor-help" />
                  </Tooltip>
                </div>
                <input 
                  type="number"
                  value={metrics.depreciation}
                  onChange={(e) => handleChange('depreciation', e.target.value)}
                  className="w-full bg-purple-500/[0.05] border border-purple-500/20 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mt-12 pt-12 border-t border-white/5">
        <div className="bg-[#008cba]/5 border border-[#008cba]/20 p-8 rounded-[2.5rem] flex items-start gap-6 flex-1">
          <div className="p-3 bg-[#008cba]/10 rounded-2xl text-[#008cba]">
            <Info className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h4 className="font-black text-[#008cba] mb-1 uppercase tracking-widest text-sm">Datenschutz-Hinweis</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Alle hier eingegebenen Werte werden lokal in deinem Browser gespeichert.
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (confirm("Möchtest du wirklich alle Basis-Werte dieses Projekts auf Null zurücksetzen?")) {
              useStore.getState().resetBaseMetrics();
            }
          }}
          className="flex items-center gap-4 px-10 py-6 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-black rounded-[2rem] transition-all font-black uppercase tracking-widest text-xs border border-rose-500/20"
        >
          <Trash2 className="w-5 h-5" />
          Alle Werte auf Null setzen
        </button>
      </div>
    </div>
  );
};
