'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { ActivityData } from './types';
import { ActivityVisual } from './activity-visual';
import { toggleActivityComplete } from '@/app/actions/activities';

interface WeekViewProps {
  activities: ActivityData[];
  weekStart: string; // YYYY-MM-DD (Monday)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_NAMES = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export function WeekView({ activities, weekStart }: WeekViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Generate 7 days starting from Monday
  const days: Date[] = [];
  const start = new Date(weekStart + 'T12:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const todayStr = toDateStr(new Date());

  // Group activities by date
  const byDate = new Map<string, ActivityData[]>();
  for (const a of activities) {
    if (!a.startTime) continue;
    const dateKey = a.startTime.split('T')[0];
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(a);
  }

  function handleToggle(id: string) {
    startTransition(() => {
      toggleActivityComplete(id);
    });
  }

  function handleDayClick(dateStr: string) {
    router.push(`/?view=day&date=${dateStr}`);
  }

  return (
    <div className="flex flex-1 flex-col overflow-x-auto p-3">
      {isPending && (
        <div className="flex justify-center py-1">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      <div className="grid min-w-[700px] grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dateKey = toDateStr(day);
          const dayActivities = byDate.get(dateKey) || [];
          const isToday = dateKey === todayStr;
          const completedCount = dayActivities.filter((a) => a.status === 'DONE').length;

          return (
            <div
              key={dateKey}
              className={`flex flex-col rounded-xl border ${
                isToday ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Day header — click to go to day view */}
              <button
                onClick={() => handleDayClick(dateKey)}
                className="flex flex-col items-center border-b border-gray-100 py-2 hover:bg-gray-50"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  {DAY_NAMES[i]}
                </span>
                <span
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayActivities.length > 0 && (
                  <span className="mt-0.5 text-[10px] text-gray-400">
                    {completedCount}/{dayActivities.length}
                  </span>
                )}
              </button>

              {/* Activities */}
              <div className="flex-1 space-y-1 p-1.5">
                {dayActivities.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleToggle(a.id)}
                    className={`flex w-full items-start gap-1 rounded-lg border-l-[3px] p-1.5 text-left text-xs transition hover:shadow-sm ${
                      a.status === 'DONE' ? 'opacity-50' : ''
                    }`}
                    style={{
                      borderLeftColor: a.color || '#6366f1',
                      backgroundColor: `${a.color || '#6366f1'}08`,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <ActivityVisual symbol={a.symbol} imageUrl={a.imageUrl} size="sm" />
                        <span
                          className={`truncate font-medium ${a.status === 'DONE' ? 'line-through text-gray-400' : ''}`}
                        >
                          {a.title}
                        </span>
                      </div>
                      {a.startTime && (
                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {formatTime(a.startTime)}
                        </div>
                      )}
                    </div>
                    {a.status === 'DONE' && (
                      <svg className="mt-0.5 h-3 w-3 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                {dayActivities.length === 0 && (
                  <p className="py-4 text-center text-[10px] text-gray-300">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
