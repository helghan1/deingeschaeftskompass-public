import { IndustryEngine } from '../engine';
import { BusinessMetrics, KPIResult } from '../../core/types';
import { Insight } from '../../analytics/types';

export class CraftIndustryEngine implements IndustryEngine {
  id = 'CRAFT';
  name = 'Handwerk';

  calculateKPIs(m: BusinessMetrics): KPIResult[] {
    const materialRatio = m.revenue > 0 ? (m.variableCosts / m.revenue) * 100 : 0;
    
    return [
      {
        id: 'material_ratio',
        label: 'Materialquote',
        category: 'costs',
        value: materialRatio,
        status: materialRatio < 40 ? 'good' : materialRatio < 60 ? 'warning' : 'critical',
      },
      {
        id: 'labor_productivity',
        label: 'Lohnproduktivität',
        category: 'efficiency',
        value: m.hoursWorked > 0 ? m.revenue / m.hoursWorked : 0,
        status: 'info',
      }
    ];
  }

  generateInsights(m: BusinessMetrics): Insight[] {
    const insights: Insight[] = [];
    const materialRatio = m.revenue > 0 ? m.variableCosts / m.revenue : 0;

    if (materialRatio > 0.5) {
      insights.push({
        id: 'high_material_costs',
        severity: 'warning',
        category: 'costs',
        title: 'Hoher Materialaufwand',
        description: `Materialkosten fressen ${Math.round(materialRatio * 100)}% deines Umsatzes.`,
        recommendation: 'Prüfe Verschnittmengen oder aktualisiere deine Materialaufschläge in Angeboten.',
      });
    }

    return insights;
  }

  validateData(m: BusinessMetrics): string[] {
    return [];
  }
}
