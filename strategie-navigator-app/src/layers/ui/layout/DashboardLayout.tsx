import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  History,
  Settings, 
  Menu,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Facebook,
  Share2
} from 'lucide-react';
import { useStore } from '../../../shared/store/useStore';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const { createProject, saveSimulationAsScenario } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'liquidity', label: 'Liquidität', icon: ShieldCheck },
    { id: 'efficiency', label: 'Effizienz', icon: TrendingUp },
    { id: 'pricing', label: 'Preisstrategie', icon: Plus },
    { id: 'simulation', label: 'Simulation', icon: ArrowRight },
    { id: 'history', label: 'Historie', icon: History },
    { id: 'settings', label: 'Projekt-Setup', icon: Settings },
  ];

  const handleNewProject = async () => {
    const name = prompt('Name des neuen Projekts:');
    if (name) {
      const industry = prompt('Branche (CRAFT, TRADE, SERVICE_OFFLINE, SERVICE_ONLINE):', 'SERVICE_OFFLINE') as any;
      await createProject(name, industry || 'SERVICE_OFFLINE');
    }
  };

  const handleSaveScenario = async () => {
    const name = prompt('Name für das Szenario:');
    if (name) await saveSimulationAsScenario(name);
  };

  return (
    <div className="flex flex-col h-screen bg-[#191818] text-white overflow-hidden">
      {/* --- OFFICIAL SITE HEADER --- */}
      <header className="kopfzeile-rest-container">
        <div className="kopfzeile-rest-navbar-interactive">
          <a href="/index.html" className="kopfzeile-rest-navlink">
            <img
              alt="Dein Geschäftskompass – zurück zur Startseite."
              src="/Logo.webp"
              className="kopfzeile-rest-image1"
            />
          </a>
          <div className="kopfzeile-rest-desktop-menu">
            <nav className="kopfzeile-rest-links">
              <a href="/index.html" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">
                Startseite
              </a>
              <a href="/gut-zu-wissen.html" className="thq-button-animated thq-button-outline !px-4 !py-1.5 !text-[10px] tracking-widest">
                GUT ZU WISSEN
              </a>
              <a href="/verantwortung.html" className="thq-button-animated thq-button-outline !px-4 !py-1.5 !text-[10px] tracking-widest">
                VERANTWORTUNG
              </a>
              <a href="/preise.html" className="thq-button-animated thq-button-outline !px-4 !py-1.5 !text-[10px] tracking-widest">
                PREISE
              </a>
            </nav>
            <div className="kopfzeile-rest-buttons">
              <a href="/mehr-erfahren.html" className="thq-button-animated thq-button-filled !px-4 !py-1.5 !text-[10px] tracking-widest">
                MEHR ERFAHREN
              </a>
              <a href="/kontakt.html" className="thq-button-animated thq-button-filled !px-4 !py-1.5 !text-[10px] tracking-widest">
                KONTAKT
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* --- SIDEBAR (App Logic) --- */}
        <aside className={cn(
          "bg-[#191818] border-r border-white/5 transition-all duration-300 flex flex-col h-full",
          isSidebarOpen ? "w-72" : "w-20"
        )}>
          <nav className="flex-1 p-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group",
                  activeTab === item.id 
                    ? "bg-[#008cba] text-white shadow-lg shadow-[#008cba]/20" 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isSidebarOpen && (
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {isSidebarOpen && <span className="font-bold text-sm">Menü einklappen</span>}
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex items-center justify-between px-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black capitalize tracking-tight">{activeTab}</h2>
              <div className="h-1 w-1 bg-slate-700 rounded-full" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Navigator 2.0</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSaveScenario}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border border-white/5"
              >
                <Plus className="w-4 h-4" />
                SZENARIO SPEICHERN
              </button>
              <button 
                onClick={handleNewProject}
                className="px-6 py-3 bg-[#008cba] hover:bg-[#60e5ff] text-black rounded-2xl text-xs font-black transition-all shadow-lg shadow-[#008cba]/20"
              >
                NEUES PROJEKT
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto p-8 min-h-[calc(100vh-240px)]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>

            {/* --- CLASSIC FOOTER (Version 1.0 Style) --- */}
            <footer className="bg-[#191818] border-t border-white/5 p-12 mt-12">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <img src="/public/Logo48.webp" alt="Logo" className="w-8 h-8 opacity-50" />
                    <span className="font-black text-lg tracking-tighter opacity-50">DEIN GESCHÄFTSKOMPASS</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                    Interaktive Unternehmenssteuerung und Finanz-Simulation für smarte Entscheidungen.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Navigation</h4>
                  <nav className="grid grid-cols-2 gap-y-3">
                    <a href="/gut-zu-wissen.html" className="text-sm text-slate-500 hover:text-[#008cba] transition-colors">Blog</a>
                    <a href="Tools.html" className="text-sm text-slate-500 hover:text-[#008cba] transition-colors">Tools</a>
                    <a href="/Widerrufsrecht.html" className="text-sm text-slate-500 hover:text-[#008cba] transition-colors">Widerruf</a>
                    <a href="/datenschutz.html" className="text-sm text-slate-500 hover:text-[#008cba] transition-colors">Datenschutz</a>
                    <a href="/impressum.html" className="text-sm text-slate-500 hover:text-[#008cba] transition-colors">Impressum</a>
                  </nav>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Social & Sharing</h4>
                  <div className="flex gap-4">
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                      <img src="/instagram.webp" alt="Instagram" className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                      <img src="/facebook.webp" alt="Facebook" className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                      <img src="/share.webp" alt="Share" className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-slate-600 text-[10px] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DATENSCHUTZ-GARANTIE: ALLE DATEN BLEIBEN LOKAL IN DEINEM BROWSER.</span>
                </div>
                <p className="text-slate-600 text-[10px] font-bold">
                  © 2026 DEIN GESCHÄFTSKOMPASS. ALLE RECHTE VORBEHALTEN.
                </p>
              </div>
            </footer>
          </div>

          {/* --- OFFICIAL SITE FOOTER --- */}
          <footer className="py-12 border-t border-white/5 bg-[#191818] mt-auto">
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <img src="/Logo.webp" alt="Logo" className="w-8 h-8 opacity-50" />
                <span className="text-slate-500 text-xs font-bold">© {new Date().getFullYear()} Dein Geschäftskompass. Alle Rechte vorbehalten.</span>
              </div>
              <nav className="flex items-center gap-8">
                <a href="/impressum.html" className="text-slate-500 hover:text-white text-xs font-bold transition-colors">IMPRESSUM</a>
                <a href="/datenschutz.html" className="text-slate-500 hover:text-white text-xs font-bold transition-colors">DATENSCHUTZ</a>
                <a href="/kontakt.html" className="text-slate-500 hover:text-white text-xs font-bold transition-colors">KONTAKT</a>
              </nav>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
