import { BusinessMetrics, KPIResult } from './types';

export type KPICalculator = (metrics: BusinessMetrics) => number;

export interface KPIModule {
  id: string;
  label: string;
  category: KPIResult['category'];
  calculate: KPICalculator;
  getThresholds: () => { good: number; warning: number };
}

export class KPIRegistry {
  private modules: Map<string, KPIModule> = new Map();

  register(module: KPIModule) {
    this.modules.set(module.id, module);
  }

  evaluate(metrics: BusinessMetrics): KPIResult[] {
    return Array.from(this.modules.values()).map(module => {
      const value = module.calculate(metrics);
      const thresholds = module.getThresholds();
      
      let status: KPIResult['status'] = 'good';
      if (value < thresholds.warning) status = 'warning';
      if (value < thresholds.good) status = 'critical'; // Note: Simple logic for now, depends on KPI direction

      return {
        id: module.id,
        label: module.label,
        category: module.category,
        value,
        status,
      };
    });
  }
}

// Initial core KPIs
export const coreKPIRegistry = new KPIRegistry();

coreKPIRegistry.register({
  id: 'profit_margin',
  label: 'Profit Marge',
  category: 'profitability',
  calculate: (m) => m.revenue > 0 ? ((m.revenue - (m.fixedCosts + m.variableCosts)) / m.revenue) * 100 : 0,
  getThresholds: () => ({ good: 20, warning: 10 }),
});

coreKPIRegistry.register({
  id: 'burn_rate',
  label: 'Monatliche Kosten',
  category: 'liquidity',
  calculate: (m) => m.fixedCosts + m.variableCosts,
  getThresholds: () => ({ good: 0, warning: 0 }), // Directional, logic needs refinement
});
