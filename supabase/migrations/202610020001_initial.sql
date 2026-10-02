create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  farm_type text check (farm_type in ('Dairy', 'Piggery')),
  animal_count integer check (animal_count > 0),
  state text check (state in ('NSW','VIC','QLD','SA','WA','TAS','NT','ACT')),
  manure_system text,
  project_started_status text check (project_started_status in ('No','Planning only','Yes')),
  site_control text check (site_control in ('Yes','No','Unsure')),
  proposed_project text,
  methane_input_type text check (methane_input_type in ('tonnes','m3','estimator')),
  methane_tonnes numeric check (methane_tonnes >= 0),
  methane_m3 numeric check (methane_m3 >= 0),
  capture_efficiency numeric check (capture_efficiency between 0 and 100),
  implementation_cost numeric check (implementation_cost >= 0),
  annual_operating_cost numeric check (annual_operating_cost >= 0),
  project_lifetime_years integer check (project_lifetime_years between 1 and 100),
  monitoring_equipment jsonb not null default '[]'::jsonb check (jsonb_typeof(monitoring_equipment) = 'array'),
  monitoring_maturity text check (monitoring_maturity in ('None','Basic records','Some sensors','Comprehensive monitoring')),
  calibration_records boolean not null default false,
  qa_plan boolean not null default false,
  eligibility_status text check (eligibility_status in ('LIKELY_ELIGIBLE','POSSIBLY_ELIGIBLE','UNLIKELY_ELIGIBLE')),
  readiness_score integer check (readiness_score between 0 and 100),
  compliance_burden text check (compliance_burden in ('Low','Medium','High')),
  estimated_methane_tonnes numeric check (estimated_methane_tonnes >= 0),
  estimated_co2e numeric check (estimated_co2e >= 0),
  estimated_accus integer check (estimated_accus >= 0),
  accu_price numeric check (accu_price between 0 and 100000),
  estimated_annual_value numeric check (estimated_annual_value >= 0),
  estimated_five_year_value numeric check (estimated_five_year_value >= 0),
  snapshot_version integer not null default 1,
  calculation_snapshot jsonb not null check (jsonb_typeof(calculation_snapshot) = 'object')
);
create index assessments_owner_device_updated on public.assessments(owner_id, device_id, updated_at desc);
alter table public.assessments enable row level security;
revoke all on public.assessments from anon;
grant select, insert, update, delete on public.assessments to authenticated;
create policy assessments_select on public.assessments for select to authenticated using ((select auth.uid()) = owner_id);
create policy assessments_insert on public.assessments for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy assessments_update on public.assessments for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy assessments_delete on public.assessments for delete to authenticated using ((select auth.uid()) = owner_id);
create function public.update_assessment_timestamp() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger assessment_updated_at before update on public.assessments for each row execute function public.update_assessment_timestamp();

create table public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
revoke all on public.app_config from anon, authenticated;
grant select on public.app_config to anon, authenticated;
create policy app_config_read on public.app_config for select to anon, authenticated using (true);
insert into public.app_config(key, value) values
  ('default_accu_price', '37'::jsonb),
  ('methodology_note', '"Simplified demonstration assumptions. Not official Clean Energy Regulator methodology values."'::jsonb),
  ('compliance_ranges', '{"Low":[40000,70000],"Medium":[70000,120000],"High":[120000,200000]}'::jsonb);
