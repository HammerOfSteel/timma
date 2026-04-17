'use client';

import { useState } from 'react';
import type { ActivityData } from './types';
import { SymbolPicker } from './symbol-picker';
import { SignVideoPicker } from './sign-video-picker';

interface ActivityFormProps {
  date: string;
  activity?: ActivityData | null;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#fbbf24',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#a78bfa',
];

export function ActivityForm({ date, activity, onSubmit, onClose }: ActivityFormProps) {
  const startDate = activity ? new Date(activity.startTime) : null;
  const endDate = activity ? new Date(activity.endTime) : null;

  const [color, setColor] = useState(activity?.color || '#6366f1');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<{
    file: string;
    name: string;
  } | null>(
    activity?.symbol
      ? {
          file: activity.symbol.imageUrl.replace('/symbols/mulberry/', ''),
          name: activity.symbol.name,
        }
      : null,
  );
  const [customImage, setCustomImage] = useState<string | null>(activity?.imageUrl || null);
  const [showSignPicker, setShowSignPicker] = useState(false);
  const [selectedSign, setSelectedSign] = useState<{
    id: string;
    word: string;
    videoUrl: string;
  } | null>(activity?.signVideo || null);

  function handleSymbolSelect(file: string, name: string) {
    setSelectedSymbol({ file, name });
    setCustomImage(null); // Symbol takes precedence
    setShowSymbolPicker(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setSelectedSymbol(null); // Custom image takes precedence
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold">{activity ? 'Redigera aktivitet' : 'Ny aktivitet'}</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onSubmit(formData);
            }}
            className="mt-4 space-y-4"
          >
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="color" value={color} />
            {selectedSymbol && (
              <>
                <input type="hidden" name="symbolFile" value={selectedSymbol.file} />
                <input type="hidden" name="symbolName" value={selectedSymbol.name} />
              </>
            )}
            {!selectedSymbol && activity?.symbol && (
              <input type="hidden" name="removeSymbol" value="true" />
            )}
            {selectedSign && (
              <input type="hidden" name="signVideoId" value={selectedSign.id} />
            )}
            {!selectedSign && activity?.signVideo && (
              <input type="hidden" name="removeSignVideo" value="true" />
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium">
                Titel
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={activity?.title}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="T.ex. Frukost"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Beskrivning (valfritt)
              </label>
              <input
                id="description"
                name="description"
                type="text"
                defaultValue={activity?.description || ''}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Symbol & Image section */}
            <div>
              <label className="block text-sm font-medium">Symbol / Bild</label>
              <div className="mt-2 flex items-center gap-3">
                {/* Preview */}
                {selectedSymbol ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/symbols/mulberry/${selectedSymbol.file}`}
                      alt={selectedSymbol.name}
                      className="h-14 w-14 rounded-lg border border-gray-200 bg-white object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedSymbol(null)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
                    >
                      ✕
                    </button>
                  </div>
                ) : customImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customImage}
                      alt="Egen bild"
                      className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomImage(null)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-300">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSymbolPicker(true)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Välj symbol
                  </button>
                  <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Ladda upp bild
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Sign video section */}
            <div>
              <label className="block text-sm font-medium">Tecken (Takk)</label>
              <div className="mt-2 flex items-center gap-3">
                {selectedSign ? (
                  <div className="relative flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                    <span className="text-lg">🤟</span>
                    <span className="text-sm font-medium capitalize">{selectedSign.word}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSign(null)}
                      className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Inget tecken valt</span>
                )}
                <button
                  type="button"
                  onClick={() => setShowSignPicker(true)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Välj tecken
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Starttid</label>
                <div className="mt-1 flex gap-1">
                  <select
                    name="startHour"
                    defaultValue={startDate?.getHours() ?? 8}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    name="startMinute"
                    defaultValue={startDate ? Math.floor(startDate.getMinutes() / 15) * 15 : 0}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Sluttid</label>
                <div className="mt-1 flex gap-1">
                  <select
                    name="endHour"
                    defaultValue={endDate?.getHours() ?? 9}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    name="endMinute"
                    defaultValue={endDate ? Math.floor(endDate.getMinutes() / 15) * 15 : 0}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Upprepning</label>
              <select
                name="recurrence"
                defaultValue={activity?.recurrence || ''}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Ingen upprepning</option>
                <option value="DAILY">Varje dag</option>
                <option value="WEEKDAYS">Vardagar (mån–fre)</option>
                <option value="WEEKLY">Varje vecka</option>
                <option value="MONTHLY">Varje månad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Färg</label>
              <div className="mt-2 flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition ${
                      color === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="pointValue" className="block text-sm font-medium">
                Poäng
              </label>
              <input
                id="pointValue"
                name="pointValue"
                type="number"
                min="0"
                defaultValue={activity?.pointValue || 0}
                className="mt-1 block w-24 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {activity ? 'Spara' : 'Lägg till'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSymbolPicker && (
        <SymbolPicker onSelect={handleSymbolSelect} onClose={() => setShowSymbolPicker(false)} />
      )}
      {showSignPicker && (
        <SignVideoPicker
          onSelect={(sv) => {
            setSelectedSign({ id: sv.id, word: sv.word, videoUrl: sv.videoUrl });
            setShowSignPicker(false);
          }}
          onClose={() => setShowSignPicker(false)}
        />
      )}
    </>
  );
}
