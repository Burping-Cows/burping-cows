import React from 'react';
import { View } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useApp } from '../../state/AppProvider';
import { farmSchema, projectSchema } from '../../lib/validation';
import { ProjectFields, useDraftForm } from '../../components/AssessmentForm';
import { Body, Button, Card, Icon, Screen } from '../../components/ui';
import { FarmIllustration } from '../../components/Illustration';
export default function Project() { const app = useApp(), form = useDraftForm(projectSchema); if (!farmSchema.safeParse(app.draft.input).success) return <Redirect href="/assessment/farm-profile" />; return <Screen title="Methane project assessment" subtitle="What are you planning to change?" step={2} back><ProjectFields form={form} /><View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Card pale style={{ flex: 1, padding: 10 }}><Body style={{ textAlign: 'center', fontFamily: 'DM_Sans_700Bold' }}>Before</Body><Body muted style={{ textAlign: 'center', fontSize: 11 }}>Methane released</Body><FarmIllustration height={85} /></Card><Icon name="arrow-right" /><Card pale style={{ flex: 1, padding: 10 }}><Body style={{ textAlign: 'center', fontFamily: 'DM_Sans_700Bold' }}>After</Body><Body muted style={{ textAlign: 'center', fontSize: 11 }}>Captured / destroyed / used</Body><FarmIllustration height={85} captured /></Card></View><Button title="See my opportunity" icon="arrow-right" onPress={() => void form.handleSubmit(values => { app.setInput(values); app.setStep(3); router.push('/assessment/results'); })()} /><Body muted style={{ fontSize: 11 }}>Demonstration assumptions only. Not an official method calculation.</Body></Screen>; }
