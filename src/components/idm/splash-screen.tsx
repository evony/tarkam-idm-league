'use client';

import { useEffect, useState, useRef } from 'react';

const SPLASH_AUDIO_URL = 'https://res.cloudinary.com/dagoryri5/video/upload/v1776781508/tangtangtang_opfd7y.mp3';

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play opening audio — start slightly after mount for browser autoplay policy
    const audio = new Audio(SPLASH_AUDIO_URL);
    audio.volume = 0.7;
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked by browser — try again on first user interaction
        const resume = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', resume);
          document.removeEventListener('touchstart', resume);
        };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
      });
    }

    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    // Fade out audio before splash ends
    const tFade = setTimeout(() => {
      if (audioRef.current) {
        const fadeAudio = audioRef.current;
        const fadeInterval = setInterval(() => {
          if (fadeAudio.volume > 0.05) {
            fadeAudio.volume = Math.max(0, fadeAudio.volume - 0.08);
          } else {
            fadeAudio.pause();
            fadeAudio.currentTime = 0;
            clearInterval(fadeInterval);
          }
        }, 50);
      }
    }, 3200);
    const t3 = setTimeout(() => onFinish(), 3900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tFade);
      clearTimeout(t3);
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [onFinish]);

  return (
    <div
      className="animate-fade-enter-sm fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    >
          {/* Gradient Background — warm obsidian matching app background #0c0a06 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a06] via-[#120e08] to-[#0c0a06]" />

          {/* Vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'
          }} />

          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(229,190,74,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Main Logo */}
            <div
              className="animate-fade-enter mb-8"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative">
                {/* Outer glow ring */}
                <div
                  className="absolute -inset-4 rounded-3xl animate-pulse"
                  style={{
                    boxShadow: '0 0 40px rgba(184,134,11,0.4), 0 0 80px rgba(245,158,11,0.15)',
                  }}
                />
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
                  <img src="/logo.webp" alt="IDM League" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div
              className="animate-fade-enter text-center"
              style={{ animationDelay: '0.9s' }}
            >
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
                <span className="text-gradient-fury">IDM</span>{' '}
                <span className="text-white">League</span>
              </h1>
              <p
                className="animate-fade-enter-sm text-xs sm:text-sm text-white/50 mt-2 tracking-widest uppercase font-light"
                style={{ animationDelay: '1.2s' }}
              >
                Idol Meta · Fan Made Edition
              </p>
            </div>

            {/* Loading bar */}
            <div
              className="animate-fade-enter-sm mt-8 w-48 sm:w-64"
              style={{ animationDelay: '1.4s' }}
            >
              <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
                  style={{ animation: 'progress-fill 2.2s ease-in-out 1.4s both' }}
                />
              </div>
              <p
                className="animate-fade-enter-sm text-[10px] text-white/40 text-center mt-2 tracking-wider"
                style={{ animationDelay: '1.6s' }}
              >
                MEMASUKI ARENA
              </p>
            </div>
          </div>

          {/* BORNEO Pride Footer */}
          <div
            className="animate-fade-enter absolute bottom-0 inset-x-0"
            style={{ animationDelay: '2s' }}
          >
            {/* Gold top border line */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <div className="py-4 flex flex-col items-center gap-1.5">
              <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                BORNEO Pride
              </span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
                <div className="w-1.5 h-1.5 rotate-45 bg-amber-500/70" />
                <div className="w-4 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
              </div>
              <span className="text-[8px] text-amber-500/30 tracking-widest uppercase">Idol Meta · Fan Made Edition</span>
            </div>
          </div>
    </div>
  );
}
