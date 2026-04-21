'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const SPLASH_AUDIO_URL = 'https://res.cloudinary.com/dagoryri5/video/upload/v1776781508/tangtangtang_opfd7y.mp3';

/* Audio duration from Cloudinary: ~4.3s. We use 4.1s so the audio finishes fully. */
const SPLASH_ENTER_DURATION = 4100;

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [entered, setEntered] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Audio-reactive beat detection loop
  useEffect(() => {
    if (!entered || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let prevBass = 0;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      // Focus on bass frequencies for beat detection
      let bassSum = 0;
      const bassBins = Math.min(12, bufferLength);
      for (let i = 0; i < bassBins; i++) {
        bassSum += dataArray[i];
      }
      const bassAvg = bassSum / bassBins;

      // Beat = sudden energy spike above threshold
      const isBeat = bassAvg > 60 && bassAvg > prevBass * 1.4;

      if (isBeat) {
        // Snap to high intensity on beat
        setBeatIntensity(Math.min(1, bassAvg / 180));
      } else {
        // Decay smoothly
        setBeatIntensity(prev => Math.max(0, prev * 0.82));
      }

      prevBass = bassAvg * 0.6 + prevBass * 0.4;

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [entered]);

  const handleEnter = useCallback(() => {
    if (entered) return;
    setEntered(true);

    // Create AudioContext on user gesture (required by browsers)
    let analyserNode: AnalyserNode | null = null;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;

      // Resume if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      analyserNode = analyser;
      analyserRef.current = analyser;
    } catch {
      // Web Audio API not available — beat detection disabled
    }

    // Play opening audio
    const audio = new Audio();
    // CRITICAL: Set crossOrigin BEFORE setting src for CORS access
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.7;
    audioRef.current = audio;

    // Connect to Web Audio API if available
    if (analyserNode && ctxRef.current) {
      try {
        const source = ctxRef.current.createMediaElementSource(audio);
        source.connect(analyserNode);
        analyserNode.connect(ctxRef.current.destination);
      } catch {
        // Connection failed — audio plays normally without beat detection
        analyserRef.current = null;
      }
    }

    audio.src = SPLASH_AUDIO_URL;
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
        if (ctxRef.current) {
          ctxRef.current.close().catch(() => {});
          ctxRef.current = null;
        }
        onFinish();
      }, SPLASH_ENTER_DURATION)
    );
  }, [entered, onFinish]);

  // Derived visual values from beat intensity
  const logoScale = 1 + beatIntensity * 0.14;
  const glowSize = 20 + beatIntensity * 50;
  const glowOpacity = 0.12 + beatIntensity * 0.5;
  const borderOpacity = 0.08 + beatIntensity * 0.45;
  const textGlow = beatIntensity * 18;
  const dotSize = 4 + beatIntensity * 10;

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

      {/* Audio-reactive background pulse — subtle radial flash on beats */}
      {entered && beatIntensity > 0.05 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, rgba(229,190,74,${beatIntensity * 0.12}) 0%, transparent 55%)`,
          }}
        />
      )}

      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(229,190,74,0.04) 0%, transparent 50%)',
        }}
      />

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Main Logo — with cinematic reveal + audio-reactive pulse */}
        <div className="mb-8" style={{ animation: 'splash-logo-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}>
          <div
            className="relative"
            style={{
              transform: entered ? `scale(${logoScale})` : undefined,
              transition: 'transform 80ms ease-out',
            }}
          >
            {/* Audio-reactive glow ring */}
            <div
              className="absolute -inset-4 rounded-2xl"
              style={{
                boxShadow: `0 0 ${glowSize}px rgba(184,134,11,${glowOpacity}), 0 0 ${glowSize * 1.5}px rgba(245,158,11,${glowOpacity * 0.4})`,
                transition: 'box-shadow 80ms ease-out',
              }}
            />
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
              <img src="/logo.webp" alt="IDM League" className="w-full h-full object-cover" />
            </div>
            {/* Audio-reactive border ring */}
            <div
              className="absolute -inset-1.5 rounded-2xl"
              style={{
                border: `1.5px solid rgba(212,168,83,${borderOpacity})`,
                animation: 'splash-border-rotate 6s linear infinite',
                transition: 'border-color 80ms ease-out',
              }}
            />
          </div>
        </div>

        {/* Title — with audio-reactive glow on beats */}
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
            style={{
              animation: 'splash-subtitle-enter 0.6s ease-out 1.4s both',
              textShadow: entered && beatIntensity > 0.1 ? `0 0 ${textGlow}px rgba(229,190,74,${beatIntensity * 0.5})` : undefined,
              transition: 'text-shadow 80ms ease-out',
            }}
          >
            Idol Meta · Fan Made Edition
          </p>
        </div>

        {/* Decorative line divider — pulses with audio */}
        <div
          className="mt-6 flex items-center gap-3"
          style={{ animation: 'splash-subtitle-enter 0.6s ease-out 1.5s both' }}
        >
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-idm-gold-warm/30" />
          <div
            className="rounded-full bg-idm-gold-warm/40"
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              transition: 'all 80ms ease-out',
            }}
          />
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
            <p
              className="text-[10px] text-center mt-2 tracking-wider"
              style={{
                animation: 'splash-subtitle-enter 0.3s ease-out 0.2s both',
                color: `rgba(255,255,255,${0.3 + beatIntensity * 0.4})`,
                textShadow: beatIntensity > 0.1 ? `0 0 ${beatIntensity * 14}px rgba(229,190,74,${beatIntensity * 0.4})` : undefined,
                transition: 'color 80ms ease-out, text-shadow 80ms ease-out',
              }}
            >
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
            <div className="w-4 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
          <span className="text-[8px] text-amber-500/20 tracking-widest uppercase">Idol Meta · Fan Made Edition</span>
        </div>
      </div>
    </div>
  );
}
