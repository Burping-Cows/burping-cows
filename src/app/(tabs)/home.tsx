import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Heading, Screen, shortDate, StatusBadge, styles } from '../../components/ui';
import { FarmIllustration, Logo } from '../../components/Illustration';
import { useApp } from '../../state/AppProvider';
import { OpportunityMetrics } from '../../components/ResultsView';
export default function Home() {
  const app = useApp(), latest = app.records[0];
  const start = () => { app.startNew(); router.push('/assessment/farm-profile'); };
  return <Screen>
    <View style={styles.row}><View style={{ flex: 1, gap: 4 }}><Heading>Morning!</Heading><Body muted>Less methane. More value.</Body></View><View style={{ marginRight: 11 }}><Logo size={52} /></View></View>
    <Card pale>
      <Text style={[styles.modeText, { color: '#176544' }]}>A BRIGHTER FUTURE FOR YOUR FARM</Text>
      <Heading small design="11:50">The less your cow buprs,{'\n'}The better your income.</Heading>
      <Body muted design="11:51">Practical first steps for Australian farmers.</Body>
      <FarmIllustration height={155} variant={latest ? 'home-saved' : 'home'} />
    </Card>
    {latest ? <>
      <OpportunityMetrics input={latest.input} result={latest.result} />
      <Card><Heading small>Latest assessment</Heading><Body muted>{latest.sample ? 'Sample · ' : ''}{latest.input.farmType} · {latest.input.animalCount} animals · {latest.input.state}</Body><StatusBadge status={latest.result.eligibility} /><Body muted>Updated {shortDate(latest.updatedAt)}</Body><Button title="View assessment" secondary onPress={() => router.push('/assessment-details/' + latest.id)} /></Card>
    </> : <Card><Heading small design="11:97">Find out if your farm has an ACCU opportunity.</Heading><Body muted design="11:98">A few simple questions. A clearer picture of what to investigate next.</Body><Button title="Start assessment" onPress={start} icon="arrow-right" /></Card>}
    {app.draft.started && !app.draft.editingId && <Button title="Continue assessment" onPress={() => router.push(app.draft.step === 3 ? '/assessment/results' : app.draft.step === 2 ? '/assessment/project' : '/assessment/farm-profile')} icon="arrow-right" />}
    {latest && <Button title="Start another assessment" secondary onPress={start} />}
    <Button title="Explore demo farm" secondary onPress={() => { app.exploreDemo(); router.push('/assessment/results'); }} />
    <Card pale><Heading small design="11:106">Less methane, more possibility.</Heading><Body muted design="11:107">Good for your farm. Better for the planet.</Body></Card>
    {!latest && <Text style={styles.modeText}>Indicative estimates only.</Text>}
  </Screen>;
}
