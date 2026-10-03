import React, { useState } from 'react';
import { router, Redirect, Href } from 'expo-router';
import { z } from 'zod';
import { Body, Button, Card, ErrorNotice, Screen } from './ui';
import { AssessmentExit } from './AssessmentExit';
import { useDraftForm } from './AssessmentForm';
import { farmSchema, projectSchema } from '../lib/validation';
import { useApp } from '../state/AppProvider';
import { AssessmentInput } from '../types/assessment';
import type { UseFormReturn } from 'react-hook-form';
export function AssessmentStep({ title, step, schema, next, Fields }: { title: string; step: number; schema: z.ZodType; next: Href; Fields: React.ComponentType<{ form: UseFormReturn<AssessmentInput> }> }) {
  const app = useApp(), form = useDraftForm(schema), [error,setError] = useState('');
  if (step > 1 && !farmSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/farm-profile" />;
  if (step > 2 && !projectSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/project" />;
  return <Screen title={title} step={step} back topAction={<AssessmentExit step={step} getValues={form.getValues} />}>{app.draft.sample && <Card pale><Body>DEMO DATA · Green Valley Dairy · illustrative planning scenario</Body></Card>}<Card pale><Body>“I’m not sure” is a useful answer. Missing information becomes a next step. Your draft saves on this device.</Body></Card><Fields form={form} /><ErrorNotice message={error} /><Button title={step === 5 ? 'See my opportunity' : 'Continue'} icon="arrow-right" onPress={() => void form.handleSubmit(values => { setError(''); app.setInput(values); app.setStep(step+1); router.push(next); }, errors => setError(Object.values(errors)[0]?.message ?? 'Check the highlighted fields.'))()} /></Screen>;
}
