import React, { Fragment, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Body, Button, Card, DisclaimerCard, Heading, ProgressRing, Screen, styles } from '../../components/ui';
import { NextSteps } from '../../components/ResultsView';
import { errorMessage, useApp } from '../../state/AppProvider';
import { calculateAssessment } from '../../lib/calculations';
import { farmSchema, projectSchema } from '../../lib/validation';
export default function ActionPlan() {
  const app = useApp(), [error, setError] = useState(''), [saved, setSaved] = useState('');
  if (!app.ready) return null;
  if (!farmSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/farm-profile" />;
  if (!projectSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/project" />;
  const result = calculateAssessment(app.draft.input, app.assumptions);
  const save = async () => { setError(''); try { const record = await app.save(); setSaved(record.id); } catch (e) { setError(errorMessage(e)); } };
  return <Screen title="Your next steps" back>
    {app.draft.sample && !error && <Body muted>Sample farm · demonstration data</Body>}
    {error ? <Card pale><Heading small>{result.readinessLabel}</Heading><Body muted>{result.readiness}% prepared{app.draft.sample ? ' · Sample farm' : ''}</Body></Card> : <><Card pale>
      <ProgressRing value={result.readiness} />
      <Heading small style={{ textAlign: 'center', transform: [{ translateX: 18 }] }}>{result.readiness}% prepared</Heading>
      <Heading small>{result.readinessLabel}</Heading>
      <Body muted design="11:640">A few more pieces to put in place. This score is a preparation guide, not certification.</Body>
    </Card>
    <Heading small>Readiness checklist</Heading>
    <Card>{result.checklist.map(item => <Fragment key={item.id}>
      <Body style={{ minHeight: item.id === 'qa' ? 46 : 23 }}>{item.status === 'complete' ? '✓ ' : item.status === 'needs review' ? '○ ' : '○ '}{item.title}</Body>
      <Body muted style={styles.small}>{item.status === 'complete' ? 'Complete' : item.status === 'needs review' ? 'Needs review' : 'Incomplete'} · {item.detail}</Body>
    </Fragment>)}</Card></>}
    <Heading small>Next steps</Heading><NextSteps steps={result.nextSteps} />
    {Boolean(error) && <Card style={{ backgroundColor: '#FFF0EA' }}><Heading small style={{ minHeight: 58 }}>Assessment could not be saved</Heading><Body muted style={{ minHeight: 46 }}>Your draft is retained. Check your connection and retry.</Body></Card>}
    {!saved && <Button title="Save assessment" icon="bookmark-outline" loading={app.busy} onPress={() => void save()} />}
    <Button title="Start another assessment" secondary onPress={() => { app.startNew(); router.replace('/assessment/farm-profile'); }} /><DisclaimerCard />
    {Boolean(saved) && <Card pale><Heading small>Assessment saved</Heading><Body muted style={{ minHeight: 46 }}>Your results and calculation assumptions are saved together.</Body><Button title="View saved assessment" icon="arrow-right" onPress={() => router.replace('/assessment-details/' + saved)} /></Card>}
  </Screen>;
}
