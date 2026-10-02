import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, DMSans_400Regular as DM_Sans_400Regular, DMSans_500Medium as DM_Sans_500Medium, DMSans_700Bold as DM_Sans_700Bold } from '@expo-google-fonts/dm-sans';
import { ActivityIndicator, Text, View } from 'react-native';
import { AppProvider, useApp } from '../state/AppProvider';
import { theme } from '../config/theme';
import { Button, ErrorNotice } from '../components/ui';
export default function RootLayout() {
  const [loaded, fontError] = useFonts({ DM_Sans_400Regular, DM_Sans_500Medium, DM_Sans_700Bold });
  if (!loaded && !fontError) return <View style={{ flex: 1, backgroundColor: theme.colors.cream, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary} /><Text>Loading Burping Cows…</Text></View>;
  return <SafeAreaProvider><AppProvider><Navigation /><StatusBar style="dark" /></AppProvider></SafeAreaProvider>;
}
function Navigation() {
  const app = useApp();
  if (!app.ready) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.cream }}>{app.bootError ? <><ErrorNotice message={app.bootError} /><Button title="Retry loading" onPress={app.retryBoot} /></> : <ActivityIndicator color={theme.colors.primary} />}</View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.cream }, animation: 'fade' }} />;
}
