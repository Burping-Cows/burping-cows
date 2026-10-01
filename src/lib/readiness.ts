import { AssessmentInput, ChecklistItem } from '../types/assessment';
import { calculateEligibility } from './eligibility';
export function calculateReadiness(input: AssessmentInput) {
  const eligible = calculateEligibility(input).status;
  const equipment = input.monitoringEquipment;
  const definitions: [string, string, string, boolean, boolean, number, string][] = [
    ['pathway', 'Eligible pathway identified', 'Anaerobic manure methane capture', eligible === 'LIKELY_ELIGIBLE', eligible === 'POSSIBLY_ELIGIBLE', 20, 'Confirm your project’s eligibility with a carbon advisor. Document your baseline manure-management system.'],
    ['timing', 'Project not started', 'Check timing before committing to work', ['No', 'Planning only'].includes(input.projectStartedStatus), input.projectStartedStatus === 'Yes', 15, 'Seek advice on project timing before starting or extending work.'],
    ['site', 'Site control confirmed', 'Permission to carry out the project', input.siteControl === 'Yes', input.siteControl === 'Unsure', 10, 'Confirm and document control of your project site.'],
    ['flow', 'Methane flow measurement available', 'Measured biogas flow', equipment.includes('Biogas flow meter'), false, 15, 'Install or verify methane flow monitoring.'],
    ['gas', 'Gas concentration monitoring available', 'Methane concentration evidence', equipment.includes('Gas analyser'), false, 15, 'Establish gas concentration monitoring.'],
    ['energy', 'Electricity / fuel records available', 'Records of energy use or generation', equipment.includes('Electricity meter') || equipment.includes('Fuel records'), false, 10, 'Start keeping electricity or fuel records.'],
    ['qa', 'QA monitoring plan and calibration records', 'Documented quality assurance', input.qaPlan && input.calibrationRecords, input.qaPlan || input.calibrationRecords, 10, 'Prepare a simple QA monitoring plan and keep calibration records.'],
    ['cost', 'Project cost estimate available', 'An indicative implementation budget', input.implementationCost !== undefined && input.implementationCost > 0, false, 5, 'Obtain an indicative project implementation cost estimate.'],
  ];
  const checklist: ChecklistItem[] = definitions.map(([id, title, detail, complete, review, weight, nextStep]) => ({ id, title, detail, status: complete ? 'complete' : review ? 'needs review' : 'incomplete', weight, nextStep }));
  const score = checklist.reduce((sum, item) => sum + (item.status === 'complete' ? item.weight : 0), 0);
  const label = score < 40 ? 'Early stage' : score < 70 ? 'Getting ready' : score < 90 ? 'Strong preparation' : 'Strongly prepared';
  return { score, label, checklist };
}
