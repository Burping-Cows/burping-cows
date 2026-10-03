import { AssessmentInput, SavedAssessment, emptyInput, YesNoUnknown } from '../types/assessment';
import { calculateAssessment } from './calculations';
import { defaultAssumptions } from '../config/assumptions';
export function normalizeInput(raw: Record<string, unknown>): AssessmentInput {
  if ('farmName' in raw) return { ...emptyInput, ...raw } as AssessmentInput;
  const answer = (v: unknown): YesNoUnknown => v === 'Yes' ? 'yes' : v === 'No' ? 'no' : 'unknown';
  return { ...emptyInput, farmName: '', farmType: raw.farmType ?? '', state: raw.state ?? '', animalCount: raw.animalCount, manureSystem: String(raw.manureSystem) === 'Anaerobic effluent pond' ? 'Anaerobic pond' : raw.manureSystem ?? '', baselineAnaerobic: String(raw.manureSystem) === 'Anaerobic effluent pond' ? 'yes' : 'unknown', proposedProject: raw.proposedProject === 'Capture and flare methane' ? 'Capture and flare methane' : 'Other / unsure', projectStage: raw.projectStartedStatus === 'No' ? 'Just exploring' : raw.projectStartedStatus === 'Planning only' ? 'Planning / obtaining quotes' : 'Unsure', siteControl: answer(raw.siteControl), monitoringEquipment: raw.monitoringEquipment ?? [], implementationCost: raw.implementationCost, annualOperatingCost: raw.annualOperatingCost, accuPrice: raw.accuPrice ?? defaultAssumptions.defaultAccuPrice, projectLifetimeYears: raw.projectLifetimeYears, calibrationRecords: raw.calibrationRecords === true ? 'yes' : 'unknown', qaPlan: raw.qaPlan === true ? 'yes' : 'unknown' } as AssessmentInput;
}
export function normalizeSnapshot(raw: SavedAssessment): SavedAssessment {
  if (raw.snapshotVersion === 2) return raw;
  const input = normalizeInput(raw.input as unknown as Record<string, unknown>);
  return { ...raw, input, result: calculateAssessment(input), assumptions: defaultAssumptions, legacySnapshot: raw, snapshotVersion: 2 };
}
export const draftRoute = (step: number) => (['/assessment/farm-profile','/assessment/project','/assessment/screening','/assessment/technical','/assessment/finance','/assessment/results','/assessment/action-plan'] as const)[Math.max(0,Math.min(step-1,6))];
