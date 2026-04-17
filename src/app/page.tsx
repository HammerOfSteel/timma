import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';

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

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold">Hej, {profile.name}!</h2>
          <p className="text-gray-600">Ditt dagsschema kommer snart.</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span className="rounded-full bg-gray-100 px-3 py-1">Vy: {profile.viewMode}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">
              Sensorisk: {profile.sensoryMode}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1">
              Belöning: {profile.rewardType}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
