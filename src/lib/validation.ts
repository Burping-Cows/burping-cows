import { z } from 'zod';
import { farmTypes, states, manureSystems, projects } from '../types/assessment';
import { anaerobicSystems } from './eligibility';
const nonnegative = z.number().finite().min(0, 'Enter zero or a positive number');
export const farmSchema = z.object({
  farmType: z.enum(farmTypes, { message: 'Choose a farm type' }), animalCount: z.number({ message: 'Enter an animal count' }).int('Use a whole number').min(1).max(10000000),
  state: z.enum(states, { message: 'Choose a state' }), manureSystem: z.enum(manureSystems, { message: 'Choose a manure system' }),
  projectStartedStatus: z.enum(['No', 'Planning only', 'Yes'], { message: 'Choose a project status' }), siteControl: z.enum(['Yes', 'No', 'Unsure'], { message: 'Choose a site-control answer' }),
  monitoringEquipment: z.array(z.string()).min(1, 'Select equipment, None, or Unsure'),
});
export const projectSchema = z.object({
  farmType: z.string(), animalCount: z.number().optional(), manureSystem: z.string(),
  proposedProject: z.enum(projects, { message: 'Choose a proposed project' }), methaneInputType: z.enum(['tonnes', 'm3', 'estimator']),
  methaneTonnes: nonnegative.optional(), methaneM3: nonnegative.optional(), captureEfficiency: nonnegative.max(100, 'Maximum 100%'),
  implementationCost: nonnegative.optional(), annualOperatingCost: nonnegative.optional(), projectLifetimeYears: z.number({ message: 'Enter a project lifetime' }).int().min(1).max(100),
  monitoringMaturity: z.enum(['None', 'Basic records', 'Some sensors', 'Comprehensive monitoring']), calibrationRecords: z.boolean(), qaPlan: z.boolean(),
}).superRefine((data, ctx) => {
  const field = data.methaneInputType === 'tonnes' ? 'methaneTonnes' : 'methaneM3';
  if (data.methaneInputType !== 'estimator' && data[field] === undefined) ctx.addIssue({ code: 'custom', path: [field], message: 'Enter an annual methane amount' });
  if (data.methaneInputType === 'estimator' && !anaerobicSystems.includes(data.manureSystem)) ctx.addIssue({ code: 'custom', path: ['methaneInputType'], message: 'This estimator needs an anaerobic system. Enter a measured methane amount instead.' });
});
export const priceSchema = nonnegative.max(100000, 'Enter a price below A$100,000');
