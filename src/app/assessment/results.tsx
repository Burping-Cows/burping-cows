import React, { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { useApp } from '../../state/AppProvider';
import { farmSchema, priceSchema, projectSchema } from '../../lib/validation';
import { calculateAssessment } from '../../lib/calculations';
import { Body, Button, Input, Screen } from '../../components/ui';
import { ResultsView } from '../../components/ResultsView';
export default function Results() {
  const app = useApp(), input = app.draft.input;
  if (!app.ready) return null;
  if (!farmSchema.safeParse(input).success) return <Redirect href="/assessment/farm-profile" />;
  if (!projectSchema.safeParse(input).success) return <Redirect href="/assessment/project" />;
  return <ReadyResults />;
}
function ReadyResults() {
  const app = useApp(), input = app.draft.input;
  const [price, setPrice] = useState(String(input.accuPrice)), [error, setError] = useState('');
  const result = calculateAssessment(input, app.assumptions);
  return <Screen title="ACCU opportunity" step={3} back>{app.draft.sample && <Body muted>Sample farm · demonstration data</Body>}<Input label="ACCU price assumption" value={price} numeric suffix="AUD/ACCU" helper="A demonstration assumption, not a live market price." error={error} onChange={value => { setPrice(value); const parsed = priceSchema.safeParse(value.trim() === '' ? NaN : Number(value)); if (parsed.success) { setError(''); app.setInput({ accuPrice: parsed.data }); } else setError('Enter a price from A$0 to A$100,000.'); }} /><ResultsView input={input} result={result} /><Button title="See my action plan" icon="arrow-right" disabled={Boolean(error)} onPress={() => router.push('/assessment/action-plan')} /><Button title="Edit farm and project" secondary onPress={() => router.push('/assessment/farm-profile')} /></Screen>;
}
