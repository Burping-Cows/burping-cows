import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { AssessmentInput, Assumptions, SavedAssessment, emptyInput } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
import { readLocal, writeLocal } from '../lib/storage';
import { listAssessments, loadAssumptions, persistAssessment, removeAssessment } from '../lib/repository';
import { calculateAssessment } from '../lib/calculations';
import { demoInput } from '../lib/demo';
import { farmSchema, projectSchema, priceSchema } from '../lib/validation';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
type Draft = { input: AssessmentInput; editingId?: string; sample?: boolean; started: boolean; step: number };
type FarmDefaults = Pick<AssessmentInput, 'farmType' | 'animalCount' | 'state' | 'manureSystem' | 'projectStartedStatus' | 'siteControl' | 'monitoringEquipment'>;
interface AppContextValue {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null), [authReady, setAuthReady] = useState(!supabase), [authError, setAuthError] = useState('');
  const scope = user && !user.is_anonymous ? user.id : '';
  const localKey = (key: string) => scope ? `${key}:account:${scope}` : key;
  const [loadedScope, setLoadedScope] = useState<string | null>(null);
  const generation = useRef(0);
  const welcomeLoaded = useRef(false);
  const [ready, setReady] = useState(false), [bootError, setBootError] = useState(''), [attempt, setAttempt] = useState(0);
  const [welcomed, setWelcomed] = useState(false), [draft, setDraft] = useState<Draft>(blankDraft);
  const [records, setRecords] = useState<SavedAssessment[]>([]), [listError, setListError] = useState(''), [busy, setBusy] = useState(false);
  const [assumptions, setAssumptions] = useState(defaultAssumptions), [farmDefaults, setFarmDefaults] = useState<FarmDefaults | null>(null), [storageError, setStorageError] = useState('');
  const saving = useRef(false);
  const setInput = useCallback((values: Partial<AssessmentInput>) => setDraft(current => ({ ...current, started: true, input: { ...current.input, ...values } })), []);
  useEffect(() => {
    if (!supabase) return;
    let active = true, eventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Keep this callback synchronous: Supabase holds its auth lock while notifying listeners.
      eventReceived = true;
      if (active) { setUser(session?.user ?? null); setAuthReady(true); setAuthError(''); }
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || eventReceived) return;
      if (error) setAuthError(error.message);
      else { setUser(data.session?.user ?? null); setAuthReady(true); setAuthError(''); }
    }).catch(error => { if (active) setAuthError(errorMessage(error)); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [attempt]);
  useEffect(() => { let active = true; (async () => {
    if (!authReady) return;
    generation.current += 1;
    setReady(false); setRecords([]); setListError(''); setDraft(blankDraft()); setFarmDefaults(null);
    try {
      const key = (name: string) => scope ? `${name}:account:${scope}` : name;
      const [storedDraft, storedWelcome, defaults] = await Promise.all([readLocal<Draft>(key('draft'), blankDraft()), readLocal('welcomed', false), readLocal<FarmDefaults | null>(key('farm-defaults'), null)]);
      if (!active) return;
      setDraft(storedDraft); if (!welcomeLoaded.current) { setWelcomed(storedWelcome); welcomeLoaded.current = true; } setFarmDefaults(defaults); setLoadedScope(scope); setReady(true); setBootError('');
      setBusy(true);
      const config = await loadAssumptions(); if (active) setAssumptions(config);
      try { const rows = storedWelcome || scope ? await listAssessments() : []; if (active) { setRecords(rows); setListError(''); } } catch (error) { if (active) setListError(errorMessage(error)); } finally { if (active) setBusy(false); }
    } catch (error) { if (active) setBootError(errorMessage(error)); }
  })(); return () => { active = false; }; }, [attempt, authReady, scope]);
  useEffect(() => { if (ready && loadedScope === scope) void writeLocal(scope ? `draft:account:${scope}` : 'draft', draft).then(() => setStorageError('')).catch(error => setStorageError(errorMessage(error))); }, [draft, ready, loadedScope, scope]);
  const refresh = async () => { const current = generation.current; setBusy(true); try { const rows = await listAssessments(); if (current === generation.current) { setRecords(rows); setListError(''); } } catch (error) { if (current === generation.current) setListError(errorMessage(error)); } finally { if (current === generation.current) setBusy(false); } };
  const value: AppContextValue = {
    user, ready: ready && loadedScope === scope, bootError: authError || bootError, retryBoot: () => setAttempt(v => v + 1), welcomed, refresh,
    welcome: async () => { await writeLocal('welcomed', true); setWelcomed(true); void refresh(); }, draft, assumptions, records, listError, busy, storageError, farmDefaults,
    logout: async () => {
      // Guest sessions remain recoverable on this device; permanent accounts really sign out.
      await writeLocal('welcomed', false);
      if (supabase && user && !user.is_anonymous) {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) { await writeLocal('welcomed', true); throw error; }
        generation.current += 1; setRecords([]); setDraft(blankDraft()); setFarmDefaults(null);
      }
      setWelcomed(false);
    },
    setInput,
    setStep: step => setDraft(current => ({ ...current, step })),
    startNew: () => setDraft({ ...blankDraft(), started: true, input: { ...emptyInput, ...farmDefaults, monitoringEquipment: [...(farmDefaults?.monitoringEquipment ?? [])], accuPrice: assumptions.defaultAccuPrice } }),
    exploreDemo: () => setDraft({ input: { ...demoInput, monitoringEquipment: [...demoInput.monitoringEquipment] }, sample: true, started: true, step: 3 }),
    edit: (record, duplicate = false) => setDraft({ input: { ...record.input, monitoringEquipment: [...record.input.monitoringEquipment] }, editingId: duplicate ? undefined : record.id, sample: record.sample, started: true, step: 1 }),
    saveFarmDefaults: async values => { const current = generation.current; await writeLocal(localKey('farm-defaults'), values); if (current === generation.current) setFarmDefaults(values); },
    save: async () => {
      if (saving.current) throw new Error('A save is already in progress.');
      if (!farmSchema.safeParse(draft.input).success || !projectSchema.safeParse(draft.input).success || !priceSchema.safeParse(draft.input.accuPrice).success) throw new Error('Complete the farm and project steps and enter a valid price before saving.');
      const currentGeneration = generation.current;
      saving.current = true; setBusy(true);
      try {
        const existing = records.find(row => row.id === draft.editingId), now = new Date().toISOString();
        const record: SavedAssessment = { id: draft.editingId ?? Crypto.randomUUID(), createdAt: existing?.createdAt ?? now, updatedAt: now, input: draft.input, result: calculateAssessment(draft.input, assumptions), assumptions, snapshotVersion: 1, sample: draft.sample };
        await persistAssessment(record);
        if (currentGeneration !== generation.current) throw new Error('Your account changed while saving. Return to the original account to check this assessment.');
        setRecords(rows => [record, ...rows.filter(row => row.id !== record.id)]); setDraft(current => ({ ...current, editingId: record.id }));
        return record;
      } finally { saving.current = false; if (currentGeneration === generation.current) setBusy(false); }
    },
    remove: async id => { const current = generation.current; setBusy(true); try { await removeAssessment(id); if (current === generation.current) { setRecords(rows => rows.filter(row => row.id !== id)); if (draft.editingId === id) setDraft(blankDraft()); } } finally { if (current === generation.current) setBusy(false); } },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() { const ctx = useContext(Context); if (!ctx) throw new Error('Missing AppProvider'); return ctx; }
export function errorMessage(error: unknown): string { return error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Something went wrong. Please retry.'; }
