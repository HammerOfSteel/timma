'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getSignVideos(query?: string, category?: string) {
  return prisma.signVideo.findMany({
    where: {
      ...(query ? { word: { contains: query, mode: 'insensitive' as const } } : {}),
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: [{ category: 'asc' }, { word: 'asc' }],
  });
}

export async function getSignVideoCategories() {
  const results = await prisma.signVideo.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { category: 'asc' },
  });
  return results.map((r) => ({ category: r.category, count: r._count }));
}

export async function setActivitySignVideo(activityId: string, signVideoId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profileId: session.activeProfileId },
  });
  if (!activity) return { error: 'Aktiviteten hittades inte.' };

  const signVideo = await prisma.signVideo.findUnique({ where: { id: signVideoId } });
  if (!signVideo) return { error: 'Teckenvideon hittades inte.' };

  await prisma.activity.update({
    where: { id: activityId },
    data: { signVideoId },
  });

  revalidatePath('/');
}

export async function removeActivitySignVideo(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.activity.updateMany({
    where: { id: activityId, profileId: session.activeProfileId },
    data: { signVideoId: null },
  });

  revalidatePath('/');
}

export async function uploadSignVideo(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const word = formData.get('word') as string;
  const category = (formData.get('category') as string) || 'övrigt';
  const videoFile = formData.get('video') as File;

  if (!word || !videoFile || videoFile.size === 0) {
    return { error: 'Ord och videofil krävs.' };
  }

  // Validate file type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowedTypes.includes(videoFile.type)) {
    return { error: 'Endast MP4, WebM eller MOV-filer tillåtna.' };
  }

  // Max 50MB
  if (videoFile.size > 50 * 1024 * 1024) {
    return { error: 'Videon får vara max 50 MB.' };
  }

  // Save to public/uploads/signs/
  const ext = videoFile.name.split('.').pop() || 'mp4';
  const filename = `sign_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const { writeFile, mkdir } = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'public', 'uploads', 'signs');
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await videoFile.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const videoUrl = `/uploads/signs/${filename}`;

  await prisma.signVideo.create({
    data: {
      word,
      videoUrl,
      category,
      source: 'CUSTOM',
      uploadedById: session.activeProfileId,
    },
  });

  revalidatePath('/');
  return { success: true };
}

// ─── Seed built-in Takk library ───────────────────────────────────────

const BUILTIN_SIGNS: { word: string; category: string }[] = [
  // Mat (Food)
  { word: 'äta', category: 'mat' },
  { word: 'dricka', category: 'mat' },
  { word: 'frukost', category: 'mat' },
  { word: 'lunch', category: 'mat' },
  { word: 'middag', category: 'mat' },
  { word: 'mellanmål', category: 'mat' },
  { word: 'vatten', category: 'mat' },
  { word: 'mjölk', category: 'mat' },
  { word: 'bröd', category: 'mat' },
  { word: 'frukt', category: 'mat' },
  // Aktivitet (Activities)
  { word: 'skola', category: 'aktivitet' },
  { word: 'leka', category: 'aktivitet' },
  { word: 'läsa', category: 'aktivitet' },
  { word: 'rita', category: 'aktivitet' },
  { word: 'musik', category: 'aktivitet' },
  { word: 'dansa', category: 'aktivitet' },
  { word: 'simma', category: 'aktivitet' },
  { word: 'cykla', category: 'aktivitet' },
  { word: 'promenera', category: 'aktivitet' },
  { word: 'titta på tv', category: 'aktivitet' },
  // Känsla (Emotions)
  { word: 'glad', category: 'känsla' },
  { word: 'ledsen', category: 'känsla' },
  { word: 'arg', category: 'känsla' },
  { word: 'rädd', category: 'känsla' },
  { word: 'trött', category: 'känsla' },
  { word: 'hungrig', category: 'känsla' },
  { word: 'törstig', category: 'känsla' },
  { word: 'lugn', category: 'känsla' },
  // Tid (Time)
  { word: 'nu', category: 'tid' },
  { word: 'sedan', category: 'tid' },
  { word: 'vänta', category: 'tid' },
  { word: 'klar', category: 'tid' },
  { word: 'börja', category: 'tid' },
  { word: 'sluta', category: 'tid' },
  { word: 'morgon', category: 'tid' },
  { word: 'kväll', category: 'tid' },
  // Vardag (Daily routines)
  { word: 'sova', category: 'vardag' },
  { word: 'vakna', category: 'vardag' },
  { word: 'klä på sig', category: 'vardag' },
  { word: 'borsta tänderna', category: 'vardag' },
  { word: 'tvätta sig', category: 'vardag' },
  { word: 'toalett', category: 'vardag' },
  { word: 'städa', category: 'vardag' },
  { word: 'hjälp', category: 'vardag' },
  // Socialt (Social)
  { word: 'hej', category: 'socialt' },
  { word: 'hej då', category: 'socialt' },
  { word: 'tack', category: 'socialt' },
  { word: 'ja', category: 'socialt' },
  { word: 'nej', category: 'socialt' },
  { word: 'mer', category: 'socialt' },
  { word: 'färdig', category: 'socialt' },
  { word: 'snälla', category: 'socialt' },
];

export async function seedSignVideos() {
  const existing = await prisma.signVideo.count({ where: { source: 'BUILTIN' } });
  if (existing > 0) return { message: `${existing} tecken finns redan.` };

  await prisma.signVideo.createMany({
    data: BUILTIN_SIGNS.map((s) => ({
      word: s.word,
      // Placeholder video URL — replace with real hosted Takk videos
      videoUrl: `/signs/${s.word.replace(/\s+/g, '-')}.mp4`,
      category: s.category,
      source: 'BUILTIN' as const,
    })),
  });

  return { message: `${BUILTIN_SIGNS.length} tecken skapade.` };
}
