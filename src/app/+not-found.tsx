import { router } from 'expo-router';
import { Button, EmptyState, Screen } from '../components/ui';
export default function NotFound() { return <Screen title="Page not found"><EmptyState title="Let’s get back to the farm" text="This page isn’t available." /><Button title="Go home" onPress={() => router.replace('/(tabs)/home')} /></Screen>; }
