import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Heading, MetricCard, Screen, StatusBadge, number, styles } from '../../components/ui';
import { FarmIllustration, Logo } from '../../components/Illustration';
import { useApp } from '../../state/AppProvider';
import { draftRoute } from '../../lib/snapshots';
export default function Home() {
  const app = useApp(), latest = app.records[0];
  const start = () => { app.startNew(); router.push('/assessment/farm-profile'); };
  return <Screen><View style={[styles.row,{ justifyContent: 'space-between' }]}><Heading>Morning!</Heading><Logo size={60} /></View><Card pale><Heading small>From methane to money, minus the mystery.</Heading><Body>Explore the capture-and-flare opportunity for your farm before investing in advice and equipment.</Body><FarmIllustration height={155} /></Card>
    {latest ? <Card><Heading small>{latest.input.farmName || 'Latest assessment'}</Heading><StatusBadge status={latest.result.eligibility} /><MetricCard label="Indicative ACCU Equivalent" value={latest.result.technical.annualWholeUnits === null ? 'Calculation incomplete' : `~${number(latest.result.technical.annualWholeUnits)}/year`} icon="chart-bar" /><Body>{latest.result.technical.status.replaceAll('_',' ')} · preliminary estimate</Body><Button title="View assessment" secondary onPress={() => router.push(`/assessment-details/${latest.id}`)} /></Card> : <Card><Heading small>Is your idea worth investigating?</Heading><Body>Screen the pathway, estimate abatement if data is available, and see what to do next.</Body></Card>}
    <Button title="Start assessment" onPress={start} icon="arrow-right" />{app.draft.started && <Button title="Continue assessment" secondary onPress={() => router.push(draftRoute(app.draft.step))} />}<Button title="Use demo farm" secondary onPress={() => { app.exploreDemo(); router.push('/assessment/farm-profile'); }} /><Body muted>Indicative preliminary decision support only.</Body></Screen>;
}
