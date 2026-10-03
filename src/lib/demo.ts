import { AssessmentInput, emptyInput } from '../types/assessment';
export const demoInput: AssessmentInput = {
  ...emptyInput, farmName: 'Green Valley Dairy', farmType: 'Dairy', animalCount: 500, state: 'NSW', postcode: '2580', wasteStream: 'Liquid effluent', manureSystem: 'Anaerobic pond', baselineAnaerobic: 'yes', baselineEvidence: 'Historical records available',
  proposedProject: 'Capture and flare methane', projectStage: 'Planning / obtaining quotes', flareType: 'Enclosed flare', siteControl: 'yes', accuRights: 'yes', legallyRequired: 'no', normalBusinessPractice: 'no', governmentFunding: 'no',
  periodMonths: 12, biogasVolumeM3: 100000, methaneFraction: .60, destructionEfficiency: .98, flareOperationFraction: 1, projectEmissionsTCO2e: 20,
  biogasSource: 'engineering_estimate', methaneSource: 'method_default', destructionSource: 'method_default', operationSource: 'demo', emissionsSource: 'demo',
  implementationCost: 150000, developmentCost: 0, annualOperatingCost: 10000, annualComplianceCost: 5000, annualEnergySavings: 0, otherRevenue: 0, annualFees: 0, accuPrice: 35, lowAccuPrice: 32, highAccuPrice: 42, projectLifetimeYears: 15, discountRate: .08,
};
