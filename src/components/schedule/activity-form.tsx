'use client';

import { useState } from 'react';
import type { ActivityData } from './types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
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
  );
}
