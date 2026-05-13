import { create } from 'zustand';
import { Project, BusinessMetrics, Scenario, SubProject } from '../../layers/domain/core/types';
import { SimulationParams } from '../../layers/domain/simulation/types';
import { SimulationEngine } from '../../layers/domain/simulation/engine';
import { db } from '../../layers/data/storage/db';
import { Insight } from '../../layers/domain/analytics/types';
import { coreInsightEngine } from '../../layers/domain/analytics/insight-engine';
import { industryRegistry } from '../../layers/domain/industries/engine';

interface State {
  activeProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  
  // Simulation State
  activeSimulationParams: SimulationParams;
  comparedScenarioIds: string[];
  
  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string, industry: Project['industry']) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  updateBaseMetrics: (period: string, metrics: BusinessMetrics) => Promise<void>;
  
  // Simulation Actions
  updateSimulationParams: (params: Partial<SimulationParams>) => void;
  resetSimulation: () => void;
  saveSimulationAsScenario: (name: string) => Promise<void>;
  toggleScenarioComparison: (id: string) => void;
  
  // Sub-Project Actions
  addSubProject: (sub: SubProject) => Promise<void>;
  toggleSubProject: (id: string) => Promise<void>;
  
  // Selectors (Logic computed from state)
  getSimulatedMetrics: (monthIndex: number, customParams?: SimulationParams) => BusinessMetrics | null;
  getYearlyProjection: () => BusinessMetrics | null;
  getYearlyDevelopment: () => { name: string; umsatz: number; gewinn: number }[];
  getInsights: (monthIndex: number) => Insight[];
  getLiquidityProjection: () => { month: string; liquidity: number; profit: number }[];
  getComparisonData: () => { name: string; [key: string]: any }[];
}

const INITIAL_SIM_PARAMS: SimulationParams = {
  priceChangePercent: 0,
  volumeChangePercent: 0,
  newProductRevenue: 0,
  newProductCosts: 0,
  marketingSpend: 0,
  marketingRevenue: 0,
  personnelChangePercent: 0,
  newEmployeesCount: 0,
  newEmployeeSalary: 0,
  rentChangePercent: 0,
  billableHoursChange: 0,
  investments: [],
};

