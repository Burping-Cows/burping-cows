import React, { useEffect, useState } from 'react';
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
  useEffect(() => { if (app.ready) form.reset({ ...emptyInput, ...app.farmDefaults }); }, [app.ready, app.farmDefaults, form]);
  const save = form.handleSubmit(async values => { try { await app.saveFarmDefaults({ farmType: values.farmType, animalCount: values.animalCount, state: values.state, manureSystem: values.manureSystem, projectStartedStatus: values.projectStartedStatus, siteControl: values.siteControl, monitoringEquipment: values.monitoringEquipment }); setSaved(true); setError(''); } catch (e) { setError(errorMessage(e)); } });
  const logout = async () => {
    setLoggingOut(true); setError('');
    try { await app.logout(); router.replace('/onboarding'); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoggingOut(false); }
  };
  return <Screen title="Your farm profile" subtitle="A head start for your next assessment."><Card><Heading small>{app.user && !app.user.is_anonymous ? app.user.user_metadata?.full_name || 'Your account' : 'Guest account'}</Heading><Body muted>{app.user && !app.user.is_anonymous ? app.user.email : 'Explore the app, or log in to your account.'}</Body>{(!app.user || app.user.is_anonymous) && <><Button title="Log in" onPress={() => router.push('/login')} /><Button title="Create account" secondary onPress={() => router.push('/signup')} /></>}</Card><Card pale><Body muted design="11:788">Save your usual farm details to prefill new assessments. Every assessment keeps its own copy.</Body></Card><FarmFields form={form} /><ErrorNotice message={error} /><Button title="Save farm defaults" icon="arrow-right" onPress={() => void save()} />{saved && <Card pale><Heading small>Farm defaults saved</Heading><Body muted style={{ minHeight: 46 }}>These details will be used when you start another assessment.</Body></Card>}<Button title="About & disclaimer" secondary onPress={() => router.push('/about')} /><Button title="Log out" secondary icon="logout" loading={loggingOut} onPress={() => void logout()} /></Screen>;
}
