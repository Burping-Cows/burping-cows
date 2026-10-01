import { Assumptions } from '../types/assessment';
export const METHANE_GWP = 28;
export const DEFAULT_ACCU_PRICE = 37;
// These factors are simplified demonstration assumptions and are NOT official Clean Energy Regulator methodology values.
export const defaultAssumptions: Assumptions = {
  version: 'demo-1', methaneGwp: METHANE_GWP, methaneDensity: 0.716, defaultAccuPrice: DEFAULT_ACCU_PRICE,
  dairyFactor: 25, pigFactor: 12,
  methodologyNote: 'Simplified demonstration assumptions. Not official Clean Energy Regulator methodology values.',
  complianceRanges: { Low: [40000, 70000], Medium: [70000, 120000], High: [120000, 200000] },
};
