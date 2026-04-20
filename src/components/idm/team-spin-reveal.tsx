'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Users, ChevronRight, PartyPopper, Play, X } from 'lucide-react';
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

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string; emoji: string }> = {
  S: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/30', emoji: '🔥' },
  A: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/30', emoji: '⚡' },
  B: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-blue-500/30', emoji: '🛡️' },
};

export function TeamSpinReveal({ spinRevealOrder, teamCount, onComplete, division }: TeamSpinRevealProps) {
  // Build team slots from reveal order
  const [teamSlots, setTeamSlots] = useState<Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState<string>('???');
  const [showReveal, setShowReveal] = useState(false);
  const [waitingForPlay, setWaitingForPlay] = useState(true); // Start waiting for admin to press Play
  const [dialogOpen, setDialogOpen] = useState(true);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalSteps = spinRevealOrder.length;

  // Initialize team slots
  useEffect(() => {
    const slots: Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }> = {};
    for (let i = 0; i < teamCount; i++) {
      slots[i] = {};
    }
    setTeamSlots(slots);
    setWaitingForPlay(true); // Wait for first play press
  }, [teamCount]);

  const doSpin = useCallback(() => {
    if (currentStep >= totalSteps) return;

    const item = spinRevealOrder[currentStep];
    const tierKey = item.tier.toLowerCase() as 's' | 'a' | 'b';
    const allPlayers = item.allPlayersInTier;
    setIsSpinning(true);
    setShowReveal(false);
    setWaitingForPlay(false);

    // Slot machine effect — cycle through player names, then slow down
    let cycleCount = 0;
    const totalCycles = 35 + Math.floor(Math.random() * 15); // 35-50 cycles (more than before)
    let currentIdx = Math.floor(Math.random() * allPlayers.length);

    spinIntervalRef.current = setInterval(() => {
      cycleCount++;
      currentIdx = (currentIdx + 1) % allPlayers.length;
      setSpinDisplay(allPlayers[currentIdx].gamertag);

      if (cycleCount >= totalCycles) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

        // Dramatic pause before reveal
        setTimeout(() => {
          setSpinDisplay(item.player.gamertag);
          setShowReveal(true);
          setIsSpinning(false);

          // Update team slot
          setTeamSlots(prev => {
            const updated = { ...prev };
            const slot = { ...updated[item.teamIndex] };
            slot[tierKey] = item.player;
            // When S-tier is set, update team name from backend (already correct after auto-balance)
            if (tierKey === 's') {
              slot.name = item.teamName; // Use backend teamName (matches bracket)
            }
            updated[item.teamIndex] = slot;
            return updated;
          });

          // After reveal, wait for admin to press Play for next step
          setTimeout(() => {
            if (currentStep + 1 >= totalSteps) {
              setIsComplete(true);
            } else {
              setCurrentStep(prev => prev + 1);
              setWaitingForPlay(true); // Wait for admin
            }
          }, 1500);
        }, 500); // Longer dramatic pause
      }
    }, // Slower intervals: fast start, gradual slowdown
      cycleCount < totalCycles * 0.4 ? 70 :      // Fast phase
      cycleCount < totalCycles * 0.65 ? 120 :     // Medium phase  
      cycleCount < totalCycles * 0.85 ? 200 :     // Slowing down
      350                                          // Dramatic slow
    );
  }, [currentStep, spinRevealOrder, totalSteps]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const currentItem = currentStep < totalSteps ? spinRevealOrder[currentStep] : null;
  const currentTier = currentItem?.tier || 'S';
  const tierConf = TIER_CONFIG[currentTier] || TIER_CONFIG.S;

  // Calculate which round we're in (S=Round 1, A=Round 2, B=Round 3)
  const currentRound = currentItem
    ? `Round ${currentTier === 'S' ? '1' : currentTier === 'A' ? '2' : '3'}`
    : '';

  // Count how many of each tier are done
  const doneCount = currentStep;

  const handleClose = () => {
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    setDialogOpen(false);
    onComplete();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      if (!open && !isSpinning) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0 border-idm-gold-warm/30 bg-gradient-to-b from-card via-card to-idm-gold-warm/5">
        {/* Header — Sticky */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-idm-gold-warm/20 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-idm-gold-warm" />
              <h2 className="text-sm font-bold text-idm-gold-warm">
                {isComplete ? 'Tim Berhasil Dibentuk!' : 'Pengundian Tim'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-[9px] border-0 bg-idm-gold-warm/10 text-idm-gold-warm">
                {division === 'male' ? '🕺 Male' : '💃 Female'}
              </Badge>
              <Badge className="text-[9px] border-0 bg-muted/50">
                {Math.min(doneCount + 1, totalSteps)}/{totalSteps}
              </Badge>
              {!isSpinning && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleClose}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-idm-gold-warm rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(doneCount / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-60px)] custom-scrollbar">
          <div className="p-5 space-y-5">
            {/* ===== SPIN DISPLAY AREA — Compact & Centered ===== */}
            {!isComplete && currentItem && (
              <div className="text-center space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-1"
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{currentRound}</p>
                    <p className="text-sm font-bold text-idm-gold-warm">
                      Tim {currentItem.teamIndex + 1} — {tierConf.emoji} Tier {currentTier}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Slot Machine Display — Bigger & More Dramatic */}
                <div className={`relative mx-auto w-72 h-24 rounded-2xl border-2 ${tierConf.border} ${tierConf.bg} overflow-hidden flex items-center justify-center shadow-lg`}>
                  {/* Spinning glow effect */}
                  {isSpinning && (
                    <motion.div
                      className={`absolute inset-0 ${tierConf.bg} opacity-50`}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 0.4, repeat: Infinity }}
                    />
                  )}

                  {/* Player name display */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSpinning ? spinDisplay : `reveal-${spinDisplay}`}
                      initial={isSpinning ? { y: 25, opacity: 0 } : { scale: 1.8, opacity: 0 }}
                      animate={isSpinning ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
                      exit={isSpinning ? { y: -25, opacity: 0 } : { opacity: 0 }}
                      transition={isSpinning ? { duration: 0.06 } : { duration: 0.5, type: 'spring' }}
                      className="relative z-10 text-center"
                    >
                      <p className={`text-xl font-black ${showReveal ? tierConf.color : 'text-foreground'}`}>
                        {spinDisplay}
                      </p>
                      {showReveal && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                        >
                          <TierBadge tier={currentTier} />
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Corner decorations */}
                  <div className="absolute top-1.5 left-2">
                    <span className={`text-[9px] font-bold ${tierConf.color}`}>{tierConf.emoji} TIER {currentTier}</span>
                  </div>
                  <div className="absolute bottom-1.5 right-2">
                    <span className="text-[9px] text-muted-foreground">Tim {currentItem.teamIndex + 1}</span>
                  </div>

                  {/* Reveal sparkle effect */}
                  {showReveal && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-idm-gold-warm rounded-full"
                          style={{ left: '50%', top: '50%' }}
                          animate={{
                            x: [0, (Math.random() - 0.5) * 160],
                            y: [0, (Math.random() - 0.5) * 100],
                            opacity: [1, 0],
                            scale: [1, 0],
                          }}
                          transition={{ duration: 1, delay: i * 0.04 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Status + Play Button */}
                <div className="flex flex-col items-center gap-3">
                  {isSpinning ? (
                    <p className="text-xs text-muted-foreground animate-pulse">🎰 Mengacak...</p>
                  ) : showReveal ? (
                    <p className="text-xs text-green-500 font-semibold">✅ Terpilih!</p>
                  ) : null}

                  {/* PLAY BUTTON — Admin controls when to spin next */}
                  {waitingForPlay && !isSpinning && !showReveal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', duration: 0.4 }}
                    >
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-base h-12 px-8 shadow-lg shadow-green-500/20"
                        onClick={doSpin}
                      >
                        <Play className="w-5 h-5 mr-2" /> Acak!
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                        Klik untuk mengacak {tierConf.emoji} Tier {currentTier} Tim {currentItem.teamIndex + 1}
                      </p>
                    </motion.div>
                  )}

                  {/* Show "Next" prompt briefly after reveal before auto-advancing */}
                  {showReveal && !waitingForPlay && !isComplete && (
                    <p className="text-[10px] text-muted-foreground">Menunggu spin berikutnya...</p>
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
                className="text-center py-6 space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <PartyPopper className="w-16 h-16 text-idm-gold-warm mx-auto" />
                </motion.div>
                <p className="text-xl font-black text-idm-gold-warm">Semua Tim Terbentuk!</p>
                <p className="text-sm text-muted-foreground">{teamCount} tim berhasil dibuat</p>
                <Button
                  size="lg"
                  className="bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black font-bold"
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
                  <span className="text-xs font-semibold">Tim ({teamCount})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
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
                          scale: isCurrentlyRevealing ? [1, 1.02, 1] : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`p-2 rounded-lg border text-xs transition-all duration-300
                          ${isCurrentlyRevealing ? 'border-idm-gold-warm/50 bg-idm-gold-warm/5 ring-1 ring-idm-gold-warm/20' :
                            hasAny ? 'bg-muted/30 border-border/20' : 'bg-muted/10 border-border/10'}`}
                      >
                        {/* Team name */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold flex items-center gap-1 truncate">
                            {slot?.name || `Tim ${i + 1}`}
                            {slot?.s && <Crown className="w-3 h-3 text-idm-gold-warm shrink-0" />}
                          </span>
                          {hasAny && (
                            <span className="text-[9px] text-idm-gold-warm font-medium shrink-0 ml-1">
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
                                    'bg-muted/20 border border-transparent'}`}
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
                                  <span className="text-[11px] text-muted-foreground/40">???</span>
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
      </DialogContent>
    </Dialog>
  );
}
