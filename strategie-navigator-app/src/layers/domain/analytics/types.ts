import { UUID } from '../core/types';

export type InsightSeverity = 'info' | 'warning' | 'critical' | 'success';
export type InsightCategory = 'cashflow' | 'growth' | 'costs' | 'risk';

export interface Insight {
  id: string;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  description: string;
  recommendation?: string;
  relatedKPIs?: string[];
}

export interface InsightRule {
  id: string;
  evaluate: (context: any) => Insight | null;
}
