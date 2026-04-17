import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

interface SymbolEntry {
  id: string;
  name: string;
  file: string;
  category: string;
  tags: string[];
}

interface SymbolIndex {
  version: string;
  totalSymbols: number;
  categories: Record<string, SymbolEntry[]>;
}

let cachedIndex: SymbolIndex | null = null;
let flatSymbols: SymbolEntry[] | null = null;

function loadIndex(): SymbolIndex | null {
  if (cachedIndex) return cachedIndex;

  const indexPath = path.join(process.cwd(), 'public', 'symbols', 'mulberry-index.json');
  if (!existsSync(indexPath)) return null;

  cachedIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
  flatSymbols = Object.values(cachedIndex!.categories).flat();
  return cachedIndex;
}

// Swedish keyword → English symbol search terms mapping for smart suggestions
const KEYWORD_MAP: Record<string, string[]> = {
  // Food & meals
  frukost: ['breakfast', 'cereal', 'toast', 'porridge', 'egg'],
  lunch: ['lunch', 'sandwich', 'soup', 'meal'],
  middag: ['dinner', 'meal', 'eat', 'food'],
  mellanmål: ['snack', 'fruit', 'biscuit', 'drink'],
  mat: ['food', 'eat', 'meal', 'dinner', 'lunch', 'breakfast'],
  äta: ['eat', 'food', 'meal', 'breakfast', 'lunch', 'dinner'],
  dricka: ['drink', 'water', 'juice', 'milk', 'cup'],
  vatten: ['water', 'drink', 'glass'],
  // School & learning
  skola: ['school', 'classroom', 'learn', 'teacher', 'book'],
  läsa: ['read', 'book', 'library', 'story'],
  skriva: ['write', 'pen', 'pencil', 'paper'],
  matte: ['maths', 'number', 'count', 'calculator'],
  matematik: ['maths', 'number', 'count', 'calculator'],
  engelska: ['english', 'language', 'book'],
  lektion: ['lesson', 'class', 'school', 'learn'],
  läxa: ['homework', 'book', 'write', 'read'],
  // Activities & play
  leka: ['play', 'toy', 'game', 'fun'],
  spela: ['play', 'game', 'music', 'instrument'],
  rita: ['draw', 'paint', 'art', 'colour', 'crayon'],
  måla: ['paint', 'art', 'brush', 'colour'],
  bygga: ['build', 'block', 'construct', 'lego'],
  musik: ['music', 'instrument', 'sing', 'drum', 'piano'],
  sjunga: ['sing', 'music', 'song'],
  dansa: ['dance', 'music', 'move'],
  träna: ['exercise', 'sport', 'gym', 'run'],
  simma: ['swim', 'pool', 'water'],
  cykla: ['cycle', 'bike', 'bicycle'],
  // Daily routines
  sova: ['sleep', 'bed', 'night', 'pillow'],
  vakna: ['wake', 'morning', 'alarm', 'clock'],
  klä: ['dress', 'clothes', 'wear', 'shirt'],
  kläder: ['clothes', 'dress', 'shirt', 'trousers', 'shoes'],
  tvätta: ['wash', 'bath', 'shower', 'clean', 'soap'],
  duscha: ['shower', 'wash', 'bath', 'clean'],
  borsta: ['brush', 'tooth', 'teeth', 'hair'],
  tandborste: ['toothbrush', 'teeth', 'brush'],
  tänder: ['teeth', 'tooth', 'brush', 'dental'],
  toalett: ['toilet', 'bathroom', 'wc'],
  bajsa: ['toilet', 'bathroom'],
  kissa: ['toilet', 'bathroom'],
  // Transport
  buss: ['bus', 'transport', 'travel'],
  bil: ['car', 'drive', 'transport'],
  tåg: ['train', 'railway', 'transport'],
  åka: ['travel', 'go', 'car', 'bus', 'transport'],
  gå: ['walk', 'go', 'step', 'foot'],
  // Emotions & social
  glad: ['happy', 'smile', 'joy', 'pleased'],
  ledsen: ['sad', 'cry', 'unhappy', 'upset'],
  arg: ['angry', 'cross', 'mad'],
  rädd: ['scared', 'afraid', 'fear', 'frightened'],
  trött: ['tired', 'sleep', 'yawn', 'rest'],
  lugn: ['calm', 'quiet', 'relax', 'peaceful'],
  kram: ['hug', 'cuddle', 'love'],
  vän: ['friend', 'together', 'people'],
  // Time
  morgon: ['morning', 'sunrise', 'wake'],
  kväll: ['evening', 'night', 'sunset'],
  natt: ['night', 'dark', 'sleep', 'moon'],
  idag: ['today', 'day', 'calendar'],
  imorgon: ['tomorrow', 'calendar', 'day'],
  // Places
  hemma: ['home', 'house', 'door'],
  ute: ['outside', 'garden', 'park', 'nature'],
  park: ['park', 'playground', 'swing', 'slide'],
  affär: ['shop', 'store', 'buy', 'money'],
  bibliotek: ['library', 'book', 'read'],
  // Weather
  sol: ['sun', 'sunny', 'weather'],
  regn: ['rain', 'weather', 'cloud', 'umbrella'],
  snö: ['snow', 'winter', 'cold'],
  // Misc
  titta: ['look', 'see', 'watch', 'eye'],
  tv: ['television', 'tv', 'watch', 'screen'],
  dator: ['computer', 'laptop', 'screen', 'tablet'],
  telefon: ['phone', 'telephone', 'call', 'mobile'],
  ipad: ['tablet', 'computer', 'screen'],
  hund: ['dog', 'pet', 'animal'],
  katt: ['cat', 'pet', 'animal', 'kitten'],
  födelsedagsfest: ['birthday', 'party', 'cake', 'balloon'],
  fest: ['party', 'balloon', 'celebrate', 'cake'],
  present: ['present', 'gift', 'birthday'],
  jul: ['christmas', 'santa', 'tree'],
  hjälp: ['help', 'hand', 'please'],
  ja: ['yes', 'tick', 'correct', 'thumbs'],
  nej: ['no', 'cross', 'wrong', 'stop'],
  stopp: ['stop', 'no', 'hand', 'halt'],
  vänta: ['wait', 'clock', 'time', 'patience'],
  mer: ['more', 'add', 'plus', 'again'],
  färdig: ['finish', 'done', 'complete', 'tick'],
  bra: ['good', 'well', 'thumbs', 'happy'],
};

