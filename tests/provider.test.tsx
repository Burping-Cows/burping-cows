import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppProvider, useApp } from '../src/state/AppProvider';
import { demoInput } from '../src/lib/demo';
import { defaultAssumptions } from '../src/config/assumptions';
const mocks = vi.hoisted(() => ({ store: new Map<string, unknown>(), write: vi.fn(), save: vi.fn(), remove: vi.fn(), id: 0 }));
vi.mock('expo-crypto', () => ({ randomUUID: () => `uuid-${++mocks.id}` }));
vi.mock('../src/lib/storage', () => ({ readLocal: async (key: string, fallback: unknown) => mocks.store.get(key) ?? fallback, writeLocal: mocks.write }));
vi.mock('../src/lib/repository', () => ({ listAssessments: async () => [], loadAssumptions: async () => defaultAssumptions, persistAssessment: mocks.save, removeAssessment: mocks.remove }));
vi.mock('../src/lib/supabase', () => ({ supabase: null }));
let app: ReturnType<typeof useApp>, renderer: ReactTestRenderer;
function Probe() { const value = useApp(); React.useEffect(() => { app = value; }, [value]); return null; }
async function mount() { await act(async () => { renderer = create(<AppProvider><Probe /></AppProvider>); }); await vi.waitFor(() => expect(app.ready).toBe(true)); }
beforeEach(() => { mocks.store.clear(); mocks.write.mockReset().mockImplementation(async (key: string, value: unknown) => { mocks.store.set(key, value); }); mocks.save.mockReset().mockResolvedValue(undefined); mocks.remove.mockReset().mockResolvedValue(undefined); (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); });
it('restores a draft and its active step across restarts', async () => { mocks.store.set('draft', { input: demoInput, started: true, step: 2 }); await mount(); expect(app.draft.input.animalCount).toBe(500); expect(app.draft.step).toBe(2); await act(async () => app.setInput({ animalCount: 451 })); expect((mocks.store.get('draft') as typeof app.draft).input.animalCount).toBe(451); });
it('does not report success or drop a draft when cloud saving fails', async () => { await mount(); await act(async () => app.exploreDemo()); mocks.save.mockRejectedValueOnce(new Error('network unavailable')); await act(async () => { await expect(app.save()).rejects.toThrow('network unavailable'); }); expect(app.records).toEqual([]); expect(app.draft.input).toEqual(demoInput); expect(app.busy).toBe(false); });
it('updates an existing record and duplicates into a separate draft', async () => { await mount(); await act(async () => app.exploreDemo()); await act(async () => { await app.save(); }); const first = app.records[0]; await act(async () => { await app.save(); }); expect(app.records).toHaveLength(1); await act(async () => app.edit(first, true)); expect(app.draft.editingId).toBeUndefined(); await act(async () => { await app.save(); }); expect(app.records).toHaveLength(2); expect(app.records[0].id).not.toBe(first.id); });
it('retains a saved record when deletion fails', async () => { await mount(); await act(async () => app.exploreDemo()); await act(async () => { await app.save(); }); mocks.remove.mockRejectedValueOnce(new Error('delete failed')); await act(async () => { await expect(app.remove(app.records[0].id)).rejects.toThrow('delete failed'); }); expect(app.records).toHaveLength(1); });
it('prefills only new assessments with stored farm defaults', async () => { await mount(); await act(async () => app.exploreDemo()); await act(async () => { await app.saveFarmDefaults({ farmName: 'Test farm', farmType: 'Piggery', animalCount: 100, state: 'NSW', postcode: '', wasteStream: 'Liquid effluent', manureSystem: 'Anaerobic pond', baselineAnaerobic: 'yes', baselineEvidence: 'Unsure' }); }); expect(app.draft.input.farmType).toBe('Dairy'); await act(async () => app.startNew()); expect(app.draft.input.farmType).toBe('Piggery'); expect(app.draft.input.biogasVolumeM3).toBeUndefined(); });
it('persists logout across restarts without clearing saved work or the draft', async () => {
  await mount();
  await act(async () => { await app.welcome(); app.exploreDemo(); });
  await act(async () => { await app.save(); });
  const records = app.records, draft = app.draft;
  await act(async () => { await app.logout(); });
  expect(app.welcomed).toBe(false);
  expect(app.records).toEqual(records);
  expect(app.draft).toEqual(draft);
  await act(async () => renderer.unmount());
  await mount();
  expect(app.welcomed).toBe(false);
  expect(app.draft).toEqual(draft);
});
it('saves an incomplete assessment and resumes its new finance step', async () => {
  await mount(); await act(async () => app.exploreDemo());
  await act(async () => { app.setInput({ biogasVolumeM3: undefined, annualFees: undefined }); app.setStep(5); });
  await act(async () => { await app.save(); });
  expect(app.records[0].result.technical.annualNetAbatement).toBeNull();
  expect(app.records[0].result.finance.state).toBe('insufficient_data');
  await act(async () => renderer.unmount()); await mount();
  expect(app.draft.step).toBe(5); expect(app.draft.input.biogasVolumeM3).toBeUndefined();
});
it('retains archived legacy evidence when duplicating a scenario', async () => {
  await mount(); await act(async () => app.exploreDemo());
  await act(async () => { await app.save(); });
  const legacySnapshot = { originalResult: 123 };
  await act(async () => app.edit({ ...app.records[0], legacySnapshot }, true));
  await act(async () => { await app.save(); });
  expect(app.records[0].legacySnapshot).toEqual(legacySnapshot);
});

it('pauses an incomplete form at the actual screen and restores it after restart', async () => {
  await mount(); await act(async () => app.exploreDemo());
  await act(async () => app.setStep(6));
  await act(async () => { await app.pauseAssessment(2, { farmName: 'My paused farm', flareType: '', animalCount: undefined }); });
  expect(app.draft.step).toBe(2);
  expect(app.draft.started).toBe(true);
  expect(app.draft.input.farmName).toBe('My paused farm');
  expect(app.draft.input.flareType).toBe('');
  expect(mocks.save).not.toHaveBeenCalled();
  expect((mocks.store.get('draft') as typeof app.draft).step).toBe(2);
  await act(async () => renderer.unmount()); await mount();
  expect(app.draft.step).toBe(2);
  expect(app.draft.input.farmName).toBe('My paused farm');
  expect(app.draft.input.animalCount).toBeUndefined();
  expect(app.draft.input.flareType).toBe('');
});
it('surfaces pause storage failures and keeps the in-memory draft available for retry', async () => {
  await mount(); await act(async () => app.exploreDemo());
  mocks.write.mockRejectedValue(new Error('Device storage unavailable'));
  await act(async () => { await expect(app.pauseAssessment(4, { biogasVolumeM3: 123 })).rejects.toThrow('Device storage unavailable'); });
  expect(app.draft.input.biogasVolumeM3).toBe(123);
  expect(app.draft.step).toBe(4);
  expect(app.storageError).toBe('Device storage unavailable');
  expect(mocks.save).not.toHaveBeenCalled();
});
