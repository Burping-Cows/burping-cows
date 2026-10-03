import React from 'react';
import { router } from 'expo-router';
import { Body, Button, Card, Heading, Screen } from '../../components/ui';
import { FarmIllustration } from '../../components/Illustration';
import { useApp } from '../../state/AppProvider';
export default function Assess() {
  const app = useApp();
  return <Screen title="Check your opportunity" subtitle="A little information. A useful starting point." subtitleDesign="11:114">
    <FarmIllustration />
    <Card><Heading small design="11:184">Three steps to a clearer picture</Heading><Body muted>1. Tell us about your farm{'\n'}2. Describe your methane project{'\n'}3. Explore estimates and next steps</Body>{!app.draft.started && <Body muted design="11:186">Rough estimates are okay. Your draft saves automatically on this device.</Body>}</Card>
    {app.draft.started && <Button title="Continue assessment" icon="arrow-right" onPress={() => router.push(app.draft.step === 3 ? '/assessment/results' : app.draft.step === 2 ? '/assessment/project' : '/assessment/farm-profile')} />}
    <Button title="Start new assessment" icon={app.draft.started ? undefined : 'arrow-right'} secondary={app.draft.started} onPress={() => { app.startNew(); router.push('/assessment/farm-profile'); }} />
    <Button title="Explore demo farm" secondary onPress={() => { app.exploreDemo(); router.push('/assessment/results'); }} />
    <Body muted style={{ fontSize: 12, lineHeight: 19 }}>Starting a new assessment replaces the current draft. Saved assessments remain available.</Body>
  </Screen>;
}
