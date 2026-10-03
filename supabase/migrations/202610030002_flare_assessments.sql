-- Additive migration: preserves old rows, snapshots, ownership and all RLS policies.
alter table public.assessments drop constraint if exists assessments_farm_type_check;
alter table public.assessments add constraint assessments_farm_type_check check (farm_type in ('Dairy','Piggery','Other','Unsure'));
alter table public.assessments drop constraint if exists assessments_state_check;
alter table public.assessments add constraint assessments_state_check check (state in ('NSW','VIC','QLD','SA','WA','TAS','NT','ACT','Unsure'));
alter table public.assessments drop constraint if exists assessments_animal_count_check;
alter table public.assessments add constraint assessments_animal_count_check check (animal_count >= 0);
alter table public.assessments
  add column if not exists name text,
  add column if not exists postcode text,
  add column if not exists waste_stream text,
  add column if not exists baseline_system text,
  add column if not exists baseline_evidence_status text,
  add column if not exists project_route text,
  add column if not exists project_stage text,
  add column if not exists scheme_answers jsonb,
  add column if not exists technical_inputs jsonb,
  add column if not exists financial_inputs jsonb,
  add column if not exists eligibility_result jsonb,
  add column if not exists preparation_result jsonb,
  add column if not exists viability_result jsonb,
  add column if not exists calculation_result jsonb,
  add column if not exists action_plan jsonb;
