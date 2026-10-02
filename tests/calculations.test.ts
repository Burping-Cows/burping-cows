import { describe, expect, it } from 'vitest';
import { calculateACCUs, calculateAssessment, calculateBreakEven, calculateCO2e, calculateMethane } from '../src/lib/calculations';
import { calculateEligibility } from '../src/lib/eligibility';
import { calculateReadiness } from '../src/lib/readiness';
import { calculateComplianceBurden } from '../src/lib/compliance';
import { demoInput } from '../src/lib/demo';
import { defaultAssumptions } from '../src/config/assumptions';
describe('methane and financial calculations', () => {
  it('reproduces the reference demo without double applying efficiency', () => {
    const r = calculateAssessment(demoInput);
    expect(r).toMatchObject({ methaneTonnes: 82, co2e: 2296, accus: 2296, annualValue: 84952, fiveYearValue: 424760, readiness: 60, burden: 'Medium', eligibility: 'LIKELY_ELIGIBLE', verdict: 'Potentially worth investigating' });
    expect(r.breakEvenYears).toBeCloseTo(275000 / 84952);
  });
  it('converts methane volume to tonnes before GWP', () => { const tonnes = calculateMethane({ ...demoInput, methaneInputType: 'm3', methaneM3: 1000 }); expect(tonnes).toBeCloseTo(0.716); expect(calculateCO2e(tonnes)).toBeCloseTo(20.048); });
  it.each([['Dairy', 25], ['Piggery', 12]] as const)('applies effluent factor and efficiency for %s', (farmType, factor) => { expect(calculateMethane({ ...demoInput, farmType, animalCount: 100, methaneInputType: 'estimator', captureEfficiency: 80 })).toBeCloseTo(100 * factor * .8 / 1000); });
  it('does not estimate methane for aerobic systems', () => { expect(calculateMethane({ ...demoInput, manureSystem: 'Aerobic pond', methaneInputType: 'estimator' })).toBe(0); });
  it('rounds ACCUs down', () => expect(calculateACCUs(2296.99)).toBe(2296));
  it('updates all price-dependent values', () => { const r = calculateAssessment({ ...demoInput, accuPrice: 50 }); expect(r.annualValue).toBe(114800); expect(r.fiveYearValue).toBe(574000); expect(r.breakEvenYears).toBeCloseTo(275000 / 114800); });
  it('does not represent operating costs as net profit', () => { expect(calculateAssessment({ ...demoInput, annualOperatingCost: 999999 }).breakEvenYears).toBe(calculateAssessment(demoInput).breakEvenYears); });
  it('returns no payback for zero revenue or unknown implementation cost', () => { expect(calculateBreakEven(100, 50, 0)).toBeNull(); expect(calculateBreakEven(undefined, 50, 100)).toBeNull(); });
  it('flags gross payback beyond the supplied lifetime', () => { expect(calculateAssessment({ ...demoInput, projectLifetimeYears: 1 }).verdict).toBe('Compliance costs may outweigh expected carbon revenue'); });
  it('uses custom assumptions consistently', () => { const r = calculateAssessment(demoInput, { ...defaultAssumptions, methaneGwp: 30 }); expect(r.co2e).toBe(2460); expect(r.annualValue).toBe(91020); });
});
describe('transparent eligibility', () => {
  it('treats planning only as not started', () => expect(calculateEligibility({ ...demoInput, projectStartedStatus: 'Planning only' }).status).toBe('LIKELY_ELIGIBLE'));
  it('flags already started projects', () => { const r = calculateEligibility({ ...demoInput, projectStartedStatus: 'Yes' }); expect(r.status).toBe('POSSIBLY_ELIGIBLE'); expect(r.reasons.join(' ')).toContain('timing'); });
  it.each(['Aerobic pond', 'Dry manure storage', 'Composting'] as const)('rejects the unsupported baseline %s', manureSystem => expect(calculateEligibility({ ...demoInput, manureSystem }).status).toBe('UNLIKELY_ELIGIBLE'));
  it('lets unsupported evidence take precedence over timing uncertainty', () => expect(calculateEligibility({ ...demoInput, projectStartedStatus: 'Yes', siteControl: 'No' }).status).toBe('UNLIKELY_ELIGIBLE'));
  it.each(['Covered lagoon', 'Anaerobic digester', 'Other', 'Unsure'] as const)('requires review for %s', manureSystem => expect(calculateEligibility({ ...demoInput, manureSystem }).status).toBe('POSSIBLY_ELIGIBLE'));
  it('requires review for missing information or uncertain site control', () => { expect(calculateEligibility({ ...demoInput, farmType: '' }).status).toBe('POSSIBLY_ELIGIBLE'); expect(calculateEligibility({ ...demoInput, siteControl: 'Unsure' }).status).toBe('POSSIBLY_ELIGIBLE'); });
});
describe('readiness and compliance', () => {
  it('awards energy records once, even with both evidence types', () => { expect(calculateReadiness(demoInput).score).toBe(60); expect(calculateReadiness({ ...demoInput, monitoringEquipment: ['Fuel records'] }).score).toBe(60); });
  it('requires both QA plan and calibration records for the QA weight', () => { expect(calculateReadiness({ ...demoInput, qaPlan: true }).score).toBe(60); expect(calculateReadiness({ ...demoInput, qaPlan: true, calibrationRecords: true }).score).toBe(70); });
  it('scores full preparation without claiming certification', () => { const input = { ...demoInput, qaPlan: true, calibrationRecords: true, monitoringEquipment: ['Biogas flow meter', 'Gas analyser', 'Fuel records'] }; expect(calculateReadiness(input)).toMatchObject({ score: 100, label: 'Strongly prepared' }); expect(calculateComplianceBurden(input)).toMatchObject({ burden: 'Low', midpoint: 55000 }); });
  it('does not award unknown site control', () => expect(calculateReadiness({ ...demoInput, siteControl: 'Unsure' }).checklist.find(item => item.id === 'site')?.status).toBe('needs review'));
  it('makes no monitoring and no records high burden', () => expect(calculateComplianceBurden({ ...demoInput, monitoringEquipment: ['None'], monitoringMaturity: 'None' }).burden).toBe('High'));
  it('makes started and biomethane projects high burden', () => { expect(calculateComplianceBurden({ ...demoInput, projectStartedStatus: 'Yes' }).burden).toBe('High'); expect(calculateComplianceBurden({ ...demoInput, proposedProject: 'Capture methane for biomethane' }).burden).toBe('High'); });
  it('generates next steps for actual missing evidence', () => { const steps = calculateAssessment(demoInput).nextSteps.join(' '); expect(steps).toContain('flow monitoring'); expect(steps).toContain('gas concentration'); expect(steps).toContain('calibration'); expect(steps).not.toContain('Confirm and document control'); });
});
