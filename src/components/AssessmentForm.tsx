import React, { useEffect } from 'react';
import { Control, Controller, FieldErrors, Resolver, UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AssessmentInput, equipmentOptions, farmTypes, manureSystems, projects, states } from '../types/assessment';
import { useApp } from '../state/AppProvider';
import { Input, Options, Card, Body, styles, Icon } from './ui';
import { View } from 'react-native';
export const resolverFor = (schema: z.ZodType): Resolver<AssessmentInput> => async values => {
  const parsed = schema.safeParse(values);
  if (parsed.success) return { values, errors: {} };
  const errors: FieldErrors<AssessmentInput> = {};
  for (const issue of parsed.error.issues) { const key = issue.path[0] as keyof AssessmentInput; if (key && !errors[key]) Object.assign(errors, { [key]: { type: 'validation', message: issue.message } }); }
  return { values: {}, errors };
};
export function useDraftForm(schema: z.ZodType) {
  const app = useApp();
  const form = useForm<AssessmentInput>({ defaultValues: app.draft.input, resolver: resolverFor(schema), mode: 'onTouched' });
  const { subscribe } = form;
  const { setInput } = app;
  useEffect(() => subscribe({ formState: { values: true }, callback: ({ values }) => setInput(values) }), [subscribe, setInput]);
  return form;
}
function NumericField({ form, name, label, suffix, helper }: { form: UseFormReturn<AssessmentInput>; name: keyof AssessmentInput; label: string; suffix?: string; helper?: string }) {
  return <Controller control={form.control} name={name} render={({ field, fieldState }) => <Input label={label} value={field.value === undefined ? '' : String(field.value)} onBlur={field.onBlur} onChange={value => { const sanitized = value.replace(/[,\s$]/g, ''); field.onChange(sanitized === '' ? undefined : Number(sanitized)); }} error={fieldState.error?.message} suffix={suffix} helper={helper} numeric />} />;
}
function ChoiceField({ control, name, label, options }: { control: Control<AssessmentInput>; name: keyof AssessmentInput; label: string; options: readonly string[] }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <Options label={label} options={options} value={String(field.value ?? '')} onChange={field.onChange} error={fieldState.error?.message} />} />;
}
export function FarmFields({ form }: { form: UseFormReturn<AssessmentInput> }) { return <>
  <ChoiceField control={form.control} name="farmType" label="Farm type" options={farmTypes} />
  <NumericField form={form} name="animalCount" label="Number of animals" suffix="animals" />
  <ChoiceField control={form.control} name="state" label="State or territory" options={states} />
  <ChoiceField control={form.control} name="manureSystem" label="Current manure management system" options={manureSystems} />
  <ChoiceField control={form.control} name="projectStartedStatus" label="Project started yet?" options={['No', 'Planning only', 'Yes']} />
  <ChoiceField control={form.control} name="siteControl" label="Do you control the project site?" options={['Yes', 'No', 'Unsure']} />
  <Controller control={form.control} name="monitoringEquipment" render={({ field, fieldState }) => <Options label="Current monitoring equipment" options={equipmentOptions} multi value={field.value} error={fieldState.error?.message} onChange={option => {
    if (['None', 'Unsure'].includes(option)) field.onChange([option]);
    else { const current = field.value.filter(value => !['None', 'Unsure'].includes(value)); field.onChange(current.includes(option) ? current.filter(value => value !== option) : [...current, option]); }
  }} />} />
</>; }
export function ProjectFields({ form }: { form: UseFormReturn<AssessmentInput> }) {
  const type = useWatch({ control: form.control, name: 'methaneInputType' });
  return <>
    <ChoiceField control={form.control} name="proposedProject" label="Proposed project" options={projects} />
    <Controller control={form.control} name="methaneInputType" render={({ field, fieldState }) => <Options label="Estimated methane captured per year" options={['Tonnes CH₄', 'm³ methane', 'I don’t know']} value={field.value === 'tonnes' ? 'Tonnes CH₄' : field.value === 'm3' ? 'm³ methane' : 'I don’t know'} onChange={value => field.onChange(value === 'Tonnes CH₄' ? 'tonnes' : value === 'm³ methane' ? 'm3' : 'estimator')} error={fieldState.error?.message} />} />
    {type === 'tonnes' && <NumericField form={form} name="methaneTonnes" label="Methane captured / reduced" suffix="t CH₄/yr" />}
    {type === 'm3' && <NumericField form={form} name="methaneM3" label="Methane captured / reduced" suffix="m³/yr" />}
    {type === 'estimator' && <Card pale><View style={styles.row}><Icon name="calculator-variant-outline" /><Body>Simple demonstration estimator</Body></View><Body muted>{form.getValues('animalCount') ?? '—'} {form.getValues('farmType').toLowerCase() || 'farm'} animals · {form.getValues('manureSystem') || 'system not selected'}</Body><NumericField form={form} name="captureEfficiency" label="Estimated capture efficiency" suffix="%" /><Body muted style={{ fontSize: 12 }}>Uses farm information from step 1. Simplified effluent factors only; excludes enteric methane and official method calculations.</Body></Card>}
    <NumericField form={form} name="implementationCost" label="Estimated implementation cost" suffix="AUD" helper="Optional if unknown; needed for the payback indicator." />
    <NumericField form={form} name="annualOperatingCost" label="Expected operating cost per year" suffix="AUD/yr" helper="Optional. Shown separately; excluded from gross-revenue payback." />
    <NumericField form={form} name="projectLifetimeYears" label="Expected project lifetime" suffix="years" />
    <ChoiceField control={form.control} name="monitoringMaturity" label="Current monitoring maturity" options={['None', 'Basic records', 'Some sensors', 'Comprehensive monitoring']} />
    {(['calibrationRecords', 'qaPlan'] as const).map(name => <Controller key={name} control={form.control} name={name} render={({ field }) => <Options label={name === 'qaPlan' ? 'Do you have a QA monitoring plan?' : 'Do you keep calibration / QA records?'} options={['Yes', 'No']} value={field.value ? 'Yes' : 'No'} onChange={value => field.onChange(value === 'Yes')} />} />)}
  </>;
}
