'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Users, ChevronRight, PartyPopper, Play, X, Zap } from 'lucide-react';
import { TierBadge } from './tier-badge';

interface SpinPlayer {
  id: string;
  gamertag: string;
  tier: string;
  points: number;
}

interface SpinRevealItem {
  teamIndex: number;
  teamName: string;
  tier: string;
  player: SpinPlayer;
  allPlayersInTier: SpinPlayer[];
}

interface TeamSpinRevealProps {
  spinRevealOrder: SpinRevealItem[];
  teamCount: number;
  onComplete: () => void;
  division: string;
}

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string; shadow: string }> = {
  S: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', emoji: '🔥', shadow: '0 0 30px rgba(239,68,68,0.15)' },
  A: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', emoji: '⚡', shadow: '0 0 30px rgba(245,158,11,0.15)' },
  B: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', emoji: '🛡️', shadow: '0 0 30px rgba(34,197,94,0.15)' },
};

const ROUND_LABELS: Record<string, string> = {
  S: 'Round 1',
  A: 'Round 2',
  B: 'Round 3',
};

export function TeamSpinReveal({ spinRevealOrder, teamCount, onComplete, division }: TeamSpinRevealProps) {
  // Team slots state
  const [teamSlots, setTeamSlots] = useState<Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState<string>('???');
  const [showReveal, setShowReveal] = useState(false);
  const [waitingForPlay, setWaitingForPlay] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [spinKey, setSpinKey] = useState(0); // For unique animation keys

  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayRef = useRef(false);
  const currentStepRef = useRef(0);
  const totalSteps = spinRevealOrder.length;

  // Keep ref in sync with state
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  // Group steps by tier for round display
  const roundGroups = useMemo(() => {
    const groups: { tier: string; steps: number[] }[] = [];
    let currentTier = '';
    for (let i = 0; i < spinRevealOrder.length; i++) {
      const tier = spinRevealOrder[i].tier;
      if (tier !== currentTier) {
        groups.push({ tier, steps: [] });
        currentTier = tier;
      }
      groups[groups.length - 1].steps.push(i);
    }
    return groups;
  }, [spinRevealOrder]);

  // Initialize team slots
  useEffect(() => {
    const slots: Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }> = {};
    for (let i = 0; i < teamCount; i++) {
      slots[i] = {};
    }
    setTeamSlots(slots);
  }, [teamCount]);

  // Get available players for cycling (exclude already revealed in same tier)
  const getAvailablePlayers = useCallback((stepIdx: number) => {
    const item = spinRevealOrder[stepIdx];
    const revealedInTier = spinRevealOrder
      .slice(0, stepIdx)
      .filter(s => s.tier === item.tier)
      .map(s => s.player.id);
    const available = item.allPlayersInTier.filter(p => !revealedInTier.includes(p.id));
    return available.length > 0 ? available : item.allPlayersInTier;
  }, [spinRevealOrder]);

  // Main spin animation — slower and more dramatic
  const doSpin = useCallback(() => {
    const step = currentStepRef.current;
    if (step >= totalSteps) return;

    const item = spinRevealOrder[step];
    const tierKey = item.tier.toLowerCase() as 's' | 'a' | 'b';
    const availablePlayers = getAvailablePlayers(step);

    setIsSpinning(true);
    setShowReveal(false);
    setWaitingForPlay(false);

    // Slower, more dramatic slot machine — 50-70 cycles
    let cycleCount = 0;
    const totalCycles = 50 + Math.floor(Math.random() * 20);
    let currentIdx = Math.floor(Math.random() * availablePlayers.length);

    const runCycle = () => {
      cycleCount++;
      currentIdx = (currentIdx + 1) % availablePlayers.length;
      setSpinDisplay(availablePlayers[currentIdx].gamertag);
      setSpinKey(prev => prev + 1); // Force re-render for animation

      if (cycleCount >= totalCycles) {
        // Dramatic pause before reveal — longer for more suspense
        spinTimeoutRef.current = setTimeout(() => {
          setSpinDisplay(item.player.gamertag);
          setShowReveal(true);
          setIsSpinning(false);

          // Update team slot
          setTeamSlots(prev => {
            const updated = { ...prev };
            const slot = { ...updated[item.teamIndex] };
            slot[tierKey] = item.player;
            if (tierKey === 's') {
              slot.name = item.teamName;
            }
            updated[item.teamIndex] = slot;
            return updated;
          });

          // After reveal, advance to next step
          spinTimeoutRef.current = setTimeout(() => {
            const nextStep = step + 1;
            if (nextStep >= totalSteps) {
              setIsComplete(true);
              setAutoPlay(false);
              autoPlayRef.current = false;
            } else {
              setCurrentStep(nextStep);
              currentStepRef.current = nextStep;
              if (autoPlayRef.current) {
                // Auto-play: small delay then auto-spin
                setWaitingForPlay(false);
                spinTimeoutRef.current = setTimeout(() => {
                  doSpin();
                }, 800);
              } else {
                setWaitingForPlay(true);
              }
            }
          }, 1800);
        }, 700); // Longer dramatic pause
        return;
      }

      // 5-phase slowdown — much more gradual
      const progress = cycleCount / totalCycles;
      let delay: number;

      if (progress < 0.35) {
        // Phase 1: Fast blur
        delay = 55;
      } else if (progress < 0.55) {
        // Phase 2: Starting to slow
        delay = 90;
      } else if (progress < 0.72) {
        // Phase 3: Noticeably slower
        delay = 150;
      } else if (progress < 0.88) {
        // Phase 4: Dramatic slowdown
        delay = 260;
      } else {
        // Phase 5: Almost stopping — very slow
        delay = 420 + (progress - 0.88) * 2000;
      }

      spinTimeoutRef.current = setTimeout(runCycle, delay);
    };

    // Start with a small initial delay for dramatic effect
    spinTimeoutRef.current = setTimeout(runCycle, 200);
  }, [spinRevealOrder, totalSteps, getAvailablePlayers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  // Current step data
  const currentItem = currentStep < totalSteps ? spinRevealOrder[currentStep] : null;
  const currentTier = currentItem?.tier || 'S';
  const tierConf = TIER_CONFIG[currentTier] || TIER_CONFIG.S;
  const currentRound = ROUND_LABELS[currentTier] || 'Round 1';
  const doneCount = currentStep;

  // Current round group info
  const currentRoundGroup = roundGroups.find(g => g.steps.includes(currentStep));
  const roundStepIndex = currentRoundGroup ? currentRoundGroup.steps.indexOf(currentStep) : 0;
  const roundTotalSteps = currentRoundGroup ? currentRoundGroup.steps.length : 1;

  const handleClose = () => {
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    setAutoPlay(false);
    autoPlayRef.current = false;
    setOverlayVisible(false);
    onComplete();
  };

  const toggleAutoPlay = () => {
    if (autoPlay) {
      setAutoPlay(false);
      autoPlayRef.current = false;
      return;
    }
    setAutoPlay(true);
    autoPlayRef.current = true;
    // If currently waiting for play, start spinning immediately
    if (waitingForPlay && !isSpinning && !showReveal) {
      doSpin();
    }
  };

  if (!overlayVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-hidden">
      <div className="w-full max-w-3xl h-full flex flex-col">
        {/* ===== STICKY HEADER ===== */}
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-idm-gold-warm" />
              <h2 className="text-sm font-bold text-idm-gold-warm">
                {isComplete ? 'Tim Berhasil Dibentuk!' : 'Pengundian Tim'}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="text-[9px] border-0 bg-idm-gold-warm/10 text-idm-gold-warm">
                {division === 'male' ? '🕺 Male' : '💃 Female'}
              </Badge>
              <Badge className="text-[9px] border-0 bg-muted/50">
                {Math.min(doneCount + 1, totalSteps)}/{totalSteps}
              </Badge>
              {/* Auto Play Toggle */}
              {!isComplete && (
                <Button
                  size="sm"
                  variant={autoPlay ? 'default' : 'outline'}
                  className={`h-6 text-[9px] px-2 ${autoPlay ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'border-white/20 text-white/60'}`}
                  onClick={toggleAutoPlay}
                >
                  <Zap className="w-3 h-3 mr-0.5" />
                  {autoPlay ? 'Auto' : 'Manual'}
                </Button>
              )}
              {/* Close button — always visible (non-blocking) */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white/40 hover:text-white hover:bg-white/10"
                onClick={handleClose}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-idm-gold-warm rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(doneCount / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Round indicator */}
          {!isComplete && currentItem && (
            <div className="mt-2 flex items-center gap-2">
              {roundGroups.map((group, gi) => {
                const tc = TIER_CONFIG[group.tier];
                const isCurrentRound = group.steps.includes(currentStep);
                const isDone = group.steps.every(s => s < currentStep);
                return (
                  <div
                    key={gi}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all duration-300
                      ${isCurrentRound ? `${tc.bg} ${tc.color} border ${tc.border}` :
                        isDone ? 'bg-white/5 text-white/30' : 'bg-white/5 text-white/20'}`}
                  >
                    <span>{tc.emoji}</span>
                    <span>{ROUND_LABELS[group.tier]}</span>
                    {isCurrentRound && (
                      <span className="text-white/40">({roundStepIndex + 1}/{roundTotalSteps})</span>
                    )}
                    {isDone && <span className="text-green-400">✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            {/* ===== SPIN DISPLAY AREA ===== */}
            {!isComplete && currentItem && (
              <div className="text-center space-y-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-1"
                  >
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{currentRound}</p>
                    <p className="text-sm font-bold text-idm-gold-warm">
                      Tim {currentItem.teamIndex + 1} — {tierConf.emoji} Tier {currentTier}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Slot Machine Display — Larger, more dramatic */}
                <div
                  className={`relative mx-auto w-80 h-28 rounded-2xl border-2 ${tierConf.border} ${tierConf.bg} overflow-hidden flex items-center justify-center`}
                  style={{ boxShadow: (isSpinning || showReveal) ? tierConf.shadow : 'none' }}
                >
                  {/* Animated background glow while spinning */}
                  {isSpinning && (
                    <motion.div
                      className={`absolute inset-0 ${tierConf.bg}`}
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {/* Scan line effect while spinning */}
                  {isSpinning && (
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-white/20"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  {/* Player name display */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSpinning ? `spin-${spinKey}` : `reveal-${currentStep}`}
                      initial={isSpinning ? { y: 30, opacity: 0 } : { scale: 2, opacity: 0 }}
                      animate={isSpinning ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
                      exit={isSpinning ? { y: -30, opacity: 0 } : { opacity: 0 }}
                      transition={isSpinning ? { duration: 0.04 } : { duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
                      className="relative z-10 text-center"
                    >
                      <p className={`text-2xl font-black tracking-tight ${showReveal ? tierConf.color : 'text-white'}`}>
                        {spinDisplay}
                      </p>
                      {showReveal && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="flex items-center justify-center gap-2 mt-1"
                        >
                          <TierBadge tier={currentTier} />
                          <span className="text-[10px] text-white/40">{currentItem.player.points} pts</span>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Corner decorations */}
                  <div className="absolute top-1.5 left-2.5">
                    <span className={`text-[9px] font-bold ${tierConf.color}`}>{tierConf.emoji} T{currentTier}</span>
                  </div>
                  <div className="absolute bottom-1.5 right-2.5">
                    <span className="text-[9px] text-white/30">Tim {currentItem.teamIndex + 1}</span>
                  </div>

                  {/* Reveal sparkle explosion */}
                  {showReveal && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 2.5 }}
                    >
                      {[...Array(16)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                            backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f59e0b' : '#ffffff',
                          }}
                          animate={{
                            x: [0, (Math.random() - 0.5) * 200],
                            y: [0, (Math.random() - 0.5) * 120],
                            opacity: [1, 0],
                            scale: [1, 0],
                          }}
                          transition={{ duration: 1.2, delay: i * 0.03, ease: 'easeOut' }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Status + Play Button */}
                <div className="flex flex-col items-center gap-2">
                  {isSpinning ? (
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-idm-gold-warm"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                      <p className="text-xs text-white/50">Mengacak...</p>
                    </div>
                  ) : showReveal ? (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-green-400 font-semibold"
                    >
                      ✅ Terpilih!
                    </motion.p>
                  ) : null}

                  {/* PLAY BUTTON — Admin controls when to spin next */}
                  {waitingForPlay && !isSpinning && !showReveal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-base h-12 px-10 shadow-lg shadow-green-500/25 border-0"
                        onClick={doSpin}
                      >
                        <Play className="w-5 h-5 mr-2 fill-current" /> Acak!
                      </Button>
                      <p className="text-[10px] text-white/30">
                        Klik untuk mengacak {tierConf.emoji} Tier {currentTier} Tim {currentItem.teamIndex + 1}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[9px] text-white/20 hover:text-amber-400 h-5"
                        onClick={toggleAutoPlay}
                      >
                        <Zap className="w-3 h-3 mr-0.5" /> Auto Play semua
                      </Button>
                    </motion.div>
                  )}

                  {/* Auto-play indicator */}
                  {autoPlay && isSpinning && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] text-amber-400/60">Auto Play aktif</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== COMPLETION CELEBRATION ===== */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="text-center py-8 space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <PartyPopper className="w-16 h-16 text-idm-gold-warm mx-auto" />
                </motion.div>
                <p className="text-2xl font-black text-idm-gold-warm">Semua Tim Terbentuk!</p>
                <p className="text-sm text-white/50">{teamCount} tim berhasil dibuat</p>

                {/* Final team summary - compact grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar mt-4">
                  {Array.from({ length: teamCount }, (_, i) => {
                    const slot = teamSlots[i];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-xs"
                      >
                        <div className="font-semibold text-idm-gold-warm truncate flex items-center gap-1">
                          {slot?.name || `Tim ${i + 1}`}
                          {slot?.s && <Crown className="w-3 h-3 text-idm-gold-warm shrink-0" />}
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {(['S', 'A', 'B'] as const).map(tier => {
                            const player = slot?.[tier.toLowerCase() as 's' | 'a' | 'b'];
                            const tc = TIER_CONFIG[tier];
                            return (
                              <div key={tier} className="flex items-center gap-1">
                                <span className="text-[9px]">{tc.emoji}</span>
                                <span className={`text-[10px] truncate ${player ? tc.color : 'text-white/20'}`}>
                                  {player?.gamertag || '???'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className="bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black font-bold mt-4"
                  onClick={handleClose}
                >
                  Lanjut ke Bracket <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* ===== TEAM GRID — Compact, scrollable ===== */}
            {!isComplete && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-idm-gold-warm" />
                  <span className="text-xs font-semibold text-white/60">Tim ({teamCount})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
                  {Array.from({ length: teamCount }, (_, i) => {
                    const slot = teamSlots[i];
                    const hasAny = slot?.s || slot?.a || slot?.b;
                    const isCurrentlyRevealing = currentItem?.teamIndex === i && !isComplete;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.5 }}
                        animate={{
                          opacity: 1,
                          scale: isCurrentlyRevealing && showReveal ? [1, 1.03, 1] : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`p-2 rounded-lg border text-xs transition-all duration-300
                          ${isCurrentlyRevealing ? 'border-idm-gold-warm/50 bg-idm-gold-warm/5 ring-1 ring-idm-gold-warm/20' :
                            hasAny ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5'}`}
                      >
                        {/* Team name */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold flex items-center gap-1 truncate text-idm-gold-warm/80">
                            {slot?.name || `Tim ${i + 1}`}
                            {slot?.s && <Crown className="w-3 h-3 text-idm-gold-warm shrink-0" />}
                          </span>
                          {hasAny && (
                            <span className="text-[9px] text-idm-gold-warm/60 font-medium shrink-0 ml-1">
                              ⚡ {((slot?.s?.points || 0) + (slot?.a?.points || 0) + (slot?.b?.points || 0))}
                            </span>
                          )}
                        </div>

                        {/* Player slots — compact inline */}
                        <div className="space-y-0.5">
                          {(['S', 'A', 'B'] as const).map(tier => {
                            const player = slot?.[tier.toLowerCase() as 's' | 'a' | 'b'];
                            const tc = TIER_CONFIG[tier];
                            const isThisSlotRevealing = isCurrentlyRevealing && currentItem?.tier === tier;

                            return (
                              <div
                                key={tier}
                                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all duration-300
                                  ${player ? `${tc.bg} border ${tc.border}` :
                                    isThisSlotRevealing ? 'bg-idm-gold-warm/10 border border-idm-gold-warm/30 animate-pulse' :
                                    'bg-white/5 border border-transparent'}`}
                              >
                                <span className="text-[10px] shrink-0">{tc.emoji}</span>
                                {player ? (
                                  <motion.span
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-[11px] font-medium truncate ${tc.color}`}
                                  >
                                    {player.gamertag}
                                  </motion.span>
                                ) : isThisSlotRevealing ? (
                                  <span className="text-[11px] text-idm-gold-warm animate-pulse">Mengacak...</span>
                                ) : (
                                  <span className="text-[11px] text-white/15">???</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
