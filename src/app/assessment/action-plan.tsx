import React, { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Body, Button, Card, ErrorNotice, Heading, ProgressRing, Screen } from '../../components/ui';
import { ActionTask } from '../../components/ActionTask';
import { errorMessage, useApp } from '../../state/AppProvider';
import { calculateAssessment } from '../../lib/calculations';
import { assessmentSchema } from '../../lib/validation';
export default function ActionPlan() {
  const app = useApp(), [error,setError] = useState(''), [saved,setSaved] = useState('');
  if (!assessmentSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/farm-profile" />;
  const r = calculateAssessment(app.draft.input,app.assumptions);
  const save = async () => { setError(''); try { setSaved((await app.save()).id); } catch(e) { setError(errorMessage(e)); } };
  return <Screen title="Your action plan" back>{app.draft.sample && <Body>DEMO DATA</Body>}<Card pale><Heading small>Preparation progress</Heading><ProgressRing value={r.preparation.progress} /><Body>Critical missing tasks remain visible regardless of overall progress.</Body></Card>{r.preparation.phases.map(phase => <React.Fragment key={phase.id}><Heading small>{phase.title} · {phase.complete}/{phase.total}</Heading>{r.actionPlan.filter(t => t.phase === phase.id).sort((a,b) => Number(b.priority === 'high')-Number(a.priority === 'high')).map(task => <ActionTask key={task.id} task={task} />)}</React.Fragment>)}<ErrorNotice message={error} />{saved ? <Button title="View saved assessment" onPress={() => router.replace(`/assessment-details/${saved}`)} /> : <Button title="Save assessment" loading={app.busy} onPress={() => void save()} />}<Button title="Start another assessment" secondary onPress={() => { app.startNew(); router.replace('/assessment/farm-profile'); }} /></Screen>;
}
