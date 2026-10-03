import { MARKET_ASSUMPTIONS } from '../config/assumptions';
export const farmTypes = ['Dairy', 'Piggery', 'Other', 'Unsure'] as const;
export const states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT', 'Unsure'] as const;
export const manureSystems = ['Anaerobic pond', 'Aerobic pond', 'Covered lagoon', 'Anaerobic digester', 'Dry manure storage', 'Composting', 'Other', 'Unsure'] as const;
export const projects = ['Capture and flare methane', 'Capture methane and generate electricity', 'Separate solids and treat aerobically', 'Produce biomethane', 'Other / unsure'] as const;
export const projectStages = ['Just exploring', 'Planning / obtaining quotes', 'Contracts signed', 'Equipment purchased', 'Construction started', 'Pilot operating', 'Fully operating', 'Unsure'] as const;
export const evidenceOptions = ['Historical records available', 'New / expanded facility evidence available', 'No evidence yet', 'Unsure'] as const;
export const equipmentOptions = ['Biogas flow meter', 'Gas analyser', 'Electricity meter', 'Fuel records', 'Laboratory testing', 'None', 'Unsure'] as const;
export const inputSources = ['user', 'engineering_estimate', 'measurement', 'method_default', 'demo'] as const;
export type InputSource = typeof inputSources[number];
export type YesNoUnknown = 'yes' | 'no' | 'unknown';
export type Eligibility = 'likely_compatible' | 'needs_review' | 'incompatible_selected_route' | 'outside_mvp';
export type RuleState = 'satisfied' | 'unresolved' | 'barrier' | 'not_applicable';
export type Phase = 'explore' | 'before_application' | 'before_first_report';
export type Viability = 'insufficient_data' | 'potentially_attractive' | 'sensitive_to_assumptions' | 'unfavorable';
export type CalculationStatus = 'incomplete' | 'projected' | 'measured_unverified' | 'reviewed';
export interface AssessmentInput {
  farmName: string; farmType: '' | typeof farmTypes[number]; state: '' | typeof states[number]; postcode: string; animalCount?: number;
  wasteStream: 'Liquid effluent' | 'Solid manure' | 'Other' | 'Unsure' | ''; manureSystem: '' | typeof manureSystems[number]; baselineAnaerobic: YesNoUnknown; baselineEvidence: '' | typeof evidenceOptions[number];
  proposedProject: '' | typeof projects[number]; projectStage: '' | typeof projectStages[number]; implementationDate: string; flareType: 'Open flare' | 'Enclosed flare' | 'Unsure' | '';
  legallyRequired: YesNoUnknown; normalBusinessPractice: YesNoUnknown; siteControl: YesNoUnknown; accuRights: YesNoUnknown; governmentFunding: YesNoUnknown;
  fundingProgram: string; fundingAmount?: number; fundingActivity: string;
  periodMonths?: number; biogasVolumeM3?: number; methaneFraction?: number; destructionEfficiency?: number; flareOperationFraction?: number; projectEmissionsTCO2e?: number;
  biogasSource: InputSource; methaneSource: InputSource; destructionSource: InputSource; operationSource: InputSource; emissionsSource: InputSource;
  implementationCost?: number; developmentCost?: number; annualOperatingCost?: number; annualComplianceCost?: number; annualEnergySavings?: number; otherRevenue?: number; annualFees?: number;
  projectLifetimeYears?: number; discountRate?: number; accuPrice: number; lowAccuPrice: number; highAccuPrice: number;
  monitoringEquipment: string[]; calibrationRecords: YesNoUnknown; qaPlan: YesNoUnknown; permits: YesNoUnknown; facilityDescription: YesNoUnknown; operationalRecords: YesNoUnknown; energyRecords: YesNoUnknown; auditPreparation: YesNoUnknown;
}
export interface EligibilityRule { id: string; state: RuleState; title: string; explanation: string; inputReferences: (keyof AssessmentInput)[]; nextAction: string }
export interface ActionTask { id: string; phase: Phase; title: string; reason: string; evidenceRequired: string; status: 'complete' | 'incomplete' | 'needs_review'; priority: 'high' | 'medium' }
export interface PreparationResult { phase: 'exploring' | 'evidence_needed' | 'application_preparation' | 'reporting_preparation'; progress: number; phases: { id: Phase; title: string; complete: number; total: number; progress: number }[] }
export interface FlareResult { biogasVolumeM3: number; methaneDestroyedM3: number; methaneMassTonnes: number; grossAbatementTCO2e: number; projectEmissionsTCO2e: number; rawNetAbatementTCO2e: number; netAbatementTCO2e: number; indicativeAccuEquivalent: number; wholePlanningUnits: number }
export interface TechnicalResult { status: CalculationStatus; explanation: string; missing: string[]; breakdown: FlareResult | null; annualNetAbatement: number | null; annualWholeUnits: number | null }
export interface FinancialScenario { price: number; grossCarbonValue: number; operatingCash: number; simplePayback: number | null; npv: number }
export interface FinancialResult { state: Viability; explanation: string; missing: string[]; grossCarbonValue: number | null; base: FinancialScenario | null; low: FinancialScenario | null; high: FinancialScenario | null }
export interface CalculationResult { eligibility: Eligibility; eligibilityRules: EligibilityRule[]; preparation: PreparationResult; technical: TechnicalResult; finance: FinancialResult; actionPlan: ActionTask[] }
export interface Assumption { value: number; unit: string; sourceLabel: string; version: string; isDemo: boolean; sourceUrl?: string }
export interface Assumptions { version: string; methaneDensityTonnesPerM3: number; methaneGwp: number; defaultAccuPrice: number; methodologyNote: string; constants: Record<string, Assumption> }
export interface SavedAssessment { id: string; createdAt: string; updatedAt: string; input: AssessmentInput; result: CalculationResult; assumptions: Assumptions; snapshotVersion: number; sample?: boolean; legacySnapshot?: unknown }
export const emptyInput: AssessmentInput = {
  farmName: '', farmType: '', state: '', postcode: '', wasteStream: '', manureSystem: '', baselineAnaerobic: 'unknown', baselineEvidence: '', proposedProject: '', projectStage: '', implementationDate: '', flareType: '',
  legallyRequired: 'unknown', normalBusinessPractice: 'unknown', siteControl: 'unknown', accuRights: 'unknown', governmentFunding: 'unknown', fundingProgram: '', fundingActivity: '',
  biogasSource: 'user', methaneSource: 'user', destructionSource: 'user', operationSource: 'user', emissionsSource: 'user',
  accuPrice: MARKET_ASSUMPTIONS.demoAccuPrice, lowAccuPrice: MARKET_ASSUMPTIONS.low, highAccuPrice: MARKET_ASSUMPTIONS.high, monitoringEquipment: [], calibrationRecords: 'unknown', qaPlan: 'unknown', permits: 'unknown', facilityDescription: 'unknown', operationalRecords: 'unknown', energyRecords: 'unknown', auditPreparation: 'unknown',
};
