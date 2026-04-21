'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  tournamentId: string;
}

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string; shadow: string }> = {
  S: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', emoji: '🔥', shadow: '0 0 20px rgba(239,68,68,0.2)' },
  A: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', emoji: '⚡', shadow: '0 0 20px rgba(245,158,11,0.2)' },
  B: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', emoji: '🛡️', shadow: '0 0 20px rgba(34,197,94,0.2)' },
};

const ROUND_LABELS: Record<string, string> = { S: 'Round 1', A: 'Round 2', B: 'Round 3' };

// Slot machine roller constants
const ITEM_H = 44;
const VISIBLE_COUNT = 3;
const VIEWPORT_H = ITEM_H * VISIBLE_COUNT; // 132px
const STRIP_REPS = 3;
const SPIN_DURATION = 1.5; // seconds
const SPIN_EASE: [number, number, number, number] = [0.05, 0.7, 0.1, 1.0]; // fast start, slow end

// Fisher-Yates shuffle — unbiased, in-place
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function TeamSpinReveal({ spinRevealOrder, teamCount, onComplete, division, tournamentId }: TeamSpinRevealProps) {
  // Team slots state
  const [teamSlots, setTeamSlots] = useState<Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  // Slot roller state
  const [rollerStrip, setRollerStrip] = useState<SpinPlayer[]>([]);
  const [rollerTargetY, setRollerTargetY] = useState(0);
  const [spinKey, setSpinKey] = useState(0);

  // Random selection tracking — ensures truly random picks instead of predetermined
  const [assignedPlayers, setAssignedPlayers] = useState<Record<string, Set<string>>>({}); // tier -> set of player IDs
  const [randomSelection, setRandomSelection] = useState<Record<number, SpinPlayer>>({}); // step -> randomly selected player

  // Refs for avoiding stale closures in timers
  const autoPlayRef = useRef(false);
  const currentStepRef = useRef(0);
  const isSpinningRef = useRef(false);
  const mountedRef = useRef(true);
  const spinCompletedRef = useRef(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  // Sort spinRevealOrder by teamIndex within tier groups — sequential placement (Team 1, 2, 3...)
  const orderedRevealOrder = useMemo(() => {
    const result: SpinRevealItem[] = [];
    // Group by tier
    const groups: SpinRevealItem[][] = [];
    let currentTier = '';
    for (const item of spinRevealOrder) {
      if (item.tier !== currentTier) {
        groups.push([]);
        currentTier = item.tier;
      }
      groups[groups.length - 1].push(item);
    }
    // Sort each tier group by teamIndex (sequential: Tim 1 → Tim 2 → Tim 3...)
    for (const group of groups) {
      result.push(...[...group].sort((a, b) => a.teamIndex - b.teamIndex));
    }
    return result;
  }, [spinRevealOrder]);

  // Group steps by tier for round display (uses ordered reveal)
  const roundGroups = useMemo(() => {
    const groups: { tier: string; steps: number[] }[] = [];
    let currentTier = '';
    for (let i = 0; i < orderedRevealOrder.length; i++) {
      const tier = orderedRevealOrder[i].tier;
      if (tier !== currentTier) {
        groups.push({ tier, steps: [] });
        currentTier = tier;
      }
      groups[groups.length - 1].steps.push(i);
    }
    return groups;
  }, [orderedRevealOrder]);

  // Total steps uses ordered reveal
  const totalSteps = orderedRevealOrder.length;

  // Initialize team slots
  useEffect(() => {
    const slots: Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }> = {};
    for (let i = 0; i < teamCount; i++) {
      slots[i] = {};
    }
    setTeamSlots(slots);
  }, [teamCount]);

  // Get available players for cycling (exclude already assigned in same tier)
  const getAvailablePlayers = useCallback((stepIdx: number) => {
    const item = orderedRevealOrder[stepIdx];
    const alreadyAssigned = assignedPlayers[item.tier] || new Set<string>();
    const available = item.allPlayersInTier.filter(p => !alreadyAssigned.has(p.id));
    return available.length > 0 ? available : item.allPlayersInTier;
  }, [orderedRevealOrder, assignedPlayers]);

  // Ref for startSpin to avoid hoisting issues
  const startSpinRef = useRef<(step: number) => void>(() => {});

  // Start the slot machine animation for a given step
  const startSpin = useCallback((step: number) => {
    if (step >= totalSteps || !mountedRef.current) return;

    const item = orderedRevealOrder[step];
    // Get available players excluding already assigned
    const alreadyAssigned = assignedPlayers[item.tier] || new Set<string>();
    const available = item.allPlayersInTier.filter(p => !alreadyAssigned.has(p.id));
    const pool = available.length > 0 ? available : item.allPlayersInTier;

    // RANDOMLY SELECT from available pool (NOT the predetermined item.player)
    const randomIdx = Math.floor(Math.random() * pool.length);
    const targetPlayer = pool[randomIdx];

    // Mark this player as assigned for this tier
    setAssignedPlayers(prev => {
      const updated = { ...prev };
      const tierSet = new Set(prev[item.tier] || []);
      tierSet.add(targetPlayer.id);
      updated[item.tier] = tierSet;
      return updated;
    });

    // Store the randomly selected player for this step
    setRandomSelection(prev => ({ ...prev, [step]: targetPlayer }));

    // Shuffle available players so the visual cycling appears random each spin
    const shuffledAvailable = shuffle([...pool]);

    // Build the name strip — repeat players multiple times for long scroll
    const strip: SpinPlayer[] = [];
    for (let r = 0; r < STRIP_REPS; r++) {
      for (let i = 0; i < shuffledAvailable.length; i++) {
        strip.push(shuffledAvailable[i]);
      }
    }

    // Calculate where the target player should land (center item of viewport for 3 visible)
    const targetRep = STRIP_REPS - 2;
    const targetIdxInPlayers = shuffledAvailable.findIndex(p => p.id === targetPlayer.id);
    const targetGlobalIdx = targetRep * shuffledAvailable.length + targetIdxInPlayers;
    // Center item position: middle of viewport
    const centerOffset = Math.floor(VISIBLE_COUNT / 2) * ITEM_H;
    const targetY = -(targetGlobalIdx * ITEM_H) + centerOffset;

    // Set state and start animation
    spinCompletedRef.current = false;
    setRollerStrip(strip);
    setRollerTargetY(targetY);
    setIsSpinning(true);
    isSpinningRef.current = true;
    setShowReveal(false);
    setSpinKey(prev => prev + 1);
  }, [orderedRevealOrder, totalSteps, assignedPlayers, getAvailablePlayers]);

  // Keep ref in sync
  useEffect(() => { startSpinRef.current = startSpin; }, [startSpin]);

  // Save team results to backend after all spins complete
  const saveTeamResults = useCallback(async () => {
    if (!spinRevealOrder || spinRevealOrder.length === 0 || !tournamentId) return;

    try {
      // Build the team assignments from teamSlots for persistence
      const teamAssignments = [];
      for (let i = 0; i < teamCount; i++) {
        const slot = teamSlots[i];
        if (slot?.s && slot?.a && slot?.b) {
          teamAssignments.push({
            teamIndex: i,
            sPlayerId: slot.s.id,
            aPlayerId: slot.a.id,
            bPlayerId: slot.b.id,
          });
        }
      }

      if (teamAssignments.length > 0) {
        const res = await fetch(`/api/tournaments/${tournamentId}/save-spin-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ teamAssignments }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Failed to save' }));
          console.error('Save spin results error:', err.error);
        }
      }
    } catch (e) {
      console.error('Failed to save team results', e);
    }
  }, [teamSlots, teamCount, spinRevealOrder, tournamentId]);

  // Advance to next step after reveal
  const advanceToNextStep = useCallback((completedStep: number) => {
    if (!mountedRef.current) return;

    const nextStep = completedStep + 1;
    if (nextStep >= totalSteps) {
      setIsComplete(true);
      setAutoPlay(false);
      autoPlayRef.current = false;
      // Save results after all spins are done
      saveTeamResults();
    } else {
      setCurrentStep(nextStep);
      currentStepRef.current = nextStep;
      setShowReveal(false);

      if (autoPlayRef.current) {
        // Auto-play: start next spin after short delay
        revealTimerRef.current = setTimeout(() => {
          if (!mountedRef.current || !autoPlayRef.current) return;
          startSpinRef.current(nextStep);
        }, 800);
      } else {
        // Manual: ready for next Play click
      }
    }
  }, [totalSteps, saveTeamResults]);

  // Handle slot machine animation completion
  const handleSpinComplete = useCallback(() => {
    if (spinCompletedRef.current || !isSpinningRef.current || !mountedRef.current) return;
    spinCompletedRef.current = true;

    const step = currentStepRef.current;
    if (step >= totalSteps) return;

    const item = orderedRevealOrder[step];
    const tierKey = item.tier.toLowerCase() as 's' | 'a' | 'b';

    // Use the randomly selected player instead of item.player
    const selectedPlayer = randomSelection[step] || item.player;

    setIsSpinning(false);
    isSpinningRef.current = false;
    setShowReveal(true);

    // Update team slot with RANDOM selection
    setTeamSlots(prev => {
      const updated = { ...prev };
      const slot = { ...updated[item.teamIndex] };
      slot[tierKey] = selectedPlayer;
      if (tierKey === 's') {
        slot.name = `Tim ${selectedPlayer.gamertag}`;
      }
      updated[item.teamIndex] = slot;
      return updated;
    });

    // After reveal, advance to next step
    revealTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      advanceToNextStep(step);
    }, 1500);
  }, [orderedRevealOrder, totalSteps, advanceToNextStep, randomSelection]);

  // Public doSpin for Play button click
  const doSpin = useCallback(() => {
    startSpin(currentStepRef.current);
  }, [startSpin]);

  // Current step data (uses ordered reveal)
  const currentItem = currentStep < totalSteps ? orderedRevealOrder[currentStep] : null;
  const currentTier = currentItem?.tier || 'S';
  const tierConf = TIER_CONFIG[currentTier] || TIER_CONFIG.S;
  const currentRound = ROUND_LABELS[currentTier] || 'Round 1';
  const doneCount = currentStep;

  // Current round group info
  const currentRoundGroup = roundGroups.find(g => g.steps.includes(currentStep));
  const roundStepIndex = currentRoundGroup ? currentRoundGroup.steps.indexOf(currentStep) : 0;
  const roundTotalSteps = currentRoundGroup ? currentRoundGroup.steps.length : 1;

  // Play button state
  const playDisabled = isSpinning || showReveal;

  const handleClose = () => {
    isSpinningRef.current = false;
    setAutoPlay(false);
    autoPlayRef.current = false;
    setOverlayVisible(false);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
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
    if (!isSpinning && !showReveal) {
      doSpin();
    }
  };

  if (!overlayVisible) return null;

  return (
    <div className="
      fixed inset-0 z-50
      lg:static lg:z-auto
      bg-black/85 lg:bg-transparent
      overflow-y-auto
    ">
      <div className="min-h-full lg:min-h-0 flex items-start justify-center lg:block">
        <div className="
          w-full max-w-3xl lg:max-w-none
          flex flex-col
          lg:border lg:border-idm-gold-warm/20
          lg:rounded-xl lg:bg-card lg:shadow-lg lg:overflow-hidden
        ">
          {/* Casino bar — desktop only */}
          <div className="hidden lg:block h-1 bg-gradient-to-r from-idm-gold-warm via-amber-400 to-idm-gold-warm" />

          {/* ===== HEADER ===== */}
          <div className="bg-black/95 lg:bg-card/95 border-b border-white/10 lg:border-idm-gold-warm/10 px-4 py-3 shrink-0">
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
                {!isComplete && (
                  <Button
                    size="sm"
                    variant={autoPlay ? 'default' : 'outline'}
                    className={`h-6 text-[9px] px-2 ${autoPlay ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'border-white/20 lg:border-idm-gold-warm/20 text-white/60 lg:text-idm-gold-warm/60'}`}
                    onClick={toggleAutoPlay}
                  >
                    <Zap className="w-3 h-3 mr-0.5" />
                    {autoPlay ? 'Auto' : 'Manual'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-white/40 lg:text-idm-gold-warm/40 hover:text-white lg:hover:text-idm-gold-warm hover:bg-white/10 lg:hover:bg-idm-gold-warm/10"
                  onClick={handleClose}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 bg-white/10 lg:bg-idm-gold-warm/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-idm-gold-warm rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${(doneCount / totalSteps) * 100}%` }}
              />
            </div>

            {/* Round indicators */}
            {!isComplete && currentItem && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {roundGroups.map((group, gi) => {
                  const tc = TIER_CONFIG[group.tier];
                  const isCurrentRound = group.steps.includes(currentStep);
                  const isDone = group.steps.every(s => s < currentStep);
                  return (
                    <div
                      key={gi}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all duration-300
                        ${isCurrentRound ? `${tc.bg} ${tc.color} border ${tc.border}` :
                          isDone ? 'bg-white/5 lg:bg-idm-gold-warm/5 text-white/30 lg:text-idm-gold-warm/30' : 'bg-white/5 lg:bg-idm-gold-warm/5 text-white/20 lg:text-idm-gold-warm/20'}`}
                    >
                      <span>{tc.emoji}</span>
                      <span>{ROUND_LABELS[group.tier]}</span>
                      {isCurrentRound && (
                        <span className="text-white/40 lg:text-idm-gold-warm/40">({roundStepIndex + 1}/{roundTotalSteps})</span>
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
            <div className="p-4 lg:p-6 space-y-5">
              {/* ===== SPIN DISPLAY AREA ===== */}
              {!isComplete && currentItem && (
                <div className="text-center space-y-4">
                  {/* Step info */}
                  <div
                    key={currentStep}
                    className="animate-fade-enter space-y-1"
                  >
                    <p className="text-[10px] text-white/40 lg:text-idm-gold-warm/40 uppercase tracking-widest">{currentRound}</p>
                    <p className="text-sm font-bold text-idm-gold-warm">
                      Tim {currentItem.teamIndex + 1} — {tierConf.emoji} Tier {currentTier}
                    </p>
                  </div>

                  {/* ===== SLOT MACHINE ROLLER ===== */}
                  <div
                    className={`relative mx-auto w-80 lg:w-96 rounded-2xl border-2 ${tierConf.border} ${tierConf.bg} overflow-hidden`}
                    style={{ height: VIEWPORT_H, boxShadow: (isSpinning || showReveal) ? tierConf.shadow : 'none' }}
                  >
                    {/* Top gradient mask — fades top item */}
                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/80 lg:from-card/80 to-transparent z-10 pointer-events-none" />

                    {/* Bottom gradient mask — fades bottom item */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 lg:from-card/80 to-transparent z-10 pointer-events-none" />

                    {/* Center highlight line — highlights middle item for 3 visible */}
                    <div
                      className={`absolute inset-x-2 z-10 pointer-events-none rounded border-y-2 transition-colors duration-300
                        ${showReveal ? 'border-idm-gold-warm/60 bg-idm-gold-warm/5' : `border-white/10 lg:border-idm-gold-warm/10`}`}
                      style={{ top: Math.floor(VISIBLE_COUNT / 2) * ITEM_H, height: ITEM_H }}
                    />

                    {/* Roller content */}
                    {rollerStrip.length > 0 ? (
                      <div
                        key={spinKey}
                        className="animate-spin-roller"
                        style={{
                          '--roller-target': `${rollerTargetY}px`,
                          willChange: 'transform',
                        } as React.CSSProperties}
                        onAnimationEnd={handleSpinComplete}
                      >
                        {rollerStrip.map((player, i) => {
                          // Check if this is the center item at the final position
                          const selectedPlayerForStep = randomSelection[currentStep] || currentItem?.player;
                          const isTargetItem = showReveal && selectedPlayerForStep && player.id === selectedPlayerForStep.id
                            && i >= (STRIP_REPS - 3) * Math.floor(rollerStrip.length / STRIP_REPS)
                            && i <= (STRIP_REPS - 1) * Math.floor(rollerStrip.length / STRIP_REPS);

                          return (
                            <div
                              key={`${spinKey}-${i}`}
                              className="flex items-center justify-center"
                              style={{ height: ITEM_H }}
                            >
                              <span className={`text-xl lg:text-2xl font-black tracking-tight transition-colors duration-200
                                ${isTargetItem ? tierConf.color : 'text-white/70 lg:text-foreground/70'}`}>
                                {player.gamertag}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Initial state before first spin */
                      <div className="flex items-center justify-center h-full">
                        <p className="text-2xl font-black text-white/20 lg:text-idm-gold-warm/20">???</p>
                      </div>
                    )}

                    {/* Corner decorations */}
                    <div className="absolute top-1.5 left-2.5 z-20">
                      <span className={`text-[9px] font-bold ${tierConf.color}`}>{tierConf.emoji} T{currentTier}</span>
                    </div>
                    <div className="absolute bottom-1.5 right-2.5 z-20">
                      <span className="text-[9px] text-white/30 lg:text-idm-gold-warm/30">Tim {currentItem.teamIndex + 1}</span>
                    </div>

                    {/* Reveal sparkle explosion */}
                    {showReveal && (
                      <div
                        className="absolute inset-0 pointer-events-none z-20 animate-fade-out"
                      >
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full animate-sparkle-explode"
                            style={{
                              left: '50%',
                              top: '50%',
                              backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f59e0b' : '#ffffff',
                              '--sparkle-x': `${(Math.random() - 0.5) * 200}px`,
                              '--sparkle-y': `${(Math.random() - 0.5) * 120}px`,
                              animationDelay: `${i * 0.03}s`,
                            } as React.CSSProperties}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reveal info (badge + points) */}
                  {showReveal && (
                    <div
                      className="animate-fade-enter flex items-center justify-center gap-2"
                    >
                      <TierBadge tier={currentTier} />
                      <span className="text-xs text-white/40 lg:text-idm-gold-warm/40">{(randomSelection[currentStep] || currentItem?.player)?.points} pts</span>
                      <span className="text-xs text-green-400 font-semibold">✅ Terpilih!</span>
                    </div>
                  )}

                  {/* ===== PLAY BUTTON — always visible, disabled during spin ===== */}
                  {!isComplete && (
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        size="lg"
                        disabled={playDisabled}
                        className={`
                          font-bold text-base h-12 px-10 shadow-lg border-0 transition-all duration-200
                          ${playDisabled
                            ? 'bg-gray-600/50 text-gray-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/25'
                          }
                        `}
                        onClick={doSpin}
                      >
                        <Play className={`w-5 h-5 mr-2 ${!playDisabled ? 'fill-current' : ''}`} />
                        {isSpinning ? 'Mengacak...' : showReveal ? 'Terpilih!' : 'Acak!'}
                      </Button>

                      {/* Helper text */}
                      {isSpinning && (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-idm-gold-warm animate-pulse-scale"
                          />
                          <p className="text-[10px] text-white/40 lg:text-idm-gold-warm/40">
                            {tierConf.emoji} Tier {currentTier} Tim {currentItem.teamIndex + 1} sedang diacak...
                          </p>
                        </div>
                      )}
                      {!isSpinning && !showReveal && (
                        <p className="text-[10px] text-white/30 lg:text-idm-gold-warm/30">
                          Klik untuk mengacak {tierConf.emoji} Tier {currentTier} Tim {currentItem.teamIndex + 1}
                        </p>
                      )}

                      {/* Auto play toggle */}
                      {!autoPlay && !isSpinning && !showReveal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[9px] text-white/20 lg:text-idm-gold-warm/20 hover:text-amber-400 h-5"
                          onClick={toggleAutoPlay}
                        >
                          <Zap className="w-3 h-3 mr-0.5" /> Auto Play semua
                        </Button>
                      )}

                      {/* Auto-play indicator */}
                      {autoPlay && isSpinning && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] text-amber-400/60">Auto Play aktif</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===== COMPLETION CELEBRATION ===== */}
              {isComplete && (
                <div
                  className="animate-fade-enter text-center py-8 space-y-4"
                >
                  <div
                    className="animate-wiggle"
                    style={{ animationIterationCount: 3 }}
                  >
                    <PartyPopper className="w-16 h-16 text-idm-gold-warm mx-auto" />
                  </div>
                  <p className="text-2xl font-black text-idm-gold-warm">Semua Tim Terbentuk!</p>
                  <p className="text-sm text-white/50 lg:text-idm-gold-warm/50">{teamCount} tim berhasil dibuat</p>

                  {/* Final team summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar mt-4">
                    {Array.from({ length: teamCount }, (_, i) => {
                      const slot = teamSlots[i];
                      return (
                        <div
                          key={i}
                          className="animate-fade-enter p-2 rounded-lg border border-white/10 lg:border-idm-gold-warm/10 bg-white/5 lg:bg-idm-gold-warm/5 text-xs"
                          style={{ animationDelay: `${i * 50}ms` }}
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
                                  <span className={`text-[10px] truncate ${player ? tc.color : 'text-white/20 lg:text-idm-gold-warm/20'}`}>
                                    {player?.gamertag || '???'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
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
                </div>
              )}

              {/* ===== TEAM GRID — Compact, scrollable ===== */}
              {!isComplete && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-idm-gold-warm" />
                    <span className="text-xs font-semibold text-white/60 lg:text-idm-gold-warm/60">Tim ({teamCount})</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
                    {Array.from({ length: teamCount }, (_, i) => {
                      const slot = teamSlots[i];
                      const hasAny = slot?.s || slot?.a || slot?.b;
                      const isCurrentlyRevealing = currentItem?.teamIndex === i && !isComplete;

                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border text-xs transition-all duration-300
                            ${isCurrentlyRevealing ? 'border-idm-gold-warm/50 bg-idm-gold-warm/5 ring-1 ring-idm-gold-warm/20' :
                              hasAny ? 'bg-white/5 lg:bg-idm-gold-warm/5 border-white/10 lg:border-idm-gold-warm/10' : 'bg-white/[0.02] lg:bg-idm-gold-warm/[0.02] border-white/5 lg:border-idm-gold-warm/5'}`}
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

                          {/* Player slots */}
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
                                      'bg-white/5 lg:bg-idm-gold-warm/5 border border-transparent'}`}
                                >
                                  <span className="text-[10px] shrink-0">{tc.emoji}</span>
                                  {player ? (
                                    <span
                                      className={`animate-fade-enter text-[11px] font-medium truncate ${tc.color}`}
                                    >
                                      {player.gamertag}
                                    </span>
                                  ) : isThisSlotRevealing ? (
                                    <span className="text-[11px] text-idm-gold-warm animate-pulse">Mengacak...</span>
                                  ) : (
                                    <span className="text-[11px] text-white/15 lg:text-idm-gold-warm/15">???</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
