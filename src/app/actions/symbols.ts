'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/**
 * Set a Mulberry symbol on an activity.
 * Creates the Symbol record if it doesn't exist, then links it.
 */
export async function setActivitySymbol(
  activityId: string,
  symbolFile: string,
  symbolName: string,
) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  // Verify activity belongs to this profile
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profileId: session.activeProfileId },
  });
  if (!activity) return { error: 'Aktiviteten hittades inte.' };

  // Find or create the symbol record
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

  await prisma.activity.update({
    where: { id: activityId },
    data: { symbolId: symbol.id },
  });

  revalidatePath('/');
}

/**
 * Remove the symbol from an activity.
 */
export async function removeActivitySymbol(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.activity.update({
    where: { id: activityId },
    data: { symbolId: null },
  });

  revalidatePath('/');
}

/**
 * Upload a custom image for an activity.
 */
export async function uploadActivityImage(activityId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profileId: session.activeProfileId },
  });
  if (!activity) return { error: 'Aktiviteten hittades inte.' };

  const file = formData.get('image') as File;
  if (!file || file.size === 0) return { error: 'Ingen fil vald.' };

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'Filen är för stor (max 5 MB).' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Otillåten filtyp. Använd PNG, JPEG, WebP eller SVG.' };
  }

  // Generate safe filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeExt = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) ? ext : 'png';
  const filename = `${crypto.randomUUID()}.${safeExt}`;

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  await prisma.activity.update({
    where: { id: activityId },
    data: { imageUrl: `/uploads/${filename}` },
  });

  revalidatePath('/');
  return { imageUrl: `/uploads/${filename}` };
}

/**
 * Remove the custom image from an activity.
 */
export async function removeActivityImage(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.activity.update({
    where: { id: activityId },
    data: { imageUrl: null },
  });

  revalidatePath('/');
}

/**
 * Add a symbol to the user's favorites.
 */
export async function addFavoriteSymbol(symbolFile: string, symbolName: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  // Find or create the Symbol record
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

  await prisma.favoriteSymbol.upsert({
    where: {
      profileId_symbolId: {
        profileId: session.activeProfileId,
        symbolId: symbol.id,
      },
    },
    update: {},
    create: {
      profileId: session.activeProfileId,
      symbolId: symbol.id,
    },
  });
}

/**
 * Remove a symbol from the user's favorites.
 */
export async function removeFavoriteSymbol(symbolFile: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const symbol = await prisma.symbol.findFirst({
    where: { imageUrl: `/symbols/mulberry/${symbolFile}`, source: 'MULBERRY' },
  });

  if (symbol) {
    await prisma.favoriteSymbol.deleteMany({
      where: {
        profileId: session.activeProfileId,
        symbolId: symbol.id,
      },
    });
  }
}

/**
 * Get the user's favorite symbol files for the picker.
 */
export async function getFavoriteSymbols(): Promise<string[]> {
  const session = await getSession();
  if (!session?.activeProfileId) return [];

  const favorites = await prisma.favoriteSymbol.findMany({
    where: { profileId: session.activeProfileId },
    include: { symbol: true },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => f.symbol.imageUrl.replace('/symbols/mulberry/', ''));
}

/**
 * Get frequently used symbol files (based on activity usage).
 */
export async function getFrequentSymbols(): Promise<Array<{ file: string; name: string; count: number }>> {
  const session = await getSession();
  if (!session?.activeProfileId) return [];

  const result = await prisma.activity.groupBy({
    by: ['symbolId'],
    where: {
      profileId: session.activeProfileId,
      symbolId: { not: null },
    },
    _count: { symbolId: true },
    orderBy: { _count: { symbolId: 'desc' } },
    take: 12,
  });

  if (result.length === 0) return [];

  const symbolIds = result.map((r) => r.symbolId!);
  const symbols = await prisma.symbol.findMany({
    where: { id: { in: symbolIds } },
  });

  const symbolMap = new Map(symbols.map((s) => [s.id, s]));
  return result
    .filter((r) => symbolMap.has(r.symbolId!))
    .map((r) => {
      const s = symbolMap.get(r.symbolId!)!;
      return {
        file: s.imageUrl.replace('/symbols/mulberry/', ''),
        name: s.name,
        count: r._count.symbolId,
      };
    });
}
