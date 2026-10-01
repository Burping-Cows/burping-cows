import { AssessmentInput, Assumptions, Burden } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
export function calculateComplianceBurden(input: AssessmentInput, assumptions: Assumptions = defaultAssumptions) {
  const has = (item: string) => input.monitoringEquipment.includes(item);
  const sensors = has('Biogas flow meter') || has('Gas analyser') || has('Electricity meter') || has('Laboratory testing');
  const records = has('Fuel records') || has('Electricity meter') || input.monitoringMaturity !== 'None' || input.calibrationRecords;
  const high = input.projectStartedStatus === 'Yes' || input.proposedProject === 'Capture methane for biomethane' || (!sensors && !records);
  const low = has('Biogas flow meter') && has('Gas analyser') && (has('Electricity meter') || has('Fuel records')) && input.qaPlan && input.calibrationRecords && input.siteControl === 'Yes';
  const burden: Burden = high ? 'High' : low ? 'Low' : 'Medium';
  const range = assumptions.complianceRanges[burden];
  return { burden, range, midpoint: (range[0] + range[1]) / 2 };
}
