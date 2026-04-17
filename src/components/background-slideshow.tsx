'use client';

import { useState, useEffect, useCallback } from 'react';

const IMAGES = [
  '/images/bg1.jpg',
  '/images/bg2.jpg',
  '/images/bg3.jpg',
  '/images/bg4.jpg',
  '/images/bg5.jpg',
  '/images/bg6.jpg',
  '/images/bg7.jpg',
  '/images/bg8.jpg',
  '/images/bg9.jpg',
  '/images/bg10.jpg',
];

const INTERVAL = 30_000; // 30 seconds per image
const FADE_DURATION = 2_000; // 2s crossfade

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [fading, setFading] = useState(false);

  const advance = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
      setNextIndex((prev) => (prev + 1) % IMAGES.length);
      setFading(false);
    }, FADE_DURATION);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, INTERVAL);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: `url(${IMAGES[currentIndex]})`,
          opacity: fading ? 0 : 1,
          transitionDuration: `${FADE_DURATION}ms`,
          filter: 'blur(4px)',
          transform: 'scale(1.05)', // prevent blur edge artifacts
        }}
      />
      {/* Next image (fades in underneath) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${IMAGES[nextIndex]})`,
          filter: 'blur(4px)',
          transform: 'scale(1.05)',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
