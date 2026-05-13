import { IndustryEngine } from '../engine';
import { BusinessMetrics, KPIResult } from '../../core/types';
import { Insight } from '../../analytics/types';

export class TradeIndustryEngine implements IndustryEngine {
  id = 'TRADE';
  name = 'Handel';

  calculateKPIs(m: BusinessMetrics): KPIResult[] {
    const rawMargin = m.revenue > 0 ? (m.revenue - m.variableCosts) / m.revenue * 100 : 0;
    
    return [
      {
        id: 'trade_margin',
        label: 'Handelsspanne',
        category: 'profitability',
        value: rawMargin,
        status: rawMargin > 30 ? 'good' : rawMargin > 15 ? 'warning' : 'critical',
      },
      {
        id: 'return_impact',
        label: 'Retouren-Kosten',
        category: 'risk',
        value: m.variableCosts * 0.05, // Demo assumption: 5% of COGS are return-related
        status: 'info',
      }
    ];
  }

  generateInsights(m: BusinessMetrics): Insight[] {
    const insights: Insight[] = [];
    const margin = m.revenue > 0 ? (m.revenue - m.variableCosts) / m.revenue : 0;

    if (margin < 0.2) {
      insights.push({
        id: 'low_trade_margin',
        severity: 'critical',
        category: 'profitability',
        title: 'Gefährliche Handelsspanne',
        description: `Deine Marge von ${Math.round(margin * 100)}% deckt kaum die Fixkosten.`,
        recommendation: 'Verhandle mit Lieferanten oder erhöhe die Preise für margenschwache Produkte.',
      });
    }

    return insights;
  }

  validateData(m: BusinessMetrics): string[] {
    const warnings: string[] = [];
    if (m.variableCosts > m.revenue) {
      warnings.push('Wareneinsatz ist höher als Umsatz. Bitte Einkaufspreise prüfen.');
    }
    return warnings;
  }
}
