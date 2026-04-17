'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getActivitiesForDate(profileId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.activity.findMany({
    where: {
      profileId,
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay },
    },
    include: { symbol: true },
    orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
  });
}

export async function createActivity(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || '#6366f1';
  const date = formData.get('date') as string;
  const startHour = parseInt(formData.get('startHour') as string);
  const startMinute = parseInt(formData.get('startMinute') as string);
  const endHour = parseInt(formData.get('endHour') as string);
  const endMinute = parseInt(formData.get('endMinute') as string);
  const pointValue = parseInt((formData.get('pointValue') as string) || '0');

  if (!title || !date) {
    return { error: 'Titel och datum krävs.' };
  }

  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  if (endTime <= startTime) {
    return { error: 'Sluttid måste vara efter starttid.' };
  }

  const maxSort = await prisma.activity.aggregate({
    where: { profileId: session.activeProfileId },
    _max: { sortOrder: true },
  });

  await prisma.activity.create({
    data: {
      title,
      description,
      color,
      startTime,
      endTime,
      pointValue,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      profileId: session.activeProfileId,
    },
  });

  revalidatePath('/');
}

export async function updateActivity(activityId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profileId: session.activeProfileId },
  });
  if (!activity) return { error: 'Aktiviteten hittades inte.' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || activity.color;
  const date = formData.get('date') as string;
  const startHour = parseInt(formData.get('startHour') as string);
  const startMinute = parseInt(formData.get('startMinute') as string);
  const endHour = parseInt(formData.get('endHour') as string);
  const endMinute = parseInt(formData.get('endMinute') as string);
  const pointValue = parseInt((formData.get('pointValue') as string) || '0');

  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  await prisma.activity.update({
    where: { id: activityId },
    data: { title, description, color, startTime, endTime, pointValue },
  });

  revalidatePath('/');
}

export async function deleteActivity(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.activity.deleteMany({
    where: { id: activityId, profileId: session.activeProfileId },
  });

  revalidatePath('/');
}

export async function toggleActivityComplete(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profileId: session.activeProfileId },
  });
  if (!activity) return;

  await prisma.activity.update({
    where: { id: activityId },
    data: { completed: !activity.completed },
  });

  revalidatePath('/');
}

export async function reorderActivities(orderedIds: string[]) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.activity.updateMany({
        where: { id, profileId: session.activeProfileId! },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath('/');
}
