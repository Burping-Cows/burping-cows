import { AssessmentInput, Assumptions, CalculationResult, TechnicalResult } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
import { calculateEligibility } from './eligibility';
import { calculateReadiness } from './readiness';
import { calculateFinance } from './finance';
import { calculateFlare } from './flare';
import { technicalSchema } from './validation';
export function calculateTechnical(i: AssessmentInput, a = defaultAssumptions): TechnicalResult {
  const required = ['periodMonths','biogasVolumeM3','methaneFraction','destructionEfficiency','flareOperationFraction','projectEmissionsTCO2e'] as const;
  const missing = required.filter(key => i[key] === undefined).map(String);
  const supported = i.proposedProject === 'Capture and flare methane' && ['Open flare','Enclosed flare'].includes(i.flareType) && ['Dairy','Piggery'].includes(i.farmType) && i.wasteStream === 'Liquid effluent';
  if (!supported) missing.push('supported capture-and-flare route');
  if (!technicalSchema.safeParse(i).success) missing.push('valid technical inputs');
  if (missing.length) return { status: 'incomplete', explanation: supported ? 'We can assess your project pathway, but need gas or engineering data before estimating potential abatement.' : 'Outside current calculation scope. Specialist assessment required.', missing, breakdown: null, annualNetAbatement: null, annualWholeUnits: null };
  // Volume represents captured biogas over the stated period. Operation is applied once,
  // then composition and destruction efficiency are applied once by the pure flare engine.
  const breakdown = calculateFlare({ biogasVolumeM3: i.biogasVolumeM3! * i.flareOperationFraction!, methaneFraction: i.methaneFraction!, destructionEfficiency: i.destructionEfficiency!, projectEmissionsTCO2e: i.projectEmissionsTCO2e! }, a);
  const annualNetAbatement = breakdown.netAbatementTCO2e * 12 / i.periodMonths!;
  const measured = [i.biogasSource,i.methaneSource,i.destructionSource,i.operationSource,i.emissionsSource].every(s => s === 'measurement');
  return { status: measured ? 'measured_unverified' : 'projected', explanation: measured ? 'Measured inputs; independent review and methodology compliance have not been verified.' : 'Based on supplied estimates and disclosed planning assumptions; not verified abatement.', missing: [], breakdown, annualNetAbatement, annualWholeUnits: Math.floor(annualNetAbatement) };
}
export function calculateAssessment(input: AssessmentInput, a: Assumptions = defaultAssumptions): CalculationResult {
  const eligibility = calculateEligibility(input), technical = calculateTechnical(input, a);
  const finance = calculateFinance(input, technical.annualNetAbatement);
  const extraTasks: import('../types/assessment').ActionTask[] = [];
  if (finance.state === 'insufficient_data') extraTasks.push({ id: 'finance', phase: 'explore', title: 'Complete the financial scenario', reason: 'Missing costs or benefits must not be assumed to be zero.', evidenceRequired: 'CAPEX, setup, operations, compliance, fees, energy benefits, horizon and discount rate.', priority: 'medium', status: 'incomplete' });
  const readiness = calculateReadiness(input, eligibility.rules, extraTasks);
  return { eligibility: eligibility.status, eligibilityRules: eligibility.rules, preparation: readiness.preparation, technical, finance, actionPlan: readiness.tasks };
}
export function updateAssessmentInput(current: AssessmentInput, values: Partial<AssessmentInput>): AssessmentInput {
  if (values.proposedProject !== undefined && values.proposedProject !== current.proposedProject) {
    // Clear route-dependent gas/financial assumptions; returning to flare cannot revive discarded values.
    const reset = { periodMonths: undefined, projectLifetimeYears: undefined, discountRate: undefined, biogasSource: 'user' as const, methaneSource: 'user' as const, destructionSource: 'user' as const, operationSource: 'user' as const, emissionsSource: 'user' as const, biogasVolumeM3: undefined, methaneFraction: undefined, destructionEfficiency: undefined, flareOperationFraction: undefined, projectEmissionsTCO2e: undefined, flareType: '' as const, implementationCost: undefined, developmentCost: undefined, annualOperatingCost: undefined, annualComplianceCost: undefined, annualEnergySavings: undefined, otherRevenue: undefined, annualFees: undefined };
    return { ...current, ...values, ...reset };
  }
  return { ...current, ...values };
}
