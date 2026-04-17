import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;

  const videos = await prisma.signVideo.findMany({
    where: {
      ...(query ? { word: { contains: query, mode: 'insensitive' as const } } : {}),
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: [{ category: 'asc' }, { word: 'asc' }],
  });

  return NextResponse.json(videos);
}
