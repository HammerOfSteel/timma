import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateICalFeed } from '@/lib/ical';

/**
 * GET /api/calendar/feed?token=<calendarToken>
 * Public iCal subscription endpoint (no session required).
 * Authenticated via a unique per-profile token.
 * Use this URL in Google Calendar, Apple Calendar, etc.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || token.length < 16) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { calendarToken: token },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Fetch activities for the next 90 days + past 30 days
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();
  to.setDate(to.getDate() + 90);

  const activities = await prisma.activity.findMany({
    where: {
      profileId: profile.id,
      startTime: { gte: from },
      endTime: { lte: to },
    },
    orderBy: { startTime: 'asc' },
  });

  const ical = generateICalFeed(profile.name, activities);

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
