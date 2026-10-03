import { router } from 'expo-router';
import { Button, EmptyState, Screen } from '../components/ui';
export default function NotFound() { return <Screen title="Page not found"><EmptyState title="Let’s get back to the farm" text="This page isn’t available." textHeight={23} /><Button title="Go home" icon="arrow-right" onPress={() => router.replace('/(tabs)/home')} /></Screen>; }