export const useStore = create<State>((set, get) => ({
  activeProject: null,
  projects: [],
  isLoading: false,
  activeSimulationParams: INITIAL_SIM_PARAMS,
  comparedScenarioIds: [],

  loadProjects: async () => {
    set({ isLoading: true });
    const projects = await db.projects.toArray();
    set({ projects, isLoading: false });
  },

  createProject: async (name, industry) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      industry,
      baseMetrics: {
        'Current': {
          revenue: 0,
          fixedCosts: 0,
          variableCosts: 0,
          hoursWorked: 40,
          billableHours: 20,
          taxRate: 30,
          targetNetIncome: 5000,
          employees: 0,
          bankBalance: 0,
          revenueBufferPercent: 10,
          financingCosts: 0,
          depreciation: 0,
          marketingCosts: 0,
          cogs: 0,
          personnelCosts: 0,
          rentCosts: 0,
          otherCosts: 0
        }
      },
      subProjects: [],
      scenarios: [
        { id: crypto.randomUUID(), name: 'Basis-Szenario', type: 'base', params: INITIAL_SIM_PARAMS, isActive: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await db.projects.add(newProject);
      set(state => ({ projects: [...state.projects, newProject], activeProject: state.activeProject || newProject }));
    } catch (err) {
      console.error("Failed to save project to DB, using memory fallback", err);
      set(state => ({ projects: [...state.projects, newProject], activeProject: state.activeProject || newProject }));
    }
  },

  setActiveProject: (project) => set({ activeProject: project }),

  updateProject: async (updates: Partial<Project>) => {
    const { activeProject } = get();
    if (!activeProject) return;

    const updatedProject = {
      ...activeProject,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.projects.update(activeProject.id, updatedProject);
    set({ activeProject: updatedProject });
  },

  updateBaseMetrics: async (period, metrics) => {
    const { activeProject } = get();
    if (!activeProject) return;

    const updatedProject = {
      ...activeProject,
      baseMetrics: {
        ...activeProject.baseMetrics,
        [period]: metrics
      },
      updatedAt: new Date().toISOString()
    };

    await db.projects.update(activeProject.id, updatedProject);
    set({ activeProject: updatedProject });
  },

  resetBaseMetrics: async () => {
    const { activeProject } = get();
    if (!activeProject) return;

    const emptyMetrics = {
      revenue: 0,
      fixedCosts: 0,
      variableCosts: 0,
      hoursWorked: 40,
      billableHours: 20,
      taxRate: 30,
      targetNetIncome: 5000,
      employees: 0,
      bankBalance: 0,
      revenueBufferPercent: 10,
      financingCosts: 0,
      depreciation: 0,
      marketingCosts: 0,
      cogs: 0,
      personnelCosts: 0,
      rentCosts: 0,
      otherCosts: 0
    };

    const updatedProject = {
      ...activeProject,
      baseMetrics: {
        ...activeProject.baseMetrics,
        ['Current']: emptyMetrics
      },
      updatedAt: new Date().toISOString()
    };

    await db.projects.update(activeProject.id, updatedProject);
    set({ activeProject: updatedProject });
  },

  addSubProject: async (sub) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updated = { ...activeProject, subProjects: [...activeProject.subProjects, sub] };
    await db.projects.update(activeProject.id, updated);
    set({ activeProject: updated });
  },

  toggleSubProject: async (id) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      subProjects: activeProject.subProjects.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    };
    await db.projects.update(activeProject.id, updated);
    set({ activeProject: updated });
  },

  updateSimulationParams: (params) => {
    set(state => ({
      activeSimulationParams: { ...state.activeSimulationParams, ...params }
    }));
  },

  resetSimulation: () => set({ activeSimulationParams: INITIAL_SIM_PARAMS }),

  saveSimulationAsScenario: async (name) => {
    const { activeProject, activeSimulationParams } = get();
    if (!activeProject) return;

    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name,
      type: 'custom',
      params: activeSimulationParams,
      isActive: false
    };

    const updatedProject = {
      ...activeProject,
      scenarios: [...activeProject.scenarios, newScenario],
      updatedAt: new Date().toISOString()
    };

    await db.projects.update(activeProject.id, updatedProject);
    set({ activeProject: updatedProject });
  },

  toggleScenarioComparison: (id) => {
    set(state => ({
      comparedScenarioIds: state.comparedScenarioIds.includes(id)
        ? state.comparedScenarioIds.filter(sid => sid !== id)
        : [...state.comparedScenarioIds, id]
    }));
  },

  getSimulatedMetrics: (monthIndex, customParams) => {
    const { activeProject, activeSimulationParams } = get();
    if (!activeProject || !activeProject.baseMetrics['Current']) return null;
    
    return SimulationEngine.simulateMonth(
      activeProject.baseMetrics['Current'],
      customParams || activeSimulationParams,
      activeProject.subProjects,
      monthIndex
    );
  },

  getYearlyProjection: () => {
    const { getSimulatedMetrics } = get();
    const monthlyMetrics = [];
    for (let i = 0; i < 12; i++) {
      const m = getSimulatedMetrics(i);
      if (m) monthlyMetrics.push(m);
    }
    if (monthlyMetrics.length === 0) return null;
    return SimulationEngine.aggregateYear(monthlyMetrics);
  },

  getYearlyDevelopment: () => {
    const { getSimulatedMetrics } = get();
    const months = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return months.map((month, i) => {
      const metrics = getSimulatedMetrics(i);
      return {
        name: month,
        umsatz: metrics?.revenue || 0,
        gewinn: (metrics?.revenue || 0) - ((metrics?.fixedCosts || 0) + (metrics?.variableCosts || 0))
      };
    });
  },

  getInsights: (monthIndex) => {
    const { activeProject } = get();
    if (!activeProject || !activeProject.baseMetrics['Current']) return [];
    
    const current = activeProject.baseMetrics['Current'];
    const simulated = get().getSimulatedMetrics(monthIndex) || undefined;
    
    // Core insights
    const coreInsights = coreInsightEngine.generateInsights(current, simulated);
    
    // Industry specific insights
    const engine = industryRegistry.getEngine(activeProject.industry);
    const industryInsights = engine ? engine.generateInsights(simulated || current) : [];
    
    return [...coreInsights, ...industryInsights];
  },

  getLiquidityProjection: () => {
    const { activeProject, activeSimulationParams } = get();
    if (!activeProject || !activeProject.baseMetrics['Current']) return [];

    return SimulationEngine.projectLiquidity(
      activeProject.baseMetrics['Current'],
      activeSimulationParams,
      activeProject.subProjects,
      activeProject.baseMetrics['Current'].bankBalance
    );
  },

  getComparisonData: () => {
    const { activeProject, comparedScenarioIds, getSimulatedMetrics } = get();
    if (!activeProject || !activeProject.baseMetrics['Current']) return [];

    const baseMetrics = activeProject.baseMetrics['Current'];
    const baseProfit = baseMetrics.revenue - (baseMetrics.fixedCosts + baseMetrics.variableCosts);

    const data = [
      { name: 'Basis', umsatz: baseMetrics.revenue, gewinn: baseProfit, type: 'Basis' }
    ];

    comparedScenarioIds.forEach(id => {
      const scenario = activeProject.scenarios.find(s => s.id === id);
      if (scenario) {
        const metrics = getSimulatedMetrics(0, scenario.params);
        if (metrics) {
          data.push({
            name: scenario.name,
            umsatz: metrics.revenue,
            gewinn: metrics.revenue - (metrics.fixedCosts + metrics.variableCosts),
            type: 'Simulation'
          });
        }
      }
    });

    return data;
  }
}));
