'use client';

import { useState } from 'react';
import Link from 'next/link';
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
}

export function HomeHeader({
  profileName,
  householdName,
  themes,
  currentThemeId,
  currentSensoryMode,
  calendarToken,
}: HomeHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const theme = useTheme();

  const borderColor = theme?.isDark ? 'border-white/10' : 'border-gray-200';
  const subtextColor = theme?.isDark ? 'text-white/60' : 'text-gray-500';
  const btnClass = theme?.isDark
    ? 'border-white/20 text-white/80 hover:bg-white/10'
    : 'border-gray-300 hover:bg-gray-50';

  return (
    <>
      <header className={`flex items-center justify-between border-b px-6 py-4 ${borderColor}`}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Timma</h1>
            <p className={`text-sm ${subtextColor}`}>{householdName}</p>
          </div>
          <nav className="flex gap-1">
            <Link
              href="/"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}
            >
              Schema
            </Link>
            <Link
              href="/kanban"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}
            >
              Kanban
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{profileName}</span>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${btnClass}`}
            title="Inställningar"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <Link
            href="/profile-select"
            className={`rounded-lg border px-3 py-1.5 text-sm ${btnClass}`}
          >
            Byt profil
          </Link>
          <form action={logout}>
            <button type="submit" className={`rounded-lg border px-3 py-1.5 text-sm ${btnClass}`}>
              Logga ut
            </button>
          </form>
        </div>
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
