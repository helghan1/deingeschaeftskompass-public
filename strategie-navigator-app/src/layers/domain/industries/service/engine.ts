import { IndustryEngine } from '../engine';
import { BusinessMetrics, KPIResult } from '../../core/types';
import { Insight } from '../../analytics/types';

export class ServiceOfflineIndustryEngine implements IndustryEngine {
  id = 'SERVICE_OFFLINE';
  name = 'Dienstleistung Offline';

  calculateKPIs(m: BusinessMetrics): KPIResult[] {
    const hourlyRate = m.billableHours > 0 ? m.revenue / m.billableHours : 0;
    const utilization = m.hoursWorked > 0 ? (m.billableHours / m.hoursWorked) * 100 : 0;

    return [
      {
        id: 'hourly_rate',
        label: 'Ø Stundensatz',
        category: 'profitability',
        value: hourlyRate,
        status: hourlyRate > 80 ? 'good' : 'warning',
      },
      {
        id: 'utilization',
        label: 'Auslastung',
        category: 'efficiency',
        value: utilization,
        status: utilization > 70 ? 'good' : utilization > 50 ? 'warning' : 'critical',
      }
    ];
  }

  generateInsights(m: BusinessMetrics): Insight[] {
    const utilization = m.hoursWorked > 0 ? (m.billableHours / m.hoursWorked) * 100 : 0;
    const insights: Insight[] = [];

    if (utilization < 40) {
      insights.push({
        id: 'low_utilization',
        severity: 'warning',
        category: 'costs',
        title: 'Geringe abrechenbare Zeit',
        description: `Deine Auslastung liegt bei nur ${Math.round(utilization)}%.`,
        recommendation: 'Prüfe, wie du administrative Aufgaben reduzieren oder mehr Akquise betreiben kannst.',
      });
    }

    return insights;
  }

  validateData(m: BusinessMetrics): string[] {
    const warnings: string[] = [];
    if (m.billableHours > m.hoursWorked) {
      warnings.push('Die abrechenbaren Stunden können nicht höher sein als die Gesamtarbeitszeit.');
    }
    return warnings;
  }
}
