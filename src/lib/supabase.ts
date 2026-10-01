import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const cloudConfigured = Boolean(url && key);
export const incompleteCloudConfig = Boolean(url || key) && !cloudConfigured;
export const supabase = cloudConfigured ? createClient(url!, key!, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(15000) }) } }) : null;
if (Platform.OS !== 'web' && supabase) AppState.addEventListener('change', state => { if (state === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh(); });
let authPromise: Promise<string> | undefined;
export async function getOwnerId(): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (!authPromise) authPromise = (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) return data.session.user.id;
    const signed = await supabase.auth.signInAnonymously();
    if (signed.error) throw signed.error;
    if (!signed.data.user) throw new Error('Anonymous sign-in failed. Enable anonymous sign-ins in Supabase.');
    return signed.data.user.id;
  })().finally(() => { authPromise = undefined; });
  return authPromise;
}
