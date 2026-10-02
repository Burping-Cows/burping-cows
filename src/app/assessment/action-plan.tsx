import React, { useState } from 'react';
import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Body, Button, Card, DisclaimerCard, ErrorNotice, Heading, Icon, ProgressRing, Screen, styles } from '../../components/ui';
import { errorMessage, useApp } from '../../state/AppProvider';
import { calculateAssessment } from '../../lib/calculations';
import { farmSchema, projectSchema } from '../../lib/validation';
export default function ActionPlan() {
  const app = useApp(), [error, setError] = useState(''), [saved, setSaved] = useState('');
  if (!farmSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/farm-profile" />;
  if (!projectSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/project" />;
  const result = calculateAssessment(app.draft.input, app.assumptions);
  const save = async () => { setError(''); try { const record = await app.save(); setSaved(record.id); } catch (e) { setError(errorMessage(e)); } };
  return <Screen title="Your next steps" back>{app.draft.sample && <Body muted>Sample farm · demonstration data</Body>}<Card pale><View style={styles.row}><ProgressRing value={result.readiness} /><View style={{ flex: 1 }}><Heading small>{result.readinessLabel}</Heading><Body muted>A few more pieces to put in place. This score is a preparation guide, not certification.</Body></View></View></Card><Heading small>Readiness checklist</Heading><Card>{result.checklist.map(item => <View key={item.id} style={[styles.row, { paddingVertical: 7 }]}><Icon name={item.status === 'complete' ? 'check-circle' : item.status === 'needs review' ? 'alert-circle-outline' : 'circle-outline'} color={item.status === 'needs review' ? '#AA5B09' : undefined} /><View style={{ flex: 1 }}><Body style={{ fontFamily: 'DM_Sans_500Medium' }}>{item.title}</Body><Body muted style={{ fontSize: 12 }}>{item.status === 'complete' ? 'Complete' : item.status === 'needs review' ? 'Needs review' : 'Incomplete'} · {item.detail}</Body></View></View>)}</Card><Heading small>Next steps</Heading>{result.nextSteps.map((text, index) => <Card key={text}><View style={styles.row}><View style={{ backgroundColor: '#EAF5E5', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}><Body>{index + 1}</Body></View><Body style={{ flex: 1 }}>{text}</Body></View></Card>)}<ErrorNotice message={error} />{saved ? <Card pale><Heading small>Assessment saved</Heading><Body>Your results and calculation assumptions are saved together.</Body><Button title="View saved assessment" onPress={() => router.replace(`/assessment-details/${saved}`)} /></Card> : <Button title="Save assessment" icon="bookmark-outline" loading={app.busy} onPress={() => void save()} />}<Button title="Start another assessment" secondary onPress={() => { app.startNew(); router.replace('/assessment/farm-profile'); }} /><DisclaimerCard /></Screen>;
}
