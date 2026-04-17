'use client';

import { useState, useTransition } from 'react';
import {
  createActivity,
  updateTaskStatus,
  deleteActivity,
} from '@/app/actions/activities';
import { SymbolPicker } from '@/components/schedule/symbol-picker';
import type { ActivityData, TaskStatus } from '@/components/schedule/types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  BACKLOG: { label: 'Backlog', color: 'text-gray-600', bg: 'bg-gray-100' },
  TODO: { label: 'Att göra', color: 'text-blue-600', bg: 'bg-blue-100' },
  IN_PROGRESS: { label: 'Pågår', color: 'text-amber-600', bg: 'bg-amber-100' },
  DONE: { label: 'Klart', color: 'text-green-600', bg: 'bg-green-100' },
};

const PROFILE_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500'];

interface BacklogListProps {
  tasks: ActivityData[];
  isAdmin: boolean;
  isFamilyView: boolean;
  profiles: { id: string; name: string }[];
}

export function BacklogList({ tasks, isAdmin, isFamilyView, profiles }: BacklogListProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [profileFilter, setProfileFilter] = useState<string | 'ALL'>('ALL');

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (profileFilter !== 'ALL' && t.profileId !== profileFilter) return false;
    return true;
  });

  const grouped = {
    active: filtered.filter((t) => t.status !== 'DONE'),
    done: filtered.filter((t) => t.status === 'DONE'),
  };

  function handleStatusChange(id: string, status: string) {
    startTransition(() => { updateTaskStatus(id, status); });
  }

  function handleDelete(id: string) {
    if (!confirm('Ta bort denna uppgift?')) return;
    startTransition(() => { deleteActivity(id); });
  }

  function handleAdd(formData: FormData) {
    startTransition(() => { createActivity(formData); setShowAddForm(false); });
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Status:</span>
        {(['ALL', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'ALL' ? 'Alla' : STATUS_CONFIG[s].label}
          </button>
        ))}

        {isFamilyView && profiles.length > 1 && (
          <>
            <span className="ml-2 text-xs font-medium text-gray-500">Person:</span>
            <button
              onClick={() => setProfileFilter('ALL')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                profileFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Alla
            </button>
            {profiles.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setProfileFilter(p.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  profileFilter === p.id
                    ? `${PROFILE_COLORS[i % PROFILE_COLORS.length]} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Add button */}
      {isAdmin && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-indigo-400 hover:text-indigo-600"
        >
          <span className="text-lg">+</span> Ny uppgift
        </button>
      )}

      {showAddForm && (
        <TaskForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          isPending={isPending}
          profiles={isFamilyView ? profiles : undefined}
        />
      )}

      {grouped.active.length === 0 && grouped.done.length === 0 && !showAddForm && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-3xl">📋</p>
          <p className="mt-2 text-sm">Inga uppgifter i backlogen</p>
        </div>
      )}

      {/* Active tasks */}
      <div className="space-y-2">
        {grouped.active.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            onDelete={isAdmin ? () => handleDelete(task.id) : undefined}
            isPending={isPending}
            showProfile={isFamilyView}
            profiles={profiles}
          />
        ))}
      </div>

      {/* Done */}
      {grouped.done.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Klara ({grouped.done.length})
          </h3>
          <div className="space-y-2">
            {grouped.done.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={isAdmin ? () => handleDelete(task.id) : undefined}
                isPending={isPending}
                showProfile={isFamilyView}
                profiles={profiles}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onStatusChange,
  onDelete,
  isPending,
  showProfile,
  profiles,
}: {
  task: ActivityData;
  onStatusChange: (id: string, status: string) => void;
  onDelete?: () => void;
  isPending: boolean;
  showProfile: boolean;
  profiles: { id: string; name: string }[];
}) {
  const cfg = STATUS_CONFIG[task.status];
  const isDone = task.status === 'DONE';
  const profileIdx = profiles.findIndex((p) => p.id === task.profileId);

  return (
    <div className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition ${isDone ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange(task.id, isDone ? 'TODO' : 'DONE')}
        disabled={isPending}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          isDone ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {isDone && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Color strip */}
      {task.color && <div className="h-6 w-1 rounded-full" style={{ backgroundColor: task.color }} />}

      {/* Symbol */}
      {task.symbol && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={task.symbol.imageUrl} alt={task.symbol.name} className="h-8 w-8 shrink-0 object-contain" />
      )}

      {/* Title & info */}
      <div className="min-w-0 flex-1">
        <span className={`text-sm ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {task.title}
        </span>
        {task.startTime && (
          <span className="ml-2 text-xs text-gray-400">
            📅 {new Date(task.startTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
            {' '}
            {new Date(task.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Profile badge */}
      {showProfile && task.profileName && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${PROFILE_COLORS[profileIdx >= 0 ? profileIdx % PROFILE_COLORS.length : 0]}`}>
          {task.profileName}
        </span>
      )}

      {/* Status badge */}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        disabled={isPending}
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color} border-0 focus:outline-none`}
      >
        <option value="BACKLOG">Backlog</option>
        <option value="TODO">Att göra</option>
        <option value="IN_PROGRESS">Pågår</option>
        <option value="DONE">Klart</option>
      </select>

      {/* Points */}
      {task.pointValue > 0 && (
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          +{task.pointValue}p
        </span>
      )}

      {/* Delete */}
      {onDelete && (
        <button onClick={onDelete} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Ta bort">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

function TaskForm({
  onSubmit,
  onCancel,
  isPending,
  profiles,
}: {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
  profiles?: { id: string; name: string }[];
}) {
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<{ file: string; name: string } | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <>
      <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-3 text-sm font-semibold">Ny uppgift</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}
          className="space-y-3"
        >
          {selectedSymbol && (
            <>
              <input type="hidden" name="symbolFile" value={selectedSymbol.file} />
              <input type="hidden" name="symbolName" value={selectedSymbol.name} />
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSymbolPicker(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white transition hover:border-indigo-400"
              title="Välj symbol"
            >
              {selectedSymbol ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={`/symbols/mulberry/${selectedSymbol.file}`} alt={selectedSymbol.name} className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-gray-300">🖼</span>
              )}
            </button>
            <input
              name="title"
              type="text"
              required
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Vad ska göras?"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {profiles && profiles.length > 1 && (
              <div className="flex items-center gap-1">
                <label className="text-xs font-medium text-gray-600">Tilldela:</label>
                <select name="assignToProfileId" className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none">
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Poäng:</label>
              <input name="pointValue" type="number" min="0" defaultValue={0} className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showSchedule} onChange={(e) => setShowSchedule(e.target.checked)} className="rounded" />
              Schemalägg
            </label>
          </div>

          {showSchedule && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">Datum</label>
                <input name="date" type="date" className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Start</label>
                <div className="flex gap-1">
                  <select name="startHour" defaultValue={9} className="flex-1 rounded border border-gray-300 px-1 py-1 text-xs">
                    {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}
                  </select>
                  <select name="startMinute" defaultValue={0} className="flex-1 rounded border border-gray-300 px-1 py-1 text-xs">
                    {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Slut</label>
                <div className="flex gap-1">
                  <select name="endHour" defaultValue={10} className="flex-1 rounded border border-gray-300 px-1 py-1 text-xs">
                    {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}
                  </select>
                  <select name="endMinute" defaultValue={0} className="flex-1 rounded border border-gray-300 px-1 py-1 text-xs">
                    {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              Avbryt
            </button>
            <button type="submit" disabled={isPending} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              Lägg till
            </button>
          </div>
        </form>
      </div>

      {showSymbolPicker && (
        <SymbolPicker
          onSelect={(file, name) => { setSelectedSymbol({ file, name }); setShowSymbolPicker(false); }}
          onClose={() => setShowSymbolPicker(false)}
          activityTitle={titleValue}
        />
      )}
    </>
  );
}
