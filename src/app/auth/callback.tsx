import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { AuthField } from '../../components/AuthScreen';
import { Body, Button, ErrorNotice, Heading, Screen } from '../../components/ui';
import { acceptAuthLink, passwordSchema, updatePassword } from '../../lib/auth';
import { errorMessage, useApp } from '../../state/AppProvider';
import { theme } from '../../config/theme';

export default function AuthCallback() {
  const url = Linking.useURL(), app = useApp();
  const [stage, setStage] = useState<'loading' | 'password' | 'confirmed' | 'error'>('loading');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [password, setPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handled = useRef(''), submitting = useRef(false);
  useEffect(() => {
    const link = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : url;
    if (!link || handled.current === link) return;
    handled.current = link;
    void acceptAuthLink(link).then(recovery => {
      // Strip credentials from browser history once the session is established.
      if (Platform.OS === 'web') window.history.replaceState({}, '', '/auth/callback');
      setStage(recovery ? 'password' : 'confirmed');
    }).catch(e => { setError(errorMessage(e)); setStage('error'); });
  }, [url]);
  const enter = async (changePassword: boolean) => {
    if (submitting.current) return;
    if (changePassword) {
      const parsed = passwordSchema.safeParse({ password, confirmPassword });
      if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message]))); return; }
    }
    submitting.current = true; setBusy(true); setError('');
    try {
      if (changePassword) await updatePassword(password, confirmPassword);
      setPassword(''); setConfirmPassword('');
      await app.welcome(); router.replace('/(tabs)/home');
    } catch (e) { setError(errorMessage(e)); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <Screen>
    <Heading>{stage === 'password' ? 'Choose a new password' : stage === 'confirmed' ? 'Email confirmed.' : stage === 'error' ? 'Let’s try that again.' : 'Opening your email link…'}</Heading>
    {stage === 'loading' && <ActivityIndicator color={theme.colors.primary} />}
    {stage === 'password' && <><Body muted>Use a new password with at least 8 characters.</Body><AuthField label="New password" kind="new-password" value={password} onChange={setPassword} error={errors.password} /><AuthField label="Confirm password" kind="new-password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} /></>}
    {stage === 'confirmed' && <Body>Your account is ready. Welcome to Burping Cows.</Body>}
    <ErrorNotice message={error} />
    {(stage === 'password' || stage === 'confirmed') && <Button title={stage === 'password' ? 'Save password' : 'Continue to my farm'} loading={busy} onPress={() => void enter(stage === 'password')} />}
    {stage === 'error' && <><Button title="Back to log in" onPress={() => router.replace('/login')} /><Button title="Request a new reset link" secondary onPress={() => router.replace('/forgot-password')} /></>}
  </Screen>;
}
