import { Redirect } from 'expo-router';
import { useApp } from '../state/AppProvider';
export default function Index() { const { welcomed } = useApp(); return <Redirect href={welcomed ? '/(tabs)/home' : '/onboarding'} />; }
