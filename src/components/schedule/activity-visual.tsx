'use client';

/**
 * Renders the visual (symbol SVG or custom image) for an activity card.
 * Falls back to nothing if no visual is set.
 */
export function ActivityVisual({
  symbol,
  imageUrl,
  size = 'md',
}: {
  symbol: { name: string; imageUrl: string } | null;
  imageUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const src = symbol?.imageUrl || imageUrl;
  if (!src) return null;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={symbol?.name || 'Aktivitetsbild'}
      className={`${sizeClasses[size]} shrink-0 rounded object-contain`}
      loading="lazy"
    />
  );
}
