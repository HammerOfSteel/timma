import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getKanbanBoard } from '@/app/actions/kanban';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { ThemeProvider } from '@/components/theme-provider';
import { HomeHeader } from '@/components/home-header';

export default async function KanbanPage() {
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

  const allProfiles = await prisma.profile.findMany({
    where: { householdId: session.householdId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  const board = await getKanbanBoard(session.householdId);

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

  const serializedColumns = board.columns.map((col) => ({
    id: col.id,
    title: col.title,
    color: col.color,
    sortOrder: col.sortOrder,
    cards: col.activities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      color: a.color,
      sortOrder: a.sortOrder,
      status: a.status,
      startTime: a.startTime?.toISOString() ?? null,
      endTime: a.endTime?.toISOString() ?? null,
      pointValue: a.pointValue,
      profileId: a.profileId,
      profileName: a.profile.name,
      symbol: a.symbol ? { name: a.symbol.name, imageUrl: a.symbol.imageUrl } : null,
      imageUrl: a.imageUrl,
    })),
  }));

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
          <h2 className="text-sm font-semibold">Kanban</h2>
        </div>
      </div>

      <KanbanBoard
        boardId={board.id}
        boardName={board.name}
        columns={serializedColumns}
        profiles={allProfiles}
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
