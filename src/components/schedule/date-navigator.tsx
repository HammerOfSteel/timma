'use client';

import { useRouter } from 'next/navigation';

export type ViewMode = 'day' | 'week' | 'month';

interface DateNavigatorProps {
  view: ViewMode;
  date: string; // YYYY-MM-DD
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DateNavigator({ view, date }: DateNavigatorProps) {
  const router = useRouter();

  function navigate(newView: ViewMode, newDate: string) {
    router.push(`/?view=${newView}&date=${newDate}`);
  }

  const dateObj = new Date(date + 'T12:00:00');

  function getDisplayText() {
    if (view === 'day') {
      return dateObj.toLocaleDateString('sv-SE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } else if (view === 'week') {
      const weekStart = getMonday(dateObj);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const startStr = weekStart.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
      const endStr = weekEnd.toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return `${startStr} – ${endStr}`;
    } else {
      return dateObj.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
    }
  }

  function navigatePrev() {
    const d = new Date(dateObj);
    if (view === 'day') d.setDate(d.getDate() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    navigate(view, toDateStr(d));
  }

  function navigateNext() {
    const d = new Date(dateObj);
    if (view === 'day') d.setDate(d.getDate() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    navigate(view, toDateStr(d));
  }

  function navigateToday() {
    navigate(view, toDateStr(new Date()));
  }

  const viewLabels: Record<ViewMode, string> = {
    day: 'Dag',
    week: 'Vecka',
    month: 'Månad',
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
      {/* View mode tabs */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50">
        {(['day', 'week', 'month'] as const).map((v, i) => (
          <button
            key={v}
            onClick={() => navigate(v, date)}
            className={`px-3 py-1.5 text-xs font-medium transition ${
              view === v
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } ${i === 0 ? 'rounded-l-lg' : ''} ${i === 2 ? 'rounded-r-lg' : ''}`}
          >
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={navigatePrev}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Föregående"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="min-w-[180px] text-center text-sm font-medium capitalize">
          {getDisplayText()}
        </span>

        <button
          onClick={navigateNext}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Nästa"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={navigateToday}
          className="ml-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
        >
          Idag
        </button>
      </div>
    </div>
  );
}
