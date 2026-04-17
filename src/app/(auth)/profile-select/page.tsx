import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ProfileGrid } from './profile-grid';
import { logout } from '@/app/actions/auth';

export default async function ProfileSelectPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profiles = await prisma.profile.findMany({
    where: { householdId: session.householdId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      pin: true,
      role: true,
    },
  });

  const household = await prisma.household.findUnique({
    where: { id: session.householdId },
    select: { name: true },
  });

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Vem ska använda Timma?</h1>
          <p className="mt-2 text-gray-600">{household?.name}</p>
        </div>

        <ProfileGrid
          profiles={profiles.map((p) => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            hasPin: !!p.pin,
            role: p.role,
          }))}
        />

        <div className="flex justify-center gap-4">
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logga ut
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
