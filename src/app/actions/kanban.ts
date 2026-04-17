'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getKanbanBoard(profileId: string) {
  // Get the profile's board (create default if none exists)
  let board = await prisma.kanbanBoard.findFirst({
    where: { profileId },
    include: {
      columns: {
        orderBy: { sortOrder: 'asc' },
        include: {
          cards: {
            orderBy: { sortOrder: 'asc' },
            include: { symbol: true, activity: true },
          },
        },
      },
    },
  });

  if (!board) {
    board = await prisma.kanbanBoard.create({
      data: {
        name: 'Min tavla',
        profileId,
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
            cards: {
              orderBy: { sortOrder: 'asc' },
              include: { symbol: true, activity: true },
            },
          },
        },
      },
    });
  }

  return board;
}

export async function createKanbanCard(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const columnId = formData.get('columnId') as string;
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || null;

  if (!columnId || !title) {
    return { error: 'Kolumn och titel krävs.' };
  }

  // Verify column belongs to the user's board
  const column = await prisma.kanbanColumn.findFirst({
    where: { id: columnId, board: { profileId: session.activeProfileId } },
  });
  if (!column) return { error: 'Kolumnen hittades inte.' };

  const maxSort = await prisma.kanbanCard.aggregate({
    where: { columnId },
    _max: { sortOrder: true },
  });

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

  await prisma.kanbanCard.create({
    data: {
      title,
      description,
      color,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      columnId,
      symbolId,
    },
  });

  revalidatePath('/kanban');
}

export async function updateKanbanCard(cardId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const card = await prisma.kanbanCard.findFirst({
    where: { id: cardId, column: { board: { profileId: session.activeProfileId } } },
  });
  if (!card) return { error: 'Kortet hittades inte.' };

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || card.color;

  await prisma.kanbanCard.update({
    where: { id: cardId },
    data: { title, description, color },
  });

  revalidatePath('/kanban');
}

export async function deleteKanbanCard(cardId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.kanbanCard.deleteMany({
    where: { id: cardId, column: { board: { profileId: session.activeProfileId } } },
  });

  revalidatePath('/kanban');
}

export async function moveKanbanCard(
  cardId: string,
  targetColumnId: string,
  newSortOrder: number,
) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  // Verify card and target column belong to user
  const card = await prisma.kanbanCard.findFirst({
    where: { id: cardId, column: { board: { profileId: session.activeProfileId } } },
  });
  if (!card) return;

  const targetColumn = await prisma.kanbanColumn.findFirst({
    where: { id: targetColumnId, board: { profileId: session.activeProfileId } },
  });
  if (!targetColumn) return;

  // Shift existing cards in target column to make room
  await prisma.kanbanCard.updateMany({
    where: { columnId: targetColumnId, sortOrder: { gte: newSortOrder } },
    data: { sortOrder: { increment: 1 } },
  });

  // Move the card
  await prisma.kanbanCard.update({
    where: { id: cardId },
    data: { columnId: targetColumnId, sortOrder: newSortOrder },
  });

  revalidatePath('/kanban');
}

export async function reorderKanbanCards(columnId: string, orderedCardIds: string[]) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.$transaction(
    orderedCardIds.map((id, index) =>
      prisma.kanbanCard.updateMany({
        where: { id, column: { id: columnId, board: { profileId: session.activeProfileId! } } },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath('/kanban');
}

export async function createKanbanColumn(boardId: string, title: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const board = await prisma.kanbanBoard.findFirst({
    where: { id: boardId, profileId: session.activeProfileId },
  });
  if (!board) return { error: 'Tavlan hittades inte.' };

  const maxSort = await prisma.kanbanColumn.aggregate({
    where: { boardId },
    _max: { sortOrder: true },
  });

  await prisma.kanbanColumn.create({
    data: {
      title,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      boardId,
    },
  });

  revalidatePath('/kanban');
}

export async function updateKanbanColumn(columnId: string, title: string, color: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.kanbanColumn.updateMany({
    where: { id: columnId, board: { profileId: session.activeProfileId } },
    data: { title, color },
  });

  revalidatePath('/kanban');
}

export async function deleteKanbanColumn(columnId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  // Only delete if it belongs to the user's board
  await prisma.kanbanColumn.deleteMany({
    where: { id: columnId, board: { profileId: session.activeProfileId } },
  });

  revalidatePath('/kanban');
}

export async function linkCardToActivity(cardId: string, activityId: string | null) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const card = await prisma.kanbanCard.findFirst({
    where: { id: cardId, column: { board: { profileId: session.activeProfileId } } },
  });
  if (!card) return { error: 'Kortet hittades inte.' };

  if (activityId) {
    const activity = await prisma.activity.findFirst({
      where: { id: activityId, profileId: session.activeProfileId },
    });
    if (!activity) return { error: 'Aktiviteten hittades inte.' };
  }

  await prisma.kanbanCard.update({
    where: { id: cardId },
    data: { activityId },
  });

  revalidatePath('/kanban');
}
