import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getBacklogTasks, getBacklogTasksForHousehold } from '@/app/actions/activities';
import { BacklogList } from '@/components/backlog/backlog-list';
import { ThemeProvider } from '@/components/theme-provider';
import { HomeHeader } from '@/components/home-header';
import type { ActivityData } from '@/components/schedule/types';

export default async function BacklogPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.activeProfileId) redirect('/profile-select');

  const profile = await prisma.profile.findUnique({
    where: { id: session.activeProfileId },
    include: { household: true, theme: true },
  });
  if (!profile) redirect('/profile-select');

  const themes = await prisma.theme.findMany({
    where: { isBuiltIn: true },
    orderBy: { name: 'asc' },
  });

  const isFamilyView = session.familyView === true;

  const allProfiles = isFamilyView
    ? await prisma.profile.findMany({
        where: { householdId: session.householdId },
        select: { id: true, name: true },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  const rawTasks = isFamilyView
    ? await getBacklogTasksForHousehold(session.householdId)
    : await getBacklogTasks(profile.id);

  const tasks: ActivityData[] = rawTasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    color: t.color,
    startTime: t.startTime?.toISOString() ?? null,
    endTime: t.endTime?.toISOString() ?? null,
    status: t.status,
    sortOrder: t.sortOrder,
    pointValue: t.pointValue,
    imageUrl: t.imageUrl,
    recurrence: t.recurrence ?? null,
    profileId: t.profileId,
    profileName: t.profile?.name ?? profile.name,
    symbol: t.symbol ? { id: t.symbol.id, name: t.symbol.name, imageUrl: t.symbol.imageUrl } : null,
    signVideo: t.signVideo ? { id: t.signVideo.id, word: t.signVideo.word, videoUrl: t.signVideo.videoUrl } : null,
  }));

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

  const isAdmin = profile.role === 'ADMIN';

  return (
    <ThemeProvider theme={themeData}>
      <HomeHeader
        profileName={isFamilyView ? 'Familjen' : profile.name}
        householdName={profile.household.name}
        themes={themes}
        currentThemeId={profile.themeId}
        currentSensoryMode={profile.sensoryMode as 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT'}
        calendarToken={profile.calendarToken}
        familyView={isFamilyView}
        familyProfiles={allProfiles}
        activeFilterIds={allProfiles.map((p) => p.id)}
      />

      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3">
          <a href="/" className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            ← Schema
          </a>
          <h2 className="text-sm font-semibold">Backlog</h2>
        </div>
      </div>

      <BacklogList
        tasks={tasks}
        isAdmin={isAdmin}
        isFamilyView={isFamilyView}
        profiles={isFamilyView ? allProfiles : [{ id: profile.id, name: profile.name }]}
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
