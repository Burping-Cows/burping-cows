import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { AppProvider, useApp } from '../src/state/AppProvider';
import { demoInput } from '../src/lib/demo';
import { defaultAssumptions } from '../src/config/assumptions';
const mocks = vi.hoisted(() => ({
  store: new Map<string, unknown>(), user: null as User | null,
  callback: null as ((event: string, session: { user: User } | null) => void) | null,
  list: vi.fn(), signOut: vi.fn(),
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'uuid' }));
vi.mock('../src/lib/storage', () => ({ readLocal: async (key: string, fallback: unknown) => mocks.store.get(key) ?? fallback, writeLocal: async (key: string, value: unknown) => { mocks.store.set(key, value); } }));
vi.mock('../src/lib/repository', () => ({ listAssessments: mocks.list, loadAssumptions: async () => defaultAssumptions, persistAssessment: vi.fn(), removeAssessment: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: { auth: {
  getSession: async () => ({ data: { session: mocks.user ? { user: mocks.user } : null }, error: null }),
  onAuthStateChange: (callback: typeof mocks.callback) => { mocks.callback = callback; return { data: { subscription: { unsubscribe: () => { mocks.callback = null; } } } }; },
  signOut: mocks.signOut,
} } }));
let app: ReturnType<typeof useApp>, renderer: ReactTestRenderer;
function Probe() { const value = useApp(); React.useEffect(() => { app = value; }, [value]); return null; }
const account = (id: string, anonymous = false) => ({ id, is_anonymous: anonymous, email: `${id}@example.com`, user_metadata: {} } as User);
async function mount() { await act(async () => { renderer = create(<AppProvider><Probe /></AppProvider>); }); await vi.waitFor(() => expect(app.ready).toBe(true)); }
beforeEach(() => {
  mocks.store.clear(); mocks.user = account('alice'); mocks.list.mockReset().mockResolvedValue([]);
  mocks.signOut.mockReset().mockImplementation(async () => { mocks.user = null; mocks.callback?.('SIGNED_OUT', null); return { error: null }; });
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); });
it('restores an account session and its private draft instead of the guest draft', async () => {
  mocks.store.set('draft', { input: { ...demoInput, animalCount: 999 }, started: true, step: 2 });
  mocks.store.set('draft:account:alice', { input: demoInput, started: true, step: 3 });
  mocks.store.set('welcomed', true);
  await mount();
  expect(app.user?.id).toBe('alice'); expect(app.draft.input.animalCount).toBe(500); expect(app.welcomed).toBe(true);
});
it('switches account drafts and defaults without copying the previous account data', async () => {
  await mount();
  await act(async () => app.exploreDemo());
  mocks.store.set('draft:account:bob', { input: { ...demoInput, animalCount: 12 }, started: true, step: 1 });
  await act(async () => { mocks.user = account('bob'); mocks.callback?.('SIGNED_IN', { user: mocks.user }); });
  expect(app.draft.input.animalCount).toBe(12); expect(app.farmDefaults).toBeNull();
  expect((mocks.store.get('draft:account:alice') as typeof app.draft).input.animalCount).toBe(500);
  expect((mocks.store.get('draft:account:bob') as typeof app.draft).input.animalCount).toBe(12);
});
it('actually signs out permanent accounts while preserving their stored draft', async () => {
  await mount(); await act(async () => { app.exploreDemo(); await app.welcome(); });
  await act(async () => app.logout());
  expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' }); expect(app.user).toBeNull(); expect(app.welcomed).toBe(false);
  expect(mocks.store.get('welcomed')).toBe(false); expect(mocks.store.has('draft:account:alice')).toBe(true); expect(app.records).toEqual([]);
});
it('reports signout failures and keeps users in their account', async () => {
  await mount(); await act(async () => app.welcome());
  mocks.signOut.mockResolvedValueOnce({ error: new Error('Offline') });
  await act(async () => { await expect(app.logout()).rejects.toThrow('Offline'); });
  expect(app.welcomed).toBe(true); expect(mocks.store.get('welcomed')).toBe(true); expect(app.user?.id).toBe('alice');
});
it('returns guests to onboarding without destroying their anonymous session', async () => {
  mocks.user = account('guest', true); await mount(); await act(async () => app.welcome());
  await act(async () => app.logout());
  expect(mocks.signOut).not.toHaveBeenCalled(); expect(app.user?.id).toBe('guest'); expect(app.welcomed).toBe(false);
});
