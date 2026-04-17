/**
 * Generate PWA icons from an SVG template.
 * Run with: npx tsx scripts/generate-icons.ts
 */

import { writeFileSync, mkdirSync } from 'fs';

const ICONS_DIR = 'public/icons';
mkdirSync(ICONS_DIR, { recursive: true });

// Timma logo SVG — a simple clock/calendar icon with "T"
function generateSvg(size: number, padding: number = 0): string {
  const s = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = s * 0.4;
  const bgR = s * 0.45;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#6366f1"/>
  <circle cx="${cx}" cy="${cy}" r="${bgR}" fill="white" opacity="0.2"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-width="${s * 0.04}"/>
  <!-- Hour hand -->
  <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.55}" stroke="white" stroke-width="${s * 0.045}" stroke-linecap="round"/>
  <!-- Minute hand -->
  <line x1="${cx}" y1="${cy}" x2="${cx + r * 0.4}" y2="${cy - r * 0.3}" stroke="white" stroke-width="${s * 0.03}" stroke-linecap="round"/>
  <!-- Center dot -->
  <circle cx="${cx}" cy="${cy}" r="${s * 0.03}" fill="white"/>
  <!-- Hour markers -->
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    .map((h) => {
      const angle = (h * 30 - 90) * (Math.PI / 180);
      const x1 = cx + Math.cos(angle) * (r * 0.85);
      const y1 = cy + Math.sin(angle) * (r * 0.85);
      const x2 = cx + Math.cos(angle) * (r * 0.95);
      const y2 = cy + Math.sin(angle) * (r * 0.95);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="white" stroke-width="${s * 0.02}" stroke-linecap="round"/>`;
    })
    .join('\n  ')}
</svg>`;
}

// Generate SVG icons at required sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const svg = generateSvg(size);
  writeFileSync(`${ICONS_DIR}/icon-${size}x${size}.svg`, svg);
  console.log(`Generated icon-${size}x${size}.svg`);
}

// Generate a maskable version (more padding for safe area)
const maskableSvg = generateSvg(512, 60);
writeFileSync(`${ICONS_DIR}/icon-maskable-512x512.svg`, maskableSvg);
console.log('Generated icon-maskable-512x512.svg');

// Apple touch icon
const appleSvg = generateSvg(180);
writeFileSync(`${ICONS_DIR}/apple-touch-icon.svg`, appleSvg);
console.log('Generated apple-touch-icon.svg');

// Favicon
const faviconSvg = generateSvg(32);
writeFileSync(`${ICONS_DIR}/favicon.svg`, faviconSvg);
console.log('Generated favicon.svg');

console.log('\nDone! Icons generated as SVGs.');
console.log(
  'For PNG conversion, use: npx sharp-cli --input public/icons/icon-512x512.svg --output public/icons/icon-512x512.png resize 512 512',
);
