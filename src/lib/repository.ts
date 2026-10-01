import { z } from 'zod';
import { SavedAssessment, Assumptions } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
import { getDeviceId, readLocal, writeLocal } from './storage';
import { getOwnerId, supabase } from './supabase';
const positive = z.number().finite().positive();
const range = z.tuple([positive, positive]).refine(v => v[0] <= v[1]);
export const remoteConfigSchema = z.object({ default_accu_price: z.number().finite().min(0).max(100000), methodology_note: z.string().min(1), compliance_ranges: z.object({ Low: range, Medium: range, High: range }) });
export async function loadAssumptions(): Promise<Assumptions> {
  if (!supabase) return defaultAssumptions;
  try {
    const { data, error } = await supabase.from('app_config').select('key,value');
    if (error) return defaultAssumptions;
    const parsed = remoteConfigSchema.safeParse(Object.fromEntries((data ?? []).map(row => [row.key, row.value])));
    if (!parsed.success) return defaultAssumptions;
    return { ...defaultAssumptions, defaultAccuPrice: parsed.data.default_accu_price, methodologyNote: parsed.data.methodology_note, complianceRanges: parsed.data.compliance_ranges };
  } catch { return defaultAssumptions; }
}
export function toDatabase(record: SavedAssessment, ownerId: string, deviceId: string) {
  const i = record.input, r = record.result;
  return {
    id: record.id, owner_id: ownerId, device_id: deviceId, created_at: record.createdAt, updated_at: record.updatedAt,
    farm_type: i.farmType, animal_count: i.animalCount, state: i.state, manure_system: i.manureSystem,
    project_started_status: i.projectStartedStatus, site_control: i.siteControl, proposed_project: i.proposedProject,
    methane_input_type: i.methaneInputType, methane_tonnes: i.methaneTonnes ?? null, methane_m3: i.methaneM3 ?? null,
    capture_efficiency: i.captureEfficiency, implementation_cost: i.implementationCost ?? null, annual_operating_cost: i.annualOperatingCost ?? null,
    project_lifetime_years: i.projectLifetimeYears, monitoring_equipment: i.monitoringEquipment, monitoring_maturity: i.monitoringMaturity,
    calibration_records: i.calibrationRecords, qa_plan: i.qaPlan, eligibility_status: r.eligibility,
    readiness_score: r.readiness, compliance_burden: r.burden, estimated_methane_tonnes: r.methaneTonnes,
    estimated_co2e: r.co2e, estimated_accus: r.accus, accu_price: i.accuPrice,
    estimated_annual_value: r.annualValue, estimated_five_year_value: r.fiveYearValue,
    snapshot_version: record.snapshotVersion, calculation_snapshot: record,
  };
}
export async function listAssessments(): Promise<SavedAssessment[]> {
  if (!supabase) return readLocal<SavedAssessment[]>('assessments', []);
  const ownerId = await getOwnerId(), deviceId = await getDeviceId();
  const { data, error } = await supabase.from('assessments').select('calculation_snapshot,updated_at').eq('owner_id', ownerId).eq('device_id', deviceId).order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({ ...(row.calculation_snapshot as SavedAssessment), updatedAt: row.updated_at }));
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
