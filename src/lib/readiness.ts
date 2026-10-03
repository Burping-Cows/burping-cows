import { AssessmentInput, ActionTask, EligibilityRule, Phase, PreparationResult } from '../types/assessment';
export function calculateReadiness(i: AssessmentInput, rules: EligibilityRule[], extraTasks: ActionTask[] = []): { preparation: PreparationResult; tasks: ActionTask[] } {
  const tasks: ActionTask[] = [...extraTasks];
  const add = (id: string, phase: Phase, title: string, complete: boolean, reason: string, evidenceRequired: string, priority: 'high' | 'medium' = 'medium') => tasks.push({ id, phase, title, status: complete ? 'complete' : 'incomplete', reason, evidenceRequired, priority });
  add('pathway','explore','Confirm the waste pathway',rules[0].state === 'satisfied','Liquid effluent and the anaerobic baseline establish route fit.','Waste-system description and pond records.','high');
  add('route','explore','Identify the project route',i.proposedProject === 'Capture and flare methane' && ['Open flare','Enclosed flare'].includes(i.flareType),'Other routes are outside this MVP.','Project scope and proposed flare specification.','high');
  add('gas','explore','Obtain preliminary biogas quantity',i.biogasVolumeM3 !== undefined && i.periodMonths !== undefined,'Net abatement cannot be estimated without gas and period data.','Engineering estimate or biogas flow measurement at standard conditions.','high');
  add('cost','explore','Estimate project cost',i.implementationCost !== undefined,'Unknown costs cannot be treated as zero.','Supplier quote and setup budget.');
  add('site','explore','Identify site control',i.siteControl === 'yes','Project permission must be documented.','Title, lease or written permission.','high');
  const ruleTask = (ruleId: string, id: string, title: string, evidence: string, priority: 'high' | 'medium' = 'high') => { const rule = rules.find(r => r.id === ruleId)!; add(id,'before_application',title,rule.state === 'satisfied',rule.explanation,evidence,priority); if (rule.state === 'barrier' || rule.state === 'unresolved') tasks[tasks.length-1].status = 'needs_review'; };
  ruleTask('EL03_NEWNESS','timing','Confirm project commencement timeline','Contracts, purchase orders, implementation and construction dates.');
  ruleTask('EL05_RIGHTS','rights','Confirm project legal rights before applying','Site permissions and documented rights to receive ACCUs.');
  ruleTask('EL02_BASELINE_EVIDENCE','baseline','Collect baseline waste-management evidence','Historic waste records or new/expanded facility evidence.');
  ruleTask('EL06_FUNDING_OVERLAP','funding','Confirm government grant interaction','Program, amount and supported activity; other certificates.','medium');
  add('permits','before_application','Confirm required permits',i.permits === 'yes','Required permissions need review before implementation.','Planning and environmental permissions.','high');
  add('facility','before_application','Prepare facility description',i.facilityDescription === 'yes','Describe the baseline and proposed treatment facility.','Facility diagram and equipment specifications.');
  const reportTasks: [string,string,boolean,string][] = [
    ['flow','Prepare methane-flow monitoring',i.monitoringEquipment.includes('Biogas flow meter'),'Flow-meter specification and monitoring schedule.'],
    ['composition','Prepare gas-concentration measurement',i.monitoringEquipment.includes('Gas analyser'),'Gas analysis method and instrument records.'],
    ['calibration','Keep meter calibration records',i.calibrationRecords === 'yes','Calibration certificates and dates.'],
    ['qa','Prepare QA / monitoring plan',i.qaPlan === 'yes','Quality assurance procedures and data-management plan.'],
    ['operation','Keep operational records',i.operationalRecords === 'yes','Flare operation and outage logs.'],
    ['energy','Keep project energy records',i.energyRecords === 'yes','Electricity and fuel use records for project emissions.'],
    ['audit','Prepare for independent review',i.auditPreparation === 'yes','Evidence register and audit preparation plan.'],
  ];
  for (const [id,title,complete,evidence] of reportTasks) add(id,'before_first_report',title,complete,'Needed for reporting preparation; progress is not certification.',evidence);
  const additional = rules.find(r => r.id === 'EL04_ADDITIONALITY')!;
  if (additional.state !== 'satisfied') add('additionality','before_application',additional.nextAction,false,additional.explanation,'Legal requirements and normal-business-practice rationale.','high');
  for (const [key,title,evidence] of [ ['methaneFraction','Confirm methane concentration','Gas composition measurement or justified planning assumption.'], ['destructionEfficiency','Confirm destruction efficiency','Flare specification and applicable device requirements.'], ['flareOperationFraction','Confirm flare operation assumption','Operating schedule and outage assumption.'], ['projectEmissionsTCO2e','Estimate project emissions subtotal','Project electricity and fuel emissions estimate.'] ] as const) if (i[key] === undefined) add(key,'explore',title,false,'Missing technical information keeps the calculation incomplete.',evidence,'high');
  const phases = (['explore','before_application','before_first_report'] as const).map(id => { const group = tasks.filter(t => t.phase === id), complete = group.filter(t => t.status === 'complete').length; return { id, title: id === 'explore' ? 'Explore' : id === 'before_application' ? 'Before application' : 'Before first report', complete, total: group.length, progress: Math.round(complete / group.length * 100) }; });
  const complete = tasks.filter(t => t.status === 'complete').length;
  const phase = phases[0].complete < phases[0].total ? 'exploring' : phases[1].complete < phases[1].total ? 'evidence_needed' : phases[2].complete < phases[2].total ? 'application_preparation' : 'reporting_preparation';
  return { preparation: { phase, progress: Math.round(complete / tasks.length * 100), phases }, tasks };
}
