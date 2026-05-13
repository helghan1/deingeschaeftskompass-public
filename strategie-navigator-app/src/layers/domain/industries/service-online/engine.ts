import { IndustryEngine } from '../engine';
import { BusinessMetrics, KPIResult } from '../../core/types';
import { Insight } from '../../analytics/types';

export class ServiceOnlineIndustryEngine implements IndustryEngine {
  id = 'SERVICE_ONLINE';
  name = 'Dienstleistung Online';

  calculateKPIs(m: BusinessMetrics): KPIResult[] {
    const digitalMargin = m.revenue > 0 ? (m.revenue - m.marketingCosts) / m.revenue * 100 : 0;
    
    return [
      {
        id: 'digital_margin',
        label: 'Digital-Marge',
        category: 'profitability',
        value: digitalMargin,
        status: digitalMargin > 40 ? 'good' : 'warning',
      },
      {
        id: 'cac_ratio',
        label: 'Akquise-Anteil',
        category: 'growth',
        value: m.revenue > 0 ? (m.marketingCosts / m.revenue) * 100 : 0,
        status: (m.marketingCosts / m.revenue) < 0.3 ? 'good' : 'warning',
      }
    ];
  }

  generateInsights(m: BusinessMetrics): Insight[] {
    const insights: Insight[] = [];
    const cacRatio = m.revenue > 0 ? m.marketingCosts / m.revenue : 0;

    if (cacRatio > 0.4) {
      insights.push({
        id: 'high_cac',
        severity: 'critical',
        category: 'growth',
        title: 'Hohe Online-Akquisekosten',
        description: `Du gibst ${Math.round(cacRatio * 100)}% deines Umsatzes für Marketing aus.`,
        recommendation: 'Optimiere deine Funnel-Conversion oder prüfe deine Zielgruppen-Segmentierung.',
      });
    }

    return insights;
  }

  validateData(m: BusinessMetrics): string[] {
    const warnings: string[] = [];
    if (m.marketingCosts === 0 && m.revenue > 1000) {
      warnings.push('Online-Dienste ohne Marketingkosten sind untypisch. Bitte Kostenstellen prüfen.');
    }
    return warnings;
  }
}
