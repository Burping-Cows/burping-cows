export const farmTypes = ['Dairy', 'Piggery'] as const;
export const states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const;
export const manureSystems = ['Anaerobic effluent pond', 'Aerobic pond', 'Covered lagoon', 'Anaerobic digester', 'Dry manure storage', 'Composting', 'Other', 'Unsure'] as const;
export const projects = ['Cover existing anaerobic pond', 'Install anaerobic digester', 'Capture and flare methane', 'Capture methane for electricity', 'Capture methane for biomethane', 'Improve effluent treatment', 'Other'] as const;
export const equipmentOptions = ['Biogas flow meter', 'Gas analyser', 'Electricity meter', 'Fuel records', 'Laboratory testing', 'None', 'Unsure'] as const;
export type Eligibility = 'LIKELY_ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'UNLIKELY_ELIGIBLE';
export type Burden = 'Low' | 'Medium' | 'High';
export interface AssessmentInput {
  farmType: '' | typeof farmTypes[number]; animalCount?: number; state: '' | typeof states[number];
  manureSystem: '' | typeof manureSystems[number]; projectStartedStatus: '' | 'No' | 'Planning only' | 'Yes';
  siteControl: '' | 'Yes' | 'No' | 'Unsure'; monitoringEquipment: string[];
  proposedProject: '' | typeof projects[number]; methaneInputType: 'tonnes' | 'm3' | 'estimator';
  methaneTonnes?: number; methaneM3?: number; captureEfficiency: number;
  implementationCost?: number; annualOperatingCost?: number; projectLifetimeYears?: number;
  monitoringMaturity: 'None' | 'Basic records' | 'Some sensors' | 'Comprehensive monitoring';
  calibrationRecords: boolean; qaPlan: boolean; accuPrice: number;
}
export interface ChecklistItem { id: string; title: string; detail: string; status: 'complete' | 'incomplete' | 'needs review'; weight: number; nextStep: string }
export interface CalculationResult {
  methaneTonnes: number; co2e: number; accus: number; annualValue: number; fiveYearValue: number;
  eligibility: Eligibility; eligibilityReasons: string[]; readiness: number; readinessLabel: string;
  burden: Burden; complianceRange: [number, number]; complianceMidpoint: number;
  breakEvenYears: number | null; verdict: string; checklist: ChecklistItem[]; nextSteps: string[];
}
export interface Assumptions {
  version: string; methaneGwp: number; methaneDensity: number; defaultAccuPrice: number;
  dairyFactor: number; pigFactor: number; methodologyNote: string;
  complianceRanges: Record<Burden, [number, number]>;
}
export interface SavedAssessment { id: string; createdAt: string; updatedAt: string; input: AssessmentInput; result: CalculationResult; assumptions: Assumptions; snapshotVersion: number; sample?: boolean }
export const emptyInput: AssessmentInput = {
  farmType: '', state: '', manureSystem: '', projectStartedStatus: '', siteControl: '', monitoringEquipment: [],
  proposedProject: '', methaneInputType: 'estimator', captureEfficiency: 75, monitoringMaturity: 'None',
  calibrationRecords: false, qaPlan: false, accuPrice: 37,
};
