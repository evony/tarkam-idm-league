'use client';

import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Trophy, Flame, Star, Swords } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DonationPopup() {
  const { donationPopup, hideDonationPopup } = useAppStore();

  if (!donationPopup.show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-amber-500/30 bg-card p-4 shadow-lg shadow-amber-500/10"
      >
        <button onClick={hideDonationPopup} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-sm font-semibold">{donationPopup.message}</p>
            <p className="text-xs text-muted-foreground">Thank you for your support!</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
