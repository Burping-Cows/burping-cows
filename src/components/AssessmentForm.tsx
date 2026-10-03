import React, { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors, Resolver, UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AssessmentInput, equipmentOptions, farmTypes, manureSystems, projects, projectStages, evidenceOptions, states, inputSources, YesNoUnknown } from '../types/assessment';
import { useApp } from '../state/AppProvider';
import { Input, Options, Card, Body, Button } from './ui';
import { updateAssessmentInput } from '../lib/calculations';
import { METHOD_ASSUMPTIONS } from '../config/assumptions';
export const resolverFor = (schema: z.ZodType): Resolver<AssessmentInput> => async values => {
  const parsed = schema.safeParse(values);
  if (parsed.success) return { values, errors: {} };
  const errors: FieldErrors<AssessmentInput> = {};
  for (const issue of parsed.error.issues) { const key = issue.path[0] as keyof AssessmentInput; if (key && !errors[key]) Object.assign(errors, { [key]: { type: 'validation', message: issue.message } }); }
  return { values: {}, errors };
};
export function useDraftForm(schema: z.ZodType) {
  const app = useApp();
  const form = useForm<AssessmentInput>({ defaultValues: app.draft.input, resolver: resolverFor(schema), mode: 'onTouched', shouldFocusError: true });
  const { subscribe } = form, { setInput } = app;
  useEffect(() => subscribe({ formState: { values: true }, callback: ({ values }) => setInput(values) }), [subscribe, setInput]);
  return form;
}
type Form = UseFormReturn<AssessmentInput>;
// Retain intermediate text such as "0." while editing fractions. The form still
// stores a number (or undefined), so blank, invalid and explicit zero stay distinct.
function NumericInput({ value, onChange, ...props }: Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> & { value: unknown; onChange: (value: number | undefined) => void }) {
  const [editing, setEditing] = useState({ text: value === undefined ? '' : String(value), numericValue: value });
  const text = Object.is(editing.numericValue, value) ? editing.text : value === undefined ? '' : String(value);
  return <Input {...props} value={text} onChange={next => {
    const cleaned = next.replace(/[,\s$]/g, '');
    const numericValue = cleaned === '' ? undefined : Number(cleaned);
    setEditing({ text: next, numericValue });
    onChange(numericValue);
  }} />;
}
export function NumericField({ form, name, label, suffix, helper }: { form: Form; name: keyof AssessmentInput; label: string; suffix?: string; helper?: string }) {
  return <Controller control={form.control} name={name} render={({ field, fieldState }) => <NumericInput inputRef={field.ref} label={label} value={field.value} onBlur={field.onBlur} onChange={field.onChange} error={fieldState.error?.message} suffix={suffix} helper={helper ?? 'Leave blank if unknown. Enter 0 only if explicitly zero.'} numeric />} />;
}
function TextField({ form, name, label, helper }: { form: Form; name: keyof AssessmentInput; label: string; helper?: string }) { return <Controller control={form.control} name={name} render={({ field, fieldState }) => <Input inputRef={field.ref} label={label} value={String(field.value ?? '')} onChange={field.onChange} onBlur={field.onBlur} helper={helper} error={fieldState.error?.message} />} />; }
export function ChoiceField({ control, name, label, options, change }: { control: Control<AssessmentInput>; name: keyof AssessmentInput; label: string; options: readonly string[]; change?: (value: string) => void }) { return <Controller control={control} name={name} render={({ field, fieldState }) => <Options inputRef={field.ref} label={label} options={options} value={String(field.value ?? '')} onChange={change ?? field.onChange} error={fieldState.error?.message} />} />; }
export function AnswerField({ form, name, label }: { form: Form; name: keyof AssessmentInput; label: string }) { return <Controller control={form.control} name={name} render={({ field }) => <Options label={label} options={['Yes', 'No', 'I’m not sure']} value={field.value === 'yes' ? 'Yes' : field.value === 'no' ? 'No' : 'I’m not sure'} onChange={value => field.onChange((value === 'Yes' ? 'yes' : value === 'No' ? 'no' : 'unknown') as YesNoUnknown)} />} />; }
export function FarmFields({ form }: { form: Form }) { return <>
  <TextField form={form} name="farmName" label="Farm / assessment name" helper="Optional. This name appears in Saved assessments." />
  <ChoiceField control={form.control} name="farmType" label="Farm type" options={farmTypes} />
  <ChoiceField control={form.control} name="state" label="State or territory" options={states} />
  <TextField form={form} name="postcode" label="Postcode / location" helper="Four-digit postcode, or leave blank if unknown." />
  <NumericField form={form} name="animalCount" label="Number of animals" suffix="animals" helper="Descriptive only. Animal count never generates an ACCU estimate." />
  <ChoiceField control={form.control} name="wasteStream" label="Waste stream" options={['Liquid effluent','Solid manure','Other','Unsure']} />
  <ChoiceField control={form.control} name="manureSystem" label="Current manure system" options={manureSystems} />
  <AnswerField form={form} name="baselineAnaerobic" label="Would this effluent otherwise enter an anaerobic pond?" />
  <ChoiceField control={form.control} name="baselineEvidence" label="Baseline evidence" options={evidenceOptions} />
</>; }
export function ProjectFields({ form }: { form: Form }) {
  const route = useWatch({ control: form.control, name: 'proposedProject' });
  const stage = useWatch({ control: form.control, name: 'projectStage' });
  return <>
    <ChoiceField control={form.control} name="proposedProject" label="What are you planning to do?" options={projects} change={value => form.reset(updateAssessmentInput(form.getValues(), { proposedProject: value as AssessmentInput['proposedProject'] }))} />
    {route && route !== 'Capture and flare methane' && <Card pale><Body>Not assessed by this MVP. Specialist assessment required. You can continue with screening and a preparation plan.</Body></Card>}
    {route === 'Capture and flare methane' && <ChoiceField control={form.control} name="flareType" label="Planned flare type" options={['Open flare','Enclosed flare','Unsure']} />}
    <ChoiceField control={form.control} name="projectStage" label="What stage is the project at?" options={projectStages} />
    {!['Just exploring','Planning / obtaining quotes','Unsure',''].includes(stage) && <TextField form={form} name="implementationDate" label="Earliest relevant implementation date" helper="YYYY-MM-DD, if known. Include contracts, purchases or construction in your timing review." />}
  </>;
}
export function ScreeningFields({ form }: { form: Form }) {
  const funding = useWatch({ control: form.control, name: 'governmentFunding' });
  return <>
    <AnswerField form={form} name="legallyRequired" label="Is this methane-reduction activity already legally required?" />
    <AnswerField form={form} name="normalBusinessPractice" label="Would you undertake this as normal business practice without the carbon incentive?" />
    <AnswerField form={form} name="siteControl" label="Do you control or have permission to carry out the project?" />
    <AnswerField form={form} name="accuRights" label="Do you expect to hold the rights to receive ACCUs from this project?" />
    <AnswerField form={form} name="governmentFunding" label="Are there government grants or other environmental certificates?" />
    {funding === 'yes' && <><TextField form={form} name="fundingProgram" label="Funding program / certificate name" /><NumericField form={form} name="fundingAmount" label="Funding amount, if known" suffix="AUD" /><TextField form={form} name="fundingActivity" label="What activity does the funding support?" /></>}
    <AnswerField form={form} name="permits" label="Have you confirmed the required permits?" />
    <AnswerField form={form} name="facilityDescription" label="Do you have a facility description?" />
  </>;
}
const sourceLabels = { user: 'User supplied', engineering_estimate: 'Engineering estimate', measurement: 'Measurement', method_default: 'Method / planning default', demo: 'Demo' };
export function TechnicalFields({ form }: { form: Form }) {
  const route = useWatch({ control: form.control, name: 'proposedProject' });
  const quantity = (name: keyof AssessmentInput, source: keyof AssessmentInput, label: string, suffix: string, helper?: string) => <Card key={name}><NumericField form={form} name={name} label={label} suffix={suffix} helper={helper} /><Controller control={form.control} name={source} render={({ field }) => <Options label={`${label} source`} options={Object.values(sourceLabels)} value={sourceLabels[field.value as keyof typeof sourceLabels]} onChange={v => field.onChange(inputSources.find(key => sourceLabels[key] === v))} />} /></Card>;
  return <>
    {route === 'Capture and flare methane' ? <>
      <NumericField form={form} name="periodMonths" label="Reporting / forecast period" suffix="months" helper="Gas volume and project emissions must cover this same period. Results are annualised." />
      {quantity('biogasVolumeM3','biogasSource','Biogas captured in this period','m³','At NGER standard conditions. Do not enter pure-methane volume. Blank means unknown.')}
      {quantity('methaneFraction','methaneSource','Methane fraction','0–1','0.60 means 60% methane. Composition is required to convert biogas to methane.')}
      {quantity('destructionEfficiency','destructionSource','Destruction efficiency','0–1','0.98 means 98%. Verify device-specific requirements; applied once.')}
      {quantity('flareOperationFraction','operationSource','Flare operation assumption','0–1','Fraction of the captured gas sent to an operating flare. Enter 1 only if explicitly justified.')}
      {quantity('projectEmissionsTCO2e','emissionsSource','Project emissions subtotal','t CO₂-e','For the same period, including project energy use. Unknown is not zero.')}
      <Button title="Use disclosed planning defaults" secondary onPress={() => { const type = form.getValues('farmType'); form.setValue('methaneFraction', type === 'Piggery' ? METHOD_ASSUMPTIONS.defaultMethaneFraction.piggery : type === 'Dairy' ? METHOD_ASSUMPTIONS.defaultMethaneFraction.dairy : METHOD_ASSUMPTIONS.defaultMethaneFraction.other); form.setValue('methaneSource','method_default'); form.setValue('destructionEfficiency',METHOD_ASSUMPTIONS.defaultDestructionEfficiency); form.setValue('destructionSource','method_default'); }} />
      <Body muted>Planning defaults are illustrative. Confirm composition and flare requirements with a specialist. No gas quantity, operating fraction or emissions subtotal is invented.</Body>
    </> : <Card pale><Body>Calculation incomplete: this project route is outside the capture-and-flare MVP.</Body></Card>}
    <Controller control={form.control} name="monitoringEquipment" render={({ field }) => <Options label="Monitoring equipment" options={equipmentOptions} multi value={field.value} onChange={option => { if (['None','Unsure'].includes(option)) field.onChange([option]); else { const current = field.value.filter(v => !['None','Unsure'].includes(v)); field.onChange(current.includes(option) ? current.filter(v => v !== option) : [...current,option]); } }} />} />
    <AnswerField form={form} name="calibrationRecords" label="Are calibration records available?" /><AnswerField form={form} name="qaPlan" label="Is a QA / monitoring plan available?" /><AnswerField form={form} name="operationalRecords" label="Are operational records available?" /><AnswerField form={form} name="energyRecords" label="Are project energy records available?" /><AnswerField form={form} name="auditPreparation" label="Has audit preparation been started?" />
  </>;
}
export function FinanceFields({ form }: { form: Form }) { return <>
  <Card pale><Body>All costs and benefits may be unknown. Leave them blank to keep viability unassessed. Enter zero only when you know there is no cost or benefit.</Body></Card>
  {([['implementationCost','Implementation / CAPEX'],['developmentCost','Development / setup cost'],['annualOperatingCost','Annual operating cost'],['annualComplianceCost','Annual compliance cost'],['annualEnergySavings','Annual energy savings'],['otherRevenue','Other annual revenue'],['annualFees','Annual fees / revenue share (estimated AUD)']] as const).map(([name,label]) => <NumericField key={name} form={form} name={name} label={label} suffix="AUD" />)}
  <NumericField form={form} name="projectLifetimeYears" label="Project horizon" suffix="years" />
  <NumericField form={form} name="discountRate" label="Discount rate" suffix="0–1" helper="0.08 means 8%. Leave blank if unknown." />
  <NumericField form={form} name="lowAccuPrice" label="Low ACCU price" suffix="AUD/ACCU" /><NumericField form={form} name="accuPrice" label="Base ACCU price" suffix="AUD/ACCU" helper="Demo market assumption. No live price feed." /><NumericField form={form} name="highAccuPrice" label="High ACCU price" suffix="AUD/ACCU" />
</>; }
