'use client';

import type { ScheduleViewProps } from './types';
import { ActivityVisual } from './activity-visual';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

export function CardStripView({
  activities,
  onToggleComplete,
  onEdit,
  onDelete,
}: ScheduleViewProps) {
  const now = new Date();
  const sorted = [...activities].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  // Find the current/next activity
  const currentIndex = sorted.findIndex((a) => {
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    return now >= start && now <= end;
  });

  const nextIndex =
    currentIndex >= 0 ? currentIndex : sorted.findIndex((a) => new Date(a.startTime) > now);

  if (activities.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        <p>Inga aktiviteter idag.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Now / Next / Later labels */}
      <div className="flex gap-4 overflow-x-auto p-4 pb-2">
        {sorted.map((activity, i) => {
          let label = 'Sedan';
          let labelColor = 'text-gray-400';
          if (i === nextIndex) {
            label = 'Nu';
            labelColor = 'text-green-600';
          } else if (i === nextIndex + 1) {
            label = 'Nästa';
            labelColor = 'text-blue-600';
          } else if (i < nextIndex) {
            label = 'Klar';
            labelColor = 'text-gray-300';
          }

          const isNow = i === nextIndex;

          return (
            <div
              key={activity.id}
              className={`flex min-w-[220px] max-w-[280px] shrink-0 flex-col rounded-2xl border-2 p-5 transition ${
                isNow
                  ? 'scale-105 border-green-400 bg-green-50 shadow-lg'
                  : activity.completed
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>
                {label}
              </span>

              <div className="mt-3 flex items-center gap-2">
                <ActivityVisual symbol={activity.symbol} imageUrl={activity.imageUrl} size="lg" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: activity.color || '#6366f1' }}
                    />
                    <h3
                      className={`text-lg font-bold ${activity.completed ? 'line-through text-gray-400' : ''}`}
                    >
                      {activity.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
              </p>

              {activity.description && (
                <p className="mt-2 text-sm text-gray-600">{activity.description}</p>
              )}

              {activity.pointValue > 0 && (
                <span className="mt-2 inline-block self-start rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  +{activity.pointValue}p
                </span>
              )}

              <div className="mt-auto flex gap-2 pt-3">
                <button
                  onClick={() => onToggleComplete(activity.id)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activity.completed
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {activity.completed ? 'Ångra' : 'Klar!'}
                </button>
                <button
                  onClick={() => onEdit(activity)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-400 hover:text-gray-600"
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(activity.id)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-400 hover:text-red-500"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
