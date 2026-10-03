import { AssessmentInput, FinancialResult, FinancialScenario } from '../types/assessment';
import { financeSchema, priceSchema } from './validation';
export const viabilityLabel = { insufficient_data: 'Not assessed', potentially_attractive: 'Potentially attractive', sensitive_to_assumptions: 'Sensitive to assumptions', unfavorable: 'Stronger economic case needed' };
export function annualNPV(investment: number, operatingCash: number, years: number, discountRate: number): number {
  let value = -investment;
  for (let year = 1; year <= years; year++) value += operatingCash / (1 + discountRate) ** year;
  return value;
}
const required = ['implementationCost','developmentCost','annualOperatingCost','annualComplianceCost','annualEnergySavings','otherRevenue','annualFees','projectLifetimeYears','discountRate'] as const;
export function calculateFinance(i: AssessmentInput, annualEquivalent: number | null): FinancialResult {
  const missing = required.filter(key => i[key] === undefined).map(String);
  const valid = financeSchema.safeParse(i).success;
  if (annualEquivalent === null || !Number.isFinite(annualEquivalent) || annualEquivalent < 0) missing.unshift('valid annual abatement');
  if (!valid) missing.push('valid financial assumptions');
  const grossCarbonValue = annualEquivalent === null || !Number.isFinite(annualEquivalent) || annualEquivalent < 0 || !priceSchema.safeParse(i.accuPrice).success ? null : annualEquivalent * i.accuPrice;
  if (missing.length) return { state: 'insufficient_data', explanation: 'Add project cost information to assess financial viability.', missing, grossCarbonValue, base: null, low: null, high: null };
  const investment = i.implementationCost! + i.developmentCost!;
  const scenario = (price: number): FinancialScenario => {
    const gross = annualEquivalent! * price;
    const operatingCash = gross + i.annualEnergySavings! + i.otherRevenue! - i.annualOperatingCost! - i.annualComplianceCost! - i.annualFees!;
    return { price, grossCarbonValue: gross, operatingCash, simplePayback: operatingCash > 0 ? investment / operatingCash : null, npv: annualNPV(investment, operatingCash, i.projectLifetimeYears!, i.discountRate!) };
  };
  const base = scenario(i.accuPrice), low = scenario(i.lowAccuPrice), high = scenario(i.highAccuPrice);
  const state = base.npv <= 0 || base.operatingCash <= 0 ? 'unfavorable' : low.npv < 0 ? 'sensitive_to_assumptions' : 'potentially_attractive';
  const explanation = state === 'unfavorable' ? 'Current assumptions indicate the project may require a stronger economic case.' : state === 'sensitive_to_assumptions' ? 'Potentially viable, but highly sensitive to assumptions.' : 'Potentially worth further investigation.';
  return { state, explanation, missing: [], grossCarbonValue, base, low, high };
}
