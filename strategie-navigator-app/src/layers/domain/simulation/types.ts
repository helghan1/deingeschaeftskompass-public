import { BusinessMetrics, UUID } from '../core/types';

export interface SimulationParams {
  priceChangePercent?: number;
  volumeChangePercent?: number;
  newProductRevenue?: number;
  newProductCosts?: number;
  marketingSpend?: number;
  marketingRevenue?: number;
  personnelChangePercent?: number;
  newEmployeesCount?: number;
  newEmployeeSalary?: number;
  rentChangePercent?: number;
  billableHoursChange?: number;
  
  // Investments
  investments?: InvestmentParams[];
}

export interface InvestmentParams {
  id: UUID;
  name: string;
  type: 'VEHICLE' | 'MACHINE' | 'IT';
  acquisitionCosts: number;
  usageDurationYears: number;
  interestRatePercent: number;
  isLeasing: boolean;
  leasingRateMonthly?: number;
  annualSubscriptionCosts?: number; // For IT
  kmPerYear?: number; // For Vehicle
  costPerKm?: number; // For Vehicle
}

export interface SimulationResult {
  baseMetrics: BusinessMetrics;
  simulatedMetrics: BusinessMetrics;
  delta: BusinessMetrics;
}
