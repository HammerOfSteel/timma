'use client';

import { useRouter } from 'next/navigation';
import type { ActivityData } from './types';

interface MonthViewProps {
  activities: ActivityData[];
  year: number;
  month: number; // 0-indexed
}

const DAY_NAMES = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function MonthView({ activities, year, month }: MonthViewProps) {
  const router = useRouter();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday-indexed
  const daysInMonth = lastDay.getDate();

  const todayStr = (() => {
    const t = new Date();
    return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  // Group activities by date
  const byDate = new Map<string, ActivityData[]>();
  for (const a of activities) {
    const dateKey = a.startTime.split('T')[0];
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(a);
  }

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function handleDayClick(day: number) {
    router.push(`/?view=day&date=${toDateStr(year, month, day)}`);
  }

  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-2 text-center text-xs font-medium text-gray-400">
            {name}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="min-h-[80px] rounded-lg bg-gray-50/50" />;
          }

          const dateStr = toDateStr(year, month, day);
          const dayActivities = byDate.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const completedCount = dayActivities.filter((a) => a.completed).length;

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className={`min-h-[80px] rounded-lg border p-1.5 text-left transition hover:bg-gray-50 ${
                isToday ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
                {dayActivities.length > 0 && (
                  <span className="text-[10px] text-gray-400">
                    {completedCount}/{dayActivities.length}
                  </span>
                )}
              </div>

              {/* Activity pills */}
              {dayActivities.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {dayActivities.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] text-white ${
                        a.completed ? 'opacity-50' : ''
                      }`}
                      style={{ backgroundColor: a.color || '#6366f1' }}
                    >
                      {a.title}
                    </div>
                  ))}
                  {dayActivities.length > 3 && (
                    <div className="text-[10px] text-gray-400">
                      +{dayActivities.length - 3} till
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
