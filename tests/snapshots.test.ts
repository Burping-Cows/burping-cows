import { expect, it } from 'vitest';
import { normalizeSnapshot, draftRoute } from '../src/lib/snapshots';
import { SavedAssessment } from '../src/types/assessment';
import { demoInput } from '../src/lib/demo';
import { calculateAssessment } from '../src/lib/calculations';
import { defaultAssumptions } from '../src/config/assumptions';
it('archives legacy estimates without presenting them as new biogas calculations', () => {
  const legacy = { id: 'old', snapshotVersion: 1, input: { farmType: 'Dairy', animalCount: 450, state: 'VIC', manureSystem: 'Anaerobic effluent pond', proposedProject: 'Capture and flare methane', methaneInputType: 'estimator', methaneTonnes: 82, calibrationRecords: true, qaPlan: false }, result: { estimatedAccus: 2296 }, assumptions: { methaneDensityKgPerM3: .716 } };
  const upgraded = normalizeSnapshot(legacy as unknown as SavedAssessment);
  expect(upgraded.legacySnapshot).toEqual(legacy);
  expect(upgraded.input.biogasVolumeM3).toBeUndefined();
  expect(upgraded.result.technical.annualNetAbatement).toBeNull();
  expect(upgraded.input.calibrationRecords).toBe('yes');
  expect(upgraded.input.qaPlan).toBe('unknown');
  expect(legacy.snapshotVersion).toBe(1);
});
it('keeps saved version-two outputs and assumptions without recalculation', () => {
  const snapshot: SavedAssessment = { id: 'new', createdAt: '', updatedAt: '', snapshotVersion: 2, input: demoInput, assumptions: { ...defaultAssumptions, defaultAccuPrice: 1 }, result: calculateAssessment(demoInput) };
  expect(normalizeSnapshot(snapshot)).toBe(snapshot);
  expect(normalizeSnapshot(snapshot).result.finance.grossCarbonValue).toBeCloseTo(38392.1216);
});
it('resumes all assessment steps and bounds invalid step indices', () => {
  expect([1,2,3,4,5,6,7].map(draftRoute)).toEqual(['/assessment/farm-profile','/assessment/project','/assessment/screening','/assessment/technical','/assessment/finance','/assessment/results','/assessment/action-plan']);
  expect(draftRoute(0)).toBe('/assessment/farm-profile'); expect(draftRoute(99)).toBe('/assessment/action-plan');
});
