import React, { useRef, useState } from 'react';
import { router } from 'expo-router';
import { AssessmentInput } from '../types/assessment';
import { errorMessage, useApp } from '../state/AppProvider';
import { Button, ErrorNotice } from './ui';

export function AssessmentExit({ step, getValues }: { step: number; getValues?: () => AssessmentInput }) {
  const app = useApp();
  const [saving, setSaving] = useState(false), [error, setError] = useState('');
  const inFlight = useRef(false);
  const exit = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true); setError('');
    try {
      await app.pauseAssessment(step, getValues?.());
      router.dismissTo('/(tabs)/home');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };
  return <>
    <Button title="Save & exit" secondary icon="home-outline" loading={saving} onPress={() => void exit()} />
    <ErrorNotice message={error} />
  </>;
}
