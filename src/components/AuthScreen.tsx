import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { z } from 'zod';
import { Body, Button, Card, ErrorNotice, Heading, Icon, Screen, styles } from './ui';
import { Logo } from './Illustration';
import { theme } from '../config/theme';
import { cloudConfigured } from '../lib/supabase';
import { login, loginSchema, requestPasswordReset, signup, signupSchema } from '../lib/auth';
import { errorMessage, useApp } from '../state/AppProvider';

const c = theme.colors;
export function authRedirect(recovery = false) { return Linking.createURL('/auth/callback', { queryParams: recovery ? { intent: 'recovery' } : {} }); }

export function AuthField({ label, value, onChange, error, kind = 'text', helper }: {
  label: string; value: string; onChange: (value: string) => void; error?: string;
  kind?: 'text' | 'email' | 'password' | 'new-password'; helper?: string;
}) {
  const [visible, setVisible] = useState(false), secret = kind === 'password' || kind === 'new-password';
  return <View style={{ gap: 7 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrap, error && { borderColor: c.error }]}>
      <TextInput accessibilityLabel={label} accessibilityHint={helper} value={value} onChangeText={onChange}
        placeholder={kind === 'email' ? 'you@example.com' : secret ? 'Enter your password' : 'Your name'} placeholderTextColor={c.muted}
        keyboardType={kind === 'email' ? 'email-address' : 'default'} autoCapitalize={secret || kind === 'email' ? 'none' : 'words'}
        autoCorrect={false} secureTextEntry={secret && !visible}
        autoComplete={kind === 'email' ? 'email' : kind === 'new-password' ? 'new-password' : kind === 'password' ? 'current-password' : 'name'}
        textContentType={kind === 'email' ? 'emailAddress' : kind === 'new-password' ? 'newPassword' : kind === 'password' ? 'password' : 'name'}
        style={styles.input} />
      {secret && <Pressable accessibilityRole="button" accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} onPress={() => setVisible(v => !v)} style={authStyles.eye}><Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.muted} /></Pressable>}
    </View>
    {helper && <Body muted style={{ fontSize: 12 }}>{helper}</Body>}
    {error && <Text accessibilityRole="alert" style={styles.fieldError}>{error}</Text>}
  </View>;
}

export default function AuthScreen({ mode }: { mode: 'login' | 'signup' | 'reset' }) {
  const app = useApp(), isSignup = mode === 'signup', isReset = mode === 'reset';
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({}), [error, setError] = useState('');
  const [loading, setLoading] = useState(false), [sent, setSent] = useState(false);
  const submitting = useRef(false);
  const change = (key: keyof typeof values) => (value: string) => { setValues(v => ({ ...v, [key]: value })); setErrors(e => ({ ...e, [key]: '' })); setError(''); };
  const submit = async () => {
    if (submitting.current) return;
    const parsed = (isSignup ? signupSchema : isReset ? z.object({ email: loginSchema.shape.email }) : loginSchema).safeParse(values);
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message]))); return; }
    submitting.current = true; setLoading(true); setErrors({}); setError('');
    try {
      if (isReset) { await requestPasswordReset(values.email, authRedirect(true)); setSent(true); }
      else {
        const session = isSignup ? await signup(values, authRedirect()) : await login(values.email, values.password);
        setValues(v => ({ ...v, password: '', confirmPassword: '' }));
        if (!session) setSent(true);
        else { await app.welcome(); router.replace('/(tabs)/home'); }
      }
    } catch (e) { setError(errorMessage(e)); }
    finally { submitting.current = false; setLoading(false); }
  };
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/onboarding');
  return <Screen>
    <View style={authStyles.top}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} disabled={loading} style={authStyles.eye}><Icon name="chevron-left" size={28} /></Pressable><Text style={authStyles.brand}>Burping Cows</Text><View style={{ width: 44 }} /></View>
    <View style={authStyles.hero}><Logo size={100} /><Heading>{sent ? 'Check your inbox' : isSignup ? 'A brighter start.' : isReset ? 'Forgot your password?' : 'Welcome back.'}</Heading><Body muted style={{ textAlign: 'center' }}>{sent ? `We’ve sent instructions to ${values.email.trim()}.` : isSignup ? 'Create your account and keep your farm’s opportunities together.' : isReset ? 'We’ll send you a link to choose a new password.' : 'Log in to pick up where your farm left off.'}</Body></View>
    {sent ? <>
      <Card pale><Icon name="email-check-outline" size={30} /><Body>{isReset ? 'If an account uses this email, you’ll receive a reset link. Open it on this device to set a new password.' : 'Confirm your email using the link we sent, then log in. Check your spam folder too.'}</Body></Card>
      <Button title="Back to log in" onPress={() => router.replace('/login')} />
      <Button title="Use a different email" secondary onPress={() => setSent(false)} />
    </> : <>
      {!cloudConfigured && <Card pale><Body>Accounts are unavailable in local demo mode. You can explore Burping Cows without an account.</Body></Card>}
      {cloudConfigured && app.user?.is_anonymous && app.records.length > 0 && <Card pale><Body>Account assessments are separate from your guest assessments. Signing in or creating an account switches away from your guest session.</Body></Card>}
      {isSignup && <AuthField key="name" label="Full name" value={values.name} onChange={change('name')} error={errors.name} />}
      <AuthField key="email" label="Email address" kind="email" value={values.email} onChange={change('email')} error={errors.email} />
      {!isReset && <AuthField key="password" label="Password" kind={isSignup ? 'new-password' : 'password'} value={values.password} onChange={change('password')} error={errors.password} helper={isSignup ? 'Use at least 8 characters.' : undefined} />}
      {isSignup && <AuthField key="confirm" label="Confirm password" kind="new-password" value={values.confirmPassword} onChange={change('confirmPassword')} error={errors.confirmPassword} />}
      {mode === 'login' && <Pressable accessibilityRole="button" accessibilityLabel="Forgot password?" disabled={loading} onPress={() => router.push('/forgot-password')} style={authStyles.forgot}><Text style={authStyles.link}>Forgot password?</Text></Pressable>}
      <ErrorNotice message={error} />
      <Button title={isSignup ? 'Create account' : isReset ? 'Send reset link' : 'Log in'} loading={loading} disabled={!cloudConfigured} icon="arrow-right" onPress={() => void submit()} />
      {!isReset && <View style={authStyles.switch}><Body muted>{isSignup ? 'Already have an account?' : 'New to Burping Cows?'}</Body><Pressable accessibilityRole="button" disabled={loading} onPress={() => router.replace(isSignup ? '/login' : '/signup')} style={authStyles.textButton}><Text style={authStyles.link}>{isSignup ? 'Log in' : 'Sign up'}</Text></Pressable></View>}
      <Body muted style={{ textAlign: 'center', fontSize: 12 }}>Real farms. Real impact. Brighter tomorrows.</Body>
    </>}
  </Screen>;
}
const authStyles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: 'DM_Sans_700Bold', fontSize: 18, color: c.dark },
  hero: { alignItems: 'center', gap: 12, paddingVertical: Platform.OS === 'web' ? 20 : 12 },
  eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  forgot: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', marginTop: -12 },
  link: { fontFamily: 'DM_Sans_700Bold', color: c.primary, fontSize: 14 },
  switch: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 },
  textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
});
