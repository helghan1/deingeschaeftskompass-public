export type UUID = string;
export type Currency = 'EUR';

export interface Money {
  amount: number;
  currency: Currency;
}

export type PeriodType = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

export interface TimePeriod {
  type: PeriodType;
  value: string; // e.g. "2024-W12", "2024-03"
}

export interface BusinessMetrics {
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  personnelCosts: number;
  marketingCosts: number;
  rentCosts: number;
  otherCosts: number;
  depreciation: number;
  financingCosts: number;
  bankBalance: number;
  hoursWorked: number;
  billableHours: number;
  taxRate: number;
  revenueBufferPercent?: number;
  targetNetIncome?: number;
  employees?: number;
}

export interface KPIResult {
  id: string;
  label: string;
  category: 'profitability' | 'liquidity' | 'efficiency' | 'growth' | 'risk' | 'costs';
  value: number;
  trend?: number; // percentage change from last period
  benchmark?: number; // target or market benchmark
  status: 'good' | 'warning' | 'critical' | 'info';
  insight?: string;
}

import { SimulationParams } from '../simulation/types';

export interface Scenario {
  id: UUID;
  name: string;
  type: 'base' | 'optimistic' | 'pessimistic' | 'custom';
  params: SimulationParams;
  isActive: boolean;
}


export interface SubProject {
  id: UUID;
  name: string;
  startMonth: number; // 0-11
  durationMonths: number;
  params: SimulationParams;
  isActive: boolean;
}

export interface Project {
  id: UUID;
  name: string;
  industry: 'SERVICE_OFFLINE' | 'SERVICE_ONLINE' | 'TRADE' | 'CRAFT';
  baseMetrics: Record<string, BusinessMetrics>; // Keyed by month (e.g. "0", "1")
  subProjects: SubProject[];
  scenarios: Scenario[];
  createdAt: string;
  updatedAt: string;
}