function suggestSymbols(text: string): SymbolEntry[] {
  if (!flatSymbols) return [];
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const searchTerms = new Set<string>();

  for (const word of words) {
    // Direct keyword match
    if (KEYWORD_MAP[word]) {
      KEYWORD_MAP[word].forEach((t) => searchTerms.add(t));
    }
    // Partial keyword match (e.g. "frukost" from "frukostmat")
    for (const [key, terms] of Object.entries(KEYWORD_MAP)) {
      if (word.includes(key) || key.includes(word)) {
        terms.forEach((t) => searchTerms.add(t));
      }
    }
    // Also search the raw word (might match English symbol names)
    searchTerms.add(word);
  }

  if (searchTerms.size === 0) return [];

  // Score each symbol by how many search terms it matches
  const scored = flatSymbols.map((s) => {
    let score = 0;
    const nameLower = s.name.toLowerCase();
    const tagsLower = s.tags.map((t) => t.toLowerCase());
    for (const term of searchTerms) {
      if (nameLower === term) score += 10;
      else if (nameLower.includes(term)) score += 5;
      if (tagsLower.some((t) => t === term)) score += 8;
      else if (tagsLower.some((t) => t.includes(term))) score += 3;
    }
    return { symbol: s, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.symbol);
}

export async function GET(request: NextRequest) {
  const index = loadIndex();
  if (!index) {
    return NextResponse.json(
      { error: 'Symbol index not found. Run: npx tsx scripts/setup-symbols.ts' },
      { status: 404 },
    );
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.toLowerCase().trim();
  const category = searchParams.get('category');
  const suggest = searchParams.get('suggest')?.trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

  // Smart suggestions based on activity title
  if (suggest) {
    const suggestions = suggestSymbols(suggest);
    return NextResponse.json({ symbols: suggestions, total: suggestions.length });
  }

  // Return categories list
  if (searchParams.has('categories')) {
    const cats = Object.entries(index.categories).map(([name, symbols]) => ({
      name,
      count: symbols.length,
    }));
    return NextResponse.json({ categories: cats });
  }

  let results: SymbolEntry[] = [];

  if (category && index.categories[category]) {
    results = index.categories[category];
  } else if (!category) {
    results = flatSymbols || Object.values(index.categories).flat();
  }

  // Filter by search query
  if (query) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.tags.some((t) => t.toLowerCase().includes(query)) ||
        s.category.toLowerCase().includes(query),
    );
  }

  // Paginate
  const offset = parseInt(searchParams.get('offset') || '0');
  const total = results.length;
  results = results.slice(offset, offset + limit);

  return NextResponse.json({
    symbols: results,
    total,
    offset,
    limit,
  });
}
