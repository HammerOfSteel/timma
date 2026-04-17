import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { DaySchedule } from '@/components/schedule/day-schedule';
import type { ActivityData } from '@/components/schedule/types';
import { ThemeProvider } from '@/components/theme-provider';
import { HomeHeader } from '@/components/home-header';

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.activeProfileId) redirect('/profile-select');

  const profile = await prisma.profile.findUnique({
    where: { id: session.activeProfileId },
    include: {
      household: true,
      theme: true,
    },
  });

  if (!profile) redirect('/profile-select');

  const themes = await prisma.theme.findMany({
    where: { isBuiltIn: true },
    orderBy: { name: 'asc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const activities = await prisma.activity.findMany({
    where: {
      profileId: profile.id,
      startTime: { gte: today },
      endTime: { lte: endOfDay },
    },
    include: { symbol: true },
    orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
  });

  // Serialize dates for client components
  const serializedActivities: ActivityData[] = activities.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    color: a.color,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    completed: a.completed,
    sortOrder: a.sortOrder,
    pointValue: a.pointValue,
    imageUrl: a.imageUrl,
    symbol: a.symbol ? { id: a.symbol.id, name: a.symbol.name, imageUrl: a.symbol.imageUrl } : null,
  }));

  const dateStr = today.toISOString().split('T')[0];

  // Determine if theme is dark
  const isDark = profile.theme ? isColorDark(profile.theme.backgroundColor) : false;

  const themeData = profile.theme
    ? {
        id: profile.theme.id,
        name: profile.theme.name,
        colors: {
          primaryColor: profile.theme.primaryColor,
          secondaryColor: profile.theme.secondaryColor,
          backgroundColor: profile.theme.backgroundColor,
          textColor: profile.theme.textColor,
          accentColor: profile.theme.accentColor,
        },
        isDark,
        sensoryMode: profile.sensoryMode as 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT',
      }
    : null;

  return (
    <ThemeProvider theme={themeData}>
      <HomeHeader
        profileName={profile.name}
        householdName={profile.household.name}
        themes={themes}
        currentThemeId={profile.themeId}
        currentSensoryMode={profile.sensoryMode as 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT'}
        calendarToken={profile.calendarToken}
      />

      <DaySchedule
        activities={serializedActivities}
        viewMode={profile.viewMode as 'BLOCKS' | 'CARDS' | 'TIMELINE'}
        date={dateStr}
        profileName={profile.name}
      />
    </ThemeProvider>
  );
}

function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
