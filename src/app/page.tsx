import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getActivitiesForRange } from '@/app/actions/activities';
import { DaySchedule } from '@/components/schedule/day-schedule';
import { WeekView } from '@/components/schedule/week-view';
import { MonthView } from '@/components/schedule/month-view';
import { DateNavigator } from '@/components/schedule/date-navigator';
import type { ViewMode } from '@/components/schedule/date-navigator';
import type { ActivityData } from '@/components/schedule/types';
import { ThemeProvider } from '@/components/theme-provider';
import { HomeHeader } from '@/components/home-header';

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const params = await searchParams;
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

  // Parse view mode and date from search params
  const view: ViewMode = (['day', 'week', 'month'].includes(params.view || '')
    ? (params.view as ViewMode)
    : 'day');

  const selectedDate = params.date ? new Date(params.date + 'T12:00:00') : new Date();
  const dateStr = toDateStr(selectedDate);

  // Calculate date range based on view
  let rangeStart: Date;
  let rangeEnd: Date;

  if (view === 'week') {
    rangeStart = getMonday(selectedDate);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 6);
    rangeEnd.setHours(23, 59, 59, 999);
  } else if (view === 'month') {
    rangeStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    rangeEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    rangeStart = new Date(selectedDate);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(selectedDate);
    rangeEnd.setHours(23, 59, 59, 999);
  }

  const activities = await getActivitiesForRange(profile.id, rangeStart, rangeEnd);

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
    recurrence: (a.recurrence as ActivityData['recurrence']) ?? null,
    symbol: a.symbol ? { id: a.symbol.id, name: a.symbol.name, imageUrl: a.symbol.imageUrl } : null,
    signVideo: a.signVideo ? { id: a.signVideo.id, word: a.signVideo.word, videoUrl: a.signVideo.videoUrl } : null,
  }));

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

  const weekStart = view === 'week' ? toDateStr(getMonday(selectedDate)) : dateStr;

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

      <DateNavigator view={view} date={dateStr} />

      {view === 'day' && (
        <DaySchedule
          activities={serializedActivities}
          viewMode={profile.viewMode as 'BLOCKS' | 'CARDS' | 'TIMELINE'}
          date={dateStr}
          profileName={profile.name}
        />
      )}
      {view === 'week' && (
        <WeekView activities={serializedActivities} weekStart={weekStart} />
      )}
      {view === 'month' && (
        <MonthView
          activities={serializedActivities}
          year={selectedDate.getFullYear()}
          month={selectedDate.getMonth()}
        />
      )}
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
