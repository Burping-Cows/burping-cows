import { expect, it } from 'vitest';
import { calculateAssessment, updateAssessmentInput } from '../src/lib/calculations';
import { calculateEligibility } from '../src/lib/eligibility';
import { calculateFinance, annualNPV } from '../src/lib/finance';
import { demoInput } from '../src/lib/demo';
import { emptyInput } from '../src/types/assessment';
it('reproduces the deterministic technical and financial demo using unrounded equivalent', () => {
  const r = calculateAssessment(demoInput);
  expect(r.technical.annualNetAbatement).toBeCloseTo(1096.91776,8); expect(r.technical.annualWholeUnits).toBe(1096);
  expect(r.finance.base!.grossCarbonValue).toBeCloseTo(38392.1216,6); expect(r.finance.base!.operatingCash).toBeCloseTo(23392.1216,6);
  expect(r.finance.base!.simplePayback).toBeCloseTo(6.4124,3); expect(r.finance.base!.npv).toBeCloseTo(50224,0);
  expect(r.eligibility).toBe('likely_compatible'); expect(r.technical.status).toBe('projected');
});
it('unknown gas preserves screening and produces tasks, not zero credits', () => {
  const r = calculateAssessment({ ...demoInput, biogasVolumeM3: undefined });
  expect(r.eligibility).toBe('likely_compatible'); expect(r.technical.status).toBe('incomplete'); expect(r.technical.annualWholeUnits).toBeNull(); expect(r.finance.state).toBe('insufficient_data');
  expect(r.actionPlan.find(t => t.id === 'gas')?.status).toBe('incomplete');
});
it('never derives credits from animal count alone', () => { const r = calculateAssessment({ ...emptyInput, farmType: 'Dairy', animalCount: 10000 }); expect(r.technical.annualNetAbatement).toBeNull(); });
it('requires operation and emissions assumptions rather than inventing 100% or zero', () => { for (const key of ['flareOperationFraction','projectEmissionsTCO2e'] as const) expect(calculateAssessment({ ...demoInput, [key]: undefined }).technical.status).toBe('incomplete'); });
it('applies flare operation and destruction once and annualises consistently', () => {
  const r = calculateAssessment({ ...demoInput, flareOperationFraction: .5, periodMonths: 6 });
  expect(r.technical.breakdown!.methaneDestroyedM3).toBeCloseTo(29400);
  expect(r.technical.annualNetAbatement).toBeCloseTo((558.45888-20)*2);
});
it('unknown rights are unresolved while explicitly absent rights are a route issue', () => {
  expect(calculateEligibility({ ...demoInput, accuRights: 'unknown' }).status).toBe('needs_review');
  expect(calculateEligibility({ ...demoInput, accuRights: 'no' }).status).toBe('incompatible_selected_route');
});
it('government grants and implementation activity trigger review, not automatic rejection', () => {
  expect(calculateEligibility({ ...demoInput, governmentFunding: 'yes', projectStage: 'Equipment purchased' }).status).toBe('needs_review');
  const tasks = calculateAssessment({ ...demoInput, projectStage: 'Construction started' }).actionPlan;
  expect(tasks.find(t => t.id === 'timing')?.status).toBe('needs_review');
});
it('outside-MVP is separate from barriers and never emits a fake calculation', () => {
  const r = calculateAssessment({ ...demoInput, proposedProject: 'Produce biomethane', siteControl: 'no' });
  expect(r.eligibility).toBe('outside_mvp'); expect(r.technical.annualNetAbatement).toBeNull();
});
it('route changes clear discarded gas and costs even when switching back', () => {
  const changed = updateAssessmentInput(demoInput,{ proposedProject: 'Produce biomethane' });
  const back = updateAssessmentInput(changed,{ proposedProject: 'Capture and flare methane' });
  expect(back.biogasVolumeM3).toBeUndefined(); expect(back.implementationCost).toBeUndefined(); expect(calculateAssessment(back).technical.status).toBe('incomplete');
});
it('missing costs differ from explicit zero and never create a payback', () => {
  const t = calculateAssessment(demoInput).technical.annualNetAbatement;
  expect(calculateFinance({ ...demoInput, annualOperatingCost: undefined },t).state).toBe('insufficient_data');
  expect(calculateFinance({ ...demoInput, annualOperatingCost: 0 },t).base).not.toBeNull();
});
it('uses operating costs, fees and revenue in cash flow and payback', () => {
  const f = calculateAssessment({ ...demoInput, annualOperatingCost: 20000, annualFees: 1000, annualEnergySavings: 2000 }).finance;
  expect(f.base!.operatingCash).toBeCloseTo(38392.1216+2000-20000-5000-1000);
});
it('classifies finances independently of eligibility and preparation', () => {
  const r = calculateAssessment({ ...demoInput, siteControl: 'unknown', implementationCost: 10000000 });
  expect(r.eligibility).toBe('needs_review'); expect(r.finance.state).toBe('unfavorable'); expect(r.finance.base!.simplePayback).toBeGreaterThan(15);
});
it('distinguishes attractive, sensitive and unfavorable financial cases', () => {
  expect(calculateAssessment(demoInput).finance.state).toBe('potentially_attractive');
  expect(calculateAssessment({ ...demoInput, lowAccuPrice: 0 }).finance.state).toBe('sensitive_to_assumptions');
  const f = calculateAssessment({ ...demoInput, annualOperatingCost: 999999 }).finance;
  expect(f.state).toBe('unfavorable'); expect(f.base!.simplePayback).toBeNull();
});
it('NPV handles zero discount without division by zero', () => expect(annualNPV(100,10,15,0)).toBe(50));
it('measurement provenance does not claim independent verification', () => {
  const r = calculateAssessment({ ...demoInput, biogasSource: 'measurement', methaneSource: 'measurement', destructionSource: 'measurement', operationSource: 'measurement', emissionsSource: 'measurement' });
  expect(r.technical.status).toBe('measured_unverified');
});
it('unknown QA and calibration are not silently false or complete', () => {
  const r = calculateAssessment(demoInput);
  expect(r.actionPlan.find(t => t.id === 'qa')?.status).toBe('incomplete'); expect(r.preparation.phases).toHaveLength(3);
  expect(r.actionPlan.some(t => t.priority === 'high' && t.status !== 'complete')).toBe(true);
});
it('includes financial gaps in phase and overall preparation totals', () => {
  const r = calculateAssessment({ ...demoInput, developmentCost: undefined });
  expect(r.actionPlan.some(task => task.id === 'finance')).toBe(true);
  for (const phase of r.preparation.phases) {
    const tasks = r.actionPlan.filter(task => task.phase === phase.id);
    expect(phase.total).toBe(tasks.length);
    expect(phase.complete).toBe(tasks.filter(task => task.status === 'complete').length);
  }
  expect(r.preparation.progress).toBe(Math.round(r.actionPlan.filter(task => task.status === 'complete').length / r.actionPlan.length * 100));
});
it('does not calculate unsupported farms or selected other routes using leftover demo inputs', () => {
  expect(calculateAssessment({ ...demoInput, farmType: 'Other' }).technical.breakdown).toBeNull();
  const r = calculateAssessment({ ...demoInput, proposedProject: 'Other / unsure' });
  expect(r.eligibility).toBe('outside_mvp'); expect(r.technical.breakdown).toBeNull();
});
it('invalid market price does not become displayed negative carbon revenue', () => {
  const r = calculateAssessment({ ...demoInput, accuPrice: -10 });
  expect(r.finance.state).toBe('insufficient_data'); expect(r.finance.grossCarbonValue).toBeNull();
});
