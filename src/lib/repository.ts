import { z } from 'zod';
import { SavedAssessment, Assumptions } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
import { getDeviceId, readLocal, writeLocal } from './storage';
import { normalizeSnapshot } from './snapshots';
import { getOwnerId, supabase } from './supabase';
export const remoteConfigSchema = z.object({ default_accu_price: z.number().finite().min(0).max(100000), methodology_note: z.string().min(1) });
export async function loadAssumptions(): Promise<Assumptions> {
  if (!supabase) return defaultAssumptions;
  try {
    const { data, error } = await supabase.from('app_config').select('key,value');
    if (error) return defaultAssumptions;
    const parsed = remoteConfigSchema.safeParse(Object.fromEntries((data ?? []).map(row => [row.key, row.value])));
    if (!parsed.success) return defaultAssumptions;
    return { ...defaultAssumptions, defaultAccuPrice: parsed.data.default_accu_price, methodologyNote: parsed.data.methodology_note };
  } catch { return defaultAssumptions; }
}
export function toDatabase(record: SavedAssessment, ownerId: string, deviceId: string) {
  const i = record.input, r = record.result;
  return {
    id: record.id, owner_id: ownerId, device_id: deviceId, created_at: record.createdAt, updated_at: record.updatedAt,
    name: i.farmName, farm_type: i.farmType, animal_count: i.animalCount ?? null, state: i.state, postcode: i.postcode,
    waste_stream: i.wasteStream, baseline_system: i.manureSystem, baseline_evidence_status: i.baselineEvidence,
    project_route: i.proposedProject, project_stage: i.projectStage,
    scheme_answers: Object.fromEntries(['baselineAnaerobic','legallyRequired','normalBusinessPractice','siteControl','accuRights','governmentFunding','fundingProgram','fundingAmount','fundingActivity','implementationDate','permits','facilityDescription'].map(key => [key,i[key as keyof typeof i] ?? null])),
    technical_inputs: Object.fromEntries(['flareType','periodMonths','biogasVolumeM3','methaneFraction','destructionEfficiency','flareOperationFraction','projectEmissionsTCO2e','biogasSource','methaneSource','destructionSource','operationSource','emissionsSource','monitoringEquipment','calibrationRecords','qaPlan','operationalRecords','energyRecords','auditPreparation'].map(key => [key,i[key as keyof typeof i] ?? null])),
    financial_inputs: Object.fromEntries(['implementationCost','developmentCost','annualOperatingCost','annualComplianceCost','annualEnergySavings','otherRevenue','annualFees','projectLifetimeYears','discountRate','accuPrice','lowAccuPrice','highAccuPrice'].map(key => [key,i[key as keyof typeof i] ?? null])),
    eligibility_result: { status: r.eligibility, rules: r.eligibilityRules }, preparation_result: r.preparation,
    viability_result: r.finance, calculation_result: r.technical, action_plan: r.actionPlan,
    snapshot_version: record.snapshotVersion, calculation_snapshot: record,
  };
}
export async function listAssessments(): Promise<SavedAssessment[]> {
  if (!supabase) return (await readLocal<SavedAssessment[]>('assessments', [])).map(normalizeSnapshot);
  const ownerId = await getOwnerId(), deviceId = await getDeviceId();
  const { data, error } = await supabase.from('assessments').select('calculation_snapshot,updated_at').eq('owner_id', ownerId).eq('device_id', deviceId).order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => normalizeSnapshot({ ...(row.calculation_snapshot as SavedAssessment), updatedAt: row.updated_at }));
}
export async function persistAssessment(record: SavedAssessment): Promise<void> {
  if (!supabase) {
    const records = await listAssessments();
    await writeLocal('assessments', [record, ...records.filter(row => row.id !== record.id)]); return;
  }
  const ownerId = await getOwnerId(), deviceId = await getDeviceId();
  const { data, error } = await supabase.from('assessments').upsert(toDatabase(record, ownerId, deviceId)).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('The assessment could not be saved. Please retry.');
}
export async function removeAssessment(id: string) {
  if (!supabase) { await writeLocal('assessments', (await listAssessments()).filter(row => row.id !== id)); return; }
  const ownerId = await getOwnerId(), deviceId = await getDeviceId();
  const { data, error } = await supabase.from('assessments').delete().eq('id', id).eq('owner_id', ownerId).eq('device_id', deviceId).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Assessment was not deleted. Refresh and retry.');
}
