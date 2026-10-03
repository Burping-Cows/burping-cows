import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { AssessmentInput, Assumptions, SavedAssessment, emptyInput } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
import { readLocal, writeLocal } from '../lib/storage';
import { listAssessments, loadAssumptions, persistAssessment, removeAssessment } from '../lib/repository';
import { calculateAssessment } from '../lib/calculations';
import { demoInput } from '../lib/demo';
import { farmSchema, projectSchema, priceSchema } from '../lib/validation';
type Draft = { input: AssessmentInput; editingId?: string; sample?: boolean; started: boolean; step: number };
type FarmDefaults = Pick<AssessmentInput, 'farmType' | 'animalCount' | 'state' | 'manureSystem' | 'projectStartedStatus' | 'siteControl' | 'monitoringEquipment'>;
interface AppContextValue {
  ready: boolean; bootError: string; retryBoot: () => void; welcomed: boolean; welcome: () => Promise<void>; logout: () => Promise<void>;
  draft: Draft; setInput: (values: Partial<AssessmentInput>) => void; setStep: (step: number) => void;
  startNew: () => void; exploreDemo: () => void; edit: (record: SavedAssessment, duplicate?: boolean) => void;
  records: SavedAssessment[]; refresh: () => Promise<void>; listError: string; busy: boolean;
  save: () => Promise<SavedAssessment>; remove: (id: string) => Promise<void>; assumptions: Assumptions;
  farmDefaults: FarmDefaults | null; saveFarmDefaults: (values: FarmDefaults) => Promise<void>; storageError: string;
}
const Context = createContext<AppContextValue | null>(null);
const blankDraft = (): Draft => ({ input: { ...emptyInput, monitoringEquipment: [] }, started: false, step: 1 });
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false), [bootError, setBootError] = useState(''), [attempt, setAttempt] = useState(0);
  const [welcomed, setWelcomed] = useState(false), [draft, setDraft] = useState<Draft>(blankDraft);
  const [records, setRecords] = useState<SavedAssessment[]>([]), [listError, setListError] = useState(''), [busy, setBusy] = useState(false);
  const [assumptions, setAssumptions] = useState(defaultAssumptions), [farmDefaults, setFarmDefaults] = useState<FarmDefaults | null>(null), [storageError, setStorageError] = useState('');
  const saving = useRef(false);
  const setInput = useCallback((values: Partial<AssessmentInput>) => setDraft(current => ({ ...current, started: true, input: { ...current.input, ...values } })), []);
  useEffect(() => { let active = true; (async () => {
    try {
      const [storedDraft, storedWelcome, defaults] = await Promise.all([readLocal<Draft>('draft', blankDraft()), readLocal('welcomed', false), readLocal<FarmDefaults | null>('farm-defaults', null)]);
      if (!active) return;
      setDraft(storedDraft); setWelcomed(storedWelcome); setFarmDefaults(defaults); setReady(true); setBootError('');
      setBusy(true);
      const config = await loadAssumptions(); if (active) setAssumptions(config);
      try { const rows = await listAssessments(); if (active) { setRecords(rows); setListError(''); } } catch (error) { if (active) setListError(errorMessage(error)); } finally { if (active) setBusy(false); }
    } catch (error) { if (active) setBootError(errorMessage(error)); }
  })(); return () => { active = false; }; }, [attempt]);
  useEffect(() => { if (ready) void writeLocal('draft', draft).then(() => setStorageError('')).catch(error => setStorageError(errorMessage(error))); }, [draft, ready]);
  const refresh = async () => { setBusy(true); try { setRecords(await listAssessments()); setListError(''); } catch (error) { setListError(errorMessage(error)); } finally { setBusy(false); } };
  const value: AppContextValue = {
    ready, bootError, retryBoot: () => setAttempt(v => v + 1), welcomed, refresh,
    welcome: async () => { await writeLocal('welcomed', true); setWelcomed(true); }, draft, assumptions, records, listError, busy, storageError, farmDefaults,
    // Return to onboarding without losing access to the device's anonymous account or saved work.
    logout: async () => { await writeLocal('welcomed', false); setWelcomed(false); },
    setInput,
    setStep: step => setDraft(current => ({ ...current, step })),
    startNew: () => setDraft({ ...blankDraft(), started: true, input: { ...emptyInput, ...farmDefaults, monitoringEquipment: [...(farmDefaults?.monitoringEquipment ?? [])], accuPrice: assumptions.defaultAccuPrice } }),
    exploreDemo: () => setDraft({ input: { ...demoInput, monitoringEquipment: [...demoInput.monitoringEquipment] }, sample: true, started: true, step: 3 }),
    edit: (record, duplicate = false) => setDraft({ input: { ...record.input, monitoringEquipment: [...record.input.monitoringEquipment] }, editingId: duplicate ? undefined : record.id, sample: record.sample, started: true, step: 1 }),
    saveFarmDefaults: async values => { await writeLocal('farm-defaults', values); setFarmDefaults(values); },
    save: async () => {
      if (saving.current) throw new Error('A save is already in progress.');
      if (!farmSchema.safeParse(draft.input).success || !projectSchema.safeParse(draft.input).success || !priceSchema.safeParse(draft.input.accuPrice).success) throw new Error('Complete the farm and project steps and enter a valid price before saving.');
      saving.current = true; setBusy(true);
      try {
        const existing = records.find(row => row.id === draft.editingId), now = new Date().toISOString();
        const record: SavedAssessment = { id: draft.editingId ?? Crypto.randomUUID(), createdAt: existing?.createdAt ?? now, updatedAt: now, input: draft.input, result: calculateAssessment(draft.input, assumptions), assumptions, snapshotVersion: 1, sample: draft.sample };
        await persistAssessment(record);
        setRecords(rows => [record, ...rows.filter(row => row.id !== record.id)]); setDraft(current => ({ ...current, editingId: record.id }));
        return record;
      } finally { saving.current = false; setBusy(false); }
    },
    remove: async id => { setBusy(true); try { await removeAssessment(id); setRecords(rows => rows.filter(row => row.id !== id)); if (draft.editingId === id) setDraft(blankDraft()); } finally { setBusy(false); } },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() { const ctx = useContext(Context); if (!ctx) throw new Error('Missing AppProvider'); return ctx; }
export function errorMessage(error: unknown): string { return error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Something went wrong. Please retry.'; }
