import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Navigation } from '../src/app/_layout';
import Index from '../src/app/index';

const mocks = vi.hoisted(() => ({
  app: { ready: false, welcomed: false, bootError: '', retryBoot: vi.fn() },
  mounts: 0, unmounts: 0,
}));
vi.mock('../src/state/AppProvider', () => ({ useApp: () => mocks.app, AppProvider: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('react-native', () => ({ View: 'View', Text: 'Text', ActivityIndicator: 'ActivityIndicator', StyleSheet: { absoluteFill: {} } }));
vi.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider' }));
vi.mock('@expo-google-fonts/dm-sans', () => ({ useFonts: () => [true], DMSans_400Regular: {}, DMSans_500Medium: {}, DMSans_700Bold: {} }));
vi.mock('../src/components/ui', () => ({ Button: 'Button', ErrorNotice: 'ErrorNotice' }));
vi.mock('expo-router', () => {
  const Stack = Object.assign(function Stack({ children }: { children: React.ReactNode }) {
    React.useEffect(() => { mocks.mounts++; return () => { mocks.unmounts++; }; }, []);
    return React.createElement('Navigator', {}, children);
  }, {
    Screen: (props: { name: string }) => React.createElement('Route', props),
    Protected: ({ guard, children }: { guard: boolean; children: React.ReactNode }) => guard ? children : null,
  });
  return { Stack, Redirect: (props: { href: string }) => React.createElement('Redirect', props) };
});
let renderer: ReactTestRenderer;
beforeEach(() => {
  mocks.app.ready = false; mocks.app.welcomed = false; mocks.app.bootError = ''; mocks.mounts = 0; mocks.unmounts = 0;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); });
it('keeps the root navigator mounted through hydration, signup session changes, and logout', async () => {
  await act(async () => { renderer = create(<Navigation />); });
  const states = [
    { ready: true, welcomed: false },
    { ready: false, welcomed: false }, // signup replaces the guest session
    { ready: true, welcomed: true },
    { ready: false, welcomed: true }, // account data hydrates
    { ready: true, welcomed: false }, // logout
  ];
  for (const state of states) {
    Object.assign(mocks.app, state);
    await act(async () => renderer.update(<Navigation />));
    expect(renderer.root.findAllByType('Navigator' as React.ElementType)).toHaveLength(1);
    expect(renderer.root.findAllByType('Redirect' as React.ElementType)).toHaveLength(0);
  }
  expect(mocks.mounts).toBe(1); expect(mocks.unmounts).toBe(0);
});
it('removes private routes after logout while leaving signup and onboarding available', async () => {
  mocks.app.ready = true; mocks.app.welcomed = true;
  await act(async () => { renderer = create(<Navigation />); });
  const routes = () => renderer.root.findAllByType('Route' as React.ElementType).map(node => node.props.name);
  expect(routes()).toContain('(tabs)');
  mocks.app.welcomed = false;
  await act(async () => renderer.update(<Navigation />));
  expect(routes()).not.toContain('(tabs)'); expect(routes()).not.toContain('assessment/results');
  expect(routes()).toContain('signup'); expect(routes()).toContain('onboarding');
});
it('waits for restored onboarding state before dispatching the initial redirect', async () => {
  await act(async () => { renderer = create(<Index />); });
  expect(renderer.toJSON()).toBeNull();
  mocks.app.ready = true; mocks.app.welcomed = true;
  await act(async () => renderer.update(<Index />));
  expect(renderer.root.findByType('Redirect' as React.ElementType).props.href).toBe('/(tabs)/home');
  mocks.app.welcomed = false;
  await act(async () => renderer.update(<Index />));
  expect(renderer.root.findByType('Redirect' as React.ElementType).props.href).toBe('/onboarding');
});
