import React from 'react';
import { Redirect, router } from 'expo-router';
import { useApp } from '../../state/AppProvider';
import { assessmentSchema } from '../../lib/validation';
import { calculateAssessment } from '../../lib/calculations';
import { Body, Button, Card, Screen } from '../../components/ui';
import { ResultsView } from '../../components/ResultsView';
export default function Results() {
  const app = useApp(), input = app.draft.input;
  if (!assessmentSchema.safeParse(input).success) return <Redirect href="/assessment/farm-profile" />;
  const result = calculateAssessment(input, app.assumptions);
  return <Screen title="Project opportunity" step={6} back>{app.draft.sample && <Card pale><Body>DEMO DATA · deterministic planning scenario</Body></Card>}<ResultsView input={input} result={result} assumptions={app.assumptions} /><Button title="See my action plan" icon="arrow-right" onPress={() => router.push('/assessment/action-plan')} /><Button title="Edit financial assumptions" secondary onPress={() => router.push('/assessment/finance')} /><Button title="Edit farm and route" secondary onPress={() => router.push('/assessment/farm-profile')} /></Screen>;
}
