import React from 'react';
import { router } from 'expo-router';
import { FarmFields, useDraftForm } from '../../components/AssessmentForm';
import { Body, Button, Card, Screen } from '../../components/ui';
import { farmSchema } from '../../lib/validation';
import { useApp } from '../../state/AppProvider';
export default function FarmProfile() { const app = useApp(), form = useDraftForm(farmSchema); return <Screen title="Farm profile" step={1} back><Card pale><Body>No stress, rough estimates are okay. We just need a few details to get started.</Body></Card><FarmFields form={form} /><Button title="Next: your project" icon="arrow-right" onPress={() => void form.handleSubmit(values => { app.setInput(values); app.setStep(2); router.push('/assessment/project'); })()} /><Body muted style={{ fontSize: 11 }}>Progress saves automatically on this device.</Body></Screen>; }
