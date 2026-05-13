import { BusinessMetrics } from '../core/types';
import { SimulationParams, InvestmentParams } from './types';

export class SimulationEngine {
  /**
   * Applies simulation parameters to a set of base metrics.
   */
  static simulate(base: BusinessMetrics, params: SimulationParams): BusinessMetrics {
    const sim = { ...base };

    // 1. Revenue Adjustments
    const priceFactor = 1 + (params.priceChangePercent || 0) / 100;
    const volumeFactor = 1 + (params.volumeChangePercent || 0) / 100;
    
    // Simple revenue model: Revenue = Price * Volume
    // If price/volume changes are applied, we scale the original revenue
    sim.revenue = base.revenue * priceFactor * volumeFactor;
    
    // Additive revenue sources
    sim.revenue += (params.newProductRevenue || 0);
    sim.revenue += (params.marketingRevenue || 0);

    // 2. Variable Costs Adjustments (COGS)
    // Variable costs typically scale with volume, but not price
    sim.variableCosts = base.variableCosts * volumeFactor;
    sim.variableCosts += (params.newProductCosts || 0);

    // 3. Personnel Costs
    const personnelFactor = 1 + (params.personnelChangePercent || 0) / 100;
    sim.personnelCosts = base.personnelCosts * personnelFactor;
    sim.personnelCosts += (params.newEmployeesCount || 0) * (params.newEmployeeSalary || 0);

    // 4. Rent
    const rentFactor = 1 + (params.rentChangePercent || 0) / 100;
    sim.rentCosts = base.rentCosts * rentFactor;

    // 5. Marketing
    sim.marketingCosts = base.marketingCosts + (params.marketingSpend || 0);

    // 6. Billable Hours Efficiency
    if (params.billableHoursChange && base.billableHours > 0) {
      const hourlyRate = base.revenue / base.billableHours;
      sim.revenue += params.billableHoursChange * hourlyRate;
    }

    // 7. Investments (Depreciation and Interest)
    if (params.investments && params.investments.length > 0) {
      const investmentImpact = this.calculateInvestmentImpact(params.investments);
      sim.depreciation += investmentImpact.depreciation;
      sim.otherCosts += investmentImpact.operatingCosts;
      sim.financingCosts += investmentImpact.interest;
    }

    // 7. Recalculate Fixed Costs (Sum of specific fixed components)
    sim.fixedCosts = sim.personnelCosts + sim.rentCosts + sim.marketingCosts + sim.depreciation + sim.financingCosts + sim.otherCosts;

    return sim;
  }

  private static calculateInvestmentImpact(investments: InvestmentParams[]) {
    let totalDepreciation = 0;
    let totalOperatingCosts = 0;
    let totalInterest = 0;

    for (const inv of investments) {
      if (inv.isLeasing) {
        totalOperatingCosts += (inv.leasingRateMonthly || 0);
      } else {
        // Linear depreciation
        const monthlyDepr = inv.acquisitionCosts / (inv.usageDurationYears * 12);
        totalDepreciation += monthlyDepr;
        
        // Simple interest calculation (on initial amount for simplicity, or declining balance)
        const monthlyInterest = (inv.acquisitionCosts * (inv.interestRatePercent / 100)) / 12;
        totalInterest += monthlyInterest;
      }

      if (inv.type === 'VEHICLE' && inv.kmPerYear && inv.costPerKm) {
        totalOperatingCosts += (inv.kmPerYear * inv.costPerKm) / 12;
      }

      if (inv.type === 'IT' && inv.annualSubscriptionCosts) {
        totalOperatingCosts += inv.annualSubscriptionCosts / 12;
      }
    }

    return {
      depreciation: totalDepreciation,
      operatingCosts: totalOperatingCosts,
      interest: totalInterest
    };
  }

  /**
   * Calculates the simulated metrics for a specific month, including all active sub-projects.
   */
  static simulateMonth(
    base: BusinessMetrics,
    globalParams: SimulationParams,
    subProjects: SubProject[],
    monthIndex: number
  ): BusinessMetrics {
    // 1. Start with global simulation on base metrics
    let total = this.simulate(base, globalParams);

    // 2. Add additive impact of each active sub-project that covers this month
    for (const sub of subProjects) {
      if (sub.isActive && monthIndex >= sub.startMonth && monthIndex < sub.startMonth + sub.durationMonths) {
        const subImpact = this.simulate({ ...EMPTY_METRICS }, sub.params);
        
        total.revenue += subImpact.revenue;
        total.variableCosts += subImpact.variableCosts;
        total.personnelCosts += subImpact.personnelCosts;
        total.marketingCosts += subImpact.marketingCosts;
        total.rentCosts += subImpact.rentCosts;
        total.depreciation += subImpact.depreciation;
        total.otherCosts += subImpact.otherCosts;
        
        // Recalculate fixed costs for the month
        total.fixedCosts = total.personnelCosts + total.rentCosts + total.marketingCosts + total.depreciation + total.otherCosts;
      }
    }

    return total;
  }

