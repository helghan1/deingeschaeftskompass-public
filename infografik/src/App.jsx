import React, { useState } from "react";
import {
  BarChart3,
  Settings2,
  Zap,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  Layers,
  Search,
  ArrowRight,
} from "lucide-react";

const App = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const colors = {
    bg: "#191818",

    primary: "#008cba",

    accent: "#ed982b",

    text: "#ffffff",

    textDim: "#a0a0a0",

    card: "#242424",
  };

  const methods = [
    {
      title: "Lean Management",

      icon: <Zap size={24} />,

      desc: "Vermeidung von Verschwendung (Muda) und Maximierung der Wertschöpfung.",

      details: ["Beseitigung von Überproduktion", "Reduzierung von Wartezeiten", "Optimierung von Lagerbeständen"],
    },

    {
      title: "Six Sigma",

      icon: <Target size={24} />,

      desc: "Statistische Qualitätsmethode zur Null-Fehler-Toleranz in Geschäftsprozessen.",

      details: ["DMAIC-Zyklus", "Variationsreduktion", "Datengetriebene Entscheidungen"],
    },

    {
      title: "Kaizen / KVP",

      icon: <TrendingUp size={24} />,

      desc: "Stetige, punktuelle Verbesserung in kleinen Schritten durch alle Mitarbeiter.",

      details: ["Standardisierung", "5S-Methode", "Mitarbeiterbeteiligung"],
    },

    {
      title: "BPR",

      icon: <Layers size={24} />,

      desc: "Business Process Reengineering – Radikaler Neuentwurf bestehender Prozesse.",

      details: ["Fundamental", "Radikal", "Dramatisch (Leistungssprünge)"],
    },
  ];

  const phases = [
    { id: 1, name: "Ist-Analyse", status: "Status Quo erfassen" },

    { id: 2, name: "Schwachstellen", status: "Engpässe identifizieren" },

    { id: 3, name: "Soll-Konzept", status: "Zielprozess definieren" },

    { id: 4, name: "Implementierung", status: "Rollout & Training" },

    { id: 5, name: "Controlling", status: "Erfolg messen" },
  ];

  return (
    <div className="h-auto w-full font-sans p-0 md:p-8" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {/* Header */}

      <header className="max-w-6xl mx-auto mb-12 border-l-4 pl-6" style={{ borderColor: colors.primary }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
          PROZESS<span style={{ color: colors.accent }}>OPTIMIERUNG</span>
        </h1>

        <p className="text-lg" style={{ color: colors.textDim }}>
          Methoden & Strategien für maximale Effizienz im Business
        </p>
      </header>

      {/* Navigation Tabs */}

      <div className="max-w-6xl mx-auto mb-10 flex flex-wrap gap-4">
        {["overview", "methods", "workflow"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 border ${
              activeTab === tab
                ? "bg-opacity-100 border-transparent"
                : "bg-transparent border-gray-700 hover:border-gray-500"
            }`}
            style={{
              backgroundColor: activeTab === tab ? colors.primary : "transparent",
            }}
          >
            {tab === "overview" ? "Übersicht" : tab === "methods" ? "Die Methoden" : "Der Ablauf"}
          </button>
        ))}
      </div>

      {/* Content Area */}

      <main className="max-w-6xl mx-auto">
        {/* TAB: OVERVIEW */}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
            <div className="md:col-span-2 p-8 rounded-2xl" style={{ backgroundColor: colors.card }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 style={{ color: colors.accent }} /> Warum optimieren?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { t: "Kostensenkung", d: "Ressourcen effizienter nutzen & Verschwendung stoppen." },

                  { t: "Zeitgewinn", d: "Durchlaufzeiten radikal verkürzen." },

                  { t: "Qualität", d: "Fehlerraten minimieren & Standards setzen." },

                  { t: "Kundenzufriedenheit", d: "Schnellere Lieferung & bessere Ergebnisse." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 style={{ color: colors.primary }} className="shrink-0" />

                    <div>
                      <h4 className="font-bold">{item.t}</h4>

                      <p className="text-sm" style={{ color: colors.textDim }}>
                        {item.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-8 rounded-2xl flex flex-col justify-center items-center text-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Settings2 size={48} className="mb-4 text-black" />

              <h3 className="text-2xl font-black text-black mb-2">KOMPASS-PRINZIP</h3>

              <p className="text-black font-medium opacity-80">
                Optimierung ist kein einmaliges Projekt, sondern eine strategische Grundhaltung.
              </p>
            </div>
          </div>
        )}

        {/* TAB: METHODS */}

        {activeTab === "methods" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {methods.map((m, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl transition-transform hover:-translate-y-2 border-b-4 h-full flex flex-col"
                style={{
                  backgroundColor: colors.card,
                  borderBottomColor: i % 2 === 0 ? colors.primary : colors.accent,
                }}
              >
                <div
                  className="p-3 rounded-lg w-fit mb-4"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: i % 2 === 0 ? colors.primary : colors.accent,
                  }}
                >
                  {m.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">{m.title}</h3>

                <p className="text-sm mb-6 grow" style={{ color: colors.textDim }}>
                  {m.desc}
                </p>

                <ul className="space-y-2">
                  {m.details.map((d, j) => (
                    <li key={j} className="text-xs flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white opacity-40" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TAB: WORKFLOW */}

        {activeTab === "workflow" && (
          <div className="p-8 rounded-2xl animate-fadeIn" style={{ backgroundColor: colors.card }}>
            <h2 className="text-2xl font-bold mb-10 text-center">Der 5-Schritte-Fahrplan</h2>

            <div className="relative">
              {/* Connector Line */}

              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2 z-0" />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
                {phases.map((p, i) => (
                  <div key={i} className="flex flex-col items-center group">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 transition-all group-hover:scale-110"
                      style={{
                        backgroundColor: i === 4 ? colors.accent : colors.bg,

                        border: `3px solid ${i === 4 ? colors.accent : colors.primary}`,

                        color: i === 4 ? colors.bg : colors.text,
                      }}
                    >
                      {p.id}
                    </div>

                    <h4 className="font-bold mb-1">{p.name}</h4>

                    <p className="text-center text-xs px-2" style={{ color: colors.textDim }}>
                      {p.status}
                    </p>

                    {i < 4 && <ArrowRight className="lg:hidden mt-4 opacity-30" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-full" style={{ backgroundColor: "rgba(0,140,186,0.1)" }}>
                <Search style={{ color: colors.primary }} size={32} />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-1">Profi-Tipp: Die Engpass-Theorie (TOC)</h3>

                <p className="text-sm" style={{ color: colors.textDim }}>
                  Konzentrieren Sie sich immer auf das schwächste Glied in der Kette. Jede Optimierung an einer anderen
                  Stelle ist eine Illusion von Fortschritt.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}

      <footer
        className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
        style={{ color: colors.textDim }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />

          <span>Infografik basierend auf deingeschaeftskompass.de</span>
        </div>

        <div className="flex gap-6">
          <span>#BusinessEfficiency</span>

          <span>#LeanSigma</span>

          <span>#DigitalTransformation</span>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `

@keyframes fadeIn {

from { opacity: 0; transform: translateY(10px); }

to { opacity: 1; transform: translateY(0); }

}

.animate-fadeIn {

animation: fadeIn 0.5s ease-out forwards;

}

`,
        }}
      />
    </div>
  );
};

export default App;
