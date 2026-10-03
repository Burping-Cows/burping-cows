import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, ErrorNotice, Icon, Screen, styles, DisclaimerCard } from '../components/ui';
import { Logo, FarmIllustration } from '../components/Illustration';
import { errorMessage, useApp } from '../state/AppProvider';
import { theme } from '../config/theme';
export default function Onboarding() {
  const app = useApp(), [error, setError] = useState('');
  const enter = async () => { try { await app.welcome(); router.replace('/(tabs)/home'); } catch (e) { setError(errorMessage(e)); } };
  return <Screen><View style={{ alignItems: 'center', paddingTop: 32, gap: 18 }}><Logo size={150} /><Text style={{ fontFamily: 'DM_Sans_700Bold', fontSize: 54, lineHeight: 53, color: theme.colors.dark, textAlign: 'center', letterSpacing: -2 }}>Burping{'\n'}Cows</Text><Body style={{ textAlign: 'center', fontSize: 19, lineHeight: 27 }}>From methane to money, {'\n'}minus the mystery.</Body><View style={{ height: 4, width: 80, backgroundColor: theme.colors.leaf, borderRadius: 5, marginVertical: 6 }} /><Body muted style={{ textAlign: 'center', maxWidth: 430 }}>See whether your methane project could make sense before spending money on consultants and audits.</Body></View><FarmIllustration height={200} /><View style={styles.row}><Icon name="sprout" /><Body style={{ flex: 1 }}>Real farms. Real impact. Brighter tomorrows.</Body></View><ErrorNotice message={error} /><Button title="Log in" onPress={() => router.push('/login')} /><Button title="Sign up" secondary onPress={() => router.push('/signup')} /><Button title="Use demo farm" secondary onPress={() => { void app.welcome().then(() => { app.exploreDemo(); router.replace('/assessment/farm-profile'); }).catch(e => setError(errorMessage(e))); }} /><Button title="Explore the app" secondary onPress={() => void enter()} /><DisclaimerCard /></Screen>;
}
