'use client';

import { useState, useTransition } from 'react';
import type { ActivityData } from './types';
import { BlockView } from './block-view';
import { CardStripView } from './card-strip-view';
import { TimelineView } from './timeline-view';
import { ActivityForm } from './activity-form';
import {
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityComplete,
  reorderActivities,
} from '@/app/actions/activities';

interface DayScheduleProps {
  activities: ActivityData[];
  viewMode: 'BLOCKS' | 'CARDS' | 'TIMELINE';
  date: string;
  profileName: string;
  isFamilyView?: boolean;
  familyProfiles?: { id: string; name: string }[];
}

export function DaySchedule({ activities, viewMode, date, profileName }: DayScheduleProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityData | null>(null);
  const [currentView, setCurrentView] = useState(viewMode);
  const [isPending, startTransition] = useTransition();

  function handleToggleComplete(id: string) {
    startTransition(() => {
      toggleActivityComplete(id);
    });
  }

  function handleEdit(activity: ActivityData) {
    setEditingActivity(activity);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    startTransition(() => {
      deleteActivity(id);
    });
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(() => {
      reorderActivities(orderedIds);
    });
  }

  async function handleFormSubmit(formData: FormData) {
    if (editingActivity) {
      await updateActivity(editingActivity.id, formData);
    } else {
      await createActivity(formData);
    }
    setShowForm(false);
    setEditingActivity(null);
  }

  const viewProps = {
    activities,
    date,
    onToggleComplete: handleToggleComplete,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onReorder: handleReorder,
  };

  const viewLabels: Record<string, string> = {
    BLOCKS: 'Block',
    CARDS: 'Kort',
    TIMELINE: 'Tidslinje',
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <p className="text-sm text-gray-500">
          {activities.length} aktivitet{activities.length !== 1 ? 'er' : ''}
          {activities.filter((a) => a.status === 'DONE').length > 0 &&
            ` · ${activities.filter((a) => a.status === 'DONE').length} klara`}
        </p>
        <div className="flex items-center gap-2">
          {/* View mode switcher */}
          <div className="flex rounded-lg border border-gray-200 bg-gray-50">
            {(['BLOCKS', 'CARDS', 'TIMELINE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentView(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  currentView === mode
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                } ${mode === 'BLOCKS' ? 'rounded-l-lg' : ''} ${mode === 'TIMELINE' ? 'rounded-r-lg' : ''}`}
              >
                {viewLabels[mode]}
              </button>
            ))}
          </div>

          {/* Add activity button */}
          <button
            onClick={() => {
              setEditingActivity(null);
              setShowForm(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="flex items-center justify-center py-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {/* View */}
      {currentView === 'BLOCKS' && <BlockView {...viewProps} />}
      {currentView === 'CARDS' && <CardStripView {...viewProps} />}
      {currentView === 'TIMELINE' && <TimelineView {...viewProps} />}

      {/* Activity form modal */}
      {showForm && (
        <ActivityForm
          date={date}
          activity={editingActivity}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
}
