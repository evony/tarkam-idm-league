'use client';

import { useState, useRef, useCallback } from 'react';

const SPLASH_AUDIO_URL = 'https://res.cloudinary.com/dagoryri5/video/upload/v1776781508/tangtangtang_opfd7y.mp3';

/* Audio duration from Cloudinary: ~4.3s. We use 4.1s so the audio finishes fully. */
const SPLASH_ENTER_DURATION = 4100;

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [entered, setEntered] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleEnter = useCallback(() => {
    if (entered) return;
    setEntered(true);

    // Play opening audio on user click — guaranteed to work (browser autoplay policy)
    const audio = new Audio(SPLASH_AUDIO_URL);
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch(() => {});

    // Start visual fade-out slightly before audio ends
    timersRef.current.push(
      setTimeout(() => setFadeOut(true), SPLASH_ENTER_DURATION - 300)
    );

    // Finish splash after audio completes
    timersRef.current.push(
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        onFinish();
      }, SPLASH_ENTER_DURATION)
    );
  }, [entered, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Gradient Background — deep obsidian */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a06] via-[#120e08] to-[#0c0a06]" />

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'
      }} />

      {/* Subtle ambient glow — reduced intensity */}
      <div
        className="absolute inset-0 pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(229,190,74,0.04) 0%, transparent 50%)',
        }}
      />

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Main Logo — with cinematic reveal animation */}
        <div className="mb-8" style={{ animation: 'splash-logo-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}>
          <div className="relative">
            {/* Subtle glow ring — reduced */}
            <div
              className="absolute -inset-3 rounded-2xl"
              style={{
                boxShadow: '0 0 20px rgba(184,134,11,0.2), 0 0 40px rgba(245,158,11,0.08)',
                animation: 'splash-glow-breathe 2.5s ease-in-out infinite',
              }}
            />
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50"
              style={{ animation: 'splash-logo-float 3s ease-in-out infinite' }}
            >
              <img src="/logo.webp" alt="IDM League" className="w-full h-full object-cover" />
            </div>
            {/* Rotating border accent */}
            <div
              className="absolute -inset-1 rounded-2xl border border-idm-gold-warm/0"
              style={{ animation: 'splash-border-rotate 6s linear infinite' }}
            />
          </div>
        </div>

        {/* Title — letter-by-letter feel with scale bounce */}
        <div
          className="text-center"
          style={{ animation: 'splash-title-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both' }}
        >
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            <span
              className="text-gradient-fury inline-block"
              style={{ animation: 'splash-letter-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1s both' }}
            >
              IDM
            </span>
            <span className="text-white inline-block ml-2">{' '}</span>
            <span
              className="text-white inline-block"
              style={{ animation: 'splash-letter-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1.15s both' }}
            >
              League
            </span>
          </h1>
          <p
            className="text-xs sm:text-sm text-white/40 mt-2 tracking-[0.25em] uppercase font-light"
            style={{ animation: 'splash-subtitle-enter 0.6s ease-out 1.4s both' }}
          >
            Idol Meta · Fan Made Edition
          </p>
        </div>

        {/* Decorative line divider */}
        <div
          className="mt-6 flex items-center gap-3"
          style={{ animation: 'splash-subtitle-enter 0.6s ease-out 1.5s both' }}
        >
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-idm-gold-warm/30" />
          <div className="w-1 h-1 rounded-full bg-idm-gold-warm/40" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-idm-gold-warm/30" />
        </div>

        {/* ═══ Phase 1: Tap to Enter button ═══ */}
        {!entered && (
          <div style={{ animation: 'splash-subtitle-enter 0.6s ease-out 1.8s both' }}>
            <button
              onClick={handleEnter}
              className="group relative cursor-pointer focus:outline-none mt-8"
              aria-label="Enter IDM League"
            >
              {/* Pulsing ring — subtle */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-10 bg-idm-gold-warm" />
              <div className="relative flex items-center gap-2.5 px-7 py-3 rounded-full border border-idm-gold-warm/40 bg-idm-gold-warm/5 backdrop-blur-sm transition-all duration-300 group-hover:border-idm-gold-warm/70 group-hover:bg-idm-gold-warm/15 group-hover:scale-105 group-active:scale-95">
                <span className="text-lg">🎧</span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-idm-gold-warm/80 group-hover:text-idm-gold-warm transition-colors">
                  Tap to Enter
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ═══ Phase 2: Loading bar (after tap) ═══ */}
        {entered && (
          <div className="mt-8 w-48 sm:w-64" style={{ animation: 'splash-subtitle-enter 0.4s ease-out both' }}>
            <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
                style={{ animation: `progress-fill ${SPLASH_ENTER_DURATION - 500}ms ease-in-out both` }}
              />
            </div>
            <p className="text-[10px] text-white/30 text-center mt-2 tracking-wider" style={{ animation: 'splash-subtitle-enter 0.3s ease-out 0.2s both' }}>
              MEMASUKI ARENA
            </p>
          </div>
        )}
      </div>

      {/* BORNEO Pride Footer */}
      <div
        className="absolute bottom-0 inset-x-0"
        style={{ animation: 'splash-subtitle-enter 0.6s ease-out 2.2s both' }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="py-4 flex flex-col items-center gap-1.5">
          <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold bg-gradient-to-r from-amber-400/80 via-yellow-200/80 to-amber-400/80 bg-clip-text text-transparent">
            BORNEO Pride
          </span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
            <div className="w-1 h-1.5 rotate-45 bg-amber-500/50" />
            <div className="w-4 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
          <span className="text-[8px] text-amber-500/20 tracking-widest uppercase">Idol Meta · Fan Made Edition</span>
        </div>
      </div>
    </div>
  );
}
