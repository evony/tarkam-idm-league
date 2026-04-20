'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Swords, Star, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DivisionTheme } from '@/hooks/use-division-theme';

interface SpinPlayer {
  id: string;
  gamertag: string;
  tier: string;
  points: number;
}

interface SpinStep {
  teamIndex: number;
  teamName: string;
  tier: string;
  player: SpinPlayer;
  allPlayersInTier: SpinPlayer[];
}

interface TeamRevealSpinProps {
  spinRevealOrder: SpinStep[];
  teamCount: number;
  dt: DivisionTheme;
  onComplete: () => void;
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Star }> = {
  S: { label: 'TIER S', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: Star },
  A: { label: 'TIER A', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/30', icon: Swords },
  B: { label: 'TIER B', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: Sparkles },
};

export function TeamRevealSpin({ spinRevealOrder, teamCount, dt, onComplete }: TeamRevealSpinProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
  const [spinningNames, setSpinningNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayRef = useRef(false);

  // Build team assignments as we reveal
  const [teamAssignments, setTeamAssignments] = useState<Record<number, SpinPlayer[]>>({});

  // Current step data
  const step = currentStep >= 0 ? spinRevealOrder[currentStep] : null;

  // Spin animation
  const startSpin = useCallback(() => {
    if (!step || isSpinning) return;

    setIsSpinning(true);
    setSelectedName(null);

    const candidates = step.allPlayersInTier;
    const usedPlayerIds = new Set(
      spinRevealOrder.slice(0, currentStep).map(s => s.player.id)
    );
    const availableCandidates = candidates.filter(p => !usedPlayerIds.has(p.id));
    const displayPool = availableCandidates.length > 0 ? availableCandidates : candidates;

    let spinCount = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10); // 20-30 cycles
    let currentSpeed = 50; // Start fast

    const doSpin = () => {
      const randomPlayer = displayPool[Math.floor(Math.random() * displayPool.length)];
      setSpinningNames(prev => [...prev.slice(-3), randomPlayer.gamertag]);
      setSelectedName(randomPlayer.gamertag);
      spinCount++;

      if (spinCount >= totalSpins) {
        // Final selection — land on the actual assigned player
        clearInterval(spinIntervalRef.current!);
        setIsSpinning(false);
        setSelectedName(step.player.gamertag);
        setRevealedSteps(prev => [...prev, currentStep]);
        setTeamAssignments(prev => ({
          ...prev,
          [step.teamIndex]: [...(prev[step.teamIndex] || []), step.player],
        }));
      } else {
        // Slow down as we approach the end
        if (spinCount > totalSpins * 0.6) {
          currentSpeed = Math.min(300, currentSpeed * 1.15);
        }
        spinIntervalRef.current = setTimeout(doSpin, currentSpeed);
      }
    };

    spinIntervalRef.current = setTimeout(doSpin, currentSpeed);
  }, [step, currentStep, isSpinning, spinRevealOrder]);

  // Auto-play next step
  useEffect(() => {
    if (autoPlay && !isSpinning && currentStep >= 0 && revealedSteps.includes(currentStep)) {
      const timer = setTimeout(() => {
        if (currentStep < spinRevealOrder.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setAutoPlay(false);
          autoPlayRef.current = false;
        }
      }, 1500); // 1.5s pause between reveals
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isSpinning, currentStep, revealedSteps, spinRevealOrder.length]);

  // Auto-start spin when step changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < spinRevealOrder.length && !revealedSteps.includes(currentStep)) {
      const timer = setTimeout(() => startSpin(), autoPlayRef.current ? 500 : 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, revealedSteps, startSpin, spinRevealOrder.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  const allRevealed = revealedSteps.length === spinRevealOrder.length;

  // Build team assignments from revealed steps
  const teamMap = spinRevealOrder.reduce<Record<number, SpinPlayer[]>>((acc, s, idx) => {
    if (!acc[s.teamIndex]) acc[s.teamIndex] = [];
    if (!acc[s.teamIndex].find(p => p.id === s.player.id)) {
      acc[s.teamIndex].push(s.player);
    }
    return acc;
  }, {} as Record<number, SpinPlayer[]>);
  const teamEntries = Object.entries(teamMap);

  // Get current round label
  const getCurrentRound = () => {
    if (currentStep < 0) return null;
    const tier = spinRevealOrder[currentStep].tier;
    return TIER_CONFIG[tier];
  };

  const currentRound = getCurrentRound();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h2 className={`text-2xl font-black ${dt.neonText} tracking-tight`}>
            🎰 TEAM GENERATION
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            Pengacakan tim otomatis — Tiap tim 1 Tier S + 1 Tier A + 1 Tier B
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
            <span>{revealedSteps.length} / {spinRevealOrder.length} slot terisi</span>
            <span>{autoPlay ? '⚡ Auto' : 'Manual'}</span>
          </div>
          <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${dt.bg} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${(revealedSteps.length / spinRevealOrder.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main spin area */}
        {currentStep >= 0 && !allRevealed && step && currentRound ? (
          <motion.div
            key={currentStep}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative rounded-2xl border ${currentRound.bg} p-6 text-center overflow-hidden`}
          >
            {/* Tier badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentRound.bg} border ${currentRound.color} text-[10px] font-bold uppercase tracking-wider mb-4`}>
              {(() => { const Icon = currentRound.icon; return <Icon className="w-3 h-3" />; })()}
              {currentRound.label}
            </div>

            {/* Team slot */}
            <p className="text-muted-foreground text-[10px] mb-1">
              Tim {step.teamIndex + 1} — Slot {currentRound.label}
            </p>

            {/* Spinning name display */}
            <div className="relative h-24 flex items-center justify-center overflow-hidden">
              {isSpinning ? (
                <motion.div
                  key={selectedName}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.05 }}
                  className={`text-3xl font-black ${currentRound.color}`}
                >
                  {selectedName}
                </motion.div>
              ) : revealedSteps.includes(currentStep) ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <p className={`text-3xl font-black ${currentRound.color}`}>
                    {step.player.gamertag}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.player.points} pts
                  </p>
                </motion.div>
              ) : null}
            </div>

            {/* Spinning indicator */}
            {isSpinning && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Mengacak...</span>
              </div>
            )}

            {/* Confetti effect when revealed */}
            {revealedSteps.includes(currentStep) && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: '50%', y: '50%', scale: 0 }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 80}%`,
                      y: `${50 + (Math.random() - 0.5) * 80}%`,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className={`absolute w-2 h-2 rounded-full ${currentRound.color === 'text-yellow-400' ? 'bg-yellow-400' : currentRound.color === 'text-cyan-400' ? 'bg-cyan-400' : 'bg-emerald-400'}`}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : allRevealed ? (
          /* Final results */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`text-xl font-black ${dt.neonText}`}
              >
                🎉 TIM BERHASIL DIBUAT!
              </motion.p>
            </div>

            {/* Team cards */}
            {teamEntries.map(([teamIdx, players]) => {
              const sPlayer = players.find(p => p.tier === 'S');
              const teamName = sPlayer ? `Tim ${sPlayer.gamertag}` : `Tim ${Number(teamIdx) + 1}`;
              return (
                <motion.div
                  key={teamIdx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: Number(teamIdx) * 0.1 }}
                  className={`rounded-xl border ${dt.borderSubtle} p-3`}
                  style={{ background: 'var(--card-bg, rgba(20,17,10,0.6))' }}
                >
                  <p className={`text-sm font-bold ${dt.neonText} mb-2`}>
                    {teamName}
                  </p>
                  <div className="flex gap-2">
                    {['S', 'A', 'B'].map(tier => {
                      const player = players.find(p => p.tier === tier);
                      const cfg = TIER_CONFIG[tier];
                      if (!player) return null;
                      return (
                        <div key={tier} className={`flex-1 rounded-lg ${cfg.bg} border p-2 text-center`}>
                          <p className={`text-[9px] font-bold ${cfg.color} uppercase`}>{tier}</p>
                          <p className="text-xs font-semibold text-foreground truncate">{player.gamertag}</p>
                          <p className="text-[9px] text-muted-foreground">{player.points}pts</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            <Button
              className={`w-full mt-4 ${dt.bg} font-bold`}
              onClick={onComplete}
            >
              <Trophy className="w-4 h-4 mr-2" /> Lanjut ke Bracket
            </Button>
          </motion.div>
        ) : (
          /* Start screen */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className={`rounded-2xl border ${dt.borderSubtle} p-8`}
              style={{ background: 'var(--card-bg, rgba(20,17,10,0.6))' }}>
              <p className="text-4xl mb-4">🎰</p>
              <p className={`text-lg font-bold ${dt.neonText}`}>Siap Mengacak Tim?</p>
              <p className="text-xs text-muted-foreground mt-2">
                {teamCount} tim akan dibentuk<br />
                Masing-masing: 1 Tier S + 1 Tier A + 1 Tier B
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Nama tim mengikuti player Tier S
              </p>

              <div className="flex flex-col gap-2 mt-6">
                <Button
                  className={`${dt.bg} font-bold`}
                  onClick={() => { setCurrentStep(0); }}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Mulai Pengacakan!
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    autoPlayRef.current = true;
                    setAutoPlay(true);
                    setCurrentStep(0);
                  }}
                >
                  ⚡ Auto Play (Semua Otomatis)
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls during spin */}
        {currentStep >= 0 && !allRevealed && !isSpinning && revealedSteps.includes(currentStep) && (
          <div className="flex justify-center gap-3 mt-4">
            {!autoPlay && currentStep < spinRevealOrder.length - 1 && (
              <Button
                className={`${dt.bg} font-bold`}
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4 mr-1" /> Lanjut
              </Button>
            )}
            {!autoPlay && (
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => {
                  autoPlayRef.current = true;
                  setAutoPlay(true);
                  if (currentStep < spinRevealOrder.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  }
                }}
              >
                ⚡ Auto Play
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
