import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { generateICalFeed } from '@/lib/ical';

/**
 * GET /api/calendar/export
 * Download a .ics file of the current profile's activities.
 * Requires authentication via session cookie.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.activeProfileId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.activeProfileId },
  });
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const activities = await prisma.activity.findMany({
    where: { profileId: profile.id, startTime: { not: null } },
    orderBy: { startTime: 'asc' },
  });

  const ical = generateICalFeed(profile.name, activities);

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(profile.name)}-timma.ics"`,
    },
  });
}
