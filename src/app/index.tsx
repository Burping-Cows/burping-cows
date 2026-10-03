import { Redirect } from 'expo-router';
import { useApp } from '../state/AppProvider';
export default function Index() { const { ready, welcomed } = useApp(); if (!ready) return null; return <Redirect href={welcomed ? '/(tabs)/home' : '/onboarding'} />; }
