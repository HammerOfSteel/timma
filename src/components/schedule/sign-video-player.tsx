'use client';

import { useState } from 'react';

interface SignVideoPlayerProps {
  word: string;
  videoUrl: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export function SignVideoPlayer({ word, videoUrl, size = 'md', inline = false }: SignVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-14 w-14',
  };

  if (!playing) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPlaying(true);
        }}
        className={`group relative flex ${sizeClasses[size]} shrink-0 items-center justify-center rounded-full bg-purple-100 transition hover:bg-purple-200`}
        title={`Visa tecken: ${word}`}
      >
        <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}>🤟</span>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 text-white">
          <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>
    );
  }

  // Full player modal
  if (!inline) {
    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
        onClick={() => setPlaying(false)}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold capitalize">Tecken: {word}</h3>
            <button
              onClick={() => setPlaying(false)}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error ? (
            <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100">
              <div className="text-center">
                <span className="text-4xl">🤟</span>
                <p className="mt-2 text-sm font-medium capitalize text-gray-600">{word}</p>
                <p className="mt-1 text-xs text-gray-400">Video ej tillgänglig</p>
              </div>
            </div>
          ) : (
            <video
              src={videoUrl}
              autoPlay
              loop
              playsInline
              controls
              className="w-full rounded-xl bg-black"
              onError={() => setError(true)}
            >
              <track kind="captions" />
            </video>
          )}
          <p className="mt-2 text-center text-xs text-gray-400">
            Tryck utanför för att stänga
          </p>
        </div>
      </div>
    );
  }

  // Inline playback
  return (
    <div className="relative">
      {error ? (
        <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-purple-100`}>
          <span className="text-xs">🤟</span>
        </div>
      ) : (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(false);
          }}
          onError={() => setError(true)}
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
