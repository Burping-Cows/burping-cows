import React from 'react';
import { View, Text } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useApp } from '../../state/AppProvider';
import { farmSchema, projectSchema } from '../../lib/validation';
import { ProjectFields, useDraftForm } from '../../components/AssessmentForm';
import { Body, Button, Card, Screen, styles } from '../../components/ui';
import { FarmIllustration } from '../../components/Illustration';
export default function Project() {
  const app = useApp(), form = useDraftForm(projectSchema);
  if (!app.ready) return null;
  if (!farmSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/farm-profile" />;
  return <Screen title="Methane project assessment" subtitle="What are you planning to change?" step={2} back>
    <ProjectFields form={form} />
    {form.watch('methaneInputType') === 'tonnes' && <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <Card pale style={{ flex: 1 }}><Text style={[styles.label, { textAlign: 'center' }]}>Before</Text><Text style={[styles.modeText, { textAlign: 'center' }]}>Methane released</Text><FarmIllustration height={85} /></Card>
      <Card pale style={{ flex: 1 }}><Text style={[styles.label, { textAlign: 'center' }]}>After</Text><Text style={[styles.modeText, { textAlign: 'center', minHeight: 32 }]}>Captured / destroyed / used</Text><FarmIllustration height={85} captured /></Card>
    </View>}
    <Button title="See my opportunity" icon="arrow-right" onPress={() => void form.handleSubmit(values => { app.setInput(values); app.setStep(3); router.push('/assessment/results'); })()} />
    <Body muted style={styles.modeText}>Demonstration assumptions only. Not an official method calculation.</Body>
  </Screen>;
}
