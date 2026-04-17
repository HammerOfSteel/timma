'use client';

import { useState, useEffect } from 'react';

interface SignVideoData {
  id: string;
  word: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string;
  source: string;
}

interface SignVideoPickerProps {
  onSelect: (signVideo: SignVideoData) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Alla',
  mat: '🍎 Mat',
  aktivitet: '🎯 Aktivitet',
  känsla: '💛 Känsla',
  tid: '⏰ Tid',
  vardag: '🏠 Vardag',
  socialt: '👋 Socialt',
  övrigt: '📦 Övrigt',
};

export function SignVideoPicker({ onSelect, onClose }: SignVideoPickerProps) {
  const [videos, setVideos] = useState<SignVideoData[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category !== 'all') params.set('category', category);

    setLoading(true);
    fetch(`/api/signs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, category]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">Välj tecken</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b px-4 py-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök tecken..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto border-b px-4 py-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                category === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : videos.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Inga tecken hittades.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => onSelect(video)}
                  className="group flex flex-col items-center rounded-xl border border-gray-200 p-3 transition hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {/* Video preview or placeholder */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl transition group-hover:bg-indigo-200">
                    🤟
                  </div>
                  <p className="mt-2 text-center text-sm font-medium capitalize">{video.word}</p>
                  <span className="mt-0.5 text-[10px] text-gray-400">
                    {CATEGORY_LABELS[video.category] || video.category}
                  </span>
                  {video.source === 'CUSTOM' && (
                    <span className="mt-0.5 rounded bg-blue-100 px-1 text-[10px] text-blue-600">Egen</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
