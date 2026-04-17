import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getTodos } from '@/app/actions/todos';
import { TodoList } from '@/components/todos/todo-list';
import type { TodoData } from '@/components/todos/todo-list';
import { ThemeProvider } from '@/components/theme-provider';
import { HomeHeader } from '@/components/home-header';

export default async function TodosPage() {
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

  const rawTodos = await getTodos();

  const todos: TodoData[] = rawTodos.map((t) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    sortOrder: t.sortOrder,
    pointValue: t.pointValue,
    symbol: t.symbol
      ? { id: t.symbol.id, name: t.symbol.name, imageUrl: t.symbol.imageUrl }
      : null,
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
        profileName={profile.name}
        householdName={profile.household.name}
        themes={themes}
        currentThemeId={profile.themeId}
        currentSensoryMode={profile.sensoryMode as 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT'}
        calendarToken={profile.calendarToken}
      />

      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ← Schema
          </a>
          <h2 className="text-sm font-semibold">Att göra</h2>
        </div>
      </div>

      <TodoList todos={todos} isAdmin={isAdmin} />
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
