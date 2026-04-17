'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function getTodos() {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  return prisma.todo.findMany({
    where: { profileId: session.activeProfileId },
    include: { symbol: true },
    orderBy: [{ completed: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function createTodo(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const title = (formData.get('title') as string)?.trim();
  if (!title) return { error: 'Titel krävs.' };

  const pointValue = parseInt((formData.get('pointValue') as string) || '0');

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

  const maxSort = await prisma.todo.aggregate({
    where: { profileId: session.activeProfileId },
    _max: { sortOrder: true },
  });

  await prisma.todo.create({
    data: {
      title,
      pointValue,
      symbolId,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      profileId: session.activeProfileId,
    },
  });

  revalidatePath('/todos');
}

export async function updateTodo(todoId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const todo = await prisma.todo.findFirst({
    where: { id: todoId, profileId: session.activeProfileId },
  });
  if (!todo) return { error: 'Uppgiften hittades inte.' };

  const title = (formData.get('title') as string)?.trim();
  if (!title) return { error: 'Titel krävs.' };

  const pointValue = parseInt((formData.get('pointValue') as string) || '0');

  // Handle symbol
  const symbolFile = (formData.get('symbolFile') as string) || null;
  const symbolName = (formData.get('symbolName') as string) || null;
  const removeSymbol = formData.get('removeSymbol') === 'true';
  let symbolId: string | undefined = undefined;

  if (removeSymbol) {
    symbolId = null as unknown as undefined;
    await prisma.todo.update({
      where: { id: todoId },
      data: { title, pointValue, symbolId: null },
    });
    revalidatePath('/todos');
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

  await prisma.todo.update({
    where: { id: todoId },
    data: {
      title,
      pointValue,
      ...(symbolId !== undefined ? { symbolId } : {}),
    },
  });

  revalidatePath('/todos');
}

export async function deleteTodo(todoId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.todo.deleteMany({
    where: { id: todoId, profileId: session.activeProfileId },
  });

  revalidatePath('/todos');
}

export async function toggleTodoComplete(todoId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const todo = await prisma.todo.findFirst({
    where: { id: todoId, profileId: session.activeProfileId },
  });
  if (!todo) return;

  const newCompleted = !todo.completed;

  await prisma.todo.update({
    where: { id: todoId },
    data: { completed: newCompleted },
  });

  // Reward system: earn or revoke points
  if (todo.pointValue > 0) {
    if (newCompleted) {
      await prisma.earnedPoint.create({
        data: {
          amount: todo.pointValue,
          reason: `Klar: ${todo.title}`,
          profileId: session.activeProfileId,
          todoId: todo.id,
        },
      });
    } else {
      // Revoke points
      await prisma.earnedPoint.deleteMany({
        where: {
          profileId: session.activeProfileId,
          todoId: todo.id,
        },
      });
    }
  }

  revalidatePath('/todos');
}

export async function reorderTodos(orderedIds: string[]) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.todo.updateMany({
        where: { id, profileId: session.activeProfileId },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath('/todos');
}
