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

function loadIndex(): SymbolIndex | null {
  if (cachedIndex) return cachedIndex;

  const indexPath = path.join(process.cwd(), 'public', 'symbols', 'mulberry-index.json');
  if (!existsSync(indexPath)) return null;

  cachedIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
  return cachedIndex;
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
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

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
    // Flatten all categories
    results = Object.values(index.categories).flat();
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
