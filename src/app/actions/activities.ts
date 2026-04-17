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

export async function getActivitiesForRange(profileId: string, start: Date, end: Date) {
  // Fetch non-recurring activities in the range
  const regular = await prisma.activity.findMany({
    where: {
      profileId,
      recurrence: null,
      startTime: { gte: start },
      endTime: { lte: end },
    },
    include: { symbol: true },
    orderBy: [{ startTime: 'asc' }, { sortOrder: 'asc' }],
  });

  // Fetch recurring activities that started on or before end of range
  const recurring = await prisma.activity.findMany({
    where: {
      profileId,
      recurrence: { not: null },
      startTime: { lte: end },
    },
    include: { symbol: true },
  });

  // Expand recurring activities into per-day instances
  const expanded = recurring.flatMap((a) => expandRecurring(a, start, end));

  return [...regular, ...expanded].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );
}

type ActivityWithSymbol = Awaited<
  ReturnType<typeof prisma.activity.findMany<{ include: { symbol: true } }>>
>[number];

function expandRecurring(
  activity: ActivityWithSymbol,
  rangeStart: Date,
  rangeEnd: Date,
): ActivityWithSymbol[] {
  const results: ActivityWithSymbol[] = [];
  const origStart = new Date(activity.startTime);
  const origEnd = new Date(activity.endTime);
  const durationMs = origEnd.getTime() - origStart.getTime();
  const origHour = origStart.getHours();
  const origMinute = origStart.getMinutes();

  // Start from the later of: range start or the activity's original date
  const iterStart = new Date(Math.max(rangeStart.getTime(), origStart.getTime()));
  iterStart.setHours(0, 0, 0, 0);

  // Don't generate more than 366 instances for safety
  const maxDays = Math.min(
    Math.ceil((rangeEnd.getTime() - iterStart.getTime()) / 86400000) + 1,
    366,
  );

  for (let i = 0; i < maxDays; i++) {
    const day = new Date(iterStart);
    day.setDate(day.getDate() + i);
    if (day > rangeEnd) break;

    if (!matchesRecurrence(activity.recurrence!, origStart, day)) continue;

    const instanceStart = new Date(day);
    instanceStart.setHours(origHour, origMinute, 0, 0);
    const instanceEnd = new Date(instanceStart.getTime() + durationMs);

    // Skip the original date — it's either already in `regular` or we include it here
    // Include it since recurring activities are excluded from the regular query
    results.push({
      ...activity,
      startTime: instanceStart,
      endTime: instanceEnd,
    });
  }

  return results;
}

function matchesRecurrence(recurrence: string, origDate: Date, targetDate: Date): boolean {
  switch (recurrence) {
    case 'DAILY':
      return true;
    case 'WEEKDAYS': {
      const dow = targetDate.getDay();
      return dow >= 1 && dow <= 5;
    }
    case 'WEEKLY':
      return targetDate.getDay() === origDate.getDay();
    case 'MONTHLY':
      return targetDate.getDate() === origDate.getDate();
    default:
      return false;
  }
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
  const recurrenceVal = (formData.get('recurrence') as string) || null;
  const recurrence = recurrenceVal && ['DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY'].includes(recurrenceVal)
    ? (recurrenceVal as 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY')
    : null;

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

  // Handle symbol
  const symbolFile = (formData.get('symbolFile') as string) || null;
  const symbolName = (formData.get('symbolName') as string) || null;
  let symbolId: string | null = null;

  if (symbolFile && symbolName) {
    let symbol = await prisma.symbol.findFirst({
      where: { imageUrl: `/symbols/mulberry/${symbolFile}`, source: 'MULBERRY' },
    });
    if (!symbol) {
      symbol = await prisma.symbol.create({
        data: {
          name: symbolName,
          imageUrl: `/symbols/mulberry/${symbolFile}`,
          category: 'mulberry',
          source: 'MULBERRY',
        },
      });
    }
    symbolId = symbol.id;
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
      symbolId,
      recurrence,
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
  const recurrenceVal = (formData.get('recurrence') as string) || null;
  const recurrence = recurrenceVal && ['DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY'].includes(recurrenceVal)
    ? (recurrenceVal as 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY')
    : null;

  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  // Handle symbol
  const symbolFile = (formData.get('symbolFile') as string) || null;
  const symbolName = (formData.get('symbolName') as string) || null;
  const removeSymbol = formData.get('removeSymbol') === 'true';
  let symbolId: string | undefined = undefined;

  if (removeSymbol) {
    symbolId = null as unknown as undefined;
    // Using raw update for null
    await prisma.activity.update({
      where: { id: activityId },
      data: { title, description, color, startTime, endTime, pointValue, recurrence, symbolId: null },
    });
    revalidatePath('/');
    return;
  }

  if (symbolFile && symbolName) {
    let symbol = await prisma.symbol.findFirst({
      where: { imageUrl: `/symbols/mulberry/${symbolFile}`, source: 'MULBERRY' },
    });
    if (!symbol) {
      symbol = await prisma.symbol.create({
        data: {
          name: symbolName,
          imageUrl: `/symbols/mulberry/${symbolFile}`,
          category: 'mulberry',
          source: 'MULBERRY',
        },
      });
    }
    symbolId = symbol.id;
  }

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      title,
      description,
      color,
      startTime,
      endTime,
      pointValue,
      recurrence,
      ...(symbolId !== undefined ? { symbolId } : {}),
    },
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
