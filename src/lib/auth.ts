import { z } from 'zod';
import { supabase } from './supabase';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
export const signupSchema = loginSchema.extend({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Use 100 characters or fewer.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });
export const passwordSchema = z.object({
  password: z.string().min(8, 'Use at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });

function client() {
  if (!supabase) throw new Error('Account sign-in is unavailable in local demo mode. You can still explore the app as a guest.');
  return supabase;
}
export async function login(email: string, password: string) {
  const credentials = loginSchema.parse({ email, password });
  const { data, error } = await client().auth.signInWithPassword(credentials);
  if (error) throw error;
  if (!data.session) throw new Error('Could not log in. Please try again.');
  return data.session;
}
export async function signup(values: z.infer<typeof signupSchema>, redirectTo: string) {
  const parsed = signupSchema.parse(values);
  const { data, error } = await client().auth.signUp({ email: parsed.email, password: parsed.password, options: { data: { full_name: parsed.name }, emailRedirectTo: redirectTo } });
  if (error) throw error;
  return data.session;
}
export async function requestPasswordReset(email: string, redirectTo: string) {
  const parsed = loginSchema.shape.email.parse(email);
  const { error } = await client().auth.resetPasswordForEmail(parsed, { redirectTo });
  if (error) throw error;
}
export async function updatePassword(password: string, confirmPassword: string) {
  const parsed = passwordSchema.parse({ password, confirmPassword });
  const { error } = await client().auth.updateUser({ password: parsed.password });
  if (error) throw error;
}
// Both native deep links and web redirects can carry an implicit session or a PKCE code.
export async function acceptAuthLink(url: string) {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.hash.slice(1));
  parsed.searchParams.forEach((value, key) => params.set(key, value));
  if (params.has('error') || params.has('error_description')) throw new Error(params.get('error_description') || 'This link is invalid or expired. Request a new email.');
  const access = params.get('access_token'), refresh = params.get('refresh_token'), code = params.get('code');
  const auth = client().auth;
  if (access && refresh) {
    const { error } = await auth.setSession({ access_token: access, refresh_token: refresh });
    if (error) throw error;
  } else if (code) {
    const { error } = await auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else throw new Error('This link is incomplete. Open the latest email link again.');
  return params.get('type') === 'recovery' || params.get('intent') === 'recovery';
}
