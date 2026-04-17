'use client';

import { useState, useTransition } from 'react';
import { setProfileTheme, setSensoryMode } from '@/app/actions/themes';

interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

interface SettingsPanelProps {
  themes: ThemeOption[];
  currentThemeId: string | null;
  currentSensoryMode: 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT';
  onClose: () => void;
}

export function SettingsPanel({
  themes,
  currentThemeId,
  currentSensoryMode,
  onClose,
}: SettingsPanelProps) {
  const [activeTheme, setActiveTheme] = useState(currentThemeId);
  const [sensory, setSensory] = useState(currentSensoryMode);
  const [isPending, startTransition] = useTransition();

  function handleThemeChange(themeId: string) {
    setActiveTheme(themeId);
    startTransition(() => {
      setProfileTheme(themeId);
    });
  }

  function handleSensoryToggle(mode: 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT') {
    setSensory(mode);
    startTransition(() => {
      setSensoryMode(mode);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Inställningar</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isPending && (
          <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            Sparar...
          </div>
        )}

        {/* Theme picker */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700">Tema</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {themes.map((theme) => {
              const isDark = isColorDark(theme.backgroundColor);
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative overflow-hidden rounded-xl border-2 p-3 text-left transition ${
                    activeTheme === theme.id
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium" style={{ color: theme.textColor }}>
                    {theme.name}
                  </p>
                  {activeTheme === theme.id && (
                    <div className="absolute right-2 top-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={isDark ? '#fff' : '#6366f1'}
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sensory mode toggle */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700">Sensoriskt läge</h3>
          <p className="mt-1 text-xs text-gray-500">Anpassa visuell intensitet efter behov.</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleSensoryToggle('LOW_STIMULATION')}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition ${
                sensory === 'LOW_STIMULATION'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xl">🌙</div>
              <div className="mt-1 text-xs font-medium">Lugn</div>
              <div className="mt-0.5 text-[10px] text-gray-400">Mindre stimulans</div>
            </button>
            <button
              onClick={() => handleSensoryToggle('HIGH_ENGAGEMENT')}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition ${
                sensory === 'HIGH_ENGAGEMENT'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xl">☀️</div>
              <div className="mt-1 text-xs font-medium">Aktiv</div>
              <div className="mt-0.5 text-[10px] text-gray-400">Mer engagemang</div>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}

/** Simple luminance check to determine if a color is dark */
function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
