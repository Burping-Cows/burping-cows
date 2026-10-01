import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
let queue = Promise.resolve();
export async function readLocal<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(`burping-cows:${key}`);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { throw new Error('Local data could not be read. Your stored data has been preserved.'); }
}
export function writeLocal(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  const next = queue.catch(() => {}).then(() => AsyncStorage.setItem(`burping-cows:${key}`, serialized));
  queue = next;
  return next;
}
let devicePromise: Promise<string> | undefined;
export function getDeviceId() {
  if (!devicePromise) devicePromise = (async () => {
    const existing = await readLocal<string | null>('device-id', null);
    if (existing) return existing;
    const id = Crypto.randomUUID(); await writeLocal('device-id', id); return id;
  })().catch(error => { devicePromise = undefined; throw error; });
  return devicePromise;
}
