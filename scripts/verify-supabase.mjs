// Run against a disposable Supabase development project, after applying migrations.
// Creates two anonymous accounts; deletes test assessment rows on completion.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL, key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env first.');
const makeClient = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const a = makeClient(), b = makeClient(), unauthenticated = makeClient();
const id = randomUUID();
const authA = await a.auth.signInAnonymously(), authB = await b.auth.signInAnonymously();
assert.ifError(authA.error); assert.ifError(authB.error);
try {
  const insert = await a.from('assessments').insert({ id, owner_id: authA.data.user.id, device_id: 'security-test', calculation_snapshot: {} }).select('id');
  assert.ifError(insert.error); assert.equal(insert.data.length, 1);
  const own = await a.from('assessments').select('id').eq('id', id); assert.ifError(own.error); assert.equal(own.data.length, 1);
  const other = await b.from('assessments').select('id').eq('id', id); assert.ifError(other.error); assert.equal(other.data.length, 0);
  const update = await b.from('assessments').update({ device_id: 'stolen' }).eq('id', id).select('id'); assert.ifError(update.error); assert.equal(update.data.length, 0);
  const remove = await b.from('assessments').delete().eq('id', id).select('id'); assert.ifError(remove.error); assert.equal(remove.data.length, 0);
  const forge = await b.from('assessments').insert({ owner_id: authA.data.user.id, device_id: 'forged', calculation_snapshot: {} }); assert.ok(forge.error);
  const transfer = await a.from('assessments').update({ owner_id: authB.data.user.id }).eq('id', id); assert.ok(transfer.error);
  const unauth = await unauthenticated.from('assessments').select('id').eq('id', id); assert.ok(unauth.error || unauth.data.length === 0);
  const configRead = await unauthenticated.from('app_config').select('key'); assert.ifError(configRead.error); assert.ok(configRead.data.length >= 3);
  const configWrite = await a.from('app_config').insert({ key: 'must-not-write', value: 1 }); assert.ok(configWrite.error);
  console.log('PASS: owner CRUD, cross-user isolation, owner transfer prevention, unauthenticated protection, read-only config.');
} finally { const clean = await a.from('assessments').delete().eq('id', id); assert.ifError(clean.error); }
