import React from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Body, Button, Card, EmptyState, Heading, Screen, shortDate, StatusBadge, money, number, styles } from '../../components/ui';
import { useApp } from '../../state/AppProvider';
export default function Saved() {
  const app = useApp();
  return <Screen title="Saved assessments" subtitle="Your farm’s possibilities, in one place.">
    <Button title={app.busy ? 'Refreshing…' : 'Refresh assessments'} secondary wrapLabel loading={app.busy} onPress={() => void app.refresh()} />
    {Boolean(app.listError) && <Card style={{ backgroundColor: '#FFF0EA' }}><Heading small>Could not load assessments</Heading><Body muted>Check your connection and retry.</Body><Button title="Retry" secondary onPress={() => void app.refresh()} /></Card>}
    {!app.records.length ? <EmptyState title="A fresh start" text={app.listError ? 'Your saved assessments could not be loaded. Retry when connected.' : 'Save an assessment to keep its estimates and action plan here.'} action={app.listError ? undefined : 'Check my farm'} onPress={() => { app.startNew(); router.push('/assessment/farm-profile'); }} /> : app.records.map(record =>
      <Card key={record.id}><Heading small>{record.input.farmType} · {record.input.state}</Heading><Body muted>{record.input.animalCount} animals{record.sample ? ' · Sample farm' : ''}</Body><StatusBadge status={record.result.eligibility} /><Body>{number(record.result.accus)} ACCUs/yr · {money(record.result.annualValue)}/yr</Body><Body muted>{record.result.readiness}% prepared · {shortDate(record.updatedAt)}</Body><Button title="View details" secondary onPress={() => router.push('/assessment-details/' + record.id)} /></Card>
    )}
    {!app.listError && <Text style={styles.modeText}>All estimates are indicative. Saved results retain the assumptions used at the time.</Text>}
  </Screen>;
}
