import { NextRequest, NextResponse } from 'next/server';
import {
  getFavoriteSymbols,
  getFrequentSymbols,
  addFavoriteSymbol,
  removeFavoriteSymbol,
} from '@/app/actions/symbols';

export async function GET() {
  const [favorites, frequent] = await Promise.all([
    getFavoriteSymbols(),
    getFrequentSymbols(),
  ]);

  return NextResponse.json({ favorites, frequent });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { file, name, action } = body;

  if (!file || !action) {
    return NextResponse.json({ error: 'Missing file or action' }, { status: 400 });
  }

  if (action === 'add') {
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    await addFavoriteSymbol(file, name);
  } else if (action === 'remove') {
    await removeFavoriteSymbol(file);
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
