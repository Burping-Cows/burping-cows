import React, { useState } from 'react';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { AssessmentInput, emptyInput } from '../../types/assessment';
import { farmSchema } from '../../lib/validation';
import { FarmFields, resolverFor } from '../../components/AssessmentForm';
import { Body, Button, Card, ErrorNotice, Heading, Screen } from '../../components/ui';
import { errorMessage, useApp } from '../../state/AppProvider';
export default function Profile() {
  const app = useApp(), [saved, setSaved] = useState(false), [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const form = useForm<AssessmentInput>({ defaultValues: { ...emptyInput, ...app.farmDefaults }, resolver: resolverFor(farmSchema), mode: 'onTouched' });
  const save = form.handleSubmit(async values => { try { await app.saveFarmDefaults({ farmType: values.farmType, animalCount: values.animalCount, state: values.state, manureSystem: values.manureSystem, projectStartedStatus: values.projectStartedStatus, siteControl: values.siteControl, monitoringEquipment: values.monitoringEquipment }); setSaved(true); setError(''); } catch (e) { setError(errorMessage(e)); } });
  const logout = async () => {
    setLoggingOut(true); setError('');
    try { await app.logout(); router.dismissAll(); router.replace('/onboarding'); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoggingOut(false); }
  };
  return <Screen title="Your farm profile" subtitle="A head start for your next assessment."><Card pale><Body>Save your usual farm details to prefill new assessments. Every assessment keeps its own copy.</Body></Card><FarmFields form={form} /><ErrorNotice message={error} />{saved && <Card pale><Heading small>Farm defaults saved</Heading><Body>These details will be used when you start another assessment.</Body></Card>}<Button title="Save farm defaults" onPress={() => void save()} /><Button title="About & disclaimer" secondary onPress={() => router.push('/about')} /><Button title="Log out" secondary icon="logout" loading={loggingOut} onPress={() => void logout()} /></Screen>;
}
