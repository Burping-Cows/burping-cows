import type { Assumptions } from '../types/assessment';
export const METHOD_ASSUMPTIONS = { methaneDensityTonnesPerM3: 0.0006784, methaneGwp: 28, methaneConversionTco2ePerM3: 0.0189952, defaultMethaneFraction: { dairy: .60, piggery: .70, other: .50 }, defaultDestructionEfficiency: .98 };
export const MARKET_ASSUMPTIONS = { demoAccuPrice: 37, low: 32, high: 42 };
const version = 'flare-planning-2 / 2026-10-03';
export const defaultAssumptions: Assumptions = {
  version, methaneDensityTonnesPerM3: METHOD_ASSUMPTIONS.methaneDensityTonnesPerM3, methaneGwp: METHOD_ASSUMPTIONS.methaneGwp, defaultAccuPrice: MARKET_ASSUMPTIONS.demoAccuPrice,
  methodologyNote: 'Preliminary capture-and-flare planning calculation. Not a complete CER method calculation: baseline, leakage and official reporting requirements need specialist review.',
  constants: {
    density: { value: METHOD_ASSUMPTIONS.methaneDensityTonnesPerM3, unit: 't CH₄/m³ at NGER standard conditions', sourceLabel: 'NGER standard-condition methane density', version, isDemo: false, sourceUrl: 'https://www.dcceew.gov.au/sites/default/files/documents/national-inventory-report-2022-volume-1.pdf' },
    gwp: { value: METHOD_ASSUMPTIONS.methaneGwp, unit: 't CO₂-e/t CH₄', sourceLabel: 'CH₄ GWP planning conversion', version, isDemo: false },
    methane: { value: METHOD_ASSUMPTIONS.defaultMethaneFraction.dairy, unit: 'fraction', sourceLabel: 'Dairy demonstration planning default; verify gas composition', version, isDemo: true },
    piggeryMethane: { value: METHOD_ASSUMPTIONS.defaultMethaneFraction.piggery, unit: 'fraction', sourceLabel: 'Piggery demonstration planning default; verify gas composition', version, isDemo: true },
    otherMethane: { value: METHOD_ASSUMPTIONS.defaultMethaneFraction.other, unit: 'fraction', sourceLabel: 'Other-farm demonstration default; route outside MVP', version, isDemo: true },
    conversion: { value: METHOD_ASSUMPTIONS.methaneConversionTco2ePerM3, unit: 't CO₂-e/m³ CH₄', sourceLabel: 'Density multiplied by GWP', version, isDemo: false },
    lowPrice: { value: MARKET_ASSUMPTIONS.low, unit: 'AUD/ACCU', sourceLabel: 'Low demo market assumption', version, isDemo: true },
    highPrice: { value: MARKET_ASSUMPTIONS.high, unit: 'AUD/ACCU', sourceLabel: 'High demo market assumption', version, isDemo: true },
    destruction: { value: METHOD_ASSUMPTIONS.defaultDestructionEfficiency, unit: 'fraction', sourceLabel: 'Demonstration planning default; verify device requirements', version, isDemo: true },
    price: { value: MARKET_ASSUMPTIONS.demoAccuPrice, unit: 'AUD/ACCU', sourceLabel: 'Demo market assumption; no live market feed', version, isDemo: true },
  },
};
export const FINANCIAL_ASSUMPTIONS = 'Steady annual operation; constant prices and costs; no tax, financing, inflation or residual asset value; immediate annual ACCU sale; cash flows at year end. A planning scenario, not a revenue forecast.';
export const DISCLAIMER = 'Burping Cows provides preliminary decision support only. Results are indicative and do not constitute Clean Energy Regulator approval, professional advice, audit verification or a guarantee of Australian Carbon Credit Units.';
