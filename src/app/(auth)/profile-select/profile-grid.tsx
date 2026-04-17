'use client';

import { useState } from 'react';
import { switchProfile, createProfile, switchToFamilyView } from '@/app/actions/auth';

interface ProfileInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
  hasPin: boolean;
  role: string;
}

export function ProfileGrid({ profiles }: { profiles: ProfileInfo[] }) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileInfo | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  async function handleProfileClick(profile: ProfileInfo) {
    if (profile.hasPin) {
      setSelectedProfile(profile);
      setPin('');
      setError('');
    } else {
      const result = await switchProfile(profile.id, '');
      if (result?.error) setError(result.error);
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfile) return;

    const result = await switchProfile(selectedProfile.id, pin);
    if (result?.error) {
      setError(result.error);
      setPin('');
    }
  }

  async function handleCreateProfile(formData: FormData) {
    const result = await createProfile(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  const colors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-purple-500',
  ];

  if (selectedProfile) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white ${colors[profiles.indexOf(selectedProfile) % colors.length]}`}
        >
          {selectedProfile.name[0].toUpperCase()}
        </div>
        <h2 className="text-xl font-semibold">{selectedProfile.name}</h2>

        <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-4">
          <div>
            <label htmlFor="pin" className="block text-center text-sm font-medium">
              Ange PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-2xl tracking-widest shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedProfile(null)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Tillbaka
            </button>
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {profiles.map((profile, i) => (
          <button
            key={profile.id}
            onClick={() => handleProfileClick(profile)}
            className="flex flex-col items-center space-y-3 rounded-xl p-4 transition hover:bg-gray-100"
          >
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${colors[i % colors.length]}`}
            >
              {profile.name[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium">{profile.name}</span>
            {profile.hasPin && <span className="text-xs text-gray-400">🔒</span>}
          </button>
        ))}

        {/* Family view */}
        <button
          onClick={() => switchToFamilyView()}
          className="flex flex-col items-center space-y-3 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 transition hover:border-indigo-400 hover:bg-indigo-100"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 text-2xl font-bold text-white">
            👨‍👩‍👧‍👦
          </div>
          <span className="text-sm font-medium text-indigo-700">Familjen</span>
        </button>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex flex-col items-center space-y-3 rounded-xl border-2 border-dashed border-gray-300 p-4 transition hover:border-indigo-400 hover:bg-gray-50"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-3xl text-gray-500">
            +
          </div>
          <span className="text-sm font-medium text-gray-500">Lägg till profil</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mx-auto max-w-xs space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold">Ny profil</h3>
          <form action={handleCreateProfile} className="space-y-4">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium">
                Namn
              </label>
              <input
                id="profileName"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="profilePin" className="block text-sm font-medium">
                PIN (valfritt)
              </label>
              <input
                id="profilePin"
                name="pin"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="4 siffror"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700"
              >
                Skapa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
