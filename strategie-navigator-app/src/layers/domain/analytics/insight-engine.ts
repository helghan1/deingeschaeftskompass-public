import { BusinessMetrics, KPIResult } from '../core/types';
import { Insight, InsightRule } from './types';

export class InsightEngine {
  private rules: InsightRule[] = [];

  constructor() {
    this.registerCoreRules();
  }

  registerRule(rule: InsightRule) {
    this.rules.push(rule);
  }

  generateInsights(current: BusinessMetrics, simulated?: BusinessMetrics): Insight[] {
    const insights: Insight[] = [];
    const context = { current, simulated };

    for (const rule of this.rules) {
      const insight = rule.evaluate(context);
      if (insight) {
        insights.push(insight);
      }
    }

    return insights;
  }

  private registerCoreRules() {
    // 1. Runway Warning
    this.registerRule({
      id: 'low_runway',
      evaluate: ({ current }) => {
        const totalCosts = current.fixedCosts + current.variableCosts;
        const runway = totalCosts > 0 ? (current.bankBalance / totalCosts) : 999;
        
        if (runway < 3) {
          return {
            id: 'low_runway',
            severity: 'critical',
            category: 'cashflow',
            title: 'Kritische Liquidität',
            description: `Dein Puffer reicht für weniger als 3 Monate (${runway.toFixed(1)} Monate).`,
            recommendation: 'Reduziere kurzfristig Fixkosten oder aktiviere offene Forderungen.',
            relatedKPIs: ['runway']
          };
        }
        return null;
      }
    });

    // 2. Profit Margin Delta
    this.registerRule({
      id: 'profit_improvement',
      evaluate: ({ current, simulated }) => {
        if (!simulated) return null;
        
        const currentProfit = current.revenue - (current.fixedCosts + current.variableCosts);
        const simProfit = simulated.revenue - (simulated.fixedCosts + simulated.variableCosts);
        
        if (simProfit > currentProfit * 1.2) {
          return {
            id: 'profit_improvement',
            severity: 'success',
            category: 'growth',
            title: 'Starkes Gewinnpotenzial',
            description: 'Deine geplanten Maßnahmen steigern den Gewinn um mehr als 20%.',
            recommendation: 'Prüfe, ob die Ressourcen für dieses Wachstum ausreichen.',
            relatedKPIs: ['monthlyProfit']
          };
        }
        return null;
      }
    });

    // 3. Fixkosten-Quote
    this.registerRule({
      id: 'high_fixed_costs',
      evaluate: ({ current }) => {
        const ratio = current.revenue > 0 ? (current.fixedCosts / current.revenue) : 0;
        if (ratio > 0.6) {
          return {
            id: 'high_fixed_costs',
            severity: 'warning',
            category: 'costs',
            title: 'Hohe Fixkosten-Quote',
            description: `Deine Fixkosten fressen ${Math.round(ratio * 100)}% deines Umsatzes auf.`,
            recommendation: 'Überprüfe Abonnements und Raumkosten auf Optimierungspotenzial.',
            relatedKPIs: ['fixedCosts']
          };
        }
        return null;
      }
    });
  }
}

export const coreInsightEngine = new InsightEngine();
