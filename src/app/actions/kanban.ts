'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getKanbanBoard(householdId: string) {
  let board = await prisma.kanbanBoard.findFirst({
    where: { householdId },
    include: {
      columns: {
        orderBy: { sortOrder: 'asc' },
        include: {
          activities: {
            orderBy: { sortOrder: 'asc' },
            include: {
              symbol: true,
              profile: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!board) {
    board = await prisma.kanbanBoard.create({
      data: {
        name: 'Familjens tavla',
        householdId,
        columns: {
          create: [
            { title: 'Att göra', sortOrder: 0, color: '#6366f1' },
            { title: 'Pågår', sortOrder: 1, color: '#f59e0b' },
            { title: 'Klart', sortOrder: 2, color: '#22c55e' },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { sortOrder: 'asc' },
          include: {
            activities: {
              orderBy: { sortOrder: 'asc' },
              include: {
                symbol: true,
                profile: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  return board;
}

export async function addTaskToKanbanColumn(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const columnId = formData.get('columnId') as string;
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || null;
  const assignToProfileId = (formData.get('assignToProfileId') as string) || session.activeProfileId;

  if (!columnId || !title) return { error: 'Kolumn och titel krävs.' };

  const column = await prisma.kanbanColumn.findFirst({
    where: { id: columnId, board: { householdId: session.householdId } },
  });
  if (!column) return { error: 'Kolumnen hittades inte.' };

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

  const maxSort = await prisma.activity.aggregate({
    where: { kanbanColumnId: columnId },
    _max: { sortOrder: true },
  });

  await prisma.activity.create({
    data: {
      title,
      description,
      color,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      profileId: assignToProfileId,
      kanbanColumnId: columnId,
      symbolId,
      status: 'TODO',
    },
  });

  revalidatePath('/kanban');
  revalidatePath('/todos');
}

export async function moveActivityToColumn(activityId: string, targetColumnId: string, newSortOrder: number) {
  const session = await getSession();
  if (!session) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profile: { householdId: session.householdId } },
  });
  if (!activity) return;

  const targetColumn = await prisma.kanbanColumn.findFirst({
    where: { id: targetColumnId, board: { householdId: session.householdId } },
  });
  if (!targetColumn) return;

  // Shift existing activities in target column
  await prisma.activity.updateMany({
    where: { kanbanColumnId: targetColumnId, sortOrder: { gte: newSortOrder } },
    data: { sortOrder: { increment: 1 } },
  });

  // Determine status based on column position
  const board = await prisma.kanbanBoard.findFirst({
    where: { householdId: session.householdId },
    include: { columns: { orderBy: { sortOrder: 'asc' } } },
  });
  const colIndex = board?.columns.findIndex((c) => c.id === targetColumnId) ?? 0;
  const totalCols = board?.columns.length ?? 3;
  let newStatus = 'TODO';
  if (colIndex === totalCols - 1) newStatus = 'DONE';
  else if (colIndex > 0) newStatus = 'IN_PROGRESS';

  await prisma.activity.update({
    where: { id: activityId },
    data: { kanbanColumnId: targetColumnId, sortOrder: newSortOrder, status: newStatus as any },
  });

  // Handle points for DONE
  if (activity.pointValue > 0) {
    if (newStatus === 'DONE' && activity.status !== 'DONE') {
      await prisma.earnedPoint.create({
        data: {
          amount: activity.pointValue,
          reason: `Klar: ${activity.title}`,
          profileId: activity.profileId,
          activityId: activity.id,
        },
      });
    } else if (newStatus !== 'DONE' && activity.status === 'DONE') {
      await prisma.earnedPoint.deleteMany({
        where: { profileId: activity.profileId, activityId: activity.id },
      });
    }
  }

  revalidatePath('/kanban');
  revalidatePath('/todos');
  revalidatePath('/');
}

export async function deleteKanbanActivity(activityId: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  await prisma.activity.deleteMany({
    where: { id: activityId, profile: { householdId: session.householdId } },
  });

  revalidatePath('/kanban');
  revalidatePath('/todos');
}

export async function createKanbanColumn(boardId: string, title: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  const board = await prisma.kanbanBoard.findFirst({
    where: { id: boardId, householdId: session.householdId },
  });
  if (!board) return { error: 'Tavlan hittades inte.' };

  const maxSort = await prisma.kanbanColumn.aggregate({
    where: { boardId },
    _max: { sortOrder: true },
  });

  await prisma.kanbanColumn.create({
    data: { title, sortOrder: (maxSort._max.sortOrder ?? 0) + 1, boardId },
  });

  revalidatePath('/kanban');
}

export async function deleteKanbanColumn(columnId: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Unlink activities from column before deleting
  await prisma.activity.updateMany({
    where: { kanbanColumnId: columnId },
    data: { kanbanColumnId: null },
  });

  await prisma.kanbanColumn.deleteMany({
    where: { id: columnId, board: { householdId: session.householdId } },
  });

  revalidatePath('/kanban');
}
