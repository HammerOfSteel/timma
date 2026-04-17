'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { useTheme } from './theme-provider';
import { SettingsPanel } from './settings-panel';

interface HomeHeaderProps {
  profileName: string;
  householdName: string;
  themes: {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  }[];
  currentThemeId: string | null;
  currentSensoryMode: 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT';
  calendarToken: string | null;
  familyView?: boolean;
  familyProfiles?: { id: string; name: string }[];
  activeFilterIds?: string[];
}

const PROFILE_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500'];

export function HomeHeader({
  profileName,
  householdName,
  themes,
  currentThemeId,
  currentSensoryMode,
  calendarToken,
  familyView,
  familyProfiles = [],
  activeFilterIds = [],
}: HomeHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const borderColor = theme?.isDark ? 'border-white/10' : 'border-gray-200';
  const subtextColor = theme?.isDark ? 'text-white/60' : 'text-gray-500';
  const btnClass = theme?.isDark
    ? 'border-white/20 text-white/80 hover:bg-white/10'
    : 'border-gray-300 hover:bg-gray-50';

  function toggleProfileFilter(profileId: string) {
    const current = new Set(activeFilterIds);
    if (current.has(profileId)) {
      current.delete(profileId);
      if (current.size === 0) {
        // Don't allow empty filter, re-select all
        familyProfiles.forEach((p) => current.add(p.id));
      }
    } else {
      current.add(profileId);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('profiles', Array.from(current).join(','));
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      <header className={`border-b px-4 py-3 ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">Timma</h1>
              <p className={`text-sm ${subtextColor}`}>{householdName}</p>
            </div>
            <nav className="flex gap-1">
              <Link href="/" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}>
                Schema
              </Link>
              <Link href="/kanban" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}>
                Kanban
              </Link>
              <Link href="/rewards" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}>
                Belöningar
              </Link>
              <Link href="/todos" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}>
                Backlog
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{profileName}</span>
            <button
              onClick={() => setShowSettings(true)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${btnClass}`}
              title="Inställningar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <Link href="/profile-select" className={`rounded-lg border px-3 py-1.5 text-sm ${btnClass}`}>
              Byt profil
            </Link>
            <form action={logout}>
              <button type="submit" className={`rounded-lg border px-3 py-1.5 text-sm ${btnClass}`}>
                Logga ut
              </button>
            </form>
          </div>
        </div>

        {/* Family filter chips */}
        {familyView && familyProfiles.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-medium ${subtextColor}`}>Visa:</span>
            {familyProfiles.map((p, i) => {
              const isActive = activeFilterIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProfileFilter(p.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? `${PROFILE_COLORS[i % PROFILE_COLORS.length]} text-white shadow-sm`
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  <span className="text-xs">{p.name[0]}</span>
                  {p.name}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {showSettings && (
        <SettingsPanel
          themes={themes}
          currentThemeId={currentThemeId}
          currentSensoryMode={currentSensoryMode}
          calendarToken={calendarToken}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
