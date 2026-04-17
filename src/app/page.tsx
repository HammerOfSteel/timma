import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { DaySchedule } from '@/components/schedule/day-schedule';
import type { ActivityData } from '@/components/schedule/types';

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

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Timma</h1>
          <p className="text-sm text-gray-500">{profile.household.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{profile.name}</span>
          <Link
            href="/profile-select"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Byt profil
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Logga ut
            </button>
          </form>
        </div>
      </header>

      <DaySchedule
        activities={serializedActivities}
        viewMode={profile.viewMode as 'BLOCKS' | 'CARDS' | 'TIMELINE'}
        date={dateStr}
        profileName={profile.name}
      />
    </div>
  );
}
