import { BusinessMetrics, KPIResult } from '../core/types';
import { Insight } from '../analytics/types';

export interface IndustryEngine {
  id: string;
  name: string;
  calculateKPIs: (metrics: BusinessMetrics) => KPIResult[];
  generateInsights: (metrics: BusinessMetrics) => Insight[];
  validateData: (metrics: BusinessMetrics) => string[]; // Returns list of warnings/errors
}

export class IndustryRegistry {
  private engines: Map<string, IndustryEngine> = new Map();

  register(engine: IndustryEngine) {
    this.engines.set(engine.id, engine);
  }

  getEngine(id: string): IndustryEngine | undefined {
    return this.engines.get(id);
  }
}

export const industryRegistry = new IndustryRegistry();
