'use client';

import type { ScheduleViewProps } from './types';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;

export function TimelineView({
  activities,
  onToggleComplete,
  onEdit,
  onDelete,
}: ScheduleViewProps) {
  function getTopOffset(iso: string) {
    const d = new Date(iso);
    const hours = d.getHours() + d.getMinutes() / 60 - START_HOUR;
    return Math.max(0, hours * HOUR_HEIGHT);
  }

  function getHeight(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const durationHours = (end.getTime() - start.getTime()) / 3600000;
    return Math.max(30, durationHours * HOUR_HEIGHT);
  }

  // Current time indicator
  const now = new Date();
  const nowOffset = (now.getHours() + now.getMinutes() / 60 - START_HOUR) * HOUR_HEIGHT;
  const showNowLine = nowOffset >= 0 && nowOffset <= TOTAL_HOURS * HOUR_HEIGHT;

  return (
    <div className="relative flex flex-1 overflow-y-auto p-4">
      {/* Hour labels */}
      <div className="relative w-14 shrink-0">
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute right-3 text-xs text-gray-400"
            style={{ top: `${i * HOUR_HEIGHT - 8}px` }}
          >
            {String(START_HOUR + i).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {/* Timeline grid */}
      <div className="relative flex-1" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
        {/* Grid lines */}
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: `${i * HOUR_HEIGHT}px` }}
          />
        ))}

        {/* Now indicator */}
        {showNowLine && (
          <div
            className="absolute left-0 right-0 z-10 flex items-center"
            style={{ top: `${nowOffset}px` }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div className="h-0.5 flex-1 bg-red-500" />
          </div>
        )}

        {/* Activity blocks */}
        {activities.map((activity) => {
          const top = getTopOffset(activity.startTime);
          const height = getHeight(activity.startTime, activity.endTime);

          return (
            <div
              key={activity.id}
              className={`absolute left-1 right-1 overflow-hidden rounded-lg border px-3 py-2 transition ${
                activity.completed ? 'opacity-50' : ''
              }`}
              style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: (activity.color || '#6366f1') + '20',
                borderColor: activity.color || '#6366f1',
              }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleComplete(activity.id)}
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          activity.completed ? 'border-green-500 bg-green-500' : 'border-gray-400'
                        }`}
                      >
                        {activity.completed && (
                          <svg
                            className="h-2.5 w-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`truncate text-sm font-semibold ${activity.completed ? 'line-through text-gray-400' : ''}`}
                      >
                        {activity.title}
                      </span>
                    </div>
                    {height > 50 && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => onEdit(activity)}
                      className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="h-3.5 w-3.5"
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
                      className="rounded p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <svg
                        className="h-3.5 w-3.5"
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
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {activities.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>Inga aktiviteter idag.</p>
          </div>
        )}
      </div>
    </div>
  );
}
