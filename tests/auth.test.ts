import { beforeEach, expect, it, vi } from 'vitest';
import { acceptAuthLink, login, loginSchema, passwordSchema, requestPasswordReset, signup, signupSchema, updatePassword } from '../src/lib/auth';
const mocks = vi.hoisted(() => ({ auth: { signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn(), setSession: vi.fn(), exchangeCodeForSession: vi.fn() } }));
vi.mock('../src/lib/supabase', () => ({ supabase: { auth: mocks.auth } }));
beforeEach(() => { Object.values(mocks.auth).forEach(mock => mock.mockReset().mockResolvedValue({ data: {}, error: null })); });
it('validates email, signup password and matching confirmation without trimming passwords', () => {
  expect(loginSchema.safeParse({ email: 'not-an-email', password: 'abc' }).success).toBe(false);
  expect(signupSchema.safeParse({ name: '', email: 'a@example.com', password: 'short', confirmPassword: 'different' }).success).toBe(false);
  expect(passwordSchema.safeParse({ password: 'password123', confirmPassword: 'different' }).success).toBe(false);
  expect(loginSchema.parse({ email: ' a@example.com ', password: ' spaces ' }).password).toBe(' spaces ');
});
it('logs in with normalized email and returns the real session', async () => {
  const session = { user: { id: 'owner' } };
  mocks.auth.signInWithPassword.mockResolvedValue({ data: { session }, error: null });
  expect(await login(' a@example.com ', 'password123')).toBe(session);
  expect(mocks.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@example.com', password: 'password123' });
});
it('surfaces invalid credentials and does not report a missing session as success', async () => {
  mocks.auth.signInWithPassword.mockResolvedValueOnce({ error: new Error('Invalid credentials') });
  await expect(login('a@example.com', 'incorrect')).rejects.toThrow('Invalid credentials');
  await expect(login('a@example.com', 'password123')).rejects.toThrow('Could not log in');
});
it('handles signup requiring email confirmation without claiming the user is logged in', async () => {
  mocks.auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
  expect(await signup({ name: ' Sam ', email: 'sam@example.com', password: 'password123', confirmPassword: 'password123' }, 'burping-cows://auth/callback')).toBeNull();
  expect(mocks.auth.signUp).toHaveBeenCalledWith({ email: 'sam@example.com', password: 'password123', options: { data: { full_name: 'Sam' }, emailRedirectTo: 'burping-cows://auth/callback' } });
});
it('requests recovery with a callback and only submits matching valid new passwords', async () => {
  await requestPasswordReset(' a@example.com ', 'burping-cows://auth/callback?intent=recovery');
  expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@example.com', { redirectTo: 'burping-cows://auth/callback?intent=recovery' });
  await expect(updatePassword('password123', 'wrong')).rejects.toThrow();
  expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  await updatePassword('password123', 'password123');
  expect(mocks.auth.updateUser).toHaveBeenCalledWith({ password: 'password123' });
});
it('accepts native and web callback sessions and identifies recovery links', async () => {
  expect(await acceptAuthLink('burping-cows://auth/callback#access_token=access&refresh_token=refresh&type=recovery')).toBe(true);
  expect(mocks.auth.setSession).toHaveBeenCalledWith({ access_token: 'access', refresh_token: 'refresh' });
  expect(await acceptAuthLink('https://example.com/auth/callback?code=pkce&intent=recovery')).toBe(true);
  expect(mocks.auth.exchangeCodeForSession).toHaveBeenCalledWith('pkce');
  expect(await acceptAuthLink('burping-cows://auth/callback#access_token=access&refresh_token=refresh&type=signup')).toBe(false);
});
it('rejects expired, incomplete, and failed confirmation links', async () => {
  await expect(acceptAuthLink('burping-cows://auth/callback#error=expired&error_description=Expired%20link')).rejects.toThrow('Expired link');
  await expect(acceptAuthLink('burping-cows://auth/callback')).rejects.toThrow('incomplete');
  mocks.auth.setSession.mockResolvedValue({ error: new Error('Session invalid') });
  await expect(acceptAuthLink('burping-cows://auth/callback#access_token=a&refresh_token=r')).rejects.toThrow('Session invalid');
});
