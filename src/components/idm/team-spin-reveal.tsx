'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Users, ChevronRight, PartyPopper } from 'lucide-react';
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

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  S: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/30' },
  A: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/30' },
  B: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-blue-500/30' },
};

export function TeamSpinReveal({ spinRevealOrder, teamCount, onComplete, division }: TeamSpinRevealProps) {
  // Build team slots from reveal order
  const [teamSlots, setTeamSlots] = useState<Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState<string>('???');
  const [showReveal, setShowReveal] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalSteps = spinRevealOrder.length;

  // Initialize team slots
  useEffect(() => {
    const slots: Record<number, { s?: SpinPlayer; a?: SpinPlayer; b?: SpinPlayer; name?: string }> = {};
    for (let i = 0; i < teamCount; i++) {
      slots[i] = {};
    }
    setTeamSlots(slots);
  }, [teamCount]);

  const doSpin = useCallback(() => {
    if (currentStep >= totalSteps) return;

    const item = spinRevealOrder[currentStep];
    const tierKey = item.tier.toLowerCase() as 's' | 'a' | 'b';
    const allPlayers = item.allPlayersInTier;
    setIsSpinning(true);
    setShowReveal(false);

    // Slot machine effect — rapidly cycle through player names
    let cycleCount = 0;
    const totalCycles = 25 + Math.floor(Math.random() * 15); // 25-40 cycles
    let currentIdx = Math.floor(Math.random() * allPlayers.length);

    spinIntervalRef.current = setInterval(() => {
      cycleCount++;
      currentIdx = (currentIdx + 1) % allPlayers.length;
      setSpinDisplay(allPlayers[currentIdx].gamertag);

      // Slow down at the end
      if (cycleCount >= totalCycles) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

        // Final reveal — show the actual selected player
        setTimeout(() => {
          setSpinDisplay(item.player.gamertag);
          setShowReveal(true);
          setIsSpinning(false);

          // Update team slot
          setTeamSlots(prev => {
            const updated = { ...prev };
            const slot = { ...updated[item.teamIndex] };
            slot[tierKey] = item.player;
            // When S-tier is set, update the team name
            if (tierKey === 's') {
              slot.name = `Tim ${item.player.gamertag}`;
            }
            updated[item.teamIndex] = slot;
            return updated;
          });

          // Auto advance to next step after a short pause
          setTimeout(() => {
            if (currentStep + 1 >= totalSteps) {
              setIsComplete(true);
            } else {
              setCurrentStep(prev => prev + 1);
            }
          }, 1200);
        }, 300);
      }
    }, cycleCount < totalCycles * 0.6 ? 60 : cycleCount < totalCycles * 0.85 ? 120 : 250);
  }, [currentStep, spinRevealOrder, totalSteps]);

  // Auto-start spinning on step change
  useEffect(() => {
    if (currentStep < totalSteps && !isComplete) {
      const timer = setTimeout(() => doSpin(), 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, doSpin, totalSteps, isComplete]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const currentItem = currentStep < totalSteps ? spinRevealOrder[currentStep] : null;
  const currentTier = currentItem?.tier || 'S';
  const tierConf = TIER_CONFIG[currentTier] || TIER_CONFIG.S;
  const currentRound = currentItem
    ? `Round ${currentTier === 'S' ? '1' : currentTier === 'A' ? '2' : '3'} — Tier ${currentTier}`
    : '';

  return (
    <Dialog open onOpenChange={() => { /* prevent closing during spin */ }}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 border-idm-gold-warm/30 bg-gradient-to-b from-card via-card to-idm-gold-warm/5">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-idm-gold-warm/20 px-4 py-3">
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
                {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-idm-gold-warm rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Spin Indicator */}
          {!isComplete && currentItem && (
            <div className="text-center space-y-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-1"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{currentRound}</p>
                  <p className="text-xs font-semibold text-idm-gold-warm">
                    Tim {currentItem.teamIndex + 1} — Tier {currentTier} Player
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Slot Machine Display */}
              <div className={`relative mx-auto w-64 h-20 rounded-xl border-2 ${tierConf.border} ${tierConf.bg} overflow-hidden flex items-center justify-center`}>
                {/* Spinning glow effect */}
                {isSpinning && (
                  <motion.div
                    className={`absolute inset-0 ${tierConf.bg} opacity-50`}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  />
                )}

                {/* Player name display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSpinning ? spinDisplay : `reveal-${spinDisplay}`}
                    initial={isSpinning ? { y: 20, opacity: 0 } : { scale: 1.5, opacity: 0 }}
                    animate={isSpinning ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
                    exit={isSpinning ? { y: -20, opacity: 0 } : { opacity: 0 }}
                    transition={isSpinning ? { duration: 0.05 } : { duration: 0.4, type: 'spring' }}
                    className="relative z-10 text-center"
                  >
                    <p className={`text-lg font-bold ${showReveal ? tierConf.color : 'text-foreground'}`}>
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
                <div className="absolute top-1 left-1.5">
                  <span className={`text-[8px] font-bold ${tierConf.color}`}>TIER {currentTier}</span>
                </div>
                <div className="absolute bottom-1 right-1.5">
                  <span className="text-[8px] text-muted-foreground">Tim {currentItem.teamIndex + 1}</span>
                </div>

                {/* Reveal sparkle effect */}
                {showReveal && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-idm-gold-warm rounded-full"
                        style={{ left: '50%', top: '50%' }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 120],
                          y: [0, (Math.random() - 0.5) * 80],
                          opacity: [1, 0],
                          scale: [1, 0],
                        }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Spin status */}
              <p className="text-[10px] text-muted-foreground">
                {isSpinning ? '🎰 Mengacak...' : showReveal ? '✅ Terpilih!' : '⏳ Bersiap...'}
              </p>
            </div>
          )}

          {/* Completion celebration */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-center py-4 space-y-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <PartyPopper className="w-12 h-12 text-idm-gold-warm mx-auto" />
              </motion.div>
              <p className="text-lg font-bold text-idm-gold-warm">Semua Tim Terbentuk!</p>
              <p className="text-xs text-muted-foreground">{teamCount} tim berhasil dibuat</p>
            </motion.div>
          )}

          {/* Team Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-idm-gold-warm" />
              <span className="text-xs font-semibold">Tim</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    className={`p-2.5 rounded-lg border text-xs transition-all duration-300
                      ${isCurrentlyRevealing ? 'border-idm-gold-warm/50 bg-idm-gold-warm/5 ring-1 ring-idm-gold-warm/20' :
                        hasAny ? 'bg-muted/30 border-border/20' : 'bg-muted/10 border-border/10'}`}
                  >
                    {/* Team name */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold flex items-center gap-1">
                        {slot?.name || `Tim ${i + 1}`}
                        {slot?.s && <Crown className="w-3 h-3 text-idm-gold-warm" />}
                      </span>
                      {hasAny && (
                        <span className="text-[9px] text-idm-gold-warm font-medium">
                          ⚡ {((slot?.s?.points || 0) + (slot?.a?.points || 0) + (slot?.b?.points || 0))}
                        </span>
                      )}
                    </div>

                    {/* Player slots */}
                    <div className="space-y-1">
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
                            <TierBadge tier={tier} />
                            {player ? (
                              <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-[11px] font-medium ${tc.color}`}
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

          {/* Close button */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center pt-2"
            >
              <Button
                className="bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black font-semibold"
                onClick={onComplete}
              >
                Lanjut ke Bracket <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
