import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Heading, Icon, MetricCard, ProgressRing, Screen, StatusBadge, money, number, styles } from '../../components/ui';
import { FarmIllustration, Logo } from '../../components/Illustration';
import { useApp } from '../../state/AppProvider';
import { eligibilityLabel } from '../../lib/eligibility';
export default function Home() {
  const app = useApp(), latest = app.records[0];
  const start = () => { app.startNew(); router.push('/assessment/farm-profile'); };
  return <Screen><View style={[styles.row, { justifyContent: 'space-between' }]}><View style={{ flex: 1 }}><View style={styles.row}><Icon name="white-balance-sunny" color="#CF961F" /><Heading>Morning!</Heading></View><Body muted>Less methane. More value.</Body></View><Logo size={52} /></View>
    <Card pale style={{ padding: 0, overflow: 'hidden' }}><View style={{ padding: 20, gap: 8 }}><Text style={{ fontSize: 11, letterSpacing: 1.6, color: '#176544', fontFamily: 'DM_Sans_700Bold' }}>A BRIGHTER FUTURE FOR YOUR FARM</Text><Heading small>The less your cow buprs,{'\n'}The better your income.</Heading><Body muted>Practical first steps for Australian farmers.</Body></View><FarmIllustration height={155} /></Card>
    {latest ? <><View style={styles.grid}><MetricCard label="Eligibility" value={eligibilityLabel[latest.result.eligibility]} hint="Based on your farm profile" icon="check-circle-outline" /><MetricCard label="Estimated ACCUs" value={`${number(latest.result.accus)}/yr`} hint="Indicative only" icon="chart-bar" /><MetricCard label="Gross carbon value" value={`${money(latest.result.annualValue)}/yr`} hint={`At ${money(latest.input.accuPrice)}/ACCU`} icon="cash-multiple" /><MetricCard label="Readiness" icon="sprout"><ProgressRing value={latest.result.readiness} /></MetricCard></View><Card><View style={styles.row}><Icon name="barn" /><Heading small>Latest assessment</Heading></View><Body>{latest.sample ? 'Sample · ' : ''}{latest.input.farmType} · {latest.input.animalCount} animals · {latest.input.state}</Body><StatusBadge status={latest.result.eligibility} /><Body muted>Updated {new Date(latest.updatedAt).toLocaleDateString('en-AU')}</Body><Button title="View assessment" secondary onPress={() => router.push(`/assessment-details/${latest.id}`)} /></Card></> : <Card><Heading small>Find out if your farm has an ACCU opportunity.</Heading><Body muted>A few simple questions. A clearer picture of what to investigate next.</Body><Button title="Start assessment" onPress={start} icon="arrow-right" /></Card>}
    {app.draft.started && <Button title="Continue assessment" onPress={() => router.push(app.draft.step === 3 ? '/assessment/results' : app.draft.step === 2 ? '/assessment/project' : '/assessment/farm-profile')} icon="arrow-right" />}
    {latest && <Button title="Start another assessment" secondary onPress={start} />}
    <Button title="Explore demo farm" secondary onPress={() => { app.exploreDemo(); router.push('/assessment/results'); }} />
    <Card pale><View style={styles.row}><Icon name="leaf" size={32} /><View style={{ flex: 1 }}><Body style={{ fontFamily: 'DM_Sans_700Bold' }}>Less methane, more possibility.</Body><Body muted style={{ fontSize: 12 }}>Good for your farm. Better for the planet.</Body></View></View></Card><Body muted style={{ fontSize: 11 }}>Indicative estimates only.</Body>
  </Screen>;
}
