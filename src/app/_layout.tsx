import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/dm-sans';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppProvider, useApp } from '../state/AppProvider';
import { theme } from '../config/theme';
import { Button, ErrorNotice } from '../components/ui';
export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    DM_Sans_400Regular: require('../../assets/fonts/DMSans-14pt-Regular.ttf'),
    DM_Sans_500Medium: require('../../assets/fonts/DMSans-14pt-Medium.ttf'),
    DM_Sans_700Bold: require('../../assets/fonts/DMSans-14pt-Bold.ttf'),
  });
  if (!loaded && !fontError) return <View style={{ flex: 1, backgroundColor: theme.colors.cream, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary} /><Text>Loading Burping Cows…</Text></View>;
  return <SafeAreaProvider><AppProvider><Navigation /><StatusBar style="dark" /></AppProvider></SafeAreaProvider>;
}
export function Navigation() {
  const app = useApp();
  // Keep the navigation container mounted during hydration and account changes.
  // Replacing it with a Redirect dispatches actions against an unmounted stack.
  return <View style={{ flex: 1 }}>
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.cream }, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="auth/callback" />
      <Stack.Protected guard={!app.ready || app.welcomed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="assessment/farm-profile" />
        <Stack.Screen name="assessment/project" />
        <Stack.Screen name="assessment/results" />
        <Stack.Screen name="assessment/action-plan" />
        <Stack.Screen name="assessment-details/[id]" />
      </Stack.Protected>
    </Stack>
    {!app.ready && <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', padding: 24, backgroundColor: theme.colors.cream }]}>{app.bootError ? <><ErrorNotice message={app.bootError} /><Button title="Retry loading" onPress={app.retryBoot} /></> : <ActivityIndicator color={theme.colors.primary} />}</View>}
  </View>;
}
