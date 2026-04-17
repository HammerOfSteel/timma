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
  activityTitle?: string; // For smart suggestions
}

type TabMode = 'suggestions' | 'favorites' | 'browse';

export function SymbolPicker({ onSelect, onClose, activityTitle }: SymbolPickerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [symbols, setSymbols] = useState<SymbolResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabMode>(activityTitle ? 'suggestions' : 'browse');
  const [suggestions, setSuggestions] = useState<SymbolResult[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [frequent, setFrequent] = useState<Array<{ file: string; name: string; count: number }>>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories on mount
  useEffect(() => {
    fetch('/api/symbols?categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Load smart suggestions when title is available
  useEffect(() => {
    if (!activityTitle || activityTitle.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    fetch(`/api/symbols?suggest=${encodeURIComponent(activityTitle)}`)
      .then((r) => r.json())
      .then((data) => setSuggestions(data.symbols || []))
      .catch(() => setSuggestions([]))
      .finally(() => setSuggestionsLoading(false));
  }, [activityTitle]);

  // Load favorites and frequent
  useEffect(() => {
    setFavoritesLoading(true);
    fetch('/api/symbols/favorites')
      .then((r) => r.json())
      .then((data) => {
        setFavorites(data.favorites || []);
        setFrequent(data.frequent || []);
      })
      .catch(() => {})
      .finally(() => setFavoritesLoading(false));
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

  // Debounced search for browse tab
  useEffect(() => {
    if (tab !== 'browse') return;
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSymbols(query, category);
    }, 200);
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [query, category, searchSymbols, tab]);

  // Focus search when switching to browse
  useEffect(() => {
    if (tab === 'browse') searchRef.current?.focus();
  }, [tab]);

  const isFavorite = (file: string) => favorites.includes(file);

  async function toggleFavorite(file: string, name: string) {
    const action = isFavorite(file) ? 'remove' : 'add';
    // Optimistic update
    if (action === 'add') {
      setFavorites((prev) => [file, ...prev]);
    } else {
      setFavorites((prev) => prev.filter((f) => f !== file));
    }
    try {
      await fetch('/api/symbols/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, name, action }),
      });
    } catch {
      // Revert on error
      if (action === 'add') {
        setFavorites((prev) => prev.filter((f) => f !== file));
      } else {
        setFavorites((prev) => [file, ...prev]);
      }
    }
  }

  // Category labels (Swedish translations)
  const categoryLabels: Record<string, string> = {
    'Alphabet': 'Alfabet',
    'Animal Birds': 'Fåglar',
    'Animal Insects': 'Insekter',
    'Animal Mammal': 'Djur',
    'Animal Reptile': 'Reptiler',
    'Animal Sea': 'Havsdjur',
    'Art Colour': 'Färger',
    'Art Making': 'Pyssel',
    'Building Contents': 'Inredning',
    'Building Exterior': 'Byggnader',
    'Building Furniture': 'Möbler',
    'Building Other': 'Övrigt (bygg)',
    'Celebration Item': 'Firande',
    'Clothes Accessories': 'Accessoarer',
    'Clothes General': 'Kläder',
    'Clothes Sport': 'Sportkläder',
    'Communication Aid': 'Kommunikation',
    'Computer': 'Dator',
    'Country Flags': 'Flaggor',
    'Country Maps': 'Kartor',
    'Descriptive Action': 'Handlingar',
    'Descriptive Position': 'Positioner',
    'Descriptive Quantity': 'Antal',
    'Descriptive State': 'Beskrivt tillstånd',
    'Descriptive Time': 'Tid',
    'Drink Type': 'Drycker',
    'Food Breads and baking': 'Bröd & bakning',
    'Food Dairy': 'Mejeriprodukter',
    'Food Feeding and eating': 'Mat & ätande',
    'Food Fruit': 'Frukt',
    'Food Kitchen items': 'Kök',
    'Food Meals and snacks': 'Måltider',
    'Food Meat': 'Kött',
    'Food Other': 'Mat (övrigt)',
    'Food Sweet': 'Godis & sötsaker',
    'Food Vegetables and salads': 'Grönsaker',
    'Gardening': 'Trädgård',
    'Healthcare Body parts': 'Kropp',
    'Healthcare Grooming items': 'Hygienartiklar',
    'Healthcare Medical': 'Sjukvård',
    'Healthcare Medical conditions': 'Medicinska tillstånd',
    'Leisure Games': 'Spel & lek',
    'Leisure Toys': 'Leksaker',
    'Music and Drama': 'Musik & drama',
    'Number': 'Siffror',
    'People Feelings': 'Känslor',
    'People Nouns': 'Människor',
    'People Profession': 'Yrken',
    'People Relationship': 'Relationer',
    'Plant': 'Växter',
    'Sport': 'Sport',
    'Tool': 'Verktyg',
    'Transport Air': 'Flyg',
    'Transport Other': 'Transport (övrigt)',
    'Transport Road': 'Vägtransport',
    'Transport Sea': 'Sjötransport',
    'Verb': 'Verb',
    'Work and School': 'Skola & jobb',
  };

  // Category groups for better browsing
  const categoryGroups: Record<string, string[]> = {
    'Mat & Dryck': [
      'Food Fruit', 'Food Vegetables and salads', 'Food Meals and snacks',
      'Food Breads and baking', 'Food Dairy', 'Food Meat', 'Food Sweet',
      'Food Kitchen items', 'Food Feeding and eating', 'Food Other', 'Drink Type',
    ],
    'Människor & Känslor': [
      'People Feelings', 'People Nouns', 'People Profession', 'People Relationship',
    ],
    'Djur & Natur': [
      'Animal Mammal', 'Animal Birds', 'Animal Insects', 'Animal Reptile',
      'Animal Sea', 'Plant', 'Gardening',
    ],
    'Skola & Aktiviteter': [
      'Work and School', 'Leisure Games', 'Leisure Toys', 'Music and Drama',
      'Sport', 'Art Colour', 'Art Making',
    ],
    'Hem & Vardag': [
      'Building Contents', 'Building Furniture', 'Building Exterior', 'Building Other',
      'Clothes General', 'Clothes Accessories', 'Clothes Sport', 'Tool',
    ],
    'Hälsa & Kropp': [
      'Healthcare Body parts', 'Healthcare Grooming items', 'Healthcare Medical',
      'Healthcare Medical conditions',
    ],
    'Transport & Platser': [
      'Transport Road', 'Transport Air', 'Transport Sea', 'Transport Other',
      'Country Flags', 'Country Maps',
    ],
    'Kommunikation & Beskrivning': [
      'Communication Aid', 'Computer', 'Descriptive Action', 'Descriptive Position',
      'Descriptive Quantity', 'Descriptive State', 'Descriptive Time', 'Verb',
    ],
    'Övrigt': [
      'Alphabet', 'Number', 'Celebration Item',
    ],
  };

  function renderSymbolGrid(items: SymbolResult[], showFavButton = true) {
    return (
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {items.map((symbol) => (
          <div key={symbol.id + symbol.file} className="group relative">
            <button
              onClick={() => onSelect(symbol.file, symbol.name)}
              className="flex w-full flex-col items-center rounded-xl border border-gray-200 p-2 transition hover:border-indigo-300 hover:bg-indigo-50"
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
            {showFavButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(symbol.file, symbol.name);
                }}
                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] shadow transition ${
                  isFavorite(symbol.file)
                    ? 'bg-yellow-400 text-white'
                    : 'bg-white text-gray-300 opacity-0 group-hover:opacity-100'
                }`}
                title={isFavorite(symbol.file) ? 'Ta bort favorit' : 'Lägg till favorit'}
              >
                ★
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold">Välj symbol</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5">
          {activityTitle && (
            <button
              onClick={() => setTab('suggestions')}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === 'suggestions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💡 Förslag
            </button>
          )}
          <button
            onClick={() => setTab('favorites')}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === 'favorites'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ★ Favoriter
          </button>
          <button
            onClick={() => setTab('browse')}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === 'browse'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🔍 Sök & bläddra
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {/* === Suggestions Tab === */}
          {tab === 'suggestions' && (
            <div className="p-4">
              {suggestionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <p className="mb-3 text-xs text-gray-400">
                    Föreslagna symboler för &ldquo;{activityTitle}&rdquo;
                  </p>
                  {renderSymbolGrid(suggestions)}
                  <p className="mt-4 text-center text-xs text-gray-400">
                    Hittar du inte rätt?{' '}
                    <button
                      onClick={() => setTab('browse')}
                      className="text-indigo-500 hover:underline"
                    >
                      Sök bland alla symboler
                    </button>
                  </p>
                </>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-sm">Inga förslag för &ldquo;{activityTitle}&rdquo;</p>
                  <button
                    onClick={() => setTab('browse')}
                    className="mt-2 text-sm text-indigo-500 hover:underline"
                  >
                    Sök bland alla symboler
                  </button>
                </div>
              )}
            </div>
          )}

          {/* === Favorites Tab === */}
          {tab === 'favorites' && (
            <div className="p-4">
              {favoritesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : (
                <>
                  {/* Favorites */}
                  {favorites.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-semibold text-gray-700">★ Favoriter</h3>
                      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                        {favorites.map((file) => (
                          <div key={file} className="group relative">
                            <button
                              onClick={() => onSelect(file, file.replace('.svg', '').replace(/_/g, ' '))}
                              className="flex w-full flex-col items-center rounded-xl border border-yellow-200 bg-yellow-50 p-2 transition hover:border-indigo-300 hover:bg-indigo-50"
                              title={file.replace('.svg', '').replace(/_/g, ' ')}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/symbols/mulberry/${file}`}
                                alt={file}
                                className="h-12 w-12 object-contain"
                                loading="lazy"
                              />
                              <span className="mt-1 line-clamp-1 text-center text-[10px] leading-tight text-gray-500">
                                {file.replace('.svg', '').replace(/_/g, ' ')}
                              </span>
                            </button>
                            <button
                              onClick={() => toggleFavorite(file, file.replace('.svg', '').replace(/_/g, ' '))}
                              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] text-white shadow"
                              title="Ta bort favorit"
                            >
                              ★
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Frequently used */}
                  {frequent.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-gray-700">📊 Ofta använda</h3>
                      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                        {frequent.map((s) => (
                          <div key={s.file} className="group relative">
                            <button
                              onClick={() => onSelect(s.file, s.name)}
                              className="flex w-full flex-col items-center rounded-xl border border-gray-200 p-2 transition hover:border-indigo-300 hover:bg-indigo-50"
                              title={`${s.name} (använd ${s.count} gånger)`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/symbols/mulberry/${s.file}`}
                                alt={s.name}
                                className="h-12 w-12 object-contain"
                                loading="lazy"
                              />
                              <span className="mt-1 line-clamp-1 text-center text-[10px] leading-tight text-gray-500">
                                {s.name}
                              </span>
                              <span className="text-[8px] text-gray-300">{s.count}×</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(s.file, s.name);
                              }}
                              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] shadow transition ${
                                isFavorite(s.file)
                                  ? 'bg-yellow-400 text-white'
                                  : 'bg-white text-gray-300 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              ★
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {favorites.length === 0 && frequent.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      <p className="text-2xl">★</p>
                      <p className="mt-2 text-sm">Inga favoriter ännu</p>
                      <p className="mt-1 text-xs">
                        Klicka på ★ på valfri symbol för att lägga till som favorit
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* === Browse Tab === */}
          {tab === 'browse' && (
            <div className="flex h-full flex-col">
              {/* Search */}
              <div className="border-b px-5 py-3">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setCategory(null); }}
                  placeholder="Sök symboler... (t.ex. breakfast, happy, school)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category groups or flat categories */}
              {!query && (
                <div className="border-b px-5 py-2">
                  <div className="flex gap-2 overflow-x-auto">
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
                    {Object.entries(categoryGroups).map(([groupName, groupCats]) => {
                      const availableCats = groupCats.filter((c) =>
                        categories.some((cat) => cat.name === c),
                      );
                      if (availableCats.length === 0) return null;
                      const isActive = category && groupCats.includes(category);
                      return (
                        <div key={groupName} className="relative shrink-0">
                          <button
                            onClick={() => {
                              // Cycle through subcategories or show first
                              if (!isActive) {
                                setCategory(availableCats[0]);
                              } else {
                                const idx = availableCats.indexOf(category!);
                                const next = availableCats[(idx + 1) % availableCats.length];
                                setCategory(next);
                              }
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              isActive
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {groupName}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Subcategory pills when a group is active */}
                  {category && (
                    <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
                      {Object.entries(categoryGroups).map(([, groupCats]) => {
                        if (!groupCats.includes(category)) return null;
                        return groupCats
                          .filter((c) => categories.some((cat) => cat.name === c))
                          .map((c) => (
                            <button
                              key={c}
                              onClick={() => setCategory(c)}
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium transition ${
                                category === c
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                              }`}
                            >
                              {categoryLabels[c] || c}
                            </button>
                          ));
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
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
                      {total} resultat {total > 60 && '(visar de första 60)'}
                      {category && ` i ${categoryLabels[category] || category}`}
                    </p>
                    {renderSymbolGrid(symbols)}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
