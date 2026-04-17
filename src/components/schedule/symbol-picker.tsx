'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SymbolResult {
  id: string;
  name: string;
  file: string;
  category: string;
  tags: string[];
}

interface CategoryInfo {
  name: string;
  count: number;
}

interface SymbolPickerProps {
  onSelect: (file: string, name: string) => void;
  onClose: () => void;
}

export function SymbolPicker({ onSelect, onClose }: SymbolPickerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [symbols, setSymbols] = useState<SymbolResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories on mount
  useEffect(() => {
    fetch('/api/symbols?categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
    searchRef.current?.focus();
  }, []);

  const searchSymbols = useCallback(async (q: string, cat: string | null) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '60' });
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);

    try {
      const res = await fetch(`/api/symbols?${params}`);
      const data = await res.json();
      setSymbols(data.symbols || []);
      setTotal(data.total || 0);
    } catch {
      setSymbols([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSymbols(query, category);
    }, 200);
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [query, category, searchSymbols]);

  // Swedish translations for common categories
  const categoryLabels: Record<string, string> = {
    'Food Fruit': 'Mat & Frukt',
    'Food Vegetables': 'Grönsaker',
    'Food Meat': 'Kött',
    'Food Kitchen': 'Kök',
    'Drink Type': 'Dryck',
    'People Feelings': 'Känslor',
    'People Relationship': 'Relationer',
    'People Profession': 'Yrken',
    'Leisure Games': 'Spel & Lek',
    'Leisure Toys': 'Leksaker',
    Sport: 'Sport',
    'Transport Road': 'Transport',
    Clothes: 'Kläder',
    'Building Contents': 'Inredning',
    'Building Furniture': 'Möbler',
    'Healthcare Body parts': 'Kropp',
    'Healthcare Grooming': 'Hygien',
    'Healthcare Medical': 'Sjukvård',
    'Work and School': 'Skola & Jobb',
    'Animal Mammal': 'Djur',
    'Animal Birds': 'Fåglar',
    Celebration: 'Firande',
    'Art Colour': 'Färger',
    'Art Making': 'Pyssel',
    'Descriptive Time': 'Tid',
    'Descriptive State': 'Beskrivning',
    'Communication Aid': 'Kommunikation',
    Computer: 'Dator',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold">Välj symbol</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b px-5 py-3">
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök symboler... (t.ex. breakfast, happy, school)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Categories (horizontal scroll) */}
        <div className="flex gap-2 overflow-x-auto border-b px-5 py-2">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              !category
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alla
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                category === cat.name
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[cat.name] || cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : symbols.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              {query ? 'Inga symboler hittades.' : 'Laddar symboler...'}
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-gray-400">
                {total} resultat{total !== 1 && ''} {total > 60 && '(visar de första 60)'}
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {symbols.map((symbol) => (
                  <button
                    key={symbol.id + symbol.file}
                    onClick={() => onSelect(symbol.file, symbol.name)}
                    className="group flex flex-col items-center rounded-xl border border-gray-200 p-2 transition hover:border-indigo-300 hover:bg-indigo-50"
                    title={symbol.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/symbols/mulberry/${symbol.file}`}
                      alt={symbol.name}
                      className="h-12 w-12 object-contain"
                      loading="lazy"
                    />
                    <span className="mt-1 line-clamp-2 text-center text-[10px] leading-tight text-gray-500 group-hover:text-indigo-700">
                      {symbol.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
