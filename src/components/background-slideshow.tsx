'use client';

import { useState, useEffect, useRef } from 'react';

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
const FADE_DURATION = 2000; // 2s crossfade

export function BackgroundSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % IMAGES.length);
    }, INTERVAL);
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, []);

  // Preload next image
  useEffect(() => {
    const next = (activeIndex + 1) % IMAGES.length;
    const img = new Image();
    img.src = IMAGES[next];
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Stack all images, only the active one is visible */}
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === activeIndex ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
            filter: 'blur(6px)',
            transform: 'scale(1.08)',
          }}
        />
      ))}
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
