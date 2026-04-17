import 'server-only';
import { cookies } from 'next/headers';
import { encrypt, decrypt, type SessionPayload } from '@/lib/session-crypto';

export type { SessionPayload };

export async function createSession(caregiverId: string, householdId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ caregiverId, householdId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession(updates: Partial<SessionPayload>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const payload = await decrypt(sessionCookie);

  if (!payload) return null;

  const newPayload = { ...payload, ...updates };
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  newPayload.expiresAt = expiresAt;

  const session = await encrypt(newPayload);
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  return newPayload;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  return decrypt(sessionCookie);
}
