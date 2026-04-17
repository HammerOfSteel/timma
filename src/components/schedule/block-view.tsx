'use client';

import type { ScheduleViewProps } from './types';
import { ActivityVisual } from './activity-visual';
import { SignVideoPlayer } from './sign-video-player';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

function getDurationMinutes(start: string, end: string) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 60000;
}

export function BlockView({ activities, onToggleComplete, onEdit, onDelete }: ScheduleViewProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        <p>Inga aktiviteter idag. Tryck + för att lägga till.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {activities.map((activity) => {
        const duration = getDurationMinutes(activity.startTime, activity.endTime);
        const minHeight = Math.max(60, Math.min(duration * 1.5, 200));

        return (
          <div
            key={activity.id}
            className={`relative rounded-xl border-l-4 bg-white p-4 shadow-sm transition ${
              activity.completed ? 'opacity-60' : ''
            }`}
            style={{
              borderLeftColor: activity.color || '#6366f1',
              minHeight: `${minHeight}px`,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleComplete(activity.id)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    activity.completed
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {activity.completed && (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <ActivityVisual
                      symbol={activity.symbol}
                      imageUrl={activity.imageUrl}
                      size="md"
                    />
                    {activity.signVideo && (
                      <SignVideoPlayer
                        videoUrl={activity.signVideo.videoUrl}
                        word={activity.signVideo.word}
                        size="sm"
                      />
                    )}
                    <h3
                      className={`font-semibold ${activity.completed ? 'line-through text-gray-400' : ''}`}
                    >
                      {activity.title}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
                  </p>
                  {activity.description && (
                    <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activity.recurrence && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600" title="Återkommande">
                    ↻
                  </span>
                )}
                {activity.pointValue > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    +{activity.pointValue}p
                  </span>
                )}
                <button
                  onClick={() => onEdit(activity)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Redigera"
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
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Ta bort"
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
          </div>
        );
      })}
    </div>
  );
}
