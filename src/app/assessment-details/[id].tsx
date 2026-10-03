import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Button, Card, DisclaimerCard, EmptyState, ErrorNotice, Heading, Screen, shortDate, styles } from '../../components/ui';
import { NextSteps, ResultsView } from '../../components/ResultsView';
import { errorMessage, useApp } from '../../state/AppProvider';
import { theme } from '../../config/theme';
export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>(), app = useApp(), record = app.records.find(row => row.id === id);
  const [confirm, setConfirm] = useState(false), [error, setError] = useState('');
  if (!app.ready) return null;
  if (!record && app.busy) return <Screen title="Assessment details" back><ActivityIndicator color={theme.colors.primary} /></Screen>;
  if (!record) return <Screen title="Assessment details" back><ErrorNotice message={app.listError} /><EmptyState title="Assessment unavailable" text="Refresh saved assessments to load this record, or return to your list." action="Refresh" onPress={() => void app.refresh()} /><Button title="Saved assessments" secondary onPress={() => router.replace('/(tabs)/saved')} /></Screen>;
  const edit = (duplicate = false) => { app.edit(record, duplicate); router.push('/assessment/farm-profile'); };
  const remove = async () => { try { await app.remove(record.id); router.replace('/(tabs)/saved'); } catch (e) { setError(errorMessage(e)); } };
  return <Screen title="Assessment details" back>
    <Card><Heading small>{record.sample ? 'Sample · ' : ''}{record.input.farmType} farm</Heading><Body muted>{record.input.animalCount} animals · {record.input.state}</Body><Body muted style={{ minHeight: 46 }}>{record.input.manureSystem}{'\n'}{record.input.proposedProject}</Body><Body muted style={styles.small}>Saved {shortDate(record.updatedAt)} · Assumptions {record.assumptions.version}</Body></Card>
    <ResultsView input={record.input} result={record.result} details /><Heading small>Your next steps</Heading><NextSteps steps={record.result.nextSteps} />
    <Button title="Edit assessment" icon="pencil-outline" onPress={() => edit()} /><Button title="Duplicate as a new draft" secondary onPress={() => edit(true)} /><ErrorNotice message={error} />
    {!confirm && <Button title="Delete assessment" secondary onPress={() => setConfirm(true)} />}
    <DisclaimerCard />
    {confirm && <Card><Heading small>Delete this assessment?</Heading><Body muted style={{ minHeight: 46 }}>This removes the saved record. You cannot undo this action.</Body><Button title="Delete permanently" destructive icon="arrow-right" loading={app.busy} onPress={() => void remove()} /><Button title="Keep assessment" secondary onPress={() => setConfirm(false)} /></Card>}
  </Screen>;
}
