'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

/**
 * Generate (or regenerate) a calendar subscription token for the active profile.
 * Returns the new token.
 */
export async function generateCalendarToken() {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const token = crypto.randomBytes(32).toString('hex');

  await prisma.profile.update({
    where: { id: session.activeProfileId },
    data: { calendarToken: token },
  });

  revalidatePath('/');
  return { token };
}

/**
 * Revoke the calendar subscription token (disables the feed URL).
 */
export async function revokeCalendarToken() {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.profile.update({
    where: { id: session.activeProfileId },
    data: { calendarToken: null },
  });

  revalidatePath('/');
}
