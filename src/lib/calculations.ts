import { AssessmentInput, Assumptions, CalculationResult } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
import { anaerobicSystems, calculateEligibility } from './eligibility';
import { calculateReadiness } from './readiness';
import { calculateComplianceBurden } from './compliance';
export function calculateMethane(input: AssessmentInput, a = defaultAssumptions): number {
  if (input.methaneInputType === 'tonnes') return input.methaneTonnes ?? 0;
  if (input.methaneInputType === 'm3') return (input.methaneM3 ?? 0) * a.methaneDensity / 1000;
  if (!anaerobicSystems.includes(input.manureSystem) || !input.farmType) return 0;
  const factor = input.farmType === 'Dairy' ? a.dairyFactor : a.pigFactor;
  return (input.animalCount ?? 0) * factor * (input.captureEfficiency / 100) / 1000;
}
export const calculateCO2e = (tonnes: number, a = defaultAssumptions) => tonnes * a.methaneGwp;
export const calculateACCUs = (co2e: number) => Math.floor(co2e);
export const calculateCarbonValue = (accus: number, price: number) => accus * price;
export const calculateFiveYearValue = (annualValue: number) => annualValue * 5;
export const calculateBreakEven = (implementationCost: number | undefined, complianceMidpoint: number, annualGrossValue: number): number | null => implementationCost === undefined || annualGrossValue <= 0 ? null : (implementationCost + complianceMidpoint) / annualGrossValue;
export function calculateAssessment(input: AssessmentInput, a: Assumptions = defaultAssumptions): CalculationResult {
  const methaneTonnes = calculateMethane(input, a), co2e = calculateCO2e(methaneTonnes, a), accus = calculateACCUs(co2e), annualValue = calculateCarbonValue(accus, input.accuPrice);
  const eligibility = calculateEligibility(input), readiness = calculateReadiness(input), compliance = calculateComplianceBurden(input, a);
  const breakEvenYears = calculateBreakEven(input.implementationCost, compliance.midpoint, annualValue);
  let verdict = 'Project scale may support further assessment';
  if (eligibility.status !== 'LIKELY_ELIGIBLE') verdict = 'Confirm eligibility before assessing the opportunity';
  else if (annualValue <= 0 || (breakEvenYears !== null && breakEvenYears > (input.projectLifetimeYears ?? 5))) verdict = 'Compliance costs may outweigh expected carbon revenue';
  else if (breakEvenYears !== null && breakEvenYears <= 5) verdict = 'Potentially worth investigating';
  const nextSteps = readiness.checklist.filter(item => item.status !== 'complete').map(item => item.nextStep);
  if (!nextSteps.length) nextSteps.push('Review your evidence and applicable method with a carbon advisor before relying on these estimates.');
  return { methaneTonnes, co2e, accus, annualValue, fiveYearValue: calculateFiveYearValue(annualValue), eligibility: eligibility.status, eligibilityReasons: eligibility.reasons, readiness: readiness.score, readinessLabel: readiness.label, burden: compliance.burden, complianceRange: compliance.range, complianceMidpoint: compliance.midpoint, breakEvenYears, verdict, checklist: readiness.checklist, nextSteps };
}
