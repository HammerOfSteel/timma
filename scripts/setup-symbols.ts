/**
 * Download Mulberry Symbols from GitHub releases and build a JSON index.
 * Run with: npx tsx scripts/setup-symbols.ts
 *
 * Downloads SVGs to public/symbols/mulberry/ and creates
 * public/symbols/mulberry-index.json from symbol-info.csv.
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { createUnzip } from 'zlib';
import { parse } from 'path';
import { execSync } from 'child_process';

const RELEASE_TAG = 'v3.5.2';
const BASE_URL = `https://github.com/mulberrysymbols/mulberry-symbols/releases/download/${RELEASE_TAG}`;
const SVG_ZIP_URL = `${BASE_URL}/mulberry-symbols.zip`;
const CSV_URL = `${BASE_URL}/symbol-info.csv`;

const SYMBOLS_DIR = 'public/symbols/mulberry';
const INDEX_PATH = 'public/symbols/mulberry-index.json';

interface SymbolEntry {
  id: string;
  name: string;
  file: string;
  category: string;
  tags: string[];
}

async function downloadFile(url: string, dest: string) {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const fileStream = createWriteStream(dest);
  await pipeline(Readable.fromWeb(res.body as any), fileStream);
  console.log(`  → Saved to ${dest}`);
}

function parseCSV(csvText: string): SymbolEntry[] {
  const lines = csvText.split('\n').filter((l) => l.trim());
  // Header: symbol_id,symbol_sequence,symbol_category_id,symbol_pos,
  //         symbol_rating,symbol_tags,symbol_filename_en,symbol_category_en,
  //         symbol_name_fr,symbol_category_fr
  const entries: SymbolEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 8) continue;

    const id = cols[0];
    const tags = cols[5].split(/\s+/).filter((t) => t.trim());
    const filename = cols[6].trim();
    const category = cols[7].trim();

    if (!filename) continue;

    entries.push({
      id,
      name: filename.replace(/_/g, ' ').replace(/\s*,\s*/g, ', '),
      file: `${filename}.svg`,
      category,
      tags,
    });
  }

  return entries;
}

/** Simple CSV line parser that handles quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  // Create directories
  mkdirSync(SYMBOLS_DIR, { recursive: true });
  mkdirSync('tmp', { recursive: true });

  // Download CSV
  const csvDest = 'tmp/symbol-info.csv';
  if (!existsSync(csvDest)) {
    await downloadFile(CSV_URL, csvDest);
  } else {
    console.log('CSV already downloaded, skipping.');
  }

  // Download and extract SVGs
  const zipDest = 'tmp/mulberry-symbols.zip';
  if (!existsSync(zipDest)) {
    await downloadFile(SVG_ZIP_URL, zipDest);
  } else {
    console.log('ZIP already downloaded, skipping.');
  }

  // Extract if directory is empty/missing
  const testFile = `${SYMBOLS_DIR}/hello.svg`;
  if (!existsSync(testFile)) {
    console.log('Extracting SVGs...');
    // The zip contains an EN-symbols/ directory with all SVGs
    execSync(`unzip -o -j "${zipDest}" "EN-symbols/*.svg" -d "${SYMBOLS_DIR}"`, {
      stdio: 'inherit',
    });
    console.log('  → Extracted SVGs');
  } else {
    console.log('SVGs already extracted, skipping.');
  }

  // Parse CSV and build index
  console.log('Building symbol index...');
  const csvText = readFileSync(csvDest, 'utf-8');
  const entries = parseCSV(csvText);

  // Group by category for the picker
  const categories = new Map<string, SymbolEntry[]>();
  for (const entry of entries) {
    // Verify the SVG file exists
    if (!existsSync(`${SYMBOLS_DIR}/${entry.file}`)) continue;

    const cat = entry.category || 'Övrigt';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(entry);
  }

  const index = {
    version: RELEASE_TAG,
    totalSymbols: entries.length,
    categories: Object.fromEntries(
      [...categories.entries()].sort(([a], [b]) => a.localeCompare(b, 'sv')),
    ),
  };

  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`  → Built index with ${entries.length} symbols in ${categories.size} categories`);
  console.log(`  → Saved to ${INDEX_PATH}`);

  console.log('\nDone! Mulberry Symbols are ready.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
