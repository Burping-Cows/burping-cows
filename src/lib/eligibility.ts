import { AssessmentInput, Eligibility } from '../types/assessment';
export const anaerobicSystems = ['Anaerobic effluent pond', 'Covered lagoon', 'Anaerobic digester'];
export function calculateEligibility(input: AssessmentInput): { status: Eligibility; reasons: string[] } {
  const reasons: string[] = [];
  if (input.siteControl === 'No') reasons.push('Site control must be resolved before pursuing this pathway.');
  if (input.manureSystem && !['Other', 'Unsure', ...anaerobicSystems].includes(input.manureSystem)) reasons.push('This demonstration pathway assumes anaerobic manure or effluent treatment.');
  if (input.proposedProject === 'Improve effluent treatment') reasons.push('Effluent improvements alone do not establish methane capture or destruction.');
  if (reasons.length) return { status: 'UNLIKELY_ELIGIBLE', reasons };
  if (!input.farmType || !input.manureSystem || !input.proposedProject || !input.projectStartedStatus || !input.siteControl || ['Other', 'Unsure'].includes(input.manureSystem) || input.proposedProject === 'Other') reasons.push('Confirm the farm, baseline system, and methane-capture pathway with a carbon advisor.');
  if (['Covered lagoon', 'Anaerobic digester'].includes(input.manureSystem)) reasons.push('Existing capture infrastructure needs a baseline and additionality review.');
  if (input.projectStartedStatus === 'Yes') reasons.push('Project timing may affect ACCU eligibility. Get professional advice before relying on this estimate.');
  if (input.siteControl === 'Unsure') reasons.push('Confirm control of the project site.');
  return reasons.length ? { status: 'POSSIBLY_ELIGIBLE', reasons } : { status: 'LIKELY_ELIGIBLE', reasons: ['A potential anaerobic manure methane-capture pathway is identified. Professional verification is still required.'] };
}
export const eligibilityLabel: Record<Eligibility, string> = { LIKELY_ELIGIBLE: 'Likely eligible', POSSIBLY_ELIGIBLE: 'Possibly eligible', UNLIKELY_ELIGIBLE: 'Unlikely under this pathway' };