  /**
   * Aggregates 12 months into a yearly total.
   */
  static aggregateYear(monthlyMetrics: BusinessMetrics[]): BusinessMetrics {
    return monthlyMetrics.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      fixedCosts: acc.fixedCosts + curr.fixedCosts,
      variableCosts: acc.variableCosts + curr.variableCosts,
      personnelCosts: acc.personnelCosts + curr.personnelCosts,
      marketingCosts: acc.marketingCosts + curr.marketingCosts,
      rentCosts: acc.rentCosts + curr.rentCosts,
      otherCosts: acc.otherCosts + curr.otherCosts,
      depreciation: acc.depreciation + curr.depreciation,
      financingCosts: acc.financingCosts + curr.financingCosts,
      bankBalance: curr.bankBalance, // Current state, not cumulative sum usually, but let's see
      hoursWorked: acc.hoursWorked + curr.hoursWorked,
      billableHours: acc.billableHours + curr.billableHours,
      taxRate: curr.taxRate, // Take last or average
    }), { ...EMPTY_METRICS });
  }

  /**
   * Calculates key performance indicators (KPIs) for a given set of metrics.
   */
  static calculateKPIs(metrics: BusinessMetrics) {
    const totalCosts = metrics.fixedCosts + metrics.variableCosts;
    const monthlyProfit = metrics.revenue - totalCosts;
    
    // Taxes
    const estimatedTax = monthlyProfit > 0 ? monthlyProfit * (metrics.taxRate / 100) : 0;
    const netProfit = monthlyProfit - estimatedTax;

    // Runway
    const runwayMonths = totalCosts > 0 ? metrics.bankBalance / totalCosts : 0;

    // Hourly
    const effectiveNetEarnings = metrics.hoursWorked > 0 ? netProfit / metrics.hoursWorked : 0;

    // Reserves
    const monthlyMinReserve = estimatedTax + (metrics.revenue * (metrics.revenueBufferPercent || 0) / 100);

    // Strategic Gap
    const targetNet = metrics.targetNetIncome || 0;
    const grossTarget = metrics.taxRate < 100 ? targetNet / (1 - metrics.taxRate / 100) : targetNet;
    const requiredRevenue = grossTarget + totalCosts;
    const invisibleLoss = Math.max(0, requiredRevenue - metrics.revenue);

    // Break Even
    const breakEvenProgress = Math.min(100, totalCosts > 0 ? (metrics.revenue / totalCosts) * 100 : 0);

    // Benchmarking Scores
    const liquidityScore = Math.min(100, (runwayMonths / 6) * 100);
    const profitMargin = metrics.revenue > 0 ? (monthlyProfit / metrics.revenue) * 100 : 0;
    const profitabilityScore = Math.min(100, (profitMargin / 20) * 100);
    
    const actualBillableRate = metrics.billableHours > 0 ? metrics.revenue / metrics.billableHours : 0;
    const targetHourlyRate = metrics.billableHours > 0 ? requiredRevenue / metrics.billableHours : 0;
    const efficiencyScore = targetHourlyRate > 0 ? Math.min(100, (actualBillableRate / targetHourlyRate) * 100) : 0;

    const lossPenalty = metrics.revenue > 0 ? Math.min(100, (invisibleLoss / metrics.revenue) * 100) : (invisibleLoss > 0 ? 100 : 0);
    const healthScore = Math.round((liquidityScore + profitabilityScore + efficiencyScore + (100 - lossPenalty)) / 4);

    return {
      monthlyProfit,
      netProfit,
      runwayMonths,
      effectiveNetEarnings,
      monthlyMinReserve,
      invisibleLoss,
      breakEvenProgress,
      totalCosts,
      estimatedTax,
      liquidityScore,
      profitabilityScore,
      efficiencyScore,
      healthScore,
      actualBillableRate,
      targetHourlyRate,
      profitMargin
    };
  }

  static getIndustryBenchmarks(industry: string, employees: number = 0) {
    // Benchmarks basierend auf Branche und Unternehmensgröße
    const isSolo = employees === 0;
    
    switch (industry) {
      case 'CRAFT': // Handwerk
        return {
          targetRunway: 4,
          targetMargin: 12,
          targetEfficiency: 85,
          marketContext: isSolo ? "Solo-Handwerker" : `Handwerksbetrieb (${employees} MA)`
        };
      case 'TRADE': // Handel
        return {
          targetRunway: 3,
          targetMargin: 8,
          targetEfficiency: 90,
          marketContext: isSolo ? "Einzelhandel" : `Groß-/Handelsunternehmen (${employees} MA)`
        };
      case 'SERVICE_ONLINE': // Agenturen, SaaS, Online
        return {
          targetRunway: 6,
          targetMargin: 25,
          targetEfficiency: 75,
          marketContext: isSolo ? "Digitaler Freelancer" : `Digital-Agentur (${employees} MA)`
        };
      case 'SERVICE_OFFLINE': // Beratung, Therapie, etc.
      default:
        return {
          targetRunway: 5,
          targetMargin: 20,
          targetEfficiency: 80,
          marketContext: isSolo ? "Einzelberater" : `Beratungsunternehmen (${employees} MA)`
        };
    }
  }

  static getMarketInsight(type: 'liquidity' | 'profitability' | 'efficiency', value: number, industry: string, employees: number = 0) {
    const benchmarks = this.getIndustryBenchmarks(industry, employees);
    
    if (type === 'liquidity') {
      const target = benchmarks.targetRunway;
      if (value < target * 0.5) return { text: `Kritisch: Unter ${benchmarks.marketContext} Durchschnitt`, color: "text-rose-500" };
      if (value < target) return { text: `Solider Durchschnitt für ${benchmarks.marketContext}`, color: "text-amber-500" };
      return { text: `Exzellent! Top 10% in der Branche ${industry}`, color: "text-emerald-500" };
    }
    if (type === 'profitability') {
      const target = benchmarks.targetMargin;
      if (value < target * 0.5) return { text: `Rendite unter Branchenschnitt (${target}%)`, color: "text-rose-500" };
      if (value < target) return { text: `Guter Durchschnitt für ${benchmarks.marketContext}`, color: "text-amber-500" };
      return { text: `Herausragend! Top Rendite für ${industry}`, color: "text-emerald-500" };
    }
    if (type === 'efficiency') {
      const target = benchmarks.targetEfficiency;
      if (value < target * 0.7) return { text: `Effizienz unter Branchenschnitt`, color: "text-rose-500" };
      if (value < target) return { text: `Gehobener Durchschnitt`, color: "text-amber-500" };
      return { text: `Elite: Top 5% Effizienz-Niveau`, color: "text-emerald-500" };
    }
    return { text: "", color: "" };
  }

  /**
   * Projects liquidity over 12 months based on seasonality and tax rhythm.
   */
  static projectLiquidity(
    base: BusinessMetrics, 
    params: SimulationParams, 
    subProjects: SubProject[],
    bankBalance: number
  ): { month: string; liquidity: number; profit: number }[] {
    const projection = [];
    let currentBalance = bankBalance;
    const months = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    
    for (let i = 0; i < 12; i++) {
      const simulatedMonth = this.simulateMonth(base, params, subProjects, i);
      const kpis = this.calculateKPIs(simulatedMonth);
      
      // Use cash-relevant profit (EBITDA approx, but here we just subtract non-cash depreciation)
      const cashFlow = simulatedMonth.revenue - (simulatedMonth.fixedCosts + simulatedMonth.variableCosts - simulatedMonth.depreciation) - kpis.estimatedTax;
      
      currentBalance += cashFlow;
      
      projection.push({
        month: months[i],
        liquidity: currentBalance,
        profit: kpis.monthlyProfit
      });
    }

    return projection;
  }
}

const EMPTY_METRICS: BusinessMetrics = {
  revenue: 0,
  fixedCosts: 0,
  variableCosts: 0,
  personnelCosts: 0,
  marketingCosts: 0,
  rentCosts: 0,
  otherCosts: 0,
  depreciation: 0,
  financingCosts: 0,
  bankBalance: 0,
  hoursWorked: 0,
  billableHours: 0,
  taxRate: 0,
};

import { SubProject } from '../core/types';


