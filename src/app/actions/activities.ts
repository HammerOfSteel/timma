'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

// ─── Calendar queries (scheduled items only) ────────────────────────

export async function getActivitiesForDate(profileId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.activity.findMany({
    where: {
      profileId,
      startTime: { not: null, gte: startOfDay },
      endTime: { not: null, lte: endOfDay },
    },
    include: { symbol: true, signVideo: true },
    orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
  });
}

export async function getActivitiesForRange(profileId: string, start: Date, end: Date) {
  const regular = await prisma.activity.findMany({
    where: {
      profileId,
      recurrence: null,
      startTime: { not: null, gte: start },
      endTime: { not: null, lte: end },
    },
    include: { symbol: true, signVideo: true },
    orderBy: [{ startTime: 'asc' }, { sortOrder: 'asc' }],
  });

  const recurring = await prisma.activity.findMany({
    where: {
      profileId,
      recurrence: { not: null },
      startTime: { not: null, lte: end },
    },
    include: { symbol: true, signVideo: true },
  });

  const expanded = recurring.flatMap((a) => expandRecurring(a, start, end));

  return [...regular, ...expanded].sort(
    (a, b) => (a.startTime?.getTime() ?? 0) - (b.startTime?.getTime() ?? 0),
  );
}

export async function getActivitiesForRangeMultiProfile(profileIds: string[], start: Date, end: Date) {
  const regular = await prisma.activity.findMany({
    where: {
      profileId: { in: profileIds },
      recurrence: null,
      startTime: { not: null, gte: start },
      endTime: { not: null, lte: end },
    },
    include: { symbol: true, signVideo: true, profile: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: [{ startTime: 'asc' }, { sortOrder: 'asc' }],
  });

  const recurring = await prisma.activity.findMany({
    where: {
      profileId: { in: profileIds },
      recurrence: { not: null },
      startTime: { not: null, lte: end },
    },
    include: { symbol: true, signVideo: true, profile: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const expanded = recurring.flatMap((a) => expandRecurring(a, start, end));

  return [...regular, ...expanded].sort(
    (a, b) => (a.startTime?.getTime() ?? 0) - (b.startTime?.getTime() ?? 0),
  );
}

// ─── Backlog queries (all tasks for profile) ───────────────────────

export async function getBacklogTasks(profileId: string) {
  return prisma.activity.findMany({
    where: { profileId },
    include: { symbol: true, signVideo: true },
    orderBy: [
      { status: 'asc' },
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getBacklogTasksForHousehold(householdId: string) {
  return prisma.activity.findMany({
    where: { profile: { householdId } },
    include: {
      symbol: true,
      signVideo: true,
      profile: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: [
      { status: 'asc' },
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

// ─── Create ────────────────────────────────────────────────────────

export async function createActivity(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || '#6366f1';
  const date = (formData.get('date') as string) || null;
  const startHourStr = formData.get('startHour') as string;
  const endHourStr = formData.get('endHour') as string;
  const pointValue = parseInt((formData.get('pointValue') as string) || '0');
  const recurrenceVal = (formData.get('recurrence') as string) || null;
  const recurrence = recurrenceVal && ['DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY'].includes(recurrenceVal)
    ? (recurrenceVal as 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY')
    : null;
  const assignToProfileId = (formData.get('assignToProfileId') as string) || session.activeProfileId;

  if (!title) return { error: 'Titel krävs.' };

  // Determine schedule
  let startTime: Date | null = null;
  let endTime: Date | null = null;
  let status: 'BACKLOG' | 'TODO' | 'SCHEDULED' = 'BACKLOG';

  if (date && startHourStr && endHourStr) {
    const startHour = parseInt(startHourStr);
    const startMinute = parseInt((formData.get('startMinute') as string) || '0');
    const endHour = parseInt(endHourStr);
    const endMinute = parseInt((formData.get('endMinute') as string) || '0');

    startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (endTime <= startTime) return { error: 'Sluttid måste vara efter starttid.' };
    status = 'TODO';
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
        data: { name: symbolName, imageUrl: `/symbols/mulberry/${symbolFile}`, category: 'mulberry', source: 'MULBERRY' },
      });
    }
    symbolId = symbol.id;
  }

  const signVideoId = (formData.get('signVideoId') as string) || null;

  const maxSort = await prisma.activity.aggregate({
    where: { profileId: assignToProfileId },
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
      profileId: assignToProfileId,
      symbolId,
      signVideoId,
      recurrence,
      status: status as any,
    },
  });

  revalidatePath('/');
  revalidatePath('/todos');
  revalidatePath('/kanban');
}

// ─── Update ────────────────────────────────────────────────────────

export async function updateActivity(activityId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  // Allow editing if user owns the activity or is in family view
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profile: { householdId: session.householdId } },
  });
  if (!activity) return { error: 'Aktiviteten hittades inte.' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || activity.color;
  const date = (formData.get('date') as string) || null;
  const pointValue = parseInt((formData.get('pointValue') as string) || '0');
  const recurrenceVal = (formData.get('recurrence') as string) || null;
  const recurrence = recurrenceVal && ['DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY'].includes(recurrenceVal)
    ? (recurrenceVal as 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY')
    : null;

  let startTime = activity.startTime;
  let endTime = activity.endTime;

  if (date) {
    const startHour = parseInt(formData.get('startHour') as string);
    const startMinute = parseInt((formData.get('startMinute') as string) || '0');
    const endHour = parseInt(formData.get('endHour') as string);
    const endMinute = parseInt((formData.get('endMinute') as string) || '0');

    startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
  }

  // Handle sign video
  const signVideoId = (formData.get('signVideoId') as string) || null;
  const removeSignVideo = formData.get('removeSignVideo') === 'true';

  // Handle symbol
  const symbolFile = (formData.get('symbolFile') as string) || null;
  const symbolName = (formData.get('symbolName') as string) || null;
  const removeSymbol = formData.get('removeSymbol') === 'true';
  let symbolId: string | undefined = undefined;

  if (removeSymbol) {
    symbolId = null as unknown as undefined;
  } else if (symbolFile && symbolName) {
    let symbol = await prisma.symbol.findFirst({
      where: { imageUrl: `/symbols/mulberry/${symbolFile}`, source: 'MULBERRY' },
    });
    if (!symbol) {
      symbol = await prisma.symbol.create({
        data: { name: symbolName, imageUrl: `/symbols/mulberry/${symbolFile}`, category: 'mulberry', source: 'MULBERRY' },
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
      ...(symbolId !== undefined ? { symbolId: symbolId as string | null } : {}),
      ...(removeSignVideo ? { signVideoId: null } : signVideoId ? { signVideoId } : {}),
    },
  });

  revalidatePath('/');
  revalidatePath('/todos');
  revalidatePath('/kanban');
}

// ─── Status & toggles ─────────────────────────────────────────────

export async function updateTaskStatus(activityId: string, status: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];
  if (!validStatuses.includes(status)) return;

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profile: { householdId: session.householdId } },
  });
  if (!activity) return;

  const wasDone = activity.status === 'DONE';
  const nowDone = status === 'DONE';

  await prisma.activity.update({
    where: { id: activityId },
    data: { status: status as any },
  });

  // Reward: earn or revoke points
  if (activity.pointValue > 0) {
    if (!wasDone && nowDone) {
      await prisma.earnedPoint.create({
        data: {
          amount: activity.pointValue,
          reason: `Klar: ${activity.title}`,
          profileId: activity.profileId,
          activityId: activity.id,
        },
      });
    } else if (wasDone && !nowDone) {
      await prisma.earnedPoint.deleteMany({
        where: { profileId: activity.profileId, activityId: activity.id },
      });
    }
  }

  revalidatePath('/');
  revalidatePath('/todos');
  revalidatePath('/kanban');
}

export async function toggleActivityComplete(activityId: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profile: { householdId: session.householdId } },
  });
  if (!activity) return;

  const newStatus = activity.status === 'DONE' ? 'TODO' : 'DONE';
  await updateTaskStatus(activityId, newStatus);
}

// ─── Delete ────────────────────────────────────────────────────────

export async function deleteActivity(activityId: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  await prisma.activity.deleteMany({
    where: { id: activityId, profile: { householdId: session.householdId } },
  });

  revalidatePath('/');
  revalidatePath('/todos');
  revalidatePath('/kanban');
}

// ─── Reorder ───────────────────────────────────────────────────────

export async function reorderActivities(orderedIds: string[]) {
  const session = await getSession();
  if (!session) redirect('/login');

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.activity.updateMany({
        where: { id, profile: { householdId: session.householdId } },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath('/');
  revalidatePath('/todos');
}

// ─── Schedule a backlog task ───────────────────────────────────────

export async function scheduleTask(activityId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const date = formData.get('date') as string;
  const startHour = parseInt(formData.get('startHour') as string);
  const startMinute = parseInt((formData.get('startMinute') as string) || '0');
  const endHour = parseInt(formData.get('endHour') as string);
  const endMinute = parseInt((formData.get('endMinute') as string) || '0');

  if (!date) return { error: 'Datum krävs.' };

  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  if (endTime <= startTime) return { error: 'Sluttid måste vara efter starttid.' };

  await prisma.activity.update({
    where: { id: activityId },
    data: { startTime, endTime, status: 'TODO' },
  });

  revalidatePath('/');
  revalidatePath('/todos');
  revalidatePath('/kanban');
}

// ─── Kanban placement ──────────────────────────────────────────────

export async function moveToKanbanColumn(activityId: string, columnId: string | null, sortOrder: number) {
  const session = await getSession();
  if (!session) redirect('/login');

  await prisma.activity.update({
    where: { id: activityId },
    data: { kanbanColumnId: columnId, sortOrder },
  });

  revalidatePath('/kanban');
  revalidatePath('/todos');
}

// ─── Helpers ───────────────────────────────────────────────────────

type ActivityWithRelations = Awaited<
  ReturnType<typeof prisma.activity.findMany<{ include: { symbol: true; signVideo: true } }>>
>[number];

function expandRecurring(
  activity: ActivityWithRelations,
  rangeStart: Date,
  rangeEnd: Date,
): ActivityWithRelations[] {
  if (!activity.startTime || !activity.endTime) return [];

  const results: ActivityWithRelations[] = [];
  const origStart = new Date(activity.startTime);
  const origEnd = new Date(activity.endTime);
  const durationMs = origEnd.getTime() - origStart.getTime();
  const origHour = origStart.getHours();
  const origMinute = origStart.getMinutes();

  const iterStart = new Date(Math.max(rangeStart.getTime(), origStart.getTime()));
  iterStart.setHours(0, 0, 0, 0);

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

    results.push({ ...activity, startTime: instanceStart, endTime: instanceEnd });
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
