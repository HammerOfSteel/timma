'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getThemes() {
  return prisma.theme.findMany({
    where: { isBuiltIn: true },
    orderBy: { name: 'asc' },
  });
}

export async function setProfileTheme(themeId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.profile.update({
    where: { id: session.activeProfileId },
    data: { themeId },
  });

  revalidatePath('/');
}

export async function setSensoryMode(mode: 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT') {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.profile.update({
    where: { id: session.activeProfileId },
    data: { sensoryMode: mode },
  });

  revalidatePath('/');
}
